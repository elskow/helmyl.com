#pragma once

#include <cstdint>

class MMU;

/**
 * Timer - Handles DIV and TIMA registers
 * 
 * DIV: Increments at 16384 Hz (every 256 cycles)
 * TIMA: Clocked by falling edge of specific DIV bits based on TAC:
 *       00: DIV bit 9  (4096 Hz,   every 1024 cycles)
 *       01: DIV bit 3  (262144 Hz, every 16 cycles)
 *       10: DIV bit 5  (65536 Hz,  every 64 cycles)
 *       11: DIV bit 7  (16384 Hz,  every 256 cycles)
 */
class Timer {
public:
    Timer(MMU& mmu);
    
    // Step timer by given cycles
    void step(int cycles);
    
    // Reset timer
    void reset();
    
    // Called when DIV is written (resets to 0, can cause falling edge)
    void onDivWrite();
    
private:
    MMU& mmu;
    
    // Internal 16-bit counter (DIV is upper 8 bits)
    uint16_t internalCounter;
    
    // Previous state of the selected DIV bit (for edge detection)
    bool prevTimerBit;
    
    // Get the bit position for TIMA clock based on TAC
    int getTimerBitPosition() const;
    
    // Check if the timer bit is set
    bool getTimerBit() const;
    
    // Handle timer tick (when falling edge detected)
    void tickTimer();
    
    // Bit positions for each TAC clock select value
    static constexpr int TIMER_BIT_POS[4] = { 9, 3, 5, 7 };
};
