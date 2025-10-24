#include "PluginProcessor.h"
#include "PluginEditor.h"

MidiGeneratorProcessor::MidiGeneratorProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     #if ! JucePlugin_IsMidiEffect
                      #if ! JucePlugin_IsSynth
                       .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                      #endif
                       .withOutput ("Output", juce::AudioChannelSet::stereo(), true)
                     #endif
                       )
#endif
{
    apiClient.autoLogin();
}

MidiGeneratorProcessor::~MidiGeneratorProcessor()
{
}

const juce::String MidiGeneratorProcessor::getName() const
{
    return JucePlugin_Name;
}

bool MidiGeneratorProcessor::acceptsMidi() const
{
   #if JucePlugin_WantsMidiInput
    return true;
   #else
    return false;
   #endif
}

bool MidiGeneratorProcessor::producesMidi() const
{
   #if JucePlugin_ProducesMidiOutput
    return true;
   #else
    return false;
   #endif
}

bool MidiGeneratorProcessor::isMidiEffect() const
{
   #if JucePlugin_IsMidiEffect
    return true;
   #else
    return false;
   #endif
}

double MidiGeneratorProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int MidiGeneratorProcessor::getNumPrograms()
{
    return 1;
}

int MidiGeneratorProcessor::getCurrentProgram()
{
    return 0;
}

void MidiGeneratorProcessor::setCurrentProgram (int index)
{
    juce::ignoreUnused (index);
}

const juce::String MidiGeneratorProcessor::getProgramName (int index)
{
    juce::ignoreUnused (index);
    return {};
}

void MidiGeneratorProcessor::changeProgramName (int index, const juce::String& newName)
{
    juce::ignoreUnused (index, newName);
}

void MidiGeneratorProcessor::prepareToPlay (double newSampleRate, int samplesPerBlock)
{
    currentSampleRate = newSampleRate;
    juce::ignoreUnused(samplesPerBlock);
}

void MidiGeneratorProcessor::releaseResources()
{
}

#ifndef JucePlugin_PreferredChannelConfigurations
bool MidiGeneratorProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
  #if JucePlugin_IsMidiEffect
    juce::ignoreUnused (layouts);
    return true;
  #else
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

   #if ! JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
   #endif

    return true;
  #endif
}
#endif

void MidiGeneratorProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    buffer.clear();
    
    // Clear incoming MIDI if we're generating our own
    if (isMidiPlaying)
    {
        midiMessages.clear();
    }
    
    if (isMidiPlaying)
    {
        processMidiPlayback(midiMessages, buffer.getNumSamples());
    }
}

bool MidiGeneratorProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* MidiGeneratorProcessor::createEditor()
{
    return new MidiGeneratorEditor (*this);
}

void MidiGeneratorProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    juce::ignoreUnused (destData);
}

void MidiGeneratorProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    juce::ignoreUnused (data, sizeInBytes);
}

void MidiGeneratorProcessor::setGeneratedMidi(const SimpleAPIClient::MidiFile& midiFile)
{
    juce::MidiFile midiFileObj;
    juce::MemoryInputStream inputStream(midiFile.data, false);
    
    if (midiFileObj.readFrom(inputStream))
    {
        currentSequence = juce::MidiMessageSequence();
        
        // Convert MIDI file tracks to a single sequence
        for (int i = 0; i < midiFileObj.getNumTracks(); i++)
        {
            auto* track = midiFileObj.getTrack(i);
            if (track)
            {
                currentSequence.addSequence(*track, 0.0);
            }
        }
        
        currentSequence.updateMatchedPairs();
        playbackPosition = 0.0;
        currentPlaybackIndex = 0;
        
        DBG("Loaded MIDI sequence with " + juce::String(currentSequence.getNumEvents()) + " events");
    }
    else
    {
        DBG("Failed to parse MIDI file");
    }
}

void MidiGeneratorProcessor::startMidiPlayback()
{
    if (currentSequence.getNumEvents() > 0)
    {
        isMidiPlaying = true;
        playbackPosition = 0.0;
        currentPlaybackIndex = 0;
        DBG("Starting MIDI playback");
    }
    else
    {
        DBG("No MIDI sequence to play");
    }
}

void MidiGeneratorProcessor::stopMidiPlayback()
{
    isMidiPlaying = false;
    DBG("Stopped MIDI playback");
}

void MidiGeneratorProcessor::processMidiPlayback(juce::MidiBuffer& midiMessages, int numSamples)
{
    if (!isMidiPlaying || currentSequence.getNumEvents() == 0)
        return;

    // Calculate timing - assuming 120 BPM and 960 PPQ (pulses per quarter note)
    double samplesPerTick = (currentSampleRate * 60.0) / (bpm * 960.0);
    double endPosition = playbackPosition + (numSamples / samplesPerTick);

    // Process MIDI events in the current time range
    while (currentPlaybackIndex < currentSequence.getNumEvents())
    {
        auto* event = currentSequence.getEventPointer(currentPlaybackIndex);
        double eventTime = event->message.getTimeStamp();
        
        if (eventTime >= playbackPosition && eventTime < endPosition)
        {
            // Calculate sample offset within this block
            int sampleOffset = static_cast<int>((eventTime - playbackPosition) * samplesPerTick);
            sampleOffset = juce::jmin(sampleOffset, numSamples - 1);
            
            // Add the MIDI event to the output buffer
            midiMessages.addEvent(event->message, sampleOffset);
            currentPlaybackIndex++;
        }
        else if (eventTime >= endPosition)
        {
            // Event is in future blocks, break for now
            break;
        }
        else
        {
            // Event is in the past (shouldn't happen normally), skip it
            currentPlaybackIndex++;
        }
    }

    // Update playback position
    playbackPosition = endPosition;

    // Loop playback when we reach the end
    double sequenceLength = currentSequence.getEndTime();
    if (playbackPosition >= sequenceLength)
    {
        playbackPosition = 0.0;
        currentPlaybackIndex = 0;
        DBG("MIDI playback looped");
    }
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new MidiGeneratorProcessor();
}