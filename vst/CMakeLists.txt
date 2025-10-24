cmake_minimum_required(VERSION 3.15)
project(MidiGenerator VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(FetchContent)

FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG 7.0.12
    GIT_SHALLOW TRUE
)

FetchContent_MakeAvailable(JUCE)

juce_add_plugin(MidiGenerator
    COMPANY_NAME "BharathProject"
    BUNDLE_ID "com.BharathProject.MidiGenerator"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT TRUE
    NEEDS_MIDI_OUTPUT TRUE
    IS_MIDI_EFFECT TRUE
    COPY_PLUGIN_AFTER_BUILD FALSE
    PLUGIN_MANUFACTURER_CODE BPrj
    PLUGIN_CODE MnG2
    FORMATS VST3
    PRODUCT_NAME "MidiGenerator"
)

target_sources(MidiGenerator PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/APIClient.cpp
    Source/PluginProcessor.h
    Source/PluginEditor.h
    Source/APIClient.h
)

juce_generate_juce_header(MidiGenerator)

target_link_libraries(MidiGenerator
    PRIVATE
        juce::juce_audio_utils
        juce::juce_audio_processors
        juce::juce_gui_basics
        juce::juce_audio_formats  # Added for MIDI file support
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

target_compile_definitions(MidiGenerator
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=1
        JUCE_VST3_CAN_REPLACE_VST2=0
)

message(STATUS "=================================================")
message(STATUS "Project:   ${PROJECT_NAME}")
message(STATUS "Output:    ${CMAKE_BINARY_DIR}")
message(STATUS "=================================================")