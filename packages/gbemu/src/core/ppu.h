#pragma once

#include <cstdint>
#include <array>

class MMU;

class PPU {
public:
    static constexpr int SCREEN_WIDTH = 160;
    static constexpr int SCREEN_HEIGHT = 144;
    
    PPU(MMU& mmu);
    
    bool step(int cycles);
    
    void reset();
    
    const uint32_t* getFramebuffer() const { return framebuffer.data(); }
    
    uint8_t getCurrentLine() const { return ly; }
    
private:
    MMU& mmu;
    
    std::array<uint32_t, SCREEN_WIDTH * SCREEN_HEIGHT> framebuffer;
    
    std::array<uint8_t, SCREEN_WIDTH> bgColorIndices;
    
    uint8_t ly;         
    int modeClock;      
    uint8_t mode;       
    bool windowLine;    
    int windowLineCounter;
    int mode3Duration;  
    
    void renderScanline();
    void renderBackground();
    void renderWindow();
    void renderSprites();
    
    int calculateMode3Duration();
    
    uint32_t getColor(uint8_t palette, uint8_t colorNum);
    
    uint8_t getTilePixel(uint16_t tileAddr, int x, int y);
    
    void checkSTATInterrupt();
    void setMode(uint8_t newMode);
    
    static constexpr uint32_t COLORS[4] = {
        0xFF9BBC0F,  
        0xFF8BAC0F,  
        0xFF306230,  
        0xFF0F380F   
    };
};
