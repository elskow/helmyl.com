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
    // Timer bit is AND of enable bit and the selected DIV bit
    if (!(tac & 0x04)) return false;  // Timer disabled
    
    int bitPos = TIMER_BIT_POS[tac & 0x03];
    return (internalCounter >> bitPos) & 1;
}

void Timer::tickTimer() {
    uint8_t tima = mmu.getTimerCounter();
    tima++;
    
    if (tima == 0) {
        // Overflow - reload from TMA and request interrupt
        tima = mmu.getTimerModulo();
        mmu.setIF(mmu.getIF() | 0x04);  // Timer interrupt
    }
    
    mmu.setTimerCounter(tima);
}

void Timer::step(int cycles) {
    // Process each cycle for accurate falling edge detection
    for (int i = 0; i < cycles; i++) {
        // Increment internal counter
        internalCounter++;
        
        mmu.setDivider(internalCounter);
        
        // Check for falling edge on timer bit
        bool currentBit = getTimerBit();
        if (prevTimerBit && !currentBit) {
            // Falling edge detected - tick TIMA
            tickTimer();
        }
        prevTimerBit = currentBit;
    }
}

void Timer::onDivWrite() {
    // Writing to DIV resets the internal counter
    // This can cause a falling edge if the selected bit was 1
    bool oldBit = getTimerBit();
    internalCounter = 0;
    mmu.setDivider(0);
    
    // Check if this caused a falling edge
    bool newBit = getTimerBit();
    if (oldBit && !newBit) {
        tickTimer();
    }
    prevTimerBit = newBit;
}
