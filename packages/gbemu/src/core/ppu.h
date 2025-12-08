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
    
    // Background color indices for current scanline (for sprite priority)
    std::array<uint8_t, SCREEN_WIDTH> bgColorIndices;
    
    // PPU state
    uint8_t ly;         // Current scanline (0-153)
    int modeClock;      // Cycles in current mode
    uint8_t mode;       // Current mode (0-3)
    bool windowLine;    // Did window trigger on this frame
    int windowLineCounter;
    int mode3Duration;  // Variable Mode 3 duration (172-289 cycles)
    
    // Scanline rendering
    void renderScanline();
    void renderBackground();
    void renderWindow();
    void renderSprites();
    
    // Calculate Mode 3 duration based on sprites and window
    int calculateMode3Duration();
    
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
