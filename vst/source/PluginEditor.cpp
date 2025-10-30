#include "PluginEditor.h"
#include "juce_audio_formats/juce_audio_formats.h"

MidiDragSource::MidiDragSource(const juce::String& name)
    : name(name)
{
    backgroundColor = juce::Colour(0xff6366f1).withAlpha(0.1f);
    setSize(200, 60);
}

void MidiDragSource::paint(juce::Graphics& g)
{
    auto bounds = getLocalBounds().toFloat().reduced(1.0f);
    
    // Background
    g.setColour(backgroundColor);
    g.fillRoundedRectangle(bounds, 6.0f);
    
    // Border
    g.setColour(juce::Colour(0xff6366f1).withAlpha(0.3f));
    g.drawRoundedRectangle(bounds, 6.0f, 1.0f);
    
    // Content
    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(14.0f, juce::Font::bold));
    g.drawText(name, bounds, juce::Justification::centred);
}

void MidiDragSource::mouseDown(const juce::MouseEvent& event)
{
    // Simple click handler - in full implementation, this would trigger drag
    juce::AlertWindow::showMessageBoxAsync(juce::AlertWindow::InfoIcon,
        "MIDI Export",
        "MIDI drag functionality would export your generated composition.\n\n"
        "In a full implementation, this would create a draggable MIDI file that you could drop into your DAW's piano roll.");
}

// MidiGeneratorEditor implementation
MidiGeneratorEditor::MidiGeneratorEditor(MidiGeneratorProcessor& p)
    : AudioProcessorEditor(&p), processor(p)
{
    setSize(800, 900);
    setLookAndFeel(&modernLNF);
    
    setupLoginScreen();
    setupMainScreen();
    
    if (processor.getAPIClient().isLoggedIn())
    {
        showMainScreen();
        updateUserProfile();
    }
    else
    {
        showLoginScreen();
    }
    
    startTimer(100);
}

MidiGeneratorEditor::~MidiGeneratorEditor()
{
    stopTimer();
    setLookAndFeel(nullptr);
}

void MidiGeneratorEditor::setupLoginScreen()
{
    loginScreen.setOpaque(false);
    addAndMakeVisible(loginScreen);
    
    // Modern title with gradient effect
    titleLabel.setText("MIDI Generator", juce::dontSendNotification);
    titleLabel.setFont(juce::Font(36.0f, juce::Font::bold));
    titleLabel.setJustificationType(juce::Justification::centred);
    titleLabel.setColour(juce::Label::textColourId, textColor);
    loginScreen.addAndMakeVisible(titleLabel);
    
    subtitleLabel.setText("AI-Powered Music Composition", juce::dontSendNotification);
    subtitleLabel.setFont(juce::Font(16.0f));
    subtitleLabel.setJustificationType(juce::Justification::centred);
    subtitleLabel.setColour(juce::Label::textColourId, secondaryTextColor);
    loginScreen.addAndMakeVisible(subtitleLabel);
    
    // Email input
    emailLabel.setText("Email Address", juce::dontSendNotification);
    emailLabel.setColour(juce::Label::textColourId, textColor);
    emailLabel.setFont(juce::Font(14.0f, juce::Font::bold));
    loginScreen.addAndMakeVisible(emailLabel);
    
    emailInput.setTextToShowWhenEmpty("your@email.com", secondaryTextColor);
    emailInput.setColour(juce::TextEditor::backgroundColourId, cardColor);
    emailInput.setColour(juce::TextEditor::textColourId, textColor);
    emailInput.setColour(juce::TextEditor::outlineColourId, primaryColor);
    emailInput.setColour(juce::TextEditor::focusedOutlineColourId, primaryColor);
    loginScreen.addAndMakeVisible(emailInput);
    
    // Password input
    passwordLabel.setText("Password", juce::dontSendNotification);
    passwordLabel.setColour(juce::Label::textColourId, textColor);
    passwordLabel.setFont(juce::Font(14.0f, juce::Font::bold));
    loginScreen.addAndMakeVisible(passwordLabel);
    
    passwordInput.setPasswordCharacter('•');
    passwordInput.setTextToShowWhenEmpty("Your password", secondaryTextColor);
    passwordInput.setColour(juce::TextEditor::backgroundColourId, cardColor);
    passwordInput.setColour(juce::TextEditor::textColourId, textColor);
    passwordInput.setColour(juce::TextEditor::outlineColourId, primaryColor);
    passwordInput.setColour(juce::TextEditor::focusedOutlineColourId, primaryColor);
    loginScreen.addAndMakeVisible(passwordInput);
    
    // Login button
    loginButton.setButtonText("Sign In");
    loginButton.setColour(juce::TextButton::buttonColourId, primaryColor);
    loginButton.setColour(juce::TextButton::textColourOnId, textColor);
    loginButton.setColour(juce::TextButton::textColourOffId, textColor);
    loginButton.onClick = [this] { handleLogin(); };
    loginScreen.addAndMakeVisible(loginButton);
    
    // Signup button
    signupButton.setButtonText("Create Account");
    signupButton.setColour(juce::TextButton::buttonColourId, cardColor);
    signupButton.setColour(juce::TextButton::textColourOnId, textColor);
    signupButton.onClick = [this] { 
        juce::URL("https://midi-generator-seven.vercel.app").launchInDefaultBrowser();
    };
    loginScreen.addAndMakeVisible(signupButton);
    
    // Status label
    loginStatusLabel.setJustificationType(juce::Justification::centred);
    loginStatusLabel.setColour(juce::Label::textColourId, warningColor);
    loginScreen.addAndMakeVisible(loginStatusLabel);
}

void MidiGeneratorEditor::setupMainScreen()
{
    mainScreen.setOpaque(false);
    mainScreen.setVisible(false);
    addAndMakeVisible(mainScreen);
    
    // User info at top
    userInfoLabel.setJustificationType(juce::Justification::centredLeft);
    userInfoLabel.setColour(juce::Label::textColourId, textColor);
    userInfoLabel.setFont(juce::Font(16.0f, juce::Font::bold));
    mainScreen.addAndMakeVisible(userInfoLabel);
    
    planLabel.setJustificationType(juce::Justification::centredLeft);
    planLabel.setColour(juce::Label::textColourId, secondaryTextColor);
    planLabel.setFont(juce::Font(12.0f));
    mainScreen.addAndMakeVisible(planLabel);
    
    // Prompt section
    promptLabel.setText("Describe Your Musical Ideas", juce::dontSendNotification);
    promptLabel.setColour(juce::Label::textColourId, textColor);
    promptLabel.setFont(juce::Font(18.0f, juce::Font::bold));
    mainScreen.addAndMakeVisible(promptLabel);
    
    promptInput.setMultiLine(true);
    promptInput.setReturnKeyStartsNewLine(true);
    promptInput.setTextToShowWhenEmpty("Describe the music you want to generate...", secondaryTextColor);
    promptInput.setColour(juce::TextEditor::backgroundColourId, cardColor);
    promptInput.setColour(juce::TextEditor::textColourId, textColor);
    promptInput.setColour(juce::TextEditor::outlineColourId, primaryColor);
    mainScreen.addAndMakeVisible(promptInput);
    
    // MIDI Upload section
    uploadLabel.setText("Upload MIDI to Transform", juce::dontSendNotification);
    uploadLabel.setColour(juce::Label::textColourId, textColor);
    uploadLabel.setFont(juce::Font(14.0f, juce::Font::bold));
    mainScreen.addAndMakeVisible(uploadLabel);
    
    uploadButton.setButtonText("Choose MIDI File");
    uploadButton.setColour(juce::TextButton::buttonColourId, cardColor);
    uploadButton.setColour(juce::TextButton::textColourOnId, textColor);
    uploadButton.onClick = [this] { handleMidiUpload(); };
    mainScreen.addAndMakeVisible(uploadButton);
    
    uploadedFileLabel.setText("No file selected", juce::dontSendNotification);
    uploadedFileLabel.setColour(juce::Label::textColourId, secondaryTextColor);
    mainScreen.addAndMakeVisible(uploadedFileLabel);
    
    clearUploadButton.setButtonText("Clear");
    clearUploadButton.setColour(juce::TextButton::buttonColourId, errorColor);
    clearUploadButton.setColour(juce::TextButton::textColourOnId, textColor);
    clearUploadButton.onClick = [this] { 
        uploadedMidi = SimpleAPIClient::MidiFile();
        uploadedFileLabel.setText("No file selected", juce::dontSendNotification);
    };
    clearUploadButton.setVisible(false);
    mainScreen.addAndMakeVisible(clearUploadButton);
    
    // Controls
    barsLabel.setText("Bars:", juce::dontSendNotification);
    barsLabel.setColour(juce::Label::textColourId, textColor);
    mainScreen.addAndMakeVisible(barsLabel);
    
    barsSlider.setRange(4, 128, 4);
    barsSlider.setValue(32);
    barsSlider.setSliderStyle(juce::Slider::LinearHorizontal);
    barsSlider.setTextBoxStyle(juce::Slider::TextBoxRight, false, 60, 20);
    mainScreen.addAndMakeVisible(barsSlider);
    
    creativityLabel.setText("Creativity:", juce::dontSendNotification);
    creativityLabel.setColour(juce::Label::textColourId, textColor);
    mainScreen.addAndMakeVisible(creativityLabel);
    
    creativityBox.addItem("Low", 1);
    creativityBox.addItem("Medium", 2);
    creativityBox.addItem("High", 3);
    creativityBox.setSelectedId(2);
    mainScreen.addAndMakeVisible(creativityBox);
    
    // Generate button
    generateButton.setButtonText("Generate MIDI");
    generateButton.setColour(juce::TextButton::buttonColourId, primaryColor);
    generateButton.setColour(juce::TextButton::textColourOnId, textColor);
    generateButton.onClick = [this] { handleGeneration(); };
    mainScreen.addAndMakeVisible(generateButton);
    
    // Status label
    statusLabel.setJustificationType(juce::Justification::centred);
    statusLabel.setColour(juce::Label::textColourId, successColor);
    statusLabel.setFont(juce::Font(14.0f, juce::Font::bold));
    mainScreen.addAndMakeVisible(statusLabel);
    
    // Generated MIDI section
    generatedMidiLabel.setText("Generated MIDI Clips", juce::dontSendNotification);
    generatedMidiLabel.setColour(juce::Label::textColourId, textColor);
    generatedMidiLabel.setFont(juce::Font(16.0f, juce::Font::bold));
    mainScreen.addAndMakeVisible(generatedMidiLabel);
    
    midiDragContainer.setOpaque(false);
    midiDragViewport.setViewedComponent(&midiDragContainer, false);
    midiDragViewport.setScrollBarsShown(true, false);
    mainScreen.addAndMakeVisible(midiDragViewport);
    
    // Playback controls
    playButton.setButtonText("Play");
    playButton.setColour(juce::TextButton::buttonColourId, successColor);
    playButton.setColour(juce::TextButton::textColourOnId, textColor);
    playButton.onClick = [this] { 
        processor.startMidiPlayback();
        updatePlaybackControls();
    };
    mainScreen.addAndMakeVisible(playButton);
    
    stopButton.setButtonText("Stop");
    stopButton.setColour(juce::TextButton::buttonColourId, errorColor);
    stopButton.setColour(juce::TextButton::textColourOnId, textColor);
    stopButton.onClick = [this] { 
        processor.stopMidiPlayback();
        updatePlaybackControls();
    };
    mainScreen.addAndMakeVisible(stopButton);
    
    playbackStatusLabel.setText("Stopped", juce::dontSendNotification);
    playbackStatusLabel.setColour(juce::Label::textColourId, secondaryTextColor);
    mainScreen.addAndMakeVisible(playbackStatusLabel);
    
    // User controls
    logoutButton.setButtonText("Logout");
    logoutButton.setColour(juce::TextButton::buttonColourId, cardColor);
    logoutButton.setColour(juce::TextButton::textColourOnId, textColor);
    logoutButton.onClick = [this] { 
        processor.getAPIClient().logout();
        showLoginScreen();
    };
    mainScreen.addAndMakeVisible(logoutButton);
    
    dashboardButton.setButtonText("Open Web Dashboard");
    dashboardButton.setColour(juce::TextButton::buttonColourId, primaryColor);
    dashboardButton.setColour(juce::TextButton::textColourOnId, textColor);
    dashboardButton.onClick = [this] { 
        juce::URL("https://midi-generator-seven.vercel.app/dashboard").launchInDefaultBrowser();
    };
    mainScreen.addAndMakeVisible(dashboardButton);
}

void MidiGeneratorEditor::updateUserProfile()
{
    auto profile = processor.getAPIClient().getUserProfile();
    
    userInfoLabel.setText("Welcome, " + profile.fullName, juce::dontSendNotification);
    planLabel.setText(profile.subscriptionTier + " Plan • " + 
                     juce::String(profile.remainingGenerations) + " generations remaining", 
                     juce::dontSendNotification);
}

void MidiGeneratorEditor::createMidiDragSources()
{
    clearMidiDragSources();
    
    // Create demo MIDI drag sources
    auto dragSource1 = std::make_unique<MidiDragSource>("Generated Composition");
    midiDragContainer.addAndMakeVisible(dragSource1.get());
    midiDragSources.push_back(std::move(dragSource1));
    
    auto dragSource2 = std::make_unique<MidiDragSource>("Bass Line");
    midiDragContainer.addAndMakeVisible(dragSource2.get());
    midiDragSources.push_back(std::move(dragSource2));
    
    // Layout drag sources
    int y = 10;
    for (auto& source : midiDragSources)
    {
        source->setBounds(10, y, midiDragViewport.getWidth() - 25, 60);
        y += 70;
    }
    midiDragContainer.setSize(midiDragViewport.getWidth(), y);
}

void MidiGeneratorEditor::clearMidiDragSources()
{
    midiDragSources.clear();
    midiDragContainer.removeAllChildren();
}

void MidiGeneratorEditor::handleLogin()
{
    loginButton.setEnabled(false);
    loginStatusLabel.setText("Signing in...", juce::dontSendNotification);
    
    SimpleAPIClient::LoginCredentials creds;
    creds.email = emailInput.getText().trim();
    creds.password = passwordInput.getText();
    
    auto response = processor.getAPIClient().login(creds);
    
    if (response.success)
    {
        showMainScreen();
        updateUserProfile();
    }
    else
    {
        loginStatusLabel.setText(response.errorMessage, juce::dontSendNotification);
        loginButton.setEnabled(true);
    }
}

void MidiGeneratorEditor::handleMidiUpload()
{
    auto fileChooser = std::make_shared<juce::FileChooser>("Select MIDI File",
                                                          juce::File::getSpecialLocation(juce::File::userDocumentsDirectory),
                                                          "*.mid;*.midi");
    
    auto folderChooserFlags = juce::FileBrowserComponent::openMode | juce::FileBrowserComponent::canSelectFiles;
    
    fileChooser->launchAsync(folderChooserFlags, [this, fileChooser](const juce::FileChooser& chooser)
    {
        auto file = chooser.getResult();
        if (file.existsAsFile())
        {
            loadMidiFile(file);
        }
    });
}

void MidiGeneratorEditor::loadMidiFile(const juce::File& file)
{
    uploadedMidi = processor.getAPIClient().loadMidiFile(file);
    if (uploadedMidi.data.getSize() > 0)
    {
        uploadedFileLabel.setText("Loaded: " + uploadedMidi.filename, juce::dontSendNotification);
        uploadedFileLabel.setColour(juce::Label::textColourId, juce::Colours::lightgreen);
        clearUploadButton.setVisible(true);
        statusLabel.setText("MIDI file loaded - ready to transform!", juce::dontSendNotification);
    }
    else
    {
        uploadedFileLabel.setText("Failed to load: " + file.getFileName(), juce::dontSendNotification);
        uploadedFileLabel.setColour(juce::Label::textColourId, juce::Colours::orange);
    }
    resized();
}

bool MidiGeneratorEditor::isInterestedInFileDrag(const juce::StringArray& files)
{
    for (const auto& file : files)
    {
        if (file.endsWithIgnoreCase(".mid") || file.endsWithIgnoreCase(".midi"))
            return true;
    }
    return false;
}

void MidiGeneratorEditor::filesDropped(const juce::StringArray& files, int x, int y)
{
    juce::ignoreUnused(x, y);
    
    for (const auto& file : files)
    {
        juce::File midiFile(file);
        if (midiFile.hasFileExtension("mid;midi"))
        {
            loadMidiFile(midiFile);
            break;
        }
    }
}

void MidiGeneratorEditor::handleGeneration()
{
    if (isGenerating) return;
    
    juce::String prompt = promptInput.getText().trim();
    if (prompt.isEmpty() && uploadedMidi.data.getSize() == 0)
    {
        statusLabel.setText("Please enter a prompt or upload a MIDI file", juce::dontSendNotification);
        return;
    }
    
    isGenerating = true;
    generateButton.setEnabled(false);
    statusLabel.setText("🎵 Generating MIDI... This may take a moment", juce::dontSendNotification);
    
    SimpleAPIClient::GenerationRequest request;
    request.message = prompt.isEmpty() ? "Transform this MIDI file" : prompt;
    request.requestedBars = (int)barsSlider.getValue();
    request.creativityLevel = creativityBox.getText().toLowerCase();
    request.source = "vst";
    request.editMode = uploadedMidi.data.getSize() > 0;
    
    if (uploadedMidi.data.getSize() > 0)
    {
        request.uploadedMidiData = uploadedMidi.base64Data;
        request.uploadedMidiFilename = uploadedMidi.filename;
    }
    
    juce::Thread::launch([this, request]() {
        auto response = processor.getAPIClient().generateMidi(request);
        
        juce::MessageManager::callAsync([this, response]() {
            isGenerating = false;
            generateButton.setEnabled(true);
            
            if (response.success)
            {
                if (response.midiData.isNotEmpty())
                {
                    auto midiData = processor.getAPIClient().decodeBase64ToMidi(response.midiData);
                    SimpleAPIClient::MidiFile midiFile;
                    midiFile.data = midiData;
                    midiFile.filename = "generated_composition.mid";
                    
                    processor.setGeneratedMidi(midiFile);
                    statusLabel.setText("✅ MIDI Generated! " + juce::String(response.barCount) + " bars - Ready to play", juce::dontSendNotification);
                    updatePlaybackControls();
                    
                    // Create MIDI drag sources after generation
                    createMidiDragSources();
                }
                else
                {
                    statusLabel.setText("✅ Generation complete - MIDI ready", juce::dontSendNotification);
                }
                
                // Clear prompt and upload after successful generation
                promptInput.clear();
                uploadedMidi = SimpleAPIClient::MidiFile();
                uploadedFileLabel.setText("No file selected", juce::dontSendNotification);
                clearUploadButton.setVisible(false);
            }
            else
            {
                statusLabel.setText("❌ " + response.errorMessage, juce::dontSendNotification);
            }
        });
    });
}

void MidiGeneratorEditor::updatePlaybackControls()
{
    if (processor.isPlaying())
    {
        playbackStatusLabel.setText("Playing...", juce::dontSendNotification);
        playbackStatusLabel.setColour(juce::Label::textColourId, juce::Colours::lightgreen);
    }
    else
    {
        playbackStatusLabel.setText("Stopped", juce::dontSendNotification);
        playbackStatusLabel.setColour(juce::Label::textColourId, secondaryTextColor);
    }
}

void MidiGeneratorEditor::showLoginScreen()
{
    loginScreen.setVisible(true);
    mainScreen.setVisible(false);
    resized();
}

void MidiGeneratorEditor::showMainScreen()
{
    loginScreen.setVisible(false);
    mainScreen.setVisible(true);
    
    userInfoLabel.setText(
        "Welcome, " + processor.getAPIClient().getUserEmail(),
        juce::dontSendNotification);
    
    // Create demo MIDI drag sources
    createMidiDragSources();
    
    resized();
}

void MidiGeneratorEditor::paint(juce::Graphics& g)
{
    // Modern gradient background
    juce::ColourGradient gradient(
        juce::Colour(0xff0f0f0f), 0, 0,
        juce::Colour(0xff1a1a1a), 0, getHeight(),
        false
    );
    g.setGradientFill(gradient);
    g.fillRect(getLocalBounds());
    
    // Add subtle noise texture
    g.setColour(juce::Colours::black.withAlpha(0.03f));
    for (int i = 0; i < getWidth(); i += 4)
    {
        for (int j = 0; j < getHeight(); j += 4)
        {
            if (rand() % 100 < 30) // 30% density
                g.fillRect(i, j, 1, 1);
        }
    }
}

void MidiGeneratorEditor::resized()
{
    auto bounds = getLocalBounds().reduced(20);
    
    if (loginScreen.isVisible())
    {
        loginScreen.setBounds(bounds);
        layoutLoginScreen();
    }
    else if (mainScreen.isVisible())
    {
        mainScreen.setBounds(bounds);
        layoutMainScreen();
    }
}

void MidiGeneratorEditor::layoutLoginScreen()
{
    auto bounds = loginScreen.getLocalBounds().reduced(20);
    
    titleLabel.setBounds(bounds.removeFromTop(80));
    subtitleLabel.setBounds(bounds.removeFromTop(30));
    bounds.removeFromTop(40);
    
    auto formWidth = jmin(400, bounds.getWidth());
    auto formBounds = bounds.withSizeKeepingCentre(formWidth, 400);
    
    emailLabel.setBounds(formBounds.removeFromTop(25));
    emailInput.setBounds(formBounds.removeFromTop(40));
    formBounds.removeFromTop(20);
    
    passwordLabel.setBounds(formBounds.removeFromTop(25));
    passwordInput.setBounds(formBounds.removeFromTop(40));
    formBounds.removeFromTop(30);
    
    loginButton.setBounds(formBounds.removeFromTop(45));
    formBounds.removeFromTop(10);
    
    signupButton.setBounds(formBounds.removeFromTop(45));
    formBounds.removeFromTop(20);
    
    loginStatusLabel.setBounds(formBounds.removeFromTop(60));
}

void MidiGeneratorEditor::layoutMainScreen()
{
    auto bounds = mainScreen.getLocalBounds().reduced(10);
    
    // User info at top
    auto topRow = bounds.removeFromTop(50);
    userInfoLabel.setBounds(topRow.removeFromTop(25));
    planLabel.setBounds(topRow);
    bounds.removeFromTop(10);
    
    // Prompt section
    promptLabel.setBounds(bounds.removeFromTop(30));
    promptInput.setBounds(bounds.removeFromTop(120));
    bounds.removeFromTop(15);
    
    // MIDI Upload section
    uploadLabel.setBounds(bounds.removeFromTop(25));
    auto uploadRow = bounds.removeFromTop(30);
    uploadButton.setBounds(uploadRow.removeFromLeft(150));
    uploadedFileLabel.setBounds(uploadRow.removeFromLeft(250).reduced(5, 0));
    clearUploadButton.setBounds(uploadRow);
    bounds.removeFromTop(15);
    
    // Controls section
    auto controlsSection = bounds.removeFromTop(80);
    
    auto barsRow = controlsSection.removeFromTop(30);
    barsLabel.setBounds(barsRow.removeFromLeft(60));
    barsSlider.setBounds(barsRow);
    
    auto creativityRow = controlsSection.removeFromTop(30);
    creativityLabel.setBounds(creativityRow.removeFromLeft(80));
    creativityBox.setBounds(creativityRow.removeFromLeft(150));
    
    bounds.removeFromTop(20);
    
    // Generate button
    generateButton.setBounds(bounds.removeFromTop(45));
    bounds.removeFromTop(15);
    
    // Status
    statusLabel.setBounds(bounds.removeFromTop(40));
    bounds.removeFromTop(15);
    
    // Generated MIDI section
    generatedMidiLabel.setBounds(bounds.removeFromTop(30));
    midiDragViewport.setBounds(bounds.removeFromTop(200));
    bounds.removeFromTop(15);
    
    // Playback controls
    auto playbackSection = bounds.removeFromTop(40);
    playButton.setBounds(playbackSection.removeFromLeft(80).reduced(2));
    stopButton.setBounds(playbackSection.removeFromLeft(80).reduced(2));
    playbackStatusLabel.setBounds(playbackSection.reduced(5));
    
    bounds.removeFromTop(20);
    
    // Dashboard and logout buttons
    auto bottomRow = bounds.removeFromTop(40);
    dashboardButton.setBounds(bottomRow.removeFromLeft(180));
    logoutButton.setBounds(bottomRow.removeFromRight(100));
}

void MidiGeneratorEditor::timerCallback()
{
    updatePlaybackControls();
}