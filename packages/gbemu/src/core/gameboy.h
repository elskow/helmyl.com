#pragma once

#include <cstdint>

#include "cpu.h"
#include "mmu.h"
#include "ppu.h"
#include "timer.h"
#include "apu.h"

class GameBoy {
public:
    GameBoy();
    
    bool loadROM(const uint8_t* data, size_t size);
    
    void runFrame();
    
    int step();
    
    int stepCPU();
    
    void reset();
    
    void setButton(int button, bool pressed);
    
    const uint32_t* getFramebuffer() const { return ppu.getFramebuffer(); }
    
    static constexpr int SCREEN_WIDTH = PPU::SCREEN_WIDTH;
    static constexpr int SCREEN_HEIGHT = PPU::SCREEN_HEIGHT;
    
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
    
    uint8_t buttons;  
    uint8_t dpad;     
    
    static constexpr int CYCLES_PER_FRAME = 70224;
};
