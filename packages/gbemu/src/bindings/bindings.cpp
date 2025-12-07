#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <emscripten/emscripten.h>
#include "../core/gameboy.h"
#include "../core/apu.h"

using namespace emscripten;

/**
 * Emscripten bindings for GameBoy emulator
 * 
 * Exposes the emulator to JavaScript with a clean API
 */

// Global emulator instance
static std::unique_ptr<GameBoy> gb;

// Buffer for ROM data transfer
static std::vector<uint8_t> romBuffer;

// Initialize emulator
void init() {
    gb = std::make_unique<GameBoy>();
}

// Allocate ROM buffer and return pointer for direct memory access
uintptr_t allocateROMBuffer(size_t size) {
    romBuffer.resize(size);
    return reinterpret_cast<uintptr_t>(romBuffer.data());
}

// Load ROM from pre-filled buffer
bool loadROMFromBuffer(size_t size) {
    if (!gb) return false;
    if (romBuffer.size() < size) return false;
    return gb->loadROM(romBuffer.data(), size);
}

// Run one frame
void runFrame() {
    if (gb) {
        gb->runFrame();
    }
}

// Reset emulator
void reset() {
    if (gb) {
        gb->reset();
    }
}

// Button handling
void setButton(int button, bool pressed) {
    if (gb) {
        gb->setButton(button, pressed);
    }
}

// Get framebuffer as JavaScript Uint32Array view
val getFramebuffer() {
    if (!gb) {
        return val::null();
    }
    
    const uint32_t* fb = gb->getFramebuffer();
    return val(typed_memory_view(
        GameBoy::SCREEN_WIDTH * GameBoy::SCREEN_HEIGHT,
        fb
    ));
}

// Get screen dimensions
int getScreenWidth() {
    return GameBoy::SCREEN_WIDTH;
}

int getScreenHeight() {
    return GameBoy::SCREEN_HEIGHT;
}

// Debug: get CPU state
val getCPUState() {
    if (!gb) return val::null();
    
    val state = val::object();
    state.set("pc", gb->getCPU().getPC());
    state.set("sp", gb->getCPU().getSP());
    state.set("a", gb->getCPU().getA());
    state.set("f", gb->getCPU().getF());
    state.set("b", gb->getCPU().getB());
    state.set("c", gb->getCPU().getC());
    state.set("d", gb->getCPU().getD());
    state.set("e", gb->getCPU().getE());
    state.set("h", gb->getCPU().getH());
    state.set("l", gb->getCPU().getL());
    state.set("halted", gb->getCPU().isHalted());
    
    // Add PPU debug info
    state.set("lcdc", gb->getMMU().read(0xFF40));
    state.set("ly", gb->getMMU().read(0xFF44));
    state.set("stat", gb->getMMU().read(0xFF41));
    
    return state;
}

// Debug: step one instruction and return trace
val stepTrace() {
    if (!gb) return val::null();
    
    val trace = val::object();
    
    // Capture pre-state
    uint16_t pc_before = gb->getCPU().getPC();
    uint16_t sp_before = gb->getCPU().getSP();
    
    // Read opcode at PC (without fetching)
    uint8_t opcode = gb->getMMU().read(pc_before);
    uint8_t byte1 = gb->getMMU().read(pc_before + 1);
    uint8_t byte2 = gb->getMMU().read(pc_before + 2);
    
    trace.set("pc_before", pc_before);
    trace.set("sp_before", sp_before);
    trace.set("opcode", opcode);
    trace.set("byte1", byte1);
    trace.set("byte2", byte2);
    
    // Execute one step
    gb->stepCPU();
    
    // Capture post-state
    trace.set("pc_after", gb->getCPU().getPC());
    trace.set("sp_after", gb->getCPU().getSP());
    trace.set("a", gb->getCPU().getA());
    trace.set("f", gb->getCPU().getF());
    trace.set("bc", gb->getCPU().getBC());
    trace.set("de", gb->getCPU().getDE());
    trace.set("hl", gb->getCPU().getHL());
    
    return trace;
}

// Debug: get PPU state
val getPPUState() {
    if (!gb) return val::null();
    
    val state = val::object();
    
    // PPU registers
    state.set("lcdc", gb->getMMU().read(0xFF40));
    state.set("stat", gb->getMMU().read(0xFF41));
    state.set("scy", gb->getMMU().read(0xFF42));
    state.set("scx", gb->getMMU().read(0xFF43));
    state.set("ly", gb->getMMU().read(0xFF44));
    state.set("lyc", gb->getMMU().read(0xFF45));
    state.set("bgp", gb->getMMU().read(0xFF47));
    state.set("obp0", gb->getMMU().read(0xFF48));
    state.set("obp1", gb->getMMU().read(0xFF49));
    state.set("wy", gb->getMMU().read(0xFF4A));
    state.set("wx", gb->getMMU().read(0xFF4B));
    
    // Decode LCDC bits
    uint8_t lcdc = gb->getMMU().read(0xFF40);
    state.set("lcdEnabled", (lcdc & 0x80) != 0);
    state.set("windowTileMap", (lcdc & 0x40) ? 0x9C00 : 0x9800);
    state.set("windowEnabled", (lcdc & 0x20) != 0);
    state.set("tileData", (lcdc & 0x10) ? 0x8000 : 0x8800);
    state.set("bgTileMap", (lcdc & 0x08) ? 0x9C00 : 0x9800);
    state.set("spriteSize", (lcdc & 0x04) ? 16 : 8);
    state.set("spritesEnabled", (lcdc & 0x02) != 0);
    state.set("bgEnabled", (lcdc & 0x01) != 0);
    
    return state;
}

// Debug: check VRAM for non-zero data
val checkVRAM() {
    if (!gb) return val::null();
    
    val result = val::object();
    
    uint8_t* vram = gb->getMMU().getVRAM();
    
    // Check if any tile data is non-zero in the first tile area (0x8000-0x8FFF)
    int nonZeroTiles = 0;
    int totalNonZeroBytes = 0;
    
    for (int tile = 0; tile < 256; tile++) {
        bool hasData = false;
        for (int b = 0; b < 16; b++) {
            if (vram[tile * 16 + b] != 0) {
                hasData = true;
                totalNonZeroBytes++;
            }
        }
        if (hasData) nonZeroTiles++;
    }
    
    result.set("nonZeroTilesIn8000", nonZeroTiles);
    result.set("totalNonZeroBytes", totalNonZeroBytes);
    
    // Check tilemap area (0x9800-0x9BFF)
    int nonZeroTileMapEntries = 0;
    for (int i = 0; i < 0x400; i++) {
        if (vram[0x1800 + i] != 0) {
            nonZeroTileMapEntries++;
        }
    }
    result.set("nonZeroTileMapEntries9800", nonZeroTileMapEntries);
    
    // Check second tilemap (0x9C00-0x9FFF)
    int nonZeroTileMapEntries2 = 0;
    for (int i = 0; i < 0x400; i++) {
        if (vram[0x1C00 + i] != 0) {
            nonZeroTileMapEntries2++;
        }
    }
    result.set("nonZeroTileMapEntries9C00", nonZeroTileMapEntries2);
    
    // Return first 16 bytes of first tile (for debugging)
    val firstTile = val::array();
    for (int i = 0; i < 16; i++) {
        firstTile.set(i, vram[i]);
    }
    result.set("firstTileData", firstTile);
    
    // Return first 32 bytes of tilemap at 0x9800
    val tileMap = val::array();
    for (int i = 0; i < 32; i++) {
        tileMap.set(i, vram[0x1800 + i]);
    }
    result.set("tileMapStart", tileMap);
    
    return result;
}

// Debug: read memory at address
val readMemory(uint16_t addr, int count) {
    if (!gb) return val::null();
    
    val result = val::array();
    for (int i = 0; i < count; i++) {
        result.set(i, gb->getMMU().read(addr + i));
    }
    return result;
}

// Debug: get MBC state
val getMBCState() {
    if (!gb) return val::null();
    
    val result = val::object();
    
    // Read cartridge type from ROM header
    uint8_t cartType = gb->getMMU().read(0x147);
    result.set("cartridgeType", cartType);
    result.set("mbcType", gb->getMMU().getMBCType());
    result.set("romBank", gb->getMMU().getROMBank());
    
    // Read what's at 0x4B69 through MMU (with banking)
    result.set("read_0x4B69", gb->getMMU().read(0x4B69));
    
    return result;
}

// Debug: get bank switch history
val getBankSwitchHistory() {
    if (!gb) return val::null();
    
    val result = val::array();
    auto& history = gb->getMMU().getBankSwitchHistory();
    
    for (size_t i = 0; i < history.size(); i++) {
        val entry = val::object();
        entry.set("addr", history[i].addr);
        entry.set("value", history[i].value);
        entry.set("oldBank", history[i].oldBank);
        entry.set("newBank", history[i].newBank);
        result.set(i, entry);
    }
    
    return result;
}

// Debug: clear bank switch history
void clearBankSwitchHistory() {
    if (gb) {
        gb->getMMU().clearBankSwitchHistory();
    }
}

// Debug: read raw ROM data at specific offset (bypassing banking)
val readRawROM(uint32_t offset, int count) {
    if (!gb) return val::null();
    
    val result = val::array();
    const auto& rom = gb->getMMU().getROM();
    
    for (int i = 0; i < count && (offset + i) < rom.size(); i++) {
        result.set(i, rom[offset + i]);
    }
    return result;
}

// Debug: get ROM size
uint32_t getROMSize() {
    if (!gb) return 0;
    return gb->getMMU().getROM().size();
}

// Debug: get framebuffer stats
val getFramebufferStats() {
    if (!gb) return val::null();
    
    val result = val::object();
    const uint32_t* fb = gb->getFramebuffer();
    
    // Count unique colors
    int color0count = 0, color1count = 0, color2count = 0, color3count = 0;
    
    for (int i = 0; i < 160 * 144; i++) {
        switch (fb[i]) {
            case 0xFF9BBC0F: color0count++; break;  // Lightest
            case 0xFF8BAC0F: color1count++; break;  // Light
            case 0xFF306230: color2count++; break;  // Dark
            case 0xFF0F380F: color3count++; break;  // Darkest
        }
    }
    
    result.set("color0_lightest", color0count);
    result.set("color1_light", color1count);
    result.set("color2_dark", color2count);
    result.set("color3_darkest", color3count);
    result.set("total", 160 * 144);
    
    // Return first few pixels
    val firstPixels = val::array();
    for (int i = 0; i < 10; i++) {
        firstPixels.set(i, fb[i]);
    }
    result.set("firstPixels", firstPixels);
    
    return result;
}

// Audio buffer for samples
static std::vector<float> audioBuffer(8192);

// Get audio samples (returns number of stereo sample pairs)
int getAudioSamplesCount() {
    if (!gb) return 0;
    return gb->getAPU().getSamples(audioBuffer.data(), audioBuffer.size() / 2);
}

// Get audio sample buffer as Float32Array view
val getAudioBuffer() {
    return val(typed_memory_view(audioBuffer.size(), audioBuffer.data()));
}

// Get audio sample rate
int getAudioSampleRate() {
    return APU::SAMPLE_RATE;
}

EMSCRIPTEN_BINDINGS(gbemu) {
    function("init", &init);
    function("allocateROMBuffer", &allocateROMBuffer);
    function("loadROMFromBuffer", &loadROMFromBuffer);
    function("runFrame", &runFrame);
    function("reset", &reset);
    function("setButton", &setButton);
    function("getFramebuffer", &getFramebuffer);
    function("getScreenWidth", &getScreenWidth);
    function("getScreenHeight", &getScreenHeight);
    function("getCPUState", &getCPUState);
    function("stepTrace", &stepTrace);
    function("getPPUState", &getPPUState);
    function("checkVRAM", &checkVRAM);
    function("getFramebufferStats", &getFramebufferStats);
    function("readMemory", &readMemory);
    function("getMBCState", &getMBCState);
    function("getBankSwitchHistory", &getBankSwitchHistory);
    function("clearBankSwitchHistory", &clearBankSwitchHistory);
    function("readRawROM", &readRawROM);
    function("getROMSize", &getROMSize);
    
    // Audio functions
    function("getAudioSamplesCount", &getAudioSamplesCount);
    function("getAudioBuffer", &getAudioBuffer);
    function("getAudioSampleRate", &getAudioSampleRate);
    
    // Button constants
    constant("BUTTON_A", static_cast<int>(GameBoy::BUTTON_A));
    constant("BUTTON_B", static_cast<int>(GameBoy::BUTTON_B));
    constant("BUTTON_SELECT", static_cast<int>(GameBoy::BUTTON_SELECT));
    constant("BUTTON_START", static_cast<int>(GameBoy::BUTTON_START));
    constant("BUTTON_RIGHT", static_cast<int>(GameBoy::BUTTON_RIGHT));
    constant("BUTTON_LEFT", static_cast<int>(GameBoy::BUTTON_LEFT));
    constant("BUTTON_UP", static_cast<int>(GameBoy::BUTTON_UP));
    constant("BUTTON_DOWN", static_cast<int>(GameBoy::BUTTON_DOWN));
}
