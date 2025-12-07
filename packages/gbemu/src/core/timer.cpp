#include "timer.h"
#include "mmu.h"

Timer::Timer(MMU& mmu) : mmu(mmu), divCounter(0), timaCounter(0) {
}

void Timer::reset() {
    divCounter = 0;
    timaCounter = 0;
    mmu.setDivider(0);
    mmu.setTimerCounter(0);
}

void Timer::step(int cycles) {
    // DIV increments every 256 cycles (at 16384 Hz)
    divCounter += cycles;
    while (divCounter >= 256) {
        divCounter -= 256;
        uint16_t div = mmu.getDivider();
        div += 256;  // DIV is upper 8 bits of internal 16-bit counter
        mmu.setDivider(div);
    }
    
    // TIMA - only runs if enabled (TAC bit 2)
    uint8_t tac = mmu.getTimerControl();
    if (!(tac & 0x04)) return;
    
    int clockSelect = tac & 0x03;
    int timaRate = TIMA_CLOCKS[clockSelect];
    
    timaCounter += cycles;
    while (timaCounter >= timaRate) {
        timaCounter -= timaRate;
        
        uint8_t tima = mmu.getTimerCounter();
        tima++;
        
        if (tima == 0) {
            // Overflow - reload from TMA and request interrupt
            tima = mmu.getTimerModulo();
            mmu.setIF(mmu.getIF() | 0x04);  // Timer interrupt
        }
        
        mmu.setTimerCounter(tima);
    }
}
