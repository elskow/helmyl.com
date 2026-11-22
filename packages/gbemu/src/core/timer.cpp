#include "timer.h"
#include "mmu.h"

Timer::Timer(MMU& mmu) : mmu(mmu), internalCounter(0), prevTimerBit(false) {
}

void Timer::reset() {
    internalCounter = 0;
    prevTimerBit = false;
    mmu.setDivider(0);
    mmu.setTimerCounter(0);
}

int Timer::getTimerBitPosition() const {
    uint8_t tac = mmu.getTimerControl();
    return TIMER_BIT_POS[tac & 0x03];
}

bool Timer::getTimerBit() const {
    uint8_t tac = mmu.getTimerControl();
    if (!(tac & 0x04)) return false;  
    
    int bitPos = TIMER_BIT_POS[tac & 0x03];
    return (internalCounter >> bitPos) & 1;
}

void Timer::tickTimer() {
    uint8_t tima = mmu.getTimerCounter();
    tima++;
    
    if (tima == 0) {
        tima = mmu.getTimerModulo();
        mmu.setIF(mmu.getIF() | 0x04);  
    }
    
    mmu.setTimerCounter(tima);
}

void Timer::step(int cycles) {
    for (int i = 0; i < cycles; i++) {
        internalCounter++;
        
        mmu.setDivider(internalCounter);
        
        bool currentBit = getTimerBit();
        if (prevTimerBit && !currentBit) {
            tickTimer();
        }
        prevTimerBit = currentBit;
    }
}

void Timer::onDivWrite() {
    bool oldBit = getTimerBit();
    internalCounter = 0;
    mmu.setDivider(0);
    
    bool newBit = getTimerBit();
    if (oldBit && !newBit) {
        tickTimer();
    }
    prevTimerBit = newBit;
}
