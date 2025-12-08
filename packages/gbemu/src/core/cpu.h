#pragma once

#include <cstdint>
#include <string>
#include <vector>

// Forward declarations
class MMU;

/**
 * Sharp LR35902 CPU - The GameBoy's processor
 * 
 * Similar to Z80 but with differences:
 * - No IX, IY index registers
 * - No alternate register set
 * - Different flag behavior for some ops
 * - Unique STOP and SWAP instructions
 * 
 * 8-bit registers: A, B, C, D, E, H, L, F (flags)
 * 16-bit pairs: AF, BC, DE, HL, SP, PC
 * 
 * Flags (F register):
 *   Bit 7: Z (Zero)
 *   Bit 6: N (Subtract)
 *   Bit 5: H (Half Carry)
 *   Bit 4: C (Carry)
 *   Bits 0-3: Always 0
 */
class CPU {
public:
    CPU(MMU& mmu);
    
    // Execute one instruction, returns cycles consumed
    int step();
    
    // Reset CPU to initial state
    void reset();
    
    // Interrupt handling
    void requestInterrupt(uint8_t interrupt);
    int handleInterrupts();  // Returns cycles consumed (20 if interrupt dispatched, 0 otherwise)
    
    // State access for debugging/serialization
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
    
    // Wake CPU from STOP mode (called on button press)
    void wakeFromStop() { stopped = false; }
    
private:
    // Registers
    uint8_t a, f;           // Accumulator & Flags
    uint8_t b, c;           // BC pair
    uint8_t d, e;           // DE pair
    uint8_t h, l;           // HL pair
    uint16_t sp;            // Stack pointer
    uint16_t pc;            // Program counter
    
    // CPU state
    bool halted;
    bool ime;               // Interrupt Master Enable
    bool imeScheduled;      // EI enables IME after next instruction
    bool stopped;
    bool haltBug;           // HALT bug: when HALT with IME=0 and pending interrupts
    
    // Memory access
    MMU& mmu;
    
    // Flag operations
    static constexpr uint8_t FLAG_Z = 0x80;  // Zero
    static constexpr uint8_t FLAG_N = 0x40;  // Subtract
    static constexpr uint8_t FLAG_H = 0x20;  // Half Carry
    static constexpr uint8_t FLAG_C = 0x10;  // Carry
    
    void setFlag(uint8_t flag, bool value);
    bool getFlag(uint8_t flag) const;
    
    // 16-bit register access
    uint16_t getAF() const { return (a << 8) | (f & 0xF0); }
    
    void setAF(uint16_t val) { a = val >> 8; f = val & 0xF0; }
    void setBC(uint16_t val) { b = val >> 8; c = val & 0xFF; }
    void setDE(uint16_t val) { d = val >> 8; e = val & 0xFF; }
    void setHL(uint16_t val) { h = val >> 8; l = val & 0xFF; }
    
    // Memory helpers
    uint8_t read8(uint16_t addr);
    uint16_t read16(uint16_t addr);
    void write8(uint16_t addr, uint8_t val);
    void write16(uint16_t addr, uint16_t val);
    
    uint8_t fetch8();
    uint16_t fetch16();
    
    // Stack operations
    void push16(uint16_t val);
    uint16_t pop16();
    
    // ALU operations
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
    
    // Rotate/shift operations
    uint8_t rlc(uint8_t val);
    uint8_t rrc(uint8_t val);
    uint8_t rl(uint8_t val);
    uint8_t rr(uint8_t val);
    uint8_t sla(uint8_t val);
    uint8_t sra(uint8_t val);
    uint8_t swap(uint8_t val);
    uint8_t srl(uint8_t val);
    
    // Bit operations
    void bit(uint8_t bit, uint8_t val);
    uint8_t res(uint8_t bit, uint8_t val);
    uint8_t set(uint8_t bit, uint8_t val);
    
    // Execute main opcode (returns cycles)
    int executeOpcode(uint8_t opcode);
    
    // Execute CB-prefixed opcode (returns cycles)
    int executeCBOpcode(uint8_t opcode);
};
