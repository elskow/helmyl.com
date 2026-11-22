#pragma once

#include <cstdint>
#include <string>
#include <vector>

class MMU;

class CPU {
public:
    CPU(MMU& mmu);
    
    int step();
    
    void reset();
    
    void requestInterrupt(uint8_t interrupt);
    int handleInterrupts();  
    
    uint16_t getPC() const { return pc; }
    uint16_t getSP() const { return sp; }
    uint8_t getA() const { return a; }
    uint8_t getF() const { return f; }
    uint8_t getB() const { return b; }
    uint8_t getC() const { return c; }
    uint8_t getD() const { return d; }
    uint8_t getE() const { return e; }
    uint8_t getH() const { return h; }
    uint8_t getL() const { return l; }
    uint16_t getBC() const { return (b << 8) | c; }
    uint16_t getDE() const { return (d << 8) | e; }
    uint16_t getHL() const { return (h << 8) | l; }
    bool isHalted() const { return halted; }
    bool isStopped() const { return stopped; }
    bool getIME() const { return ime; }
    
    void wakeFromStop() { stopped = false; }
    
private:
    uint8_t a, f;           
    uint8_t b, c;           
    uint8_t d, e;           
    uint8_t h, l;           
    uint16_t sp;            
    uint16_t pc;            
    
    bool halted;
    bool ime;               
    bool imeScheduled;      
    bool stopped;
    bool haltBug;           
    
    MMU& mmu;
    
    static constexpr uint8_t FLAG_Z = 0x80;  
    static constexpr uint8_t FLAG_N = 0x40;  
    static constexpr uint8_t FLAG_H = 0x20;  
    static constexpr uint8_t FLAG_C = 0x10;  
    
    void setFlag(uint8_t flag, bool value);
    bool getFlag(uint8_t flag) const;
    
    uint16_t getAF() const { return (a << 8) | (f & 0xF0); }
    
    void setAF(uint16_t val) { a = val >> 8; f = val & 0xF0; }
    void setBC(uint16_t val) { b = val >> 8; c = val & 0xFF; }
    void setDE(uint16_t val) { d = val >> 8; e = val & 0xFF; }
    void setHL(uint16_t val) { h = val >> 8; l = val & 0xFF; }
    
    uint8_t read8(uint16_t addr);
    uint16_t read16(uint16_t addr);
    void write8(uint16_t addr, uint8_t val);
    void write16(uint16_t addr, uint16_t val);
    
    uint8_t fetch8();
    uint16_t fetch16();
    
    void push16(uint16_t val);
    uint16_t pop16();
    
    void add8(uint8_t val);
    void adc8(uint8_t val);
    void sub8(uint8_t val);
    void sbc8(uint8_t val);
    void and8(uint8_t val);
    void or8(uint8_t val);
    void xor8(uint8_t val);
    void cp8(uint8_t val);
    void inc8(uint8_t& reg);
    void dec8(uint8_t& reg);
    
    void addHL(uint16_t val);
    void addSP(int8_t val);
    
    uint8_t rlc(uint8_t val);
    uint8_t rrc(uint8_t val);
    uint8_t rl(uint8_t val);
    uint8_t rr(uint8_t val);
    uint8_t sla(uint8_t val);
    uint8_t sra(uint8_t val);
    uint8_t swap(uint8_t val);
    uint8_t srl(uint8_t val);
    
    void bit(uint8_t bit, uint8_t val);
    uint8_t res(uint8_t bit, uint8_t val);
    uint8_t set(uint8_t bit, uint8_t val);
    
    int executeOpcode(uint8_t opcode);
    
    int executeCBOpcode(uint8_t opcode);
};
