#include "apu.h"
#include <cstring>
#include <algorithm>
#include <cmath>

APU::APU() {
    reset();
}

void APU::reset() {
    frameSequencerCycles = 0;
    frameSequencerStep = 0;
    sampleCycles = 0;
    sampleCyclesFrac = 0;
    sampleBufferPos = 0;
    sampleBuffer.resize(SAMPLE_BUFFER_SIZE * 2);
    
    nr50 = 0x77;
    nr51 = 0xF3;
    nr52 = 0xF1;
    
    ch1 = {};
    ch1.nr10 = 0x80;
    ch1.nr11 = 0xBF;
    ch1.nr12 = 0xF3;
    ch1.nr14 = 0xBF;
    
    ch2 = {};
    ch2.nr21 = 0x3F;
    ch2.nr24 = 0xBF;
    
    ch3 = {};
    ch3.nr30 = 0x7F;
    ch3.nr31 = 0xFF;
    ch3.nr32 = 0x9F;
    ch3.nr34 = 0xBF;
    
    ch4 = {};
    ch4.nr41 = 0xFF;
    ch4.nr44 = 0xBF;
    ch4.lfsr = 0x7FFF;
    
    waveRam.fill(0);
    initFilters();
}

void APU::step(int cycles) {
    if (!(nr52 & 0x80)) {
        return;
    }
    
    frameSequencerCycles += cycles;
    while (frameSequencerCycles >= 8192) {
        frameSequencerCycles -= 8192;
        stepFrameSequencer();
    }
    
    sampleCycles += cycles;
    while (sampleCycles >= CYCLES_PER_SAMPLE_INT) {
        sampleCycles -= CYCLES_PER_SAMPLE_INT;
        sampleCyclesFrac += CYCLES_PER_SAMPLE_FRAC;
        
        if (sampleCyclesFrac >= 1000) {
            sampleCyclesFrac -= 1000;
            sampleCycles--;
        }
        
        generateSample();
    }
    
    if (ch1.enabled) {
        ch1.frequencyTimer -= cycles;
        while (ch1.frequencyTimer <= 0) {
            ch1.frequencyTimer += (2048 - ch1.frequency) * 4;
            ch1.dutyPosition = (ch1.dutyPosition + 1) & 7;
        }
    }
    
    if (ch2.enabled) {
        ch2.frequencyTimer -= cycles;
        while (ch2.frequencyTimer <= 0) {
            ch2.frequencyTimer += (2048 - ch2.frequency) * 4;
            ch2.dutyPosition = (ch2.dutyPosition + 1) & 7;
        }
    }
    
    if (ch3.enabled) {
        ch3.frequencyTimer -= cycles;
        while (ch3.frequencyTimer <= 0) {
            ch3.frequencyTimer += (2048 - ch3.frequency) * 2;
            ch3.positionCounter = (ch3.positionCounter + 1) & 31;
        }
    }
    
    if (ch4.enabled) {
        ch4.frequencyTimer -= cycles;
        while (ch4.frequencyTimer <= 0) {
            int divisor = ch4.divisor == 0 ? 8 : ch4.divisor * 16;
            ch4.frequencyTimer += divisor << ch4.clockShift;
            
            uint8_t xorResult = (ch4.lfsr & 1) ^ ((ch4.lfsr >> 1) & 1);
            ch4.lfsr = (ch4.lfsr >> 1) | (xorResult << 14);
            if (ch4.widthMode) {
                ch4.lfsr &= ~(1 << 6);
                ch4.lfsr |= (xorResult << 6);
            }
        }
    }
}

void APU::stepFrameSequencer() {
    switch (frameSequencerStep) {
        case 0:
        case 4:
            stepLength(ch1.enabled, ch1.lengthCounter);
            stepLength(ch2.enabled, ch2.lengthCounter);
            stepLength(ch3.enabled, ch3.lengthCounter);
            stepLength(ch4.enabled, ch4.lengthCounter);
            break;
        case 2:
        case 6:
            stepLength(ch1.enabled, ch1.lengthCounter);
            stepLength(ch2.enabled, ch2.lengthCounter);
            stepLength(ch3.enabled, ch3.lengthCounter);
            stepLength(ch4.enabled, ch4.lengthCounter);
            stepSweep();
            break;
        case 7:
            stepEnvelope(ch1.volume, ch1.envelopeTimer, ch1.envelopeIncreasing, ch1.envelopePeriod);
            stepEnvelope(ch2.volume, ch2.envelopeTimer, ch2.envelopeIncreasing, ch2.envelopePeriod);
            stepEnvelope(ch4.volume, ch4.envelopeTimer, ch4.envelopeIncreasing, ch4.envelopePeriod);
            break;
    }
    
    frameSequencerStep = (frameSequencerStep + 1) & 7;
}

void APU::stepLength(bool& enabled, int& lengthCounter) {
    if (lengthCounter > 0) {
        lengthCounter--;
        if (lengthCounter == 0) {
            enabled = false;
        }
    }
}

void APU::stepEnvelope(int& volume, int& timer, bool increasing, int period) {
    if (period == 0) return;
    
    timer--;
    if (timer <= 0) {
        timer = period;
        if (increasing && volume < 15) {
            volume++;
        } else if (!increasing && volume > 0) {
            volume--;
        }
    }
}

void APU::stepSweep() {
    if (!ch1.sweepEnabled || ch1.sweepPeriod == 0) return;
    
    ch1.sweepTimer--;
    if (ch1.sweepTimer <= 0) {
        ch1.sweepTimer = ch1.sweepPeriod ? ch1.sweepPeriod : 8;
        
        if (ch1.sweepPeriod > 0) {
            int newFreq = calculateSweepFrequency();
            
            if (newFreq <= 2047 && ch1.sweepShift > 0) {
                ch1.frequency = newFreq;
                ch1.shadowFrequency = newFreq;
                calculateSweepFrequency();
            }
        }
    }
}

int APU::calculateSweepFrequency() {
    int newFreq = ch1.shadowFrequency >> ch1.sweepShift;
    
    if (ch1.sweepNegate) {
        newFreq = ch1.shadowFrequency - newFreq;
        ch1.sweepNegateUsed = true;  // Mark that negate was used
    } else {
        newFreq = ch1.shadowFrequency + newFreq;
    }
    
    if (newFreq > 2047) {
        ch1.enabled = false;
    }
    
    return newFreq;
}

void APU::triggerChannel1() {
    ch1.enabled = ch1.dacEnabled;
    
    if (ch1.lengthCounter == 0) {
        ch1.lengthCounter = 64;
        // Length counter extra clock bug: if length enable set and on length-clocking step
        if ((ch1.nr14 & 0x40) && (frameSequencerStep & 1) == 0) {
            ch1.lengthCounter--;
        }
    }
    
    ch1.frequencyTimer = (2048 - ch1.frequency) * 4;
    ch1.envelopeTimer = ch1.envelopePeriod ? ch1.envelopePeriod : 8;
    ch1.volume = ch1.nr12 >> 4;
    
    ch1.shadowFrequency = ch1.frequency;
    ch1.sweepTimer = ch1.sweepPeriod ? ch1.sweepPeriod : 8;
    ch1.sweepEnabled = ch1.sweepPeriod > 0 || ch1.sweepShift > 0;
    ch1.sweepNegateUsed = false;  // Reset negate flag on trigger
    
    if (ch1.sweepShift > 0) {
        calculateSweepFrequency();
    }
}

void APU::triggerChannel2() {
    ch2.enabled = ch2.dacEnabled;
    
    if (ch2.lengthCounter == 0) {
        ch2.lengthCounter = 64;
        // Length counter extra clock bug: if length enable set and on length-clocking step
        if ((ch2.nr24 & 0x40) && (frameSequencerStep & 1) == 0) {
            ch2.lengthCounter--;
        }
    }
    
    ch2.frequencyTimer = (2048 - ch2.frequency) * 4;
    ch2.envelopeTimer = ch2.envelopePeriod ? ch2.envelopePeriod : 8;
    ch2.volume = ch2.nr22 >> 4;
}

void APU::triggerChannel3() {
    ch3.enabled = ch3.dacEnabled;
    
    if (ch3.lengthCounter == 0) {
        ch3.lengthCounter = 256;
        // Length counter extra clock bug: if length enable set and on length-clocking step
        if ((ch3.nr34 & 0x40) && (frameSequencerStep & 1) == 0) {
            ch3.lengthCounter--;
        }
    }
    
    ch3.frequencyTimer = (2048 - ch3.frequency) * 2;
    ch3.positionCounter = 0;
}

void APU::triggerChannel4() {
    ch4.enabled = ch4.dacEnabled;
    
    if (ch4.lengthCounter == 0) {
        ch4.lengthCounter = 64;
        // Length counter extra clock bug: if length enable set and on length-clocking step
        if ((ch4.nr44 & 0x40) && (frameSequencerStep & 1) == 0) {
            ch4.lengthCounter--;
        }
    }
    
    int divisor = ch4.divisor == 0 ? 8 : ch4.divisor * 16;
    ch4.frequencyTimer = divisor << ch4.clockShift;
    ch4.envelopeTimer = ch4.envelopePeriod ? ch4.envelopePeriod : 8;
    ch4.volume = ch4.nr42 >> 4;
    ch4.lfsr = 0x7FFF;
}

float APU::getChannel1Sample() {
    if (!ch1.enabled || !ch1.dacEnabled) return 0.0f;
    
    uint8_t duty = DUTY_TABLE[ch1.dutyCycle];
    bool high = (duty >> (7 - ch1.dutyPosition)) & 1;
    
    return high ? (ch1.volume / 15.0f) : -(ch1.volume / 15.0f);
}

float APU::getChannel2Sample() {
    if (!ch2.enabled || !ch2.dacEnabled) return 0.0f;
    
    uint8_t duty = DUTY_TABLE[ch2.dutyCycle];
    bool high = (duty >> (7 - ch2.dutyPosition)) & 1;
    
    return high ? (ch2.volume / 15.0f) : -(ch2.volume / 15.0f);
}

float APU::getChannel3Sample() {
    if (!ch3.enabled || !ch3.dacEnabled) return 0.0f;
    
    int sampleIndex = ch3.positionCounter;
    uint8_t waveByte = waveRam[sampleIndex / 2];
    uint8_t sample = (sampleIndex & 1) ? (waveByte & 0x0F) : (waveByte >> 4);
    
    int volumeShift = (ch3.nr32 >> 5) & 0x03;
    if (volumeShift == 0) return 0.0f;
    sample >>= (volumeShift - 1);
    
    return (sample / 15.0f) * 2.0f - 1.0f;
}

float APU::getChannel4Sample() {
    if (!ch4.enabled || !ch4.dacEnabled) return 0.0f;
    
    bool high = ~ch4.lfsr & 1;
    
    return high ? (ch4.volume / 15.0f) : -(ch4.volume / 15.0f);
}

void APU::generateSample() {
    if (sampleBufferPos >= SAMPLE_BUFFER_SIZE * 2) {
        return;
    }
    
    float ch1Sample = getChannel1Sample();
    float ch2Sample = getChannel2Sample();
    float ch3Sample = getChannel3Sample();
    float ch4Sample = getChannel4Sample();
    
    float left = 0.0f;
    float right = 0.0f;
    
    if (nr51 & 0x10) left += ch1Sample;
    if (nr51 & 0x01) right += ch1Sample;
    if (nr51 & 0x20) left += ch2Sample;
    if (nr51 & 0x02) right += ch2Sample;
    if (nr51 & 0x40) left += ch3Sample;
    if (nr51 & 0x04) right += ch3Sample;
    if (nr51 & 0x80) left += ch4Sample;
    if (nr51 & 0x08) right += ch4Sample;
    
    int leftVol = ((nr50 >> 4) & 7) + 1;
    int rightVol = (nr50 & 7) + 1;
    
    left = left * leftVol / 32.0f;
    right = right * rightVol / 32.0f;
    
    applyFilters(left, right);
    
    left = std::max(-1.0f, std::min(1.0f, left));
    right = std::max(-1.0f, std::min(1.0f, right));
    
    sampleBuffer[sampleBufferPos++] = left;
    sampleBuffer[sampleBufferPos++] = right;
}

int APU::getSamples(float* buffer, int maxSamples) {
    int samplesToReturn = std::min(sampleBufferPos, maxSamples * 2);
    
    if (samplesToReturn > 0) {
        std::memcpy(buffer, sampleBuffer.data(), samplesToReturn * sizeof(float));
        
        if (samplesToReturn < sampleBufferPos) {
            std::memmove(sampleBuffer.data(), 
                        sampleBuffer.data() + samplesToReturn,
                        (sampleBufferPos - samplesToReturn) * sizeof(float));
        }
        sampleBufferPos -= samplesToReturn;
    }
    
    return samplesToReturn / 2;
}

uint8_t APU::read(uint16_t addr) {
    static const uint8_t readMasks[] = {
        0x80, 0x3F, 0x00, 0xFF, 0xBF,  // NR10-NR14
        0xFF, 0x3F, 0x00, 0xFF, 0xBF,  // NR20-NR24
        0x7F, 0xFF, 0x9F, 0xFF, 0xBF,  // NR30-NR34
        0xFF, 0xFF, 0x00, 0x00, 0xBF,  // NR40-NR44
        0x00, 0x00, 0x70               // NR50-NR52
    };
    
    switch (addr) {
        case 0xFF10: return ch1.nr10 | 0x80;
        case 0xFF11: return ch1.nr11 | 0x3F;
        case 0xFF12: return ch1.nr12;
        case 0xFF13: return 0xFF;
        case 0xFF14: return ch1.nr14 | 0xBF;
        
        case 0xFF16: return ch2.nr21 | 0x3F;
        case 0xFF17: return ch2.nr22;
        case 0xFF18: return 0xFF;
        case 0xFF19: return ch2.nr24 | 0xBF;
        
        case 0xFF1A: return ch3.nr30 | 0x7F;
        case 0xFF1B: return 0xFF;
        case 0xFF1C: return ch3.nr32 | 0x9F;
        case 0xFF1D: return 0xFF;
        case 0xFF1E: return ch3.nr34 | 0xBF;
        
        case 0xFF20: return 0xFF;
        case 0xFF21: return ch4.nr42;
        case 0xFF22: return ch4.nr43;
        case 0xFF23: return ch4.nr44 | 0xBF;
        
        case 0xFF24: return nr50;
        case 0xFF25: return nr51;
        case 0xFF26: {
            uint8_t status = nr52 & 0x80;
            if (ch1.enabled) status |= 0x01;
            if (ch2.enabled) status |= 0x02;
            if (ch3.enabled) status |= 0x04;
            if (ch4.enabled) status |= 0x08;
            return status | 0x70;
        }
        
        case 0xFF30: case 0xFF31: case 0xFF32: case 0xFF33:
        case 0xFF34: case 0xFF35: case 0xFF36: case 0xFF37:
        case 0xFF38: case 0xFF39: case 0xFF3A: case 0xFF3B:
        case 0xFF3C: case 0xFF3D: case 0xFF3E: case 0xFF3F:
            // Wave RAM corruption: if CH3 is playing, return the byte being accessed
            if (ch3.enabled) {
                return waveRam[ch3.positionCounter / 2];
            }
            return waveRam[addr - 0xFF30];
        
        default:
            return 0xFF;
    }
}

void APU::write(uint16_t addr, uint8_t val) {
    if (!(nr52 & 0x80) && addr != 0xFF26 && (addr < 0xFF30 || addr > 0xFF3F)) {
        return;
    }
    
    switch (addr) {
        case 0xFF10: {
            bool wasNegate = ch1.sweepNegate;
            ch1.nr10 = val;
            ch1.sweepPeriod = (val >> 4) & 7;
            ch1.sweepNegate = val & 0x08;
            ch1.sweepShift = val & 7;
            
            // Sweep negate quirk: if negate was used and now cleared, disable channel
            if (ch1.sweepNegateUsed && wasNegate && !ch1.sweepNegate) {
                ch1.enabled = false;
            }
            break;
        }
            
        case 0xFF11:
            ch1.nr11 = val;
            ch1.dutyCycle = val >> 6;
            ch1.lengthCounter = 64 - (val & 0x3F);
            break;
            
        case 0xFF12: {
            uint8_t oldVal = ch1.nr12;
            ch1.nr12 = val;
            ch1.dacEnabled = (val & 0xF8) != 0;
            ch1.envelopePeriod = val & 7;
            ch1.envelopeIncreasing = val & 0x08;
            
            // Zombie mode: volume changes when writing while channel active
            if (ch1.enabled) {
                if ((val & 0x08) && !(oldVal & 0x08)) {
                    // Switching to increment mode: volume++
                    ch1.volume = (ch1.volume + 1) & 0x0F;
                } else if (((oldVal ^ val) & 0x08) != 0) {
                    // Direction changed: volume = 16 - volume
                    ch1.volume = (16 - ch1.volume) & 0x0F;
                }
            }
            
            if (!ch1.dacEnabled) ch1.enabled = false;
            break;
        }
            
        case 0xFF13:
            ch1.nr13 = val;
            ch1.frequency = (ch1.frequency & 0x700) | val;
            break;
            
        case 0xFF14:
            ch1.nr14 = val;
            ch1.frequency = (ch1.frequency & 0xFF) | ((val & 7) << 8);
            if (val & 0x80) {
                triggerChannel1();
            }
            break;
        
        case 0xFF16:
            ch2.nr21 = val;
            ch2.dutyCycle = val >> 6;
            ch2.lengthCounter = 64 - (val & 0x3F);
            break;
            
        case 0xFF17: {
            uint8_t oldVal = ch2.nr22;
            ch2.nr22 = val;
            ch2.dacEnabled = (val & 0xF8) != 0;
            ch2.envelopePeriod = val & 7;
            ch2.envelopeIncreasing = val & 0x08;
            
            // Zombie mode: volume changes when writing while channel active
            if (ch2.enabled) {
                if ((val & 0x08) && !(oldVal & 0x08)) {
                    // Switching to increment mode: volume++
                    ch2.volume = (ch2.volume + 1) & 0x0F;
                } else if (((oldVal ^ val) & 0x08) != 0) {
                    // Direction changed: volume = 16 - volume
                    ch2.volume = (16 - ch2.volume) & 0x0F;
                }
            }
            
            if (!ch2.dacEnabled) ch2.enabled = false;
            break;
        }
            
        case 0xFF18:
            ch2.nr23 = val;
            ch2.frequency = (ch2.frequency & 0x700) | val;
            break;
            
        case 0xFF19:
            ch2.nr24 = val;
            ch2.frequency = (ch2.frequency & 0xFF) | ((val & 7) << 8);
            if (val & 0x80) {
                triggerChannel2();
            }
            break;
        
        case 0xFF1A:
            ch3.nr30 = val;
            ch3.dacEnabled = val & 0x80;
            if (!ch3.dacEnabled) ch3.enabled = false;
            break;
            
        case 0xFF1B:
            ch3.nr31 = val;
            ch3.lengthCounter = 256 - val;
            break;
            
        case 0xFF1C:
            ch3.nr32 = val;
            break;
            
        case 0xFF1D:
            ch3.nr33 = val;
            ch3.frequency = (ch3.frequency & 0x700) | val;
            break;
            
        case 0xFF1E:
            ch3.nr34 = val;
            ch3.frequency = (ch3.frequency & 0xFF) | ((val & 7) << 8);
            if (val & 0x80) {
                triggerChannel3();
            }
            break;
        
        case 0xFF20:
            ch4.nr41 = val;
            ch4.lengthCounter = 64 - (val & 0x3F);
            break;
            
        case 0xFF21: {
            uint8_t oldVal = ch4.nr42;
            ch4.nr42 = val;
            ch4.dacEnabled = (val & 0xF8) != 0;
            ch4.envelopePeriod = val & 7;
            ch4.envelopeIncreasing = val & 0x08;
            
            // Zombie mode: volume changes when writing while channel active
            if (ch4.enabled) {
                if ((val & 0x08) && !(oldVal & 0x08)) {
                    // Switching to increment mode: volume++
                    ch4.volume = (ch4.volume + 1) & 0x0F;
                } else if (((oldVal ^ val) & 0x08) != 0) {
                    // Direction changed: volume = 16 - volume
                    ch4.volume = (16 - ch4.volume) & 0x0F;
                }
            }
            
            if (!ch4.dacEnabled) ch4.enabled = false;
            break;
        }
            
        case 0xFF22:
            ch4.nr43 = val;
            ch4.clockShift = val >> 4;
            ch4.widthMode = val & 0x08;
            ch4.divisor = val & 7;
            break;
            
        case 0xFF23:
            ch4.nr44 = val;
            if (val & 0x80) {
                triggerChannel4();
            }
            break;
        
        case 0xFF24:
            nr50 = val;
            break;
            
        case 0xFF25:
            nr51 = val;
            break;
            
        case 0xFF26:
            nr52 = (nr52 & 0x0F) | (val & 0x80);
            if (!(val & 0x80)) {
                ch1 = {};
                ch2 = {};
                ch3 = {};
                ch4 = {};
                nr50 = 0;
                nr51 = 0;
            }
            break;
        
        case 0xFF30: case 0xFF31: case 0xFF32: case 0xFF33:
        case 0xFF34: case 0xFF35: case 0xFF36: case 0xFF37:
        case 0xFF38: case 0xFF39: case 0xFF3A: case 0xFF3B:
        case 0xFF3C: case 0xFF3D: case 0xFF3E: case 0xFF3F:
            waveRam[addr - 0xFF30] = val;
            break;
    }
}

void APU::initFilters() {
    // Reset filter state
    lpfLeftPrev = 0.0f;
    lpfRightPrev = 0.0f;
    hpfLeftPrev = 0.0f;
    hpfRightPrev = 0.0f;
    hpfLeftCapacitor = 0.0f;
    hpfRightCapacitor = 0.0f;
    
    // Compute filter coefficients using the formula:
    // alpha = dt / (RC + dt) for low-pass
    // alpha = RC / (RC + dt) for high-pass
    // where RC = 1 / (2 * PI * cutoff) and dt = 1 / sampleRate
    
    float dt = 1.0f / static_cast<float>(SAMPLE_RATE);
    
    // Low-pass filter coefficient (14kHz cutoff)
    float lpfRC = 1.0f / (2.0f * 3.14159265f * LPF_CUTOFF);
    lpfAlpha = dt / (lpfRC + dt);
    
    // High-pass filter coefficient (20Hz cutoff)
    float hpfRC = 1.0f / (2.0f * 3.14159265f * HPF_CUTOFF);
    hpfAlpha = hpfRC / (hpfRC + dt);
}

void APU::applyFilters(float& left, float& right) {
    // Apply high-pass filter first (removes DC offset, smooths channel on/off clicks)
    // This emulates the capacitor-coupled output of the real Game Boy
    // Formula: output = alpha * (prevOutput + input - prevInput)
    float hpfLeftOut = hpfAlpha * (hpfLeftCapacitor + left - hpfLeftPrev);
    float hpfRightOut = hpfAlpha * (hpfRightCapacitor + right - hpfRightPrev);
    hpfLeftPrev = left;
    hpfRightPrev = right;
    hpfLeftCapacitor = hpfLeftOut;
    hpfRightCapacitor = hpfRightOut;
    
    // Apply low-pass filter (removes harshness/aliasing from square waves)
    // This emulates the analog filtering in the Game Boy's audio path
    // Formula: output = prevOutput + alpha * (input - prevOutput)
    lpfLeftPrev = lpfLeftPrev + lpfAlpha * (hpfLeftOut - lpfLeftPrev);
    lpfRightPrev = lpfRightPrev + lpfAlpha * (hpfRightOut - lpfRightPrev);
    
    left = lpfLeftPrev;
    right = lpfRightPrev;
}
