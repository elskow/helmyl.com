#pragma once

#include <cstdint>
#include <array>

class MMU;

/**
 * PPU - Pixel Processing Unit
 * 
 * Renders 160x144 pixel display with 4 colors (2-bit per pixel)
 * 
 * Modes:
 * - Mode 0: HBlank (204 cycles)
 * - Mode 1: VBlank (4560 cycles, 10 lines)
 * - Mode 2: OAM Scan (80 cycles)
 * - Mode 3: Drawing (172-289 cycles)
 * 
 * Full frame: 154 lines * 456 cycles = 70224 cycles (~59.7 Hz)
 */
class PPU {
public:
    static constexpr int SCREEN_WIDTH = 160;
    static constexpr int SCREEN_HEIGHT = 144;
    
    PPU(MMU& mmu);
    
    // Step PPU by given cycles, returns true if frame complete
    bool step(int cycles);
    
    // Reset PPU state
    void reset();
    
    // Get framebuffer (RGBA format, 160x144)
    const uint32_t* getFramebuffer() const { return framebuffer.data(); }
    
    // Get current scanline
    uint8_t getCurrentLine() const { return ly; }
    
private:
    MMU& mmu;
    
    // Framebuffer (RGBA)
    std::array<uint32_t, SCREEN_WIDTH * SCREEN_HEIGHT> framebuffer;
    
    // PPU state
    uint8_t ly;         // Current scanline (0-153)
    int modeClock;      // Cycles in current mode
    uint8_t mode;       // Current mode (0-3)
    bool windowLine;    // Did window trigger on this frame
    int windowLineCounter;
    
    // Scanline rendering
    void renderScanline();
    void renderBackground();
    void renderWindow();
    void renderSprites();
    
    // Color conversion
    uint32_t getColor(uint8_t palette, uint8_t colorNum);
    
    // Tile/sprite fetching
    uint8_t getTilePixel(uint16_t tileAddr, int x, int y);
    
    // STAT interrupt handling
    void checkSTATInterrupt();
    void setMode(uint8_t newMode);
    
    // Palette colors (classic green)
    static constexpr uint32_t COLORS[4] = {
        0xFF9BBC0F,  // Lightest (00)
        0xFF8BAC0F,  // Light (01)
        0xFF306230,  // Dark (10)
        0xFF0F380F   // Darkest (11)
    };
};
