#pragma once

#include <cstdint>
#include <array>
#include <vector>

/**
 * Audio Processing Unit - GameBoy Sound
 * 
 * 4 Sound Channels:
 * - Channel 1: Square wave with sweep and envelope
 * - Channel 2: Square wave with envelope
 * - Channel 3: Wave channel (custom waveform)
 * - Channel 4: Noise channel with envelope
 * 
 * Audio Registers (0xFF10-0xFF3F):
 * 0xFF10-0xFF14: Channel 1
 * 0xFF16-0xFF19: Channel 2
 * 0xFF1A-0xFF1E: Channel 3
 * 0xFF20-0xFF23: Channel 4
 * 0xFF24: Master volume / VIN panning
 * 0xFF25: Sound panning
 * 0xFF26: Sound on/off
 * 0xFF30-0xFF3F: Wave pattern RAM
 */
class APU {
public:
    APU();
    
    // Step the APU by given CPU cycles
    void step(int cycles);
    
    // Reset APU state
    void reset();
    
    // Register read/write
    uint8_t read(uint16_t addr);
    void write(uint16_t addr, uint8_t val);
    
    // Get audio samples for output (returns number of samples)
    // Buffer should be large enough for stereo samples (left, right, left, right...)
    int getSamples(float* buffer, int maxSamples);
    
    // Clear audio buffer (call on ROM load to reset audio latency)
    void clearBuffer() { sampleBufferPos = 0; }
    
    // Sample rate for audio output
    static constexpr int SAMPLE_RATE = 44100;
    
private:
    // Frame sequencer (512 Hz, controls sweep/envelope/length)
    int frameSequencerCycles;
    int frameSequencerStep;
    
    // Sample generation - use fractional accumulator for precise timing
    int sampleCycles;
    int sampleCyclesFrac;  // Fractional part (scaled by 1000)
    // Precise cycles per sample: 4194304 / 44100 = 95.1020408...
    // We use 95102 / 1000 to avoid drift
    static constexpr int CYCLES_PER_SAMPLE_INT = 95;
    static constexpr int CYCLES_PER_SAMPLE_FRAC = 102;  // 0.102 * 1000
    
    // Audio buffer
    std::vector<float> sampleBuffer;
    int sampleBufferPos;
    static constexpr int SAMPLE_BUFFER_SIZE = 4096;
    
    // Master control registers
    uint8_t nr50;  // 0xFF24 - Master volume / VIN
    uint8_t nr51;  // 0xFF25 - Sound panning
    uint8_t nr52;  // 0xFF26 - Sound on/off
    
    // Channel 1: Square with sweep
    struct Channel1 {
        uint8_t nr10;  // Sweep
        uint8_t nr11;  // Length/duty
        uint8_t nr12;  // Volume envelope
        uint8_t nr13;  // Frequency low
        uint8_t nr14;  // Frequency high / control
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int dutyCycle;
        int dutyPosition;
        int volume;
        int envelopeTimer;
        bool envelopeIncreasing;
        int envelopePeriod;
        int sweepTimer;
        int sweepPeriod;
        bool sweepNegate;
        bool sweepNegateUsed;  // Track if negate was used since trigger (for quirk)
        int sweepShift;
        int frequency;
        int shadowFrequency;
        bool sweepEnabled;
    } ch1;
    
    // Channel 2: Square (no sweep)
    struct Channel2 {
        uint8_t nr21;  // Length/duty
        uint8_t nr22;  // Volume envelope
        uint8_t nr23;  // Frequency low
        uint8_t nr24;  // Frequency high / control
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int dutyCycle;
        int dutyPosition;
        int volume;
        int envelopeTimer;
        bool envelopeIncreasing;
        int envelopePeriod;
        int frequency;
    } ch2;
    
    // Channel 3: Wave
    struct Channel3 {
        uint8_t nr30;  // DAC enable
        uint8_t nr31;  // Length
        uint8_t nr32;  // Volume
        uint8_t nr33;  // Frequency low
        uint8_t nr34;  // Frequency high / control
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int positionCounter;
        int volume;
        int frequency;
    } ch3;
    
    // Channel 4: Noise
    struct Channel4 {
        uint8_t nr41;  // Length
        uint8_t nr42;  // Volume envelope
        uint8_t nr43;  // Polynomial counter
        uint8_t nr44;  // Control
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int volume;
        int envelopeTimer;
        bool envelopeIncreasing;
        int envelopePeriod;
        uint16_t lfsr;  // Linear feedback shift register
        bool widthMode;  // 7-bit or 15-bit LFSR
        int divisor;
        int clockShift;
    } ch4;
    
    // Wave RAM (16 bytes = 32 4-bit samples)
    std::array<uint8_t, 16> waveRam;
    
    // Duty cycle patterns
    static constexpr uint8_t DUTY_TABLE[4] = {
        0b00000001,  // 12.5%
        0b00000011,  // 25%
        0b00001111,  // 50%
        0b11111100   // 75%
    };
    
    // Internal methods
    void stepFrameSequencer();
    void stepLength(bool& enabled, int& lengthCounter);
    void stepEnvelope(int& volume, int& timer, bool increasing, int period);
    void stepSweep();
    
    void triggerChannel1();
    void triggerChannel2();
    void triggerChannel3();
    void triggerChannel4();
    
    float getChannel1Sample();
    float getChannel2Sample();
    float getChannel3Sample();
    float getChannel4Sample();
    
    void generateSample();
    
    int calculateSweepFrequency();
};
