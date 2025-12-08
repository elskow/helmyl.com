#pragma once

#include <cstdint>
#include <vector>

// Forward declarations
class APU;
class Timer;

/**
 * Memory Management Unit - Handles GameBoy's 64KB address space
 * 
 * Memory Map:
 * 0x0000-0x3FFF: ROM Bank 0 (16KB) - Fixed
 * 0x4000-0x7FFF: ROM Bank 1-N (16KB) - Switchable via MBC
 * 0x8000-0x9FFF: VRAM (8KB)
 * 0xA000-0xBFFF: External RAM (8KB) - Cartridge RAM, switchable
 * 0xC000-0xDFFF: WRAM (8KB)
 * 0xE000-0xFDFF: Echo RAM (mirror of 0xC000-0xDDFF)
 * 0xFE00-0xFE9F: OAM (Sprite Attribute Table)
 * 0xFEA0-0xFEFF: Not usable
 * 0xFF00-0xFF7F: I/O Registers
 * 0xFF80-0xFFFE: HRAM (High RAM)
 * 0xFFFF: Interrupt Enable Register
 */
class MMU {
public:
    MMU();
    
    // Basic memory access
    uint8_t read(uint16_t addr);
    void write(uint16_t addr, uint8_t val);
    
    // ROM loading
    bool loadROM(const uint8_t* data, size_t size);
    
    // Direct VRAM access for PPU
    uint8_t* getVRAM() { return vram.data(); }
    uint8_t* getOAM() { return oam.data(); }
    
    // Joypad state
    void setJoypad(uint8_t buttons, uint8_t dpad);
    
    // Timer registers access
    uint8_t getTimerControl() const { return tac; }
    uint8_t getTimerCounter() const { return tima; }
    uint8_t getTimerModulo() const { return tma; }
    uint16_t getDivider() const { return div; }
    void setTimerCounter(uint8_t val) { tima = val; }
    void setDivider(uint16_t val) { div = val; }
    
    // Interrupt flags
    uint8_t getIF() const { return interruptFlag; }
    uint8_t getIE() const { return interruptEnable; }
    void setIF(uint8_t val) { interruptFlag = val; }
    
    // PPU state for memory access control
    void setPPUMode(uint8_t mode) { ppuMode = mode; }
    
    // DMA transfer
    void startDMATransfer(uint8_t val);
    void stepDMA(int cycles);
    bool isDMAActive() const { return dmaActive; }
    
    // APU reference for audio register access
    void setAPU(APU* apuPtr) { apu = apuPtr; }
    
    // Timer reference for DIV write callback
    void setTimer(Timer* timerPtr) { timer = timerPtr; }
    
    // Debug: get current ROM bank
    uint8_t getROMBank() const { return romBank; }
    uint8_t getMBCType() const { return mbcType; }
    const std::vector<uint8_t>& getROM() const { return rom; }
    
    // Bank switch history for debugging
    struct BankSwitch {
        uint16_t addr;      // Address of the write
        uint8_t value;      // Value written
        uint8_t oldBank;    // Previous bank
        uint8_t newBank;    // New bank after write
    };
    
    std::vector<BankSwitch>& getBankSwitchHistory() { return bankSwitchHistory; }
    void clearBankSwitchHistory() { bankSwitchHistory.clear(); }
    
private:
    // Memory regions
    std::vector<uint8_t> rom;           // Cartridge ROM
    std::vector<uint8_t> vram;          // Video RAM (8KB)
    std::vector<uint8_t> eram;          // External/Cartridge RAM (up to 32KB)
    std::vector<uint8_t> wram;          // Work RAM (8KB)
    std::vector<uint8_t> oam;           // Sprite Attribute Table (160 bytes)
    std::vector<uint8_t> hram;          // High RAM (127 bytes)
    
    // MBC (Memory Bank Controller) state
    uint8_t mbcType;
    uint8_t romBank;
    uint8_t ramBank;
    bool ramEnabled;
    uint8_t mbcMode;
    
    // MBC3 RTC (Real-Time Clock) registers
    struct RTC {
        uint8_t seconds;      // 0-59
        uint8_t minutes;      // 0-59
        uint8_t hours;        // 0-23
        uint8_t daysLow;      // Lower 8 bits of day counter
        uint8_t daysHigh;     // Bit 0: Day counter MSB, Bit 6: Halt, Bit 7: Day overflow
        uint64_t lastTime;    // System time at last latch
    };
    RTC rtc;
    RTC rtcLatched;           // Latched RTC values
    uint8_t rtcLatchState;    // 0x00 -> 0x01 latches RTC
    bool rtcSelected;         // True when RTC register is selected instead of RAM
    
    // I/O Registers
    uint8_t joypadReg;      // 0xFF00 - Joypad
    uint8_t joypadButtons;  // Button state (active low)
    uint8_t joypadDpad;     // D-pad state (active low)
    
    // Timer registers
    uint16_t div;           // 0xFF04 - Divider (upper 8 bits exposed)
    uint8_t tima;           // 0xFF05 - Timer counter
    uint8_t tma;            // 0xFF06 - Timer modulo
    uint8_t tac;            // 0xFF07 - Timer control
    
    // Serial (stubbed)
    uint8_t sb;             // 0xFF01 - Serial data
    uint8_t sc;             // 0xFF02 - Serial control
    
    // Interrupt registers
    uint8_t interruptFlag;  // 0xFF0F - IF
    uint8_t interruptEnable; // 0xFFFF - IE
    
    // PPU registers (exposed for PPU to access)
    uint8_t lcdc;           // 0xFF40 - LCD Control
    uint8_t stat;           // 0xFF41 - LCD Status
    uint8_t scy;            // 0xFF42 - Scroll Y
    uint8_t scx;            // 0xFF43 - Scroll X
    uint8_t ly;             // 0xFF44 - LCD Y-Coordinate
    uint8_t lyc;            // 0xFF45 - LY Compare
    uint8_t dma;            // 0xFF46 - DMA Transfer
    uint8_t bgp;            // 0xFF47 - BG Palette
    uint8_t obp0;           // 0xFF48 - Object Palette 0
    uint8_t obp1;           // 0xFF49 - Object Palette 1
    uint8_t wy;             // 0xFF4A - Window Y
    uint8_t wx;             // 0xFF4B - Window X
    
    // PPU access control
    uint8_t ppuMode;
    
    // DMA state
    bool dmaActive;         // True during DMA transfer
    uint16_t dmaSource;     // Source address for DMA
    int dmaCyclesLeft;      // Cycles remaining in DMA transfer
    int dmaIndex;           // Current byte being transferred
    
    // APU reference
    APU* apu = nullptr;
    
    // Timer reference for DIV write callback
    Timer* timer = nullptr;
    
    // Debug: bank switch history
    std::vector<BankSwitch> bankSwitchHistory;
    
    // MBC handling
    void handleMBCWrite(uint16_t addr, uint8_t val);
    uint32_t getROMOffset(uint16_t addr);
    uint16_t getRAMOffset(uint16_t addr);
    
    // MBC3 RTC handling
    void updateRTC();
    uint8_t readRTC(uint8_t reg);
    void writeRTC(uint8_t reg, uint8_t val);
    
    // Detect MBC type from ROM header
    void detectMBC();
    
    friend class PPU;
    friend class Timer;
};
