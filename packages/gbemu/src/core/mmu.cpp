#include "mmu.h"
#include "apu.h"
#include "timer.h"
#include <cstring>
#include <ctime>

MMU::MMU() 
    : vram(0x2000, 0)
    , eram(0x8000, 0)  
    , wram(0x2000, 0)
    , oam(0xA0, 0)
    , hram(0x7F, 0)
    , mbcType(0)
    , romBank(1)
    , ramBank(0)
    , ramEnabled(false)
    , mbcMode(0)
    , rtc{}
    , rtcLatched{}
    , rtcLatchState(0xFF)
    , rtcSelected(false)
    , joypadReg(0xCF)
    , joypadButtons(0x0F)
    , joypadDpad(0x0F)
    , div(0)
    , tima(0)
    , tma(0)
    , tac(0)
    , sb(0)
    , sc(0)
    , serialCycles(0)
    , serialActive(false)
    , interruptFlag(0xE1)
    , interruptEnable(0)
    , lcdc(0x91)
    , stat(0x85)
    , scy(0)
    , scx(0)
    , ly(0)
    , lyc(0)
    , dma(0)
    , bgp(0xFC)
    , obp0(0xFF)
    , obp1(0xFF)
    , wy(0)
    , wx(0)
    , ppuMode(0)
    , dmaActive(false)
    , dmaSource(0)
    , dmaCyclesLeft(0)
    , dmaIndex(0)
{
    rtc.lastTime = static_cast<uint64_t>(std::time(nullptr));
}

bool MMU::loadROM(const uint8_t* data, size_t size) {
    if (size < 0x150) return false;  
    
    rom.assign(data, data + size);
    detectMBC();
    romBank = 1;
    ramBank = 0;
    ramEnabled = false;
    
    return true;
}

void MMU::detectMBC() {
    if (rom.size() < 0x148) {
        mbcType = 0;
        return;
    }
    
    uint8_t cartType = rom[0x147];
    
    switch (cartType) {
        case 0x00: mbcType = 0; break;  
        case 0x01: case 0x02: case 0x03: mbcType = 1; break;  
        case 0x05: case 0x06: mbcType = 2; break;  
        case 0x0F: case 0x10: case 0x11: case 0x12: case 0x13: mbcType = 3; break;  
        case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E: mbcType = 5; break;  
        default: mbcType = 0; break;
    }
}

void MMU::handleMBCWrite(uint16_t addr, uint8_t val) {
    switch (mbcType) {
        case 0:  
            break;
            
        case 1:  
            if (addr < 0x2000) {
                ramEnabled = (val & 0x0F) == 0x0A;
            } else if (addr < 0x4000) {
                uint8_t bank = val & 0x1F;
                if (bank == 0) bank = 1;
                romBank = (romBank & 0x60) | bank;
            } else if (addr < 0x6000) {
                if (mbcMode == 0) {
                    romBank = (romBank & 0x1F) | ((val & 0x03) << 5);
                } else {
                    ramBank = val & 0x03;
                }
            } else {
                mbcMode = val & 0x01;
            }
            break;
        
        case 2:  
            if (addr < 0x4000) {
                if ((addr & 0x0100) == 0) {
                    ramEnabled = (val & 0x0F) == 0x0A;
                } else {
                    uint8_t bank = val & 0x0F;
                    if (bank == 0) bank = 1;
                    romBank = bank;
                }
            }
            break;
            
        case 3:  
            if (addr < 0x2000) {
                ramEnabled = (val & 0x0F) == 0x0A;
            } else if (addr < 0x4000) {
                uint8_t bank = val & 0x7F;
                if (bank == 0) bank = 1;
                romBank = bank;
            } else if (addr < 0x6000) {
                if (val <= 0x03) {
                    ramBank = val;
                    rtcSelected = false;
                } else if (val >= 0x08 && val <= 0x0C) {
                    ramBank = val;
                    rtcSelected = true;
                }
            } else {
                if (rtcLatchState == 0x00 && val == 0x01) {
                    updateRTC();
                    rtcLatched = rtc;
                }
                rtcLatchState = val;
            }
            break;
            
        case 5:  
            if (addr < 0x2000) {
                ramEnabled = (val & 0x0F) == 0x0A;
            } else if (addr < 0x3000) {
                romBank = (romBank & 0x100) | val;
            } else if (addr < 0x4000) {
                romBank = (romBank & 0xFF) | ((val & 0x01) << 8);
            } else if (addr < 0x6000) {
                ramBank = val & 0x0F;
            }
            break;
    }
}

uint32_t MMU::getROMOffset(uint16_t addr) {
    if (addr < 0x4000) {
        if (mbcType == 1 && mbcMode == 1) {
            return ((romBank & 0x60) << 14) | addr;
        }
        return addr;
    } else {
        uint32_t offset = (romBank << 14) | (addr & 0x3FFF);
        return offset % rom.size();
    }
}

uint16_t MMU::getRAMOffset(uint16_t addr) {
    uint32_t offset = (ramBank << 13) | (addr & 0x1FFF);
    return offset % eram.size();
}

void MMU::setJoypad(uint8_t buttons, uint8_t dpad) {
    joypadButtons = buttons;
    joypadDpad = dpad;
}

void MMU::startDMATransfer(uint8_t val) {
    dmaSource = val << 8;
    dmaActive = true;
    dmaCyclesLeft = 160;  
    dmaIndex = 0;
}

void MMU::stepDMA(int cycles) {
    if (!dmaActive) return;
    
    while (cycles > 0 && dmaIndex < 0xA0) {
        uint16_t srcAddr = dmaSource + dmaIndex;
        uint8_t val = 0xFF;
        
        if (srcAddr < 0x4000) {
            val = (srcAddr < rom.size()) ? rom[getROMOffset(srcAddr)] : 0xFF;
        } else if (srcAddr < 0x8000) {
            uint32_t offset = getROMOffset(srcAddr);
            val = (offset < rom.size()) ? rom[offset] : 0xFF;
        } else if (srcAddr < 0xA000) {
            val = vram[srcAddr - 0x8000];
        } else if (srcAddr < 0xC000) {
            val = ramEnabled ? eram[getRAMOffset(srcAddr)] : 0xFF;
        } else if (srcAddr < 0xE000) {
            val = wram[srcAddr - 0xC000];
        } else if (srcAddr < 0xFE00) {
            val = wram[srcAddr - 0xE000];  
        }
        
        oam[dmaIndex] = val;
        dmaIndex++;
        cycles--;
        dmaCyclesLeft--;
    }
    
    if (dmaIndex >= 0xA0) {
        dmaActive = false;
    }
}

uint8_t MMU::read(uint16_t addr) {
    if (dmaActive && addr < 0xFF00) {
        return 0xFF;
    }
    
    if (addr < 0x4000) {
        if (addr < rom.size()) {
            return rom[getROMOffset(addr)];
        }
        return 0xFF;
    }
    
    if (addr < 0x8000) {
        uint32_t offset = getROMOffset(addr);
        if (offset < rom.size()) {
            return rom[offset];
        }
        return 0xFF;
    }
    
    if (addr < 0xA000) {
        if (ppuMode == 3) return 0xFF;
        return vram[addr - 0x8000];
    }
    
    if (addr < 0xC000) {
        if (!ramEnabled) return 0xFF;
        if (mbcType == 2) {
            return eram[addr & 0x1FF] | 0xF0;  
        }
        if (mbcType == 3 && rtcSelected) {
            return readRTC(ramBank);
        }
        return eram[getRAMOffset(addr)];
    }
    
    if (addr < 0xE000) {
        return wram[addr - 0xC000];
    }
    
    if (addr < 0xFE00) {
        return wram[addr - 0xE000];
    }
    
    if (addr < 0xFEA0) {
        if (ppuMode >= 2) return 0xFF;
        return oam[addr - 0xFE00];
    }
    
    if (addr < 0xFF00) {
        return 0xFF;
    }
    
    if (addr < 0xFF80) {
        switch (addr) {
            case 0xFF00:  
                if ((joypadReg & 0x20) == 0) {
                    return (joypadReg & 0xF0) | (joypadButtons & 0x0F);
                }
                if ((joypadReg & 0x10) == 0) {
                    return (joypadReg & 0xF0) | (joypadDpad & 0x0F);
                }
                return joypadReg | 0x0F;
            case 0xFF01: return sb;
            case 0xFF02: return sc;
            case 0xFF04: return div >> 8;
            case 0xFF05: return tima;
            case 0xFF06: return tma;
            case 0xFF07: return tac | 0xF8;
            case 0xFF0F: return interruptFlag | 0xE0;
            
            case 0xFF10: case 0xFF11: case 0xFF12: case 0xFF13: case 0xFF14:
            case 0xFF16: case 0xFF17: case 0xFF18: case 0xFF19:
            case 0xFF1A: case 0xFF1B: case 0xFF1C: case 0xFF1D: case 0xFF1E:
            case 0xFF20: case 0xFF21: case 0xFF22: case 0xFF23:
            case 0xFF24: case 0xFF25: case 0xFF26:
            case 0xFF30: case 0xFF31: case 0xFF32: case 0xFF33:
            case 0xFF34: case 0xFF35: case 0xFF36: case 0xFF37:
            case 0xFF38: case 0xFF39: case 0xFF3A: case 0xFF3B:
            case 0xFF3C: case 0xFF3D: case 0xFF3E: case 0xFF3F:
                return apu ? apu->read(addr) : 0xFF;
            
            case 0xFF40: return lcdc;
            case 0xFF41: return stat | 0x80;
            case 0xFF42: return scy;
            case 0xFF43: return scx;
            case 0xFF44: return ly;
            case 0xFF45: return lyc;
            case 0xFF46: return dma;
            case 0xFF47: return bgp;
            case 0xFF48: return obp0;
            case 0xFF49: return obp1;
            case 0xFF4A: return wy;
            case 0xFF4B: return wx;
            
            default: return 0xFF;
        }
    }
    
    if (addr < 0xFFFF) {
        return hram[addr - 0xFF80];
    }
    
    return interruptEnable;
}

void MMU::write(uint16_t addr, uint8_t val) {
    if (dmaActive && addr < 0xFF00) {
        return;
    }
    
    if (addr < 0x8000) {
        handleMBCWrite(addr, val);
        return;
    }
    
    if (addr < 0xA000) {
        if (ppuMode != 3) {
            vram[addr - 0x8000] = val;
        }
        return;
    }
    
    if (addr < 0xC000) {
        if (ramEnabled) {
            if (mbcType == 2) {
                eram[addr & 0x1FF] = val & 0x0F;
            } else if (mbcType == 3 && rtcSelected) {
                writeRTC(ramBank, val);
            } else {
                eram[getRAMOffset(addr)] = val;
            }
        }
        return;
    }
    
    if (addr < 0xE000) {
        wram[addr - 0xC000] = val;
        return;
    }
    
    if (addr < 0xFE00) {
        wram[addr - 0xE000] = val;
        return;
    }
    
    if (addr < 0xFEA0) {
        if (ppuMode < 2) {
            oam[addr - 0xFE00] = val;
        }
        return;
    }
    
    if (addr < 0xFF00) {
        return;
    }
    
    if (addr < 0xFF80) {
        switch (addr) {
            case 0xFF00: joypadReg = (val & 0x30) | (joypadReg & 0xCF); break;
            case 0xFF01: sb = val; break;
            case 0xFF02: 
                sc = val;
                if ((val & 0x81) == 0x81) {
                    serialActive = true;
                    serialCycles = 512;  
                }
                break;
            case 0xFF04:  
                div = 0;
                if (timer) timer->onDivWrite();
                break;
            case 0xFF05: tima = val; break;
            case 0xFF06: tma = val; break;
            case 0xFF07: tac = val & 0x07; break;
            case 0xFF0F: interruptFlag = val & 0x1F; break;
            
            case 0xFF10: case 0xFF11: case 0xFF12: case 0xFF13: case 0xFF14:
            case 0xFF16: case 0xFF17: case 0xFF18: case 0xFF19:
            case 0xFF1A: case 0xFF1B: case 0xFF1C: case 0xFF1D: case 0xFF1E:
            case 0xFF20: case 0xFF21: case 0xFF22: case 0xFF23:
            case 0xFF24: case 0xFF25: case 0xFF26:
            case 0xFF30: case 0xFF31: case 0xFF32: case 0xFF33:
            case 0xFF34: case 0xFF35: case 0xFF36: case 0xFF37:
            case 0xFF38: case 0xFF39: case 0xFF3A: case 0xFF3B:
            case 0xFF3C: case 0xFF3D: case 0xFF3E: case 0xFF3F:
                if (apu) apu->write(addr, val);
                break;
            
            case 0xFF40: lcdc = val; break;
            case 0xFF41: stat = (stat & 0x07) | (val & 0x78); break;  
            case 0xFF42: scy = val; break;
            case 0xFF43: scx = val; break;
            case 0xFF44: break;  
            case 0xFF45: lyc = val; break;
            case 0xFF46: dma = val; startDMATransfer(val); break;
            case 0xFF47: bgp = val; break;
            case 0xFF48: obp0 = val; break;
            case 0xFF49: obp1 = val; break;
            case 0xFF4A: wy = val; break;
            case 0xFF4B: wx = val; break;
        }
        return;
    }
    
    if (addr < 0xFFFF) {
        hram[addr - 0xFF80] = val;
        return;
    }
    
    interruptEnable = val;
}

void MMU::updateRTC() {
    if (rtc.daysHigh & 0x40) return;
    
    uint64_t currentTime = static_cast<uint64_t>(std::time(nullptr));
    uint64_t elapsed = currentTime - rtc.lastTime;
    rtc.lastTime = currentTime;
    
    uint32_t totalSeconds = rtc.seconds + elapsed;
    rtc.seconds = totalSeconds % 60;
    
    uint32_t totalMinutes = rtc.minutes + (totalSeconds / 60);
    rtc.minutes = totalMinutes % 60;
    
    uint32_t totalHours = rtc.hours + (totalMinutes / 60);
    rtc.hours = totalHours % 24;
    
    uint32_t totalDays = ((rtc.daysHigh & 0x01) << 8) | rtc.daysLow;
    totalDays += totalHours / 24;
    
    rtc.daysLow = totalDays & 0xFF;
    rtc.daysHigh = (rtc.daysHigh & 0xFE) | ((totalDays >> 8) & 0x01);
    
    if (totalDays > 511) {
        rtc.daysHigh |= 0x80;  
        rtc.daysLow = 0;
        rtc.daysHigh &= 0xFE;  
    }
}

uint8_t MMU::readRTC(uint8_t reg) {
    switch (reg) {
        case 0x08: return rtcLatched.seconds;
        case 0x09: return rtcLatched.minutes;
        case 0x0A: return rtcLatched.hours;
        case 0x0B: return rtcLatched.daysLow;
        case 0x0C: return rtcLatched.daysHigh;
        default: return 0xFF;
    }
}

void MMU::writeRTC(uint8_t reg, uint8_t val) {
    updateRTC();
    
    switch (reg) {
        case 0x08: rtc.seconds = val & 0x3F; break;  
        case 0x09: rtc.minutes = val & 0x3F; break;  
        case 0x0A: rtc.hours = val & 0x1F; break;    
        case 0x0B: rtc.daysLow = val; break;
        case 0x0C: rtc.daysHigh = val & 0xC1; break; 
    }
    
    rtc.lastTime = static_cast<uint64_t>(std::time(nullptr));
}

void MMU::stepSerial(int cycles) {
    if (!serialActive) return;
    
    serialCycles -= cycles;
    
    if (serialCycles <= 0) {
        serialActive = false;
        sc &= 0x7F;  
        sb = 0xFF;   
        interruptFlag |= 0x08;  
    }
}
