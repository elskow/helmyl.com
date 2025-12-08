#include "ppu.h"
#include "mmu.h"

PPU::PPU(MMU& mmu) : mmu(mmu) {
    reset();
}

void PPU::reset() {
    framebuffer.fill(COLORS[0]);
    ly = 0;
    modeClock = 0;
    mode = 2;
    windowLine = false;
    windowLineCounter = 0;
    mode3Duration = 172;
    mmu.ly = 0;
    mmu.stat = (mmu.stat & 0xFC) | 2;
}

void PPU::setMode(uint8_t newMode) {
    mode = newMode;
    mmu.stat = (mmu.stat & 0xFC) | mode;
    mmu.setPPUMode(mode);
    checkSTATInterrupt();
}

void PPU::checkSTATInterrupt() {
    bool interrupt = false;
    
    // Mode interrupts
    if ((mmu.stat & 0x08) && mode == 0) interrupt = true;  // HBlank
    if ((mmu.stat & 0x10) && mode == 1) interrupt = true;  // VBlank
    if ((mmu.stat & 0x20) && mode == 2) interrupt = true;  // OAM
    
    // LYC=LY interrupt
    if ((mmu.stat & 0x40) && (mmu.stat & 0x04)) interrupt = true;
    
    if (interrupt) {
        mmu.setIF(mmu.getIF() | 0x02);  // LCD STAT interrupt
    }
}

bool PPU::step(int cycles) {
    // Check if LCD is enabled
    if (!(mmu.lcdc & 0x80)) {
        return false;
    }
    
    modeClock += cycles;
    bool frameComplete = false;
    
    switch (mode) {
        case 2:  // OAM Scan (80 cycles)
            if (modeClock >= 80) {
                modeClock -= 80;
                // Calculate variable Mode 3 duration before entering it
                mode3Duration = calculateMode3Duration();
                setMode(3);
            }
            break;
            
        case 3:  // Drawing (172-289 cycles depending on sprites and window)
            if (modeClock >= mode3Duration) {
                modeClock -= mode3Duration;
                
                // Render current scanline
                renderScanline();
                
                setMode(0);  // Enter HBlank
            }
            break;
            
        case 0: {  // HBlank (remaining cycles to complete 456 per scanline)
            // Total scanline = 456 cycles = 80 (Mode 2) + mode3Duration + HBlank
            int hblankDuration = 456 - 80 - mode3Duration;
            if (modeClock >= hblankDuration) {
                modeClock -= hblankDuration;
                ly++;
                mmu.ly = ly;
                
                // Check LYC=LY
                if (ly == mmu.lyc) {
                    mmu.stat |= 0x04;
                    checkSTATInterrupt();
                } else {
                    mmu.stat &= ~0x04;
                }
                
                if (ly == 144) {
                    // Enter VBlank
                    setMode(1);
                    mmu.setIF(mmu.getIF() | 0x01);  // VBlank interrupt
                    frameComplete = true;
                } else {
                    setMode(2);  // Next scanline
                }
            }
            break;
        }
            
        case 1:  // VBlank (4560 cycles, 10 lines)
            if (modeClock >= 456) {
                modeClock -= 456;
                ly++;
                mmu.ly = ly;
                
                // Check LYC=LY
                if (ly == mmu.lyc) {
                    mmu.stat |= 0x04;
                    checkSTATInterrupt();
                } else {
                    mmu.stat &= ~0x04;
                }
                
                if (ly > 153) {
                    // Frame complete, start new frame
                    ly = 0;
                    mmu.ly = 0;
                    windowLine = false;
                    windowLineCounter = 0;
                    setMode(2);
                }
            }
            break;
    }
    
    return frameComplete;
}

void PPU::renderScanline() {
    // Clear scanline with white and reset BG color indices
    for (int x = 0; x < SCREEN_WIDTH; x++) {
        framebuffer[ly * SCREEN_WIDTH + x] = COLORS[0];
        bgColorIndices[x] = 0;  // Default BG color index is 0
    }
    
    if (mmu.lcdc & 0x01) {
        renderBackground();
    }
    
    if ((mmu.lcdc & 0x20) && (mmu.lcdc & 0x01)) {
        renderWindow();
    }
    
    if (mmu.lcdc & 0x02) {
        renderSprites();
    }
}

void PPU::renderBackground() {
    // Tile data address
    uint16_t tileData = (mmu.lcdc & 0x10) ? 0x8000 : 0x8800;
    bool signedIndex = !(mmu.lcdc & 0x10);
    
    // Background tilemap address
    uint16_t tileMap = (mmu.lcdc & 0x08) ? 0x9C00 : 0x9800;
    
    uint8_t scrollY = mmu.scy;
    uint8_t scrollX = mmu.scx;
    
    uint8_t* vram = mmu.getVRAM();
    
    for (int x = 0; x < SCREEN_WIDTH; x++) {
        // Calculate position in background
        uint8_t bgX = (scrollX + x) & 0xFF;
        uint8_t bgY = (scrollY + ly) & 0xFF;
        
        // Get tile index
        uint16_t tileMapAddr = tileMap + (bgY / 8) * 32 + (bgX / 8);
        uint8_t tileIndex = vram[tileMapAddr - 0x8000];
        
        // Calculate tile data address
        uint16_t tileAddr;
        if (signedIndex) {
            tileAddr = 0x9000 + ((int8_t)tileIndex * 16);
        } else {
            tileAddr = tileData + (tileIndex * 16);
        }
        
        // Get pixel within tile
        uint8_t tileX = bgX & 7;
        uint8_t tileY = bgY & 7;
        
        // Get color from tile
        uint16_t lineAddr = tileAddr + tileY * 2;
        uint8_t lo = vram[lineAddr - 0x8000];
        uint8_t hi = vram[lineAddr + 1 - 0x8000];
        uint8_t bit = 7 - tileX;
        uint8_t colorNum = ((hi >> bit) & 1) << 1 | ((lo >> bit) & 1);
        
        // Store color index for sprite priority and apply palette
        bgColorIndices[x] = colorNum;
        framebuffer[ly * SCREEN_WIDTH + x] = getColor(mmu.bgp, colorNum);
    }
}

void PPU::renderWindow() {
    // Check if window is visible on this line
    if (ly < mmu.wy) return;
    if (mmu.wx > 166) return;
    
    int windowX = mmu.wx - 7;
    
    // Tile data address
    uint16_t tileData = (mmu.lcdc & 0x10) ? 0x8000 : 0x8800;
    bool signedIndex = !(mmu.lcdc & 0x10);
    
    // Window tilemap address
    uint16_t tileMap = (mmu.lcdc & 0x40) ? 0x9C00 : 0x9800;
    
    uint8_t* vram = mmu.getVRAM();
    
    bool windowOnThisLine = false;
    
    for (int x = 0; x < SCREEN_WIDTH; x++) {
        if (x < windowX) continue;
        
        windowOnThisLine = true;
        
        // Calculate position in window
        int winX = x - windowX;
        int winY = windowLineCounter;
        
        // Get tile index
        uint16_t tileMapAddr = tileMap + (winY / 8) * 32 + (winX / 8);
        uint8_t tileIndex = vram[tileMapAddr - 0x8000];
        
        // Calculate tile data address
        uint16_t tileAddr;
        if (signedIndex) {
            tileAddr = 0x9000 + ((int8_t)tileIndex * 16);
        } else {
            tileAddr = tileData + (tileIndex * 16);
        }
        
        // Get pixel within tile
        uint8_t tileX = winX & 7;
        uint8_t tileY = winY & 7;
        
        // Get color from tile
        uint16_t lineAddr = tileAddr + tileY * 2;
        uint8_t lo = vram[lineAddr - 0x8000];
        uint8_t hi = vram[lineAddr + 1 - 0x8000];
        uint8_t bit = 7 - tileX;
        uint8_t colorNum = ((hi >> bit) & 1) << 1 | ((lo >> bit) & 1);
        
        // Store color index for sprite priority and apply palette
        bgColorIndices[x] = colorNum;
        framebuffer[ly * SCREEN_WIDTH + x] = getColor(mmu.bgp, colorNum);
    }
    
    if (windowOnThisLine) {
        windowLineCounter++;
    }
}

void PPU::renderSprites() {
    uint8_t* oam = mmu.getOAM();
    uint8_t* vram = mmu.getVRAM();
    
    // Sprite size (8x8 or 8x16)
    int spriteHeight = (mmu.lcdc & 0x04) ? 16 : 8;
    
    // Find sprites on this scanline (max 10)
    struct Sprite {
        int x, y;
        uint8_t tile;
        uint8_t flags;
        int oamIndex;
    };
    Sprite sprites[10];
    int spriteCount = 0;
    
    for (int i = 0; i < 40 && spriteCount < 10; i++) {
        int y = oam[i * 4] - 16;
        int x = oam[i * 4 + 1] - 8;
        
        // Check if sprite is on this scanline
        if (ly >= y && ly < y + spriteHeight) {
            sprites[spriteCount].x = x;
            sprites[spriteCount].y = y;
            sprites[spriteCount].tile = oam[i * 4 + 2];
            sprites[spriteCount].flags = oam[i * 4 + 3];
            sprites[spriteCount].oamIndex = i;
            spriteCount++;
        }
    }
    
    // Sort by X coordinate (lower X = higher priority)
    // If same X, lower OAM index = higher priority
    for (int i = 0; i < spriteCount - 1; i++) {
        for (int j = i + 1; j < spriteCount; j++) {
            if (sprites[j].x < sprites[i].x || 
                (sprites[j].x == sprites[i].x && sprites[j].oamIndex < sprites[i].oamIndex)) {
                Sprite temp = sprites[i];
                sprites[i] = sprites[j];
                sprites[j] = temp;
            }
        }
    }
    
    // Render sprites (reverse order so lower X draws on top)
    for (int i = spriteCount - 1; i >= 0; i--) {
        Sprite& spr = sprites[i];
        
        bool flipX = spr.flags & 0x20;
        bool flipY = spr.flags & 0x40;
        bool priority = spr.flags & 0x80;
        uint8_t palette = (spr.flags & 0x10) ? mmu.obp1 : mmu.obp0;
        
        // Calculate Y position in sprite
        int spriteY = ly - spr.y;
        if (flipY) {
            spriteY = spriteHeight - 1 - spriteY;
        }
        
        // For 8x16 sprites, bit 0 of tile is ignored
        uint8_t tile = spr.tile;
        if (spriteHeight == 16) {
            tile &= 0xFE;
        }
        
        // Get tile line address
        uint16_t tileAddr = 0x8000 + tile * 16 + (spriteY % 8) * 2;
        if (spriteHeight == 16 && spriteY >= 8) {
            tileAddr += 16;  // Second tile
        }
        
        uint8_t lo = vram[tileAddr - 0x8000];
        uint8_t hi = vram[tileAddr + 1 - 0x8000];
        
        for (int px = 0; px < 8; px++) {
            int screenX = spr.x + px;
            if (screenX < 0 || screenX >= SCREEN_WIDTH) continue;
            
            int tileX = flipX ? px : (7 - px);
            uint8_t colorNum = ((hi >> tileX) & 1) << 1 | ((lo >> tileX) & 1);
            
            // Color 0 is transparent
            if (colorNum == 0) continue;
            
            // BG priority: sprite behind BG colors 1-3 (non-zero color indices)
            if (priority && bgColorIndices[screenX] != 0) {
                continue;
            }
            
            framebuffer[ly * SCREEN_WIDTH + screenX] = getColor(palette, colorNum);
        }
    }
}

uint32_t PPU::getColor(uint8_t palette, uint8_t colorNum) {
    uint8_t color = (palette >> (colorNum * 2)) & 0x03;
    return COLORS[color];
}

int PPU::calculateMode3Duration() {
    // Base Mode 3 duration is 172 cycles
    int duration = 172;
    
    // Add 12 cycles for SCX % 8 (background scroll penalty)
    duration += (mmu.scx & 7);
    
    // Count sprites on this scanline and add penalty
    uint8_t* oam = mmu.getOAM();
    int spriteHeight = (mmu.lcdc & 0x04) ? 16 : 8;
    int spriteCount = 0;
    
    if (mmu.lcdc & 0x02) {  // Sprites enabled
        for (int i = 0; i < 40 && spriteCount < 10; i++) {
            int y = oam[i * 4] - 16;
            // Check if sprite is on this scanline
            if (ly >= y && ly < y + spriteHeight) {
                spriteCount++;
                // Each sprite adds approximately 6 cycles (varies based on position)
                duration += 6;
            }
        }
    }
    
    // Window penalty: if window is active on this line, add extra cycles
    if ((mmu.lcdc & 0x20) && (mmu.lcdc & 0x01)) {  // Window enabled
        if (ly >= mmu.wy && mmu.wx <= 166) {
            // Window adds 6 cycles when triggered
            duration += 6;
        }
    }
    
    // Clamp to valid range (172-289 cycles)
    if (duration < 172) duration = 172;
    if (duration > 289) duration = 289;
    
    return duration;
}
