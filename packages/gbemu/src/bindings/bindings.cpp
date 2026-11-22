#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <emscripten/emscripten.h>
#include "../core/gameboy.h"
#include "../core/apu.h"

using namespace emscripten;

static std::unique_ptr<GameBoy> gb;

static std::vector<uint8_t> romBuffer;

void init() {
    gb = std::make_unique<GameBoy>();
}

uintptr_t allocateROMBuffer(size_t size) {
    romBuffer.resize(size);
    return reinterpret_cast<uintptr_t>(romBuffer.data());
}

bool loadROMFromBuffer(size_t size) {
    if (!gb) return false;
    if (romBuffer.size() < size) return false;
    return gb->loadROM(romBuffer.data(), size);
}

void runFrame() {
    if (gb) {
        gb->runFrame();
    }
}

void reset() {
    if (gb) {
        gb->reset();
    }
}

void setButton(int button, bool pressed) {
    if (gb) {
        gb->setButton(button, pressed);
    }
}

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

int getScreenWidth() {
    return GameBoy::SCREEN_WIDTH;
}

int getScreenHeight() {
    return GameBoy::SCREEN_HEIGHT;
}

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
    state.set("lcdc", gb->getMMU().read(0xFF40));
    state.set("ly", gb->getMMU().read(0xFF44));
    state.set("stat", gb->getMMU().read(0xFF41));
    
    return state;
}

val getPPUState() {
    if (!gb) return val::null();
    
    val state = val::object();
    
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

static std::vector<float> audioBuffer(8192);

int getAudioSamplesCount() {
    if (!gb) return 0;
    return gb->getAPU().getSamples(audioBuffer.data(), audioBuffer.size() / 2);
}

val getAudioBuffer() {
    return val(typed_memory_view(audioBuffer.size(), audioBuffer.data()));
}

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
    function("getPPUState", &getPPUState);
    
    function("getAudioSamplesCount", &getAudioSamplesCount);
    function("getAudioBuffer", &getAudioBuffer);
    function("getAudioSampleRate", &getAudioSampleRate);
    
    constant("BUTTON_A", static_cast<int>(GameBoy::BUTTON_A));
    constant("BUTTON_B", static_cast<int>(GameBoy::BUTTON_B));
    constant("BUTTON_SELECT", static_cast<int>(GameBoy::BUTTON_SELECT));
    constant("BUTTON_START", static_cast<int>(GameBoy::BUTTON_START));
    constant("BUTTON_RIGHT", static_cast<int>(GameBoy::BUTTON_RIGHT));
    constant("BUTTON_LEFT", static_cast<int>(GameBoy::BUTTON_LEFT));
    constant("BUTTON_UP", static_cast<int>(GameBoy::BUTTON_UP));
    constant("BUTTON_DOWN", static_cast<int>(GameBoy::BUTTON_DOWN));
}
