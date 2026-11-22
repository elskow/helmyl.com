#include "cpu.h"
#include "mmu.h"

CPU::CPU(MMU& mmu) : mmu(mmu) {
    reset();
}

void CPU::reset() {
    a = 0x01; f = 0xB0;
    b = 0x00; c = 0x13;
    d = 0x00; e = 0xD8;
    h = 0x01; l = 0x4D;
    sp = 0xFFFE;
    pc = 0x0100;
    
    halted = false;
    stopped = false;
    ime = false;
    imeScheduled = false;
    haltBug = false;
}

void CPU::setFlag(uint8_t flag, bool value) {
    if (value) {
        f |= flag;
    } else {
        f &= ~flag;
    }
}

bool CPU::getFlag(uint8_t flag) const {
    return (f & flag) != 0;
}

uint8_t CPU::read8(uint16_t addr) {
    return mmu.read(addr);
}

uint16_t CPU::read16(uint16_t addr) {
    return mmu.read(addr) | (mmu.read(addr + 1) << 8);
}

void CPU::write8(uint16_t addr, uint8_t val) {
    mmu.write(addr, val);
}

void CPU::write16(uint16_t addr, uint16_t val) {
    mmu.write(addr, val & 0xFF);
    mmu.write(addr + 1, val >> 8);
}

uint8_t CPU::fetch8() {
    return read8(pc++);
}

uint16_t CPU::fetch16() {
    uint16_t val = read16(pc);
    pc += 2;
    return val;
}

void CPU::push16(uint16_t val) {
    sp -= 2;
    write16(sp, val);
}

uint16_t CPU::pop16() {
    uint16_t val = read16(sp);
    sp += 2;
    return val;
}

void CPU::add8(uint8_t val) {
    uint16_t result = a + val;
    setFlag(FLAG_Z, (result & 0xFF) == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, ((a & 0x0F) + (val & 0x0F)) > 0x0F);
    setFlag(FLAG_C, result > 0xFF);
    a = result & 0xFF;
}

void CPU::adc8(uint8_t val) {
    uint8_t carry = getFlag(FLAG_C) ? 1 : 0;
    uint16_t result = a + val + carry;
    setFlag(FLAG_Z, (result & 0xFF) == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, ((a & 0x0F) + (val & 0x0F) + carry) > 0x0F);
    setFlag(FLAG_C, result > 0xFF);
    a = result & 0xFF;
}

void CPU::sub8(uint8_t val) {
    uint16_t result = a - val;
    setFlag(FLAG_Z, (result & 0xFF) == 0);
    setFlag(FLAG_N, true);
    setFlag(FLAG_H, (a & 0x0F) < (val & 0x0F));
    setFlag(FLAG_C, a < val);
    a = result & 0xFF;
}

void CPU::sbc8(uint8_t val) {
    uint8_t carry = getFlag(FLAG_C) ? 1 : 0;
    int result = (int)a - (int)val - (int)carry;
    setFlag(FLAG_Z, (result & 0xFF) == 0);
    setFlag(FLAG_N, true);
    setFlag(FLAG_H, ((int)(a & 0x0F) - (int)(val & 0x0F) - (int)carry) < 0);
    setFlag(FLAG_C, result < 0);
    a = result & 0xFF;
}

void CPU::and8(uint8_t val) {
    a &= val;
    setFlag(FLAG_Z, a == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, true);
    setFlag(FLAG_C, false);
}

void CPU::or8(uint8_t val) {
    a |= val;
    setFlag(FLAG_Z, a == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, false);
}

void CPU::xor8(uint8_t val) {
    a ^= val;
    setFlag(FLAG_Z, a == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, false);
}

void CPU::cp8(uint8_t val) {
    setFlag(FLAG_Z, a == val);
    setFlag(FLAG_N, true);
    setFlag(FLAG_H, (a & 0x0F) < (val & 0x0F));
    setFlag(FLAG_C, a < val);
}

void CPU::inc8(uint8_t& reg) {
    reg++;
    setFlag(FLAG_Z, reg == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, (reg & 0x0F) == 0);
}

void CPU::dec8(uint8_t& reg) {
    reg--;
    setFlag(FLAG_Z, reg == 0);
    setFlag(FLAG_N, true);
    setFlag(FLAG_H, (reg & 0x0F) == 0x0F);
}

void CPU::addHL(uint16_t val) {
    uint32_t result = getHL() + val;
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, ((getHL() & 0x0FFF) + (val & 0x0FFF)) > 0x0FFF);
    setFlag(FLAG_C, result > 0xFFFF);
    setHL(result & 0xFFFF);
}

void CPU::addSP(int8_t val) {
    uint16_t result = sp + val;
    setFlag(FLAG_Z, false);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, ((sp & 0x0F) + (val & 0x0F)) > 0x0F);
    setFlag(FLAG_C, ((sp & 0xFF) + (val & 0xFF)) > 0xFF);
    sp = result;
}

uint8_t CPU::rlc(uint8_t val) {
    uint8_t carry = (val >> 7) & 1;
    val = (val << 1) | carry;
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, carry);
    return val;
}

uint8_t CPU::rrc(uint8_t val) {
    uint8_t carry = val & 1;
    val = (val >> 1) | (carry << 7);
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, carry);
    return val;
}

uint8_t CPU::rl(uint8_t val) {
    uint8_t oldCarry = getFlag(FLAG_C) ? 1 : 0;
    uint8_t newCarry = (val >> 7) & 1;
    val = (val << 1) | oldCarry;
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, newCarry);
    return val;
}

uint8_t CPU::rr(uint8_t val) {
    uint8_t oldCarry = getFlag(FLAG_C) ? 0x80 : 0;
    uint8_t newCarry = val & 1;
    val = (val >> 1) | oldCarry;
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, newCarry);
    return val;
}

uint8_t CPU::sla(uint8_t val) {
    uint8_t carry = (val >> 7) & 1;
    val <<= 1;
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, carry);
    return val;
}

uint8_t CPU::sra(uint8_t val) {
    uint8_t carry = val & 1;
    val = (val >> 1) | (val & 0x80);
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, carry);
    return val;
}

uint8_t CPU::swap(uint8_t val) {
    val = ((val & 0x0F) << 4) | ((val & 0xF0) >> 4);
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, false);
    return val;
}

uint8_t CPU::srl(uint8_t val) {
    uint8_t carry = val & 1;
    val >>= 1;
    setFlag(FLAG_Z, val == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, false);
    setFlag(FLAG_C, carry);
    return val;
}

void CPU::bit(uint8_t bitNum, uint8_t val) {
    setFlag(FLAG_Z, ((val >> bitNum) & 1) == 0);
    setFlag(FLAG_N, false);
    setFlag(FLAG_H, true);
}

uint8_t CPU::res(uint8_t bitNum, uint8_t val) {
    return val & ~(1 << bitNum);
}

uint8_t CPU::set(uint8_t bitNum, uint8_t val) {
    return val | (1 << bitNum);
}

void CPU::requestInterrupt(uint8_t interrupt) {
    uint8_t ifReg = mmu.read(0xFF0F);
    mmu.write(0xFF0F, ifReg | interrupt);
}

int CPU::handleInterrupts() {
    if (!ime && !halted) return 0;
    
    uint8_t ifReg = mmu.read(0xFF0F);  
    uint8_t ieReg = mmu.read(0xFFFF);  
    uint8_t pending = ifReg & ieReg & 0x1F;
    
    if (pending == 0) return 0;
    
    halted = false;
    
    if (!ime) return 0;
    
    ime = false;
    
    uint16_t vector = 0;
    uint8_t interrupt = 0;
    
    if (pending & 0x01) { vector = 0x40; interrupt = 0x01; }
    else if (pending & 0x02) { vector = 0x48; interrupt = 0x02; }
    else if (pending & 0x04) { vector = 0x50; interrupt = 0x04; }
    else if (pending & 0x08) { vector = 0x58; interrupt = 0x08; }
    else if (pending & 0x10) { vector = 0x60; interrupt = 0x10; }
    
    mmu.write(0xFF0F, ifReg & ~interrupt);
    
    push16(pc);
    pc = vector;
    
    return 20;
}

int CPU::step() {
    if (imeScheduled) {
        ime = true;
        imeScheduled = false;
    }
    
    int interruptCycles = handleInterrupts();
    if (interruptCycles > 0) {
        return interruptCycles;
    }
    
    if (halted) {
        return 4;
    }
    
    if (stopped) {
        return 4;
    }
    
    uint8_t opcode = fetch8();
    
    if (haltBug) {
        pc--;  
        haltBug = false;
    }
    
    return executeOpcode(opcode);
}

int CPU::executeOpcode(uint8_t opcode) {
    
    switch (opcode) {
        case 0x00: return 4;  
        case 0x01: setBC(fetch16()); return 12;  
        case 0x02: write8(getBC(), a); return 8;  
        case 0x03: setBC(getBC() + 1); return 8;  
        case 0x04: inc8(b); return 4;  
        case 0x05: dec8(b); return 4;  
        case 0x06: b = fetch8(); return 8;  
        case 0x07: {  
            uint8_t carry = (a >> 7) & 1;
            a = (a << 1) | carry;
            setFlag(FLAG_Z, false);
            setFlag(FLAG_N, false);
            setFlag(FLAG_H, false);
            setFlag(FLAG_C, carry);
            return 4;
        }
        case 0x08: write16(fetch16(), sp); return 20;  
        case 0x09: addHL(getBC()); return 8;  
        case 0x0A: a = read8(getBC()); return 8;  
        case 0x0B: setBC(getBC() - 1); return 8;  
        case 0x0C: inc8(c); return 4;  
        case 0x0D: dec8(c); return 4;  
        case 0x0E: c = fetch8(); return 8;  
        case 0x0F: {  
            uint8_t carry = a & 1;
            a = (a >> 1) | (carry << 7);
            setFlag(FLAG_Z, false);
            setFlag(FLAG_N, false);
            setFlag(FLAG_H, false);
            setFlag(FLAG_C, carry);
            return 4;
        }
        
        case 0x10: stopped = true; pc++; return 4;  
        case 0x11: setDE(fetch16()); return 12;  
        case 0x12: write8(getDE(), a); return 8;  
        case 0x13: setDE(getDE() + 1); return 8;  
        case 0x14: inc8(d); return 4;  
        case 0x15: dec8(d); return 4;  
        case 0x16: d = fetch8(); return 8;  
        case 0x17: {  
            uint8_t oldCarry = getFlag(FLAG_C) ? 1 : 0;
            uint8_t newCarry = (a >> 7) & 1;
            a = (a << 1) | oldCarry;
            setFlag(FLAG_Z, false);
            setFlag(FLAG_N, false);
            setFlag(FLAG_H, false);
            setFlag(FLAG_C, newCarry);
            return 4;
        }
        case 0x18: { int8_t offset = (int8_t)fetch8(); pc += offset; return 12; }  
        case 0x19: addHL(getDE()); return 8;  
        case 0x1A: a = read8(getDE()); return 8;  
        case 0x1B: setDE(getDE() - 1); return 8;  
        case 0x1C: inc8(e); return 4;  
        case 0x1D: dec8(e); return 4;  
        case 0x1E: e = fetch8(); return 8;  
        case 0x1F: {  
            uint8_t oldCarry = getFlag(FLAG_C) ? 0x80 : 0;
            uint8_t newCarry = a & 1;
            a = (a >> 1) | oldCarry;
            setFlag(FLAG_Z, false);
            setFlag(FLAG_N, false);
            setFlag(FLAG_H, false);
            setFlag(FLAG_C, newCarry);
            return 4;
        }
        
        case 0x20: {  
            int8_t offset = (int8_t)fetch8();
            if (!getFlag(FLAG_Z)) { pc += offset; return 12; }
            return 8;
        }
        case 0x21: setHL(fetch16()); return 12;  
        case 0x22: write8(getHL(), a); setHL(getHL() + 1); return 8;  
        case 0x23: setHL(getHL() + 1); return 8;  
        case 0x24: inc8(h); return 4;  
        case 0x25: dec8(h); return 4;  
        case 0x26: h = fetch8(); return 8;  
        case 0x27: {  
            uint8_t correction = 0;
            bool setCarry = false;
            if (getFlag(FLAG_H) || (!getFlag(FLAG_N) && (a & 0x0F) > 9)) {
                correction |= 0x06;
            }
            if (getFlag(FLAG_C) || (!getFlag(FLAG_N) && a > 0x99)) {
                correction |= 0x60;
                setCarry = true;
            }
            a += getFlag(FLAG_N) ? -correction : correction;
            setFlag(FLAG_Z, a == 0);
            setFlag(FLAG_H, false);
            setFlag(FLAG_C, setCarry);
            return 4;
        }
        case 0x28: {  
            int8_t offset = (int8_t)fetch8();
            if (getFlag(FLAG_Z)) { pc += offset; return 12; }
            return 8;
        }
        case 0x29: addHL(getHL()); return 8;  
        case 0x2A: a = read8(getHL()); setHL(getHL() + 1); return 8;  
        case 0x2B: setHL(getHL() - 1); return 8;  
        case 0x2C: inc8(l); return 4;  
        case 0x2D: dec8(l); return 4;  
        case 0x2E: l = fetch8(); return 8;  
        case 0x2F: a = ~a; setFlag(FLAG_N, true); setFlag(FLAG_H, true); return 4;  
        
        case 0x30: {  
            int8_t offset = (int8_t)fetch8();
            if (!getFlag(FLAG_C)) { pc += offset; return 12; }
            return 8;
        }
        case 0x31: sp = fetch16(); return 12;  
        case 0x32: write8(getHL(), a); setHL(getHL() - 1); return 8;  
        case 0x33: sp++; return 8;  
        case 0x34: { uint8_t val = read8(getHL()); inc8(val); write8(getHL(), val); return 12; }  
        case 0x35: { uint8_t val = read8(getHL()); dec8(val); write8(getHL(), val); return 12; }  
        case 0x36: write8(getHL(), fetch8()); return 12;  
        case 0x37: setFlag(FLAG_N, false); setFlag(FLAG_H, false); setFlag(FLAG_C, true); return 4;  
        case 0x38: {  
            int8_t offset = (int8_t)fetch8();
            if (getFlag(FLAG_C)) { pc += offset; return 12; }
            return 8;
        }
        case 0x39: addHL(sp); return 8;  
        case 0x3A: a = read8(getHL()); setHL(getHL() - 1); return 8;  
        case 0x3B: sp--; return 8;  
        case 0x3C: inc8(a); return 4;  
        case 0x3D: dec8(a); return 4;  
        case 0x3E: a = fetch8(); return 8;  
        case 0x3F: setFlag(FLAG_N, false); setFlag(FLAG_H, false); setFlag(FLAG_C, !getFlag(FLAG_C)); return 4;  
        
        case 0x40: return 4;  
        case 0x41: b = c; return 4;  
        case 0x42: b = d; return 4;  
        case 0x43: b = e; return 4;  
        case 0x44: b = h; return 4;  
        case 0x45: b = l; return 4;  
        case 0x46: b = read8(getHL()); return 8;  
        case 0x47: b = a; return 4;  
        case 0x48: c = b; return 4;  
        case 0x49: return 4;  
        case 0x4A: c = d; return 4;  
        case 0x4B: c = e; return 4;  
        case 0x4C: c = h; return 4;  
        case 0x4D: c = l; return 4;  
        case 0x4E: c = read8(getHL()); return 8;  
        case 0x4F: c = a; return 4;  
        
        case 0x50: d = b; return 4;  
        case 0x51: d = c; return 4;  
        case 0x52: return 4;  
        case 0x53: d = e; return 4;  
        case 0x54: d = h; return 4;  
        case 0x55: d = l; return 4;  
        case 0x56: d = read8(getHL()); return 8;  
        case 0x57: d = a; return 4;  
        case 0x58: e = b; return 4;  
        case 0x59: e = c; return 4;  
        case 0x5A: e = d; return 4;  
        case 0x5B: return 4;  
        case 0x5C: e = h; return 4;  
        case 0x5D: e = l; return 4;  
        case 0x5E: e = read8(getHL()); return 8;  
        case 0x5F: e = a; return 4;  
        
        case 0x60: h = b; return 4;  
        case 0x61: h = c; return 4;  
        case 0x62: h = d; return 4;  
        case 0x63: h = e; return 4;  
        case 0x64: return 4;  
        case 0x65: h = l; return 4;  
        case 0x66: h = read8(getHL()); return 8;  
        case 0x67: h = a; return 4;  
        case 0x68: l = b; return 4;  
        case 0x69: l = c; return 4;  
        case 0x6A: l = d; return 4;  
        case 0x6B: l = e; return 4;  
        case 0x6C: l = h; return 4;  
        case 0x6D: return 4;  
        case 0x6E: l = read8(getHL()); return 8;  
        case 0x6F: l = a; return 4;  
        
        case 0x70: write8(getHL(), b); return 8;  
        case 0x71: write8(getHL(), c); return 8;  
        case 0x72: write8(getHL(), d); return 8;  
        case 0x73: write8(getHL(), e); return 8;  
        case 0x74: write8(getHL(), h); return 8;  
        case 0x75: write8(getHL(), l); return 8;  
        case 0x76: {  
            uint8_t ifReg = mmu.read(0xFF0F);
            uint8_t ieReg = mmu.read(0xFFFF);
            if (!ime && (ifReg & ieReg & 0x1F) != 0) {
                haltBug = true;
            } else {
                halted = true;
            }
            return 4;
        }
        case 0x77: write8(getHL(), a); return 8;  
        case 0x78: a = b; return 4;  
        case 0x79: a = c; return 4;  
        case 0x7A: a = d; return 4;  
        case 0x7B: a = e; return 4;  
        case 0x7C: a = h; return 4;  
        case 0x7D: a = l; return 4;  
        case 0x7E: a = read8(getHL()); return 8;  
        case 0x7F: return 4;  
        
        case 0x80: add8(b); return 4;  
        case 0x81: add8(c); return 4;  
        case 0x82: add8(d); return 4;  
        case 0x83: add8(e); return 4;  
        case 0x84: add8(h); return 4;  
        case 0x85: add8(l); return 4;  
        case 0x86: add8(read8(getHL())); return 8;  
        case 0x87: add8(a); return 4;  
        case 0x88: adc8(b); return 4;  
        case 0x89: adc8(c); return 4;  
        case 0x8A: adc8(d); return 4;  
        case 0x8B: adc8(e); return 4;  
        case 0x8C: adc8(h); return 4;  
        case 0x8D: adc8(l); return 4;  
        case 0x8E: adc8(read8(getHL())); return 8;  
        case 0x8F: adc8(a); return 4;  
        
        case 0x90: sub8(b); return 4;  
        case 0x91: sub8(c); return 4;  
        case 0x92: sub8(d); return 4;  
        case 0x93: sub8(e); return 4;  
        case 0x94: sub8(h); return 4;  
        case 0x95: sub8(l); return 4;  
        case 0x96: sub8(read8(getHL())); return 8;  
        case 0x97: sub8(a); return 4;  
        case 0x98: sbc8(b); return 4;  
        case 0x99: sbc8(c); return 4;  
        case 0x9A: sbc8(d); return 4;  
        case 0x9B: sbc8(e); return 4;  
        case 0x9C: sbc8(h); return 4;  
        case 0x9D: sbc8(l); return 4;  
        case 0x9E: sbc8(read8(getHL())); return 8;  
        case 0x9F: sbc8(a); return 4;  
        
        case 0xA0: and8(b); return 4;  
        case 0xA1: and8(c); return 4;  
        case 0xA2: and8(d); return 4;  
        case 0xA3: and8(e); return 4;  
        case 0xA4: and8(h); return 4;  
        case 0xA5: and8(l); return 4;  
        case 0xA6: and8(read8(getHL())); return 8;  
        case 0xA7: and8(a); return 4;  
        case 0xA8: xor8(b); return 4;  
        case 0xA9: xor8(c); return 4;  
        case 0xAA: xor8(d); return 4;  
        case 0xAB: xor8(e); return 4;  
        case 0xAC: xor8(h); return 4;  
        case 0xAD: xor8(l); return 4;  
        case 0xAE: xor8(read8(getHL())); return 8;  
        case 0xAF: xor8(a); return 4;  
        
        case 0xB0: or8(b); return 4;  
        case 0xB1: or8(c); return 4;  
        case 0xB2: or8(d); return 4;  
        case 0xB3: or8(e); return 4;  
        case 0xB4: or8(h); return 4;  
        case 0xB5: or8(l); return 4;  
        case 0xB6: or8(read8(getHL())); return 8;  
        case 0xB7: or8(a); return 4;  
        case 0xB8: cp8(b); return 4;  
        case 0xB9: cp8(c); return 4;  
        case 0xBA: cp8(d); return 4;  
        case 0xBB: cp8(e); return 4;  
        case 0xBC: cp8(h); return 4;  
        case 0xBD: cp8(l); return 4;  
        case 0xBE: cp8(read8(getHL())); return 8;  
        case 0xBF: cp8(a); return 4;  
        
        case 0xC0: if (!getFlag(FLAG_Z)) { pc = pop16(); return 20; } return 8;  
        case 0xC1: setBC(pop16()); return 12;  
        case 0xC2: { uint16_t addr = fetch16(); if (!getFlag(FLAG_Z)) { pc = addr; return 16; } return 12; }  
        case 0xC3: { uint16_t addr = fetch16(); pc = addr; return 16; }  
        case 0xC4: { uint16_t addr = fetch16(); if (!getFlag(FLAG_Z)) { push16(pc); pc = addr; return 24; } return 12; }  
        case 0xC5: push16(getBC()); return 16;  
        case 0xC6: add8(fetch8()); return 8;  
        case 0xC7: push16(pc); pc = 0x00; return 16;  
        case 0xC8: if (getFlag(FLAG_Z)) { pc = pop16(); return 20; } return 8;  
        case 0xC9: pc = pop16(); return 16;  
        case 0xCA: { uint16_t addr = fetch16(); if (getFlag(FLAG_Z)) { pc = addr; return 16; } return 12; }  
        case 0xCB: return executeCBOpcode(fetch8());  
        case 0xCC: { uint16_t addr = fetch16(); if (getFlag(FLAG_Z)) { push16(pc); pc = addr; return 24; } return 12; }  
        case 0xCD: { uint16_t addr = fetch16(); push16(pc); pc = addr; return 24; }  
        case 0xCE: adc8(fetch8()); return 8;  
        case 0xCF: push16(pc); pc = 0x08; return 16;  
        
        case 0xD0: if (!getFlag(FLAG_C)) { pc = pop16(); return 20; } return 8;  
        case 0xD1: setDE(pop16()); return 12;  
        case 0xD2: { uint16_t addr = fetch16(); if (!getFlag(FLAG_C)) { pc = addr; return 16; } return 12; }  
        case 0xD4: { uint16_t addr = fetch16(); if (!getFlag(FLAG_C)) { push16(pc); pc = addr; return 24; } return 12; }  
        case 0xD5: push16(getDE()); return 16;  
        case 0xD6: sub8(fetch8()); return 8;  
        case 0xD7: push16(pc); pc = 0x10; return 16;  
        case 0xD8: if (getFlag(FLAG_C)) { pc = pop16(); return 20; } return 8;  
        case 0xD9: pc = pop16(); ime = true; return 16;  
        case 0xDA: { uint16_t addr = fetch16(); if (getFlag(FLAG_C)) { pc = addr; return 16; } return 12; }  
        case 0xDC: { uint16_t addr = fetch16(); if (getFlag(FLAG_C)) { push16(pc); pc = addr; return 24; } return 12; }  
        case 0xDE: sbc8(fetch8()); return 8;  
        case 0xDF: push16(pc); pc = 0x18; return 16;  
        
        case 0xE0: write8(0xFF00 + fetch8(), a); return 12;  
        case 0xE1: setHL(pop16()); return 12;  
        case 0xE2: write8(0xFF00 + c, a); return 8;  
        case 0xE5: push16(getHL()); return 16;  
        case 0xE6: and8(fetch8()); return 8;  
        case 0xE7: push16(pc); pc = 0x20; return 16;  
        case 0xE8: addSP((int8_t)fetch8()); return 16;  
        case 0xE9: pc = getHL(); return 4;  
        case 0xEA: write8(fetch16(), a); return 16;  
        case 0xEE: xor8(fetch8()); return 8;  
        case 0xEF: push16(pc); pc = 0x28; return 16;  
        
        case 0xF0: a = read8(0xFF00 + fetch8()); return 12;  
        case 0xF1: setAF(pop16()); return 12;  
        case 0xF2: a = read8(0xFF00 + c); return 8;  
        case 0xF3: ime = false; return 4;  
        case 0xF5: push16(getAF()); return 16;  
        case 0xF6: or8(fetch8()); return 8;  
        case 0xF7: push16(pc); pc = 0x30; return 16;  
        case 0xF8: {  
            int8_t offset = (int8_t)fetch8();
            setFlag(FLAG_Z, false);
            setFlag(FLAG_N, false);
            setFlag(FLAG_H, ((sp & 0x0F) + (offset & 0x0F)) > 0x0F);
            setFlag(FLAG_C, ((sp & 0xFF) + (offset & 0xFF)) > 0xFF);
            setHL(sp + offset);
            return 12;
        }
        case 0xF9: sp = getHL(); return 8;  
        case 0xFA: a = read8(fetch16()); return 16;  
        case 0xFB: imeScheduled = true; return 4;  
        case 0xFE: cp8(fetch8()); return 8;  
        case 0xFF: push16(pc); pc = 0x38; return 16;  
        
        default: return 4;  
    }
}

int CPU::executeCBOpcode(uint8_t opcode) {
    uint8_t* regs[] = { &b, &c, &d, &e, &h, &l, nullptr, &a };
    uint8_t reg = opcode & 0x07;
    uint8_t bitNum = (opcode >> 3) & 0x07;
    uint8_t op = (opcode >> 6) & 0x03;
    
    uint8_t val;
    if (reg == 6) {
        val = read8(getHL());
    } else {
        val = *regs[reg];
    }
    
    uint8_t result = val;
    switch (op) {
        case 0:  
            switch (bitNum) {
                case 0: result = rlc(val); break;
                case 1: result = rrc(val); break;
                case 2: result = rl(val); break;
                case 3: result = rr(val); break;
                case 4: result = sla(val); break;
                case 5: result = sra(val); break;
                case 6: result = swap(val); break;
                case 7: result = srl(val); break;
            }
            break;
        case 1:  
            bit(bitNum, val);
            return (reg == 6) ? 12 : 8;  
        case 2:  
            result = res(bitNum, val);
            break;
        case 3:  
            result = set(bitNum, val);
            break;
    }
    
    if (reg == 6) {
        write8(getHL(), result);
        return 16;
    } else {
        *regs[reg] = result;
        return 8;
    }
}
