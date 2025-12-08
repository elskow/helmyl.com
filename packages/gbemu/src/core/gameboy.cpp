#include "gameboy.h"

GameBoy::GameBoy()
    : mmu()
    , cpu(mmu)
    , ppu(mmu)
    , timer(mmu)
    , apu()
    , buttons(0x0F)
    , dpad(0x0F)
{
    mmu.setAPU(&apu);
    mmu.setTimer(&timer);
}

bool GameBoy::loadROM(const uint8_t* data, size_t size) {
    if (!mmu.loadROM(data, size)) {
        return false;
    }
    reset();
    return true;
}

void GameBoy::reset() {
    cpu.reset();
    ppu.reset();
    timer.reset();
    apu.reset();
    buttons = 0x0F;
    dpad = 0x0F;
    mmu.setJoypad(buttons, dpad);
}

int GameBoy::step() {
    int cycles = cpu.step();
    mmu.stepDMA(cycles);  // Step DMA transfer
    timer.step(cycles);
    ppu.step(cycles);
    apu.step(cycles);
    return cycles;
}

int GameBoy::stepCPU() {
    return cpu.step();
}

void GameBoy::runFrame() {
    int cyclesThisFrame = 0;
    
    while (cyclesThisFrame < CYCLES_PER_FRAME) {
        int cycles = cpu.step();
        mmu.stepDMA(cycles);  // Step DMA transfer
        timer.step(cycles);
        apu.step(cycles);
        
        if (ppu.step(cycles)) {
            // Frame complete
            break;
        }
        
        cyclesThisFrame += cycles;
    }
}

void GameBoy::setButton(int button, bool pressed) {
    // Buttons are active LOW
    uint8_t mask = 1 << (button & 0x03);
    
    if (button < 4) {
        // A, B, Select, Start
        if (pressed) {
            buttons &= ~mask;
        } else {
            buttons |= mask;
        }
    } else {
        // D-pad
        if (pressed) {
            dpad &= ~mask;
        } else {
            dpad |= mask;
        }
    }
    
    mmu.setJoypad(buttons, dpad);
    
    if (pressed) {
        mmu.setIF(mmu.getIF() | 0x10);
        
        if (cpu.isStopped()) {
            cpu.wakeFromStop();
        }
    }
}
