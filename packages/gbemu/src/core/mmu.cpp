#include "mmu.h"
#include "apu.h"
#include <cstring>

MMU::MMU() 
    : vram(0x2000, 0)
    , eram(0x8000, 0)  // Max 32KB external RAM
    , wram(0x2000, 0)
    , oam(0xA0, 0)
    , hram(0x7F, 0)
    , mbcType(0)
    , romBank(1)
    , ramBank(0)
    , ramEnabled(false)
    , mbcMode(0)
    , joypadReg(0xCF)
    , joypadButtons(0x0F)
    , joypadDpad(0x0F)
    , div(0)
    , tima(0)
    , tma(0)
    , tac(0)
    , sb(0)
    , sc(0)
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
{
}

bool MMU::loadROM(const uint8_t* data, size_t size) {
    if (size < 0x150) return false;  // Minimum ROM size (header)
    
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
    
    // Determine MBC type from cartridge type byte
    switch (cartType) {
        case 0x00: mbcType = 0; break;  // ROM Only
        case 0x01: case 0x02: case 0x03: mbcType = 1; break;  // MBC1
        case 0x05: case 0x06: mbcType = 2; break;  // MBC2
        case 0x0F: case 0x10: case 0x11: case 0x12: case 0x13: mbcType = 3; break;  // MBC3
        case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E: mbcType = 5; break;  // MBC5
        default: mbcType = 0; break;
    }
}

void MMU::handleMBCWrite(uint16_t addr, uint8_t val) {
    uint8_t oldBank = romBank;
    
    switch (mbcType) {
        case 0:  // No MBC
            break;
            
        case 1:  // MBC1
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
            
        case 3:  // MBC3
            if (addr < 0x2000) {
                ramEnabled = (val & 0x0F) == 0x0A;
            } else if (addr < 0x4000) {
                uint8_t bank = val & 0x7F;
                if (bank == 0) bank = 1;
                romBank = bank;
            } else if (addr < 0x6000) {
                ramBank = val;
            }
            break;
            
        case 5:  // MBC5
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
    
    // Log bank switch if bank changed
    if (romBank != oldBank) {
        MMU::BankSwitch bs;
        bs.addr = addr;
        bs.value = val;
        bs.oldBank = oldBank;
        bs.newBank = romBank;
        bankSwitchHistory.push_back(bs);
    }
}

uint32_t MMU::getROMOffset(uint16_t addr) {
    if (addr < 0x4000) {
        // Bank 0 (fixed) - but MBC1 mode 1 can change this
        if (mbcType == 1 && mbcMode == 1) {
            return ((romBank & 0x60) << 14) | addr;
        }
        return addr;
    } else {
        // Switchable bank
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

void MMU::doDMATransfer(uint8_t val) {
    uint16_t src = val << 8;
    for (int i = 0; i < 0xA0; i++) {
        oam[i] = read(src + i);
    }
}

uint8_t MMU::read(uint16_t addr) {
    // ROM Bank 0
    if (addr < 0x4000) {
        if (addr < rom.size()) {
            return rom[getROMOffset(addr)];
        }
        return 0xFF;
    }
    
    // ROM Bank 1-N
    if (addr < 0x8000) {
        uint32_t offset = getROMOffset(addr);
        if (offset < rom.size()) {
            return rom[offset];
        }
        return 0xFF;
    }
    
    // VRAM
    if (addr < 0xA000) {
        // VRAM inaccessible during mode 3
        if (ppuMode == 3) return 0xFF;
        return vram[addr - 0x8000];
    }
    
    // External RAM
    if (addr < 0xC000) {
        if (!ramEnabled) return 0xFF;
        return eram[getRAMOffset(addr)];
    }
    
    // WRAM
    if (addr < 0xE000) {
        return wram[addr - 0xC000];
    }
    
    // Echo RAM
    if (addr < 0xFE00) {
        return wram[addr - 0xE000];
    }
    
    // OAM
    if (addr < 0xFEA0) {
        // OAM inaccessible during mode 2 and 3
        if (ppuMode >= 2) return 0xFF;
        return oam[addr - 0xFE00];
    }
    
    // Not usable
    if (addr < 0xFF00) {
        return 0xFF;
    }
    
    // I/O Registers
    if (addr < 0xFF80) {
        switch (addr) {
            case 0xFF00:  // Joypad
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
            
            // Audio registers - delegate to APU
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
            
            // PPU registers
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
    
    // HRAM
    if (addr < 0xFFFF) {
        return hram[addr - 0xFF80];
    }
    
    // Interrupt Enable
    return interruptEnable;
}

void MMU::write(uint16_t addr, uint8_t val) {
    // ROM area - MBC control
    if (addr < 0x8000) {
        handleMBCWrite(addr, val);
        return;
    }
    
    // VRAM
    if (addr < 0xA000) {
        if (ppuMode != 3) {
            vram[addr - 0x8000] = val;
        }
        return;
    }
    
    // External RAM
    if (addr < 0xC000) {
        if (ramEnabled) {
            eram[getRAMOffset(addr)] = val;
        }
        return;
    }
    
    // WRAM
    if (addr < 0xE000) {
        wram[addr - 0xC000] = val;
        return;
    }
    
    // Echo RAM
    if (addr < 0xFE00) {
        wram[addr - 0xE000] = val;
        return;
    }
    
    // OAM
    if (addr < 0xFEA0) {
        if (ppuMode < 2) {
            oam[addr - 0xFE00] = val;
        }
        return;
    }
    
    // Not usable
    if (addr < 0xFF00) {
        return;
    }
    
    // I/O Registers
    if (addr < 0xFF80) {
        switch (addr) {
            case 0xFF00: joypadReg = (val & 0x30) | (joypadReg & 0xCF); break;
            case 0xFF01: sb = val; break;
            case 0xFF02: sc = val; break;
            case 0xFF04: div = 0; break;  // Writing any value resets DIV
            case 0xFF05: tima = val; break;
            case 0xFF06: tma = val; break;
            case 0xFF07: tac = val & 0x07; break;
            case 0xFF0F: interruptFlag = val & 0x1F; break;
            
            // Audio registers - delegate to APU
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
            
            // PPU registers
            case 0xFF40: lcdc = val; break;
            case 0xFF41: stat = (stat & 0x07) | (val & 0x78); break;  // Lower 3 bits read-only
            case 0xFF42: scy = val; break;
            case 0xFF43: scx = val; break;
            case 0xFF44: break;  // LY is read-only
            case 0xFF45: lyc = val; break;
            case 0xFF46: dma = val; doDMATransfer(val); break;
            case 0xFF47: bgp = val; break;
            case 0xFF48: obp0 = val; break;
            case 0xFF49: obp1 = val; break;
            case 0xFF4A: wy = val; break;
            case 0xFF4B: wx = val; break;
        }
        return;
    }
    
    // HRAM
    if (addr < 0xFFFF) {
        hram[addr - 0xFF80] = val;
        return;
    }
    
    // Interrupt Enable
    interruptEnable = val;
}
