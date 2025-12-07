cmake_minimum_required(VERSION 3.14)
project(gbemu VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Source files
set(CORE_SOURCES
    src/core/cpu.cpp
    src/core/mmu.cpp
    src/core/ppu.cpp
    src/core/apu.cpp
    src/core/timer.cpp
    src/core/gameboy.cpp
)

set(BINDING_SOURCES
    src/bindings/bindings.cpp
)

# Emscripten build
if(EMSCRIPTEN)
    add_executable(gbemu ${CORE_SOURCES} ${BINDING_SOURCES})
    
    # Emscripten compiler flags
    # Note: embind requires RTTI, so we can't use -fno-rtti
    # SIMD enabled for better performance on modern browsers
    target_compile_options(gbemu PRIVATE
        -O3
        -fno-exceptions
        -msimd128
    )
    
    # Emscripten linker flags
    set_target_properties(gbemu PROPERTIES
        LINK_FLAGS "\
            -s WASM=1 \
            -s MODULARIZE=1 \
            -s EXPORT_NAME='createGBEmu' \
            -s EXPORTED_FUNCTIONS='[\"_malloc\", \"_free\"]' \
            -s EXPORTED_RUNTIME_METHODS='[\"ccall\", \"cwrap\", \"getValue\", \"setValue\", \"HEAPU8\"]' \
            -s ALLOW_MEMORY_GROWTH=1 \
            -s INITIAL_MEMORY=16777216 \
            -s STACK_SIZE=1048576 \
            -s NO_EXIT_RUNTIME=1 \
            -s ENVIRONMENT='web' \
            -msimd128 \
            -O3 \
            --bind \
        "
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/dist"
    )

# Native build (for testing)
else()
    add_executable(gbemu_native ${CORE_SOURCES} src/core/main.cpp)
    target_compile_options(gbemu_native PRIVATE -O2 -Wall -Wextra)
endif()

# Include directories
target_include_directories(gbemu PRIVATE ${CMAKE_SOURCE_DIR}/src)
