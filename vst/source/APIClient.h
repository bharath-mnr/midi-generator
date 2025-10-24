#pragma once
#include <JuceHeader.h>

class SimpleAPIClient
{
public:
    struct LoginCredentials
    {
        juce::String email;
        juce::String password;
    };

    struct AuthResponse
    {
        bool success = false;
        juce::String token;
        juce::String email;
        juce::String fullName;
        juce::String errorMessage;
    };

    struct GenerationRequest
    {
        juce::String message;
        juce::String creativityLevel = "medium";
        int requestedBars = 32;
        juce::String source = "vst";
        juce::String uploadedMidiData;
        juce::String uploadedMidiFilename;
        bool editMode = false;
    };

    struct GenerationResponse
    {
        bool success = false;
        juce::String message;
        juce::String midiData;
        juce::String midiUrl;
        int barCount = 0;
        juce::String errorMessage;
        int remainingGenerations = 0;
    };

    struct MidiFile
    {
        juce::String filename;
        juce::MemoryBlock data;
        juce::String base64Data;
    };

    struct UserProfile
    {
        juce::String email;
        juce::String fullName;
        juce::String subscriptionTier;
        int dailyGenerationCount = 0;
        int remainingGenerations = 0;
    };

    SimpleAPIClient();
    ~SimpleAPIClient() = default;

    void setBaseURL(const juce::String& url);
    AuthResponse login(const LoginCredentials& credentials);
    GenerationResponse generateMidi(const GenerationRequest& request);
    
    bool isLoggedIn() const { return !authToken.isEmpty(); }
    juce::String getUserEmail() const { return userEmail; }
    juce::String getUserName() const { return userName; }

    void logout();
    bool autoLogin();

    // MIDI file handling
    MidiFile loadMidiFile(const juce::File& file);
    juce::String encodeMidiToBase64(const juce::MemoryBlock& midiData);
    juce::MemoryBlock decodeBase64ToMidi(const juce::String& base64Data);
    
    // User profile
    UserProfile getUserProfile() 
    {
        UserProfile profile;
        profile.email = userEmail;
        profile.fullName = userName;
        profile.subscriptionTier = "FREE";
        profile.remainingGenerations = 10;
        return profile;
    }

private:
    juce::String baseURL;
    juce::String authToken;
    juce::String userEmail;
    juce::String userName;

    void saveCredentials(const juce::String& email, const juce::String& password, const juce::String& token);
    LoginCredentials loadSavedCredentials();
    void clearSavedCredentials();
    std::unique_ptr<juce::PropertiesFile> getPropertiesFile();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(SimpleAPIClient)
};