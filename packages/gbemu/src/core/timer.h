#pragma once

#include <cstdint>

class MMU;

class Timer {
public:
    Timer(MMU& mmu);
    
    void step(int cycles);
    
    void reset();
    
    void onDivWrite();
    
private:
    MMU& mmu;
    
    uint16_t internalCounter;
    
    bool prevTimerBit;
    
    int getTimerBitPosition() const;
    
    bool getTimerBit() const;
    
    void tickTimer();
    
    static constexpr int TIMER_BIT_POS[4] = { 9, 3, 5, 7 };
};
