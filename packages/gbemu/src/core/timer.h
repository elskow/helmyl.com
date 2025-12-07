#pragma once

#include <cstdint>

class MMU;

/**
 * Timer - Handles DIV and TIMA registers
 * 
 * DIV: Increments at 16384 Hz (every 256 cycles)
 * TIMA: Increments at rate set by TAC register
 *       00: 4096 Hz   (every 1024 cycles)
 *       01: 262144 Hz (every 16 cycles)
 *       10: 65536 Hz  (every 64 cycles)
 *       11: 16384 Hz  (every 256 cycles)
 */
class Timer {
public:
    Timer(MMU& mmu);
    
    // Step timer by given cycles
    void step(int cycles);
    
    // Reset timer
    void reset();
    
private:
    MMU& mmu;
    
    int divCounter;
    int timaCounter;
    
    static constexpr int TIMA_CLOCKS[4] = { 1024, 16, 64, 256 };
};
