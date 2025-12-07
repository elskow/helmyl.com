#pragma once

#include <cstdint>

#include "cpu.h"
#include "mmu.h"
#include "ppu.h"
#include "timer.h"
#include "apu.h"

/**
 * GameBoy - Main emulator class
 * 
 * Coordinates all components and runs emulation
 */
class GameBoy {
public:
    GameBoy();
    
    // Load ROM from buffer
    bool loadROM(const uint8_t* data, size_t size);
    
    // Run one frame (~70224 cycles)
    void runFrame();
    
    // Run single CPU step (with PPU/timer update)
    int step();
    
    // Run single CPU instruction only (for tracing)
    int stepCPU();
    
    // Reset emulator
    void reset();
    
    // Input handling
    void setButton(int button, bool pressed);
    
    // Get framebuffer for rendering
    const uint32_t* getFramebuffer() const { return ppu.getFramebuffer(); }
    
    // Screen dimensions
    static constexpr int SCREEN_WIDTH = PPU::SCREEN_WIDTH;
    static constexpr int SCREEN_HEIGHT = PPU::SCREEN_HEIGHT;
    
    // Button indices
    enum Button {
        BUTTON_A = 0,
        BUTTON_B = 1,
        BUTTON_SELECT = 2,
        BUTTON_START = 3,
        BUTTON_RIGHT = 4,
        BUTTON_LEFT = 5,
        BUTTON_UP = 6,
        BUTTON_DOWN = 7
    };
    
    // Debug/state access
    CPU& getCPU() { return cpu; }
    MMU& getMMU() { return mmu; }
    PPU& getPPU() { return ppu; }
    APU& getAPU() { return apu; }
    
private:
    MMU mmu;
    CPU cpu;
    PPU ppu;
    Timer timer;
    APU apu;
    
    // Joypad state (active low)
    uint8_t buttons;  // A, B, Select, Start
    uint8_t dpad;     // Right, Left, Up, Down
    
    static constexpr int CYCLES_PER_FRAME = 70224;
};
