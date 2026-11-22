#pragma once

#include <cstdint>
#include <vector>

class APU;
class Timer;

class MMU {
public:
    MMU();
    
    uint8_t read(uint16_t addr);
    void write(uint16_t addr, uint8_t val);
    
    bool loadROM(const uint8_t* data, size_t size);
    
    uint8_t* getVRAM() { return vram.data(); }
    uint8_t* getOAM() { return oam.data(); }
    
    void setJoypad(uint8_t buttons, uint8_t dpad);
    
    uint8_t getTimerControl() const { return tac; }
    uint8_t getTimerCounter() const { return tima; }
    uint8_t getTimerModulo() const { return tma; }
    uint16_t getDivider() const { return div; }
    void setTimerCounter(uint8_t val) { tima = val; }
    void setDivider(uint16_t val) { div = val; }
    
    uint8_t getIF() const { return interruptFlag; }
    uint8_t getIE() const { return interruptEnable; }
    void setIF(uint8_t val) { interruptFlag = val; }
    
    void setPPUMode(uint8_t mode) { ppuMode = mode; }
    uint8_t getPPUMode() const { return ppuMode; }
    
    void startDMATransfer(uint8_t val);
    void stepDMA(int cycles);
    bool isDMAActive() const { return dmaActive; }
    
    void stepSerial(int cycles);
    
    void setAPU(APU* apuPtr) { apu = apuPtr; }
    
    void setTimer(Timer* timerPtr) { timer = timerPtr; }
    
private:
    std::vector<uint8_t> rom;           
    std::vector<uint8_t> vram;          
    std::vector<uint8_t> eram;          
    std::vector<uint8_t> wram;          
    std::vector<uint8_t> oam;           
    std::vector<uint8_t> hram;          
    
    uint8_t mbcType;
    uint8_t romBank;
    uint8_t ramBank;
    bool ramEnabled;
    uint8_t mbcMode;
    
    struct RTC {
        uint8_t seconds;      
        uint8_t minutes;      
        uint8_t hours;        
        uint8_t daysLow;      
        uint8_t daysHigh;     
        uint64_t lastTime;    
    };
    RTC rtc;
    RTC rtcLatched;           
    uint8_t rtcLatchState;    
    bool rtcSelected;         
    
    uint8_t joypadReg;      
    uint8_t joypadButtons;  
    uint8_t joypadDpad;     
    
    uint16_t div;           
    uint8_t tima;           
    uint8_t tma;            
    uint8_t tac;            
    
    uint8_t sb;             
    uint8_t sc;             
    int serialCycles;       
    bool serialActive;      
    
    uint8_t interruptFlag;  
    uint8_t interruptEnable; 
    
    uint8_t lcdc;           
    uint8_t stat;           
    uint8_t scy;            
    uint8_t scx;            
    uint8_t ly;             
    uint8_t lyc;            
    uint8_t dma;            
    uint8_t bgp;            
    uint8_t obp0;           
    uint8_t obp1;           
    uint8_t wy;             
    uint8_t wx;             
    
    uint8_t ppuMode;
    
    bool dmaActive;         
    uint16_t dmaSource;     
    int dmaCyclesLeft;      
    int dmaIndex;           
    
    APU* apu = nullptr;
    
    Timer* timer = nullptr;
    
    void handleMBCWrite(uint16_t addr, uint8_t val);
    uint32_t getROMOffset(uint16_t addr);
    uint16_t getRAMOffset(uint16_t addr);
    
    void updateRTC();
    uint8_t readRTC(uint8_t reg);
    void writeRTC(uint8_t reg, uint8_t val);
    
    void detectMBC();
    
    friend class PPU;
    friend class Timer;
};
