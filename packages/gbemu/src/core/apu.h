#pragma once

#include <cstdint>
#include <array>
#include <vector>

class APU {
public:
    APU();
    
    void step(int cycles);
    
    void reset();
    
    uint8_t read(uint16_t addr);
    void write(uint16_t addr, uint8_t val);
    
    int getSamples(float* buffer, int maxSamples);
    
    void clearBuffer() { sampleBufferPos = 0; }
    
    static constexpr int SAMPLE_RATE = 44100;
    
private:
    int frameSequencerCycles;
    int frameSequencerStep;
    
    int sampleCycles;
    int sampleCyclesFrac;  
    static constexpr int CYCLES_PER_SAMPLE_INT = 95;
    static constexpr int CYCLES_PER_SAMPLE_FRAC = 102;  
    
    std::vector<float> sampleBuffer;
    int sampleBufferPos;
    static constexpr int SAMPLE_BUFFER_SIZE = 4096;
    
    uint8_t nr50;  
    uint8_t nr51;  
    uint8_t nr52;  
    
    struct Channel1 {
        uint8_t nr10;  
        uint8_t nr11;  
        uint8_t nr12;  
        uint8_t nr13;  
        uint8_t nr14;  
        
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
        bool sweepNegateUsed;  
        int sweepShift;
        int frequency;
        int shadowFrequency;
        bool sweepEnabled;
    } ch1;
    
    struct Channel2 {
        uint8_t nr21;  
        uint8_t nr22;  
        uint8_t nr23;  
        uint8_t nr24;  
        
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
    
    struct Channel3 {
        uint8_t nr30;  
        uint8_t nr31;  
        uint8_t nr32;  
        uint8_t nr33;  
        uint8_t nr34;  
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int positionCounter;
        int volume;
        int frequency;
    } ch3;
    
    struct Channel4 {
        uint8_t nr41;  
        uint8_t nr42;  
        uint8_t nr43;  
        uint8_t nr44;  
        
        bool enabled;
        bool dacEnabled;
        int lengthCounter;
        int frequencyTimer;
        int volume;
        int envelopeTimer;
        bool envelopeIncreasing;
        int envelopePeriod;
        uint16_t lfsr;  
        bool widthMode;  
        int divisor;
        int clockShift;
    } ch4;
    
    std::array<uint8_t, 16> waveRam;
    
    static constexpr uint8_t DUTY_TABLE[4] = {
        0b00000001,  
        0b00000011,  
        0b00001111,  
        0b11111100   
    };
    
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
    
    float lpfLeftPrev;
    float lpfRightPrev;
    static constexpr float LPF_CUTOFF = 14000.0f;  
    
    float hpfLeftPrev;
    float hpfRightPrev;
    float hpfLeftCapacitor;
    float hpfRightCapacitor;
    static constexpr float HPF_CUTOFF = 20.0f;  
    
    float lpfAlpha;  
    float hpfAlpha;  
    
    void initFilters();
    void applyFilters(float& left, float& right);
};
