#pragma once
#include <JuceHeader.h>
#include "APIClient.h"

class MidiGeneratorProcessor : public juce::AudioProcessor
{
public:
    MidiGeneratorProcessor();
    ~MidiGeneratorProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

   #ifndef JucePlugin_PreferredChannelConfigurations
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
   #endif

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    SimpleAPIClient& getAPIClient() { return apiClient; }
    
    // MIDI generation and playback
    void setGeneratedMidi(const SimpleAPIClient::MidiFile& midiFile);
    void startMidiPlayback();
    void stopMidiPlayback();
    bool isPlaying() const { return isMidiPlaying; }
    double getPlaybackPosition() const { return playbackPosition; }
    juce::MidiMessageSequence getCurrentSequence() const { return currentSequence; }

private:
    SimpleAPIClient apiClient;
    
    // MIDI playback state
    juce::MidiMessageSequence currentSequence;
    double playbackPosition = 0.0;
    bool isMidiPlaying = false;
    double currentSampleRate = 44100.0;  // Renamed to avoid conflict
    double bpm = 120.0;
    int currentPlaybackIndex = 0;

    void processMidiPlayback(juce::MidiBuffer& midiMessages, int numSamples);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MidiGeneratorProcessor)
};
