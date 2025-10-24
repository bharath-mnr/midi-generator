#pragma once
#include <JuceHeader.h>
#include "PluginProcessor.h"

class MidiDragSource : public juce::Component
{
public:
    MidiDragSource(const juce::String& name);
    
    void paint(juce::Graphics& g) override;
    void mouseDown(const juce::MouseEvent& event) override;

private:
    juce::String name;
    juce::Colour backgroundColor;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MidiDragSource)
};

class MidiGeneratorEditor : public juce::AudioProcessorEditor,
                            private juce::Timer,
                            private juce::FileDragAndDropTarget
{
public:
    MidiGeneratorEditor(MidiGeneratorProcessor&);
    ~MidiGeneratorEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

    // File drag and drop
    bool isInterestedInFileDrag(const juce::StringArray& files) override;
    void filesDropped(const juce::StringArray& files, int x, int y) override;

private:
    void timerCallback() override;
    void setupLoginScreen();
    void setupMainScreen();
    void layoutLoginScreen();
    void layoutMainScreen();
    void handleLogin();
    void handleGeneration();
    void handleMidiUpload();
    void showLoginScreen();
    void showMainScreen();
    void updatePlaybackControls();
    void loadMidiFile(const juce::File& file);
    void updateUserProfile();
    void createMidiDragSources();
    void clearMidiDragSources();

    MidiGeneratorProcessor& processor;
    
    // Modern gradient colors matching web UI
    juce::Colour backgroundColor = juce::Colour(0xff0f0f0f);
    juce::Colour cardColor = juce::Colour(0xff1a1a1a);
    juce::Colour primaryColor = juce::Colour(0xff6366f1);
    juce::Colour primaryHoverColor = juce::Colour(0xff4f46e5);
    juce::Colour textColor = juce::Colour(0xfff8fafc);
    juce::Colour secondaryTextColor = juce::Colour(0xff94a3b8);
    juce::Colour successColor = juce::Colour(0xff10b981);
    juce::Colour warningColor = juce::Colour(0xfff59e0b);
    juce::Colour errorColor = juce::Colour(0xffef4444);

    // Custom LookAndFeel for modern buttons
    class ModernLNF : public juce::LookAndFeel_V4
    {
    public:
        ModernLNF() {
            setColour(juce::TextButton::buttonColourId, juce::Colour(0xff6366f1));
            setColour(juce::TextButton::buttonOnColourId, juce::Colour(0xff4f46e5));
            setColour(juce::TextButton::textColourOffId, juce::Colour(0xfff8fafc));
            setColour(juce::ComboBox::backgroundColourId, juce::Colour(0xff1a1a1a));
            setColour(juce::ComboBox::textColourId, juce::Colour(0xfff8fafc));
            setColour(juce::ComboBox::arrowColourId, juce::Colour(0xff6366f1));
            setColour(juce::Slider::thumbColourId, juce::Colour(0xff6366f1));
            setColour(juce::Slider::trackColourId, juce::Colour(0xff374151));
            setColour(juce::Slider::textBoxTextColourId, juce::Colour(0xfff8fafc));
            setColour(juce::Slider::textBoxBackgroundColourId, juce::Colour(0xff1a1a1a));
            setColour(juce::TextEditor::backgroundColourId, juce::Colour(0xff1a1a1a));
            setColour(juce::TextEditor::textColourId, juce::Colour(0xfff8fafc));
            setColour(juce::TextEditor::highlightColourId, juce::Colour(0xff6366f1));
            setColour(juce::TextEditor::outlineColourId, juce::Colour(0xff374151));
            setColour(juce::Label::textColourId, juce::Colour(0xfff8fafc));
        }
        
        void drawButtonBackground(juce::Graphics& g, juce::Button& button, 
                                 const juce::Colour& backgroundColour,
                                 bool shouldDrawButtonAsHighlighted, 
                                 bool shouldDrawButtonAsDown) override
        {
            auto cornerSize = 8.0f;
            auto bounds = button.getLocalBounds().toFloat().reduced(0.5f, 0.5f);

            auto baseColour = backgroundColour.withMultipliedSaturation(button.hasKeyboardFocus(true) ? 1.3f : 0.9f)
                                              .withMultipliedAlpha(button.isEnabled() ? 1.0f : 0.5f);

            if (shouldDrawButtonAsDown || shouldDrawButtonAsHighlighted)
                baseColour = baseColour.contrasting(shouldDrawButtonAsDown ? 0.2f : 0.1f);

            g.setColour(baseColour);
            g.fillRoundedRectangle(bounds, cornerSize);

            g.setColour(button.findColour(juce::ComboBox::outlineColourId));
            g.drawRoundedRectangle(bounds, cornerSize, 1.0f);
        }
    };

    ModernLNF modernLNF;

    // Login Screen Components
    juce::Component loginScreen;
    juce::Label titleLabel;
    juce::Label subtitleLabel;
    juce::Label emailLabel;
    juce::TextEditor emailInput;
    juce::Label passwordLabel;
    juce::TextEditor passwordInput;
    juce::TextButton loginButton;
    juce::Label loginStatusLabel;
    juce::TextButton signupButton;

    // Main Screen Components
    juce::Component mainScreen;
    juce::Label userInfoLabel;
    juce::Label planLabel;
    
    // Generation Section
    juce::Label promptLabel;
    juce::TextEditor promptInput;
    
    // MIDI Upload Section
    juce::Label uploadLabel;
    juce::TextButton uploadButton;
    juce::Label uploadedFileLabel;
    juce::TextButton clearUploadButton;
    
    // Controls Section
    juce::Label barsLabel;
    juce::Slider barsSlider;
    juce::Label creativityLabel;
    juce::ComboBox creativityBox;
    
    // Generation Button
    juce::TextButton generateButton;
    juce::Label statusLabel;
    
    // Generated MIDI Section
    juce::Label generatedMidiLabel;
    juce::Viewport midiDragViewport;
    juce::Component midiDragContainer;
    std::vector<std::unique_ptr<MidiDragSource>> midiDragSources;
    
    // Playback Controls
    juce::TextButton playButton;
    juce::TextButton stopButton;
    juce::Label playbackStatusLabel;
    
    // User Controls
    juce::TextButton logoutButton;
    juce::TextButton dashboardButton;

    // State
    bool isGenerating = false;
    SimpleAPIClient::MidiFile uploadedMidi;
    juce::String lastGeneratedMidi;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MidiGeneratorEditor)
};