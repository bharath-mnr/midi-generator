// #include "APIClient.h"

// SimpleAPIClient::SimpleAPIClient()
//     : baseURL("http://localhost:8080/api")
// {
// }

// void SimpleAPIClient::setBaseURL(const juce::String& url)
// {
//     baseURL = url;
//     DBG("Base URL set to: " + baseURL);
// }

// SimpleAPIClient::AuthResponse SimpleAPIClient::login(const LoginCredentials& credentials)
// {
//     AuthResponse response;

//     juce::DynamicObject::Ptr requestObj = new juce::DynamicObject();
//     requestObj->setProperty("email", credentials.email);
//     requestObj->setProperty("password", credentials.password);
    
//     juce::String jsonRequest = juce::JSON::toString(juce::var(requestObj.get()));

//     juce::URL url = juce::URL(baseURL + "/auth/login")
//         .withPOSTData(jsonRequest);

//     juce::String headers = "Content-Type: application/json\r\nAccept: application/json";
//     int statusCode = 0;
//     juce::StringPairArray responseHeaders;

//     std::unique_ptr<juce::InputStream> responseStream = url.createInputStream(
//         juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
//             .withExtraHeaders(headers)
//             .withConnectionTimeoutMs(10000)
//             .withResponseHeaders(&responseHeaders)
//             .withStatusCode(&statusCode)
//             .withHttpRequestCmd("POST")
//     );

//     if (responseStream != nullptr)
//     {
//         juce::String responseText = responseStream->readEntireStreamAsString();
        
//         auto json = juce::JSON::parse(responseText);
        
//         if (json.isObject())
//         {
//             auto obj = json.getDynamicObject();
            
//             if (obj->hasProperty("token"))
//             {
//                 response.success = true;
//                 response.token = obj->getProperty("token").toString();
//                 response.email = obj->getProperty("email").toString();
//                 response.fullName = obj->getProperty("fullName").toString();
                
//                 authToken = response.token;
//                 userEmail = response.email;
//                 userName = response.fullName;
                
//                 saveCredentials(credentials.email, credentials.password, response.token);
//                 DBG("Login successful: " + response.email);
//             }
//             else if (obj->hasProperty("message"))
//             {
//                 response.errorMessage = obj->getProperty("message").toString();
//                 DBG("Login failed: " + response.errorMessage);
//             }
//             else
//             {
//                 response.errorMessage = "Invalid response from server";
//             }
//         }
//         else
//         {
//             response.errorMessage = "Invalid JSON response";
//         }
//     }
//     else
//     {
//         response.errorMessage = "Failed to connect to server";
//         DBG("Login failed: Connection error");
//     }

//     return response;
// }

// SimpleAPIClient::GenerationResponse SimpleAPIClient::generateMidi(const GenerationRequest& request)
// {
//     GenerationResponse response;

//     if (authToken.isEmpty())
//     {
//         response.errorMessage = "Not logged in";
//         return response;
//     }

//     juce::DynamicObject::Ptr requestObj = new juce::DynamicObject();
//     requestObj->setProperty("message", request.message);
//     requestObj->setProperty("creativityLevel", request.creativityLevel);
//     requestObj->setProperty("requestedBars", request.requestedBars);
//     requestObj->setProperty("source", request.source);
//     requestObj->setProperty("sessionId", "vst-" + juce::Uuid().toString());
//     requestObj->setProperty("performanceMode", "balanced");
//     requestObj->setProperty("editMode", request.editMode);
    
//     if (request.uploadedMidiData.isNotEmpty())
//     {
//         requestObj->setProperty("uploadedMidiData", request.uploadedMidiData);
//         requestObj->setProperty("uploadedMidiFilename", request.uploadedMidiFilename);
//     }

//     juce::String jsonRequest = juce::JSON::toString(juce::var(requestObj.get()));

//     juce::URL url = juce::URL(baseURL + "/midi/generate")
//         .withPOSTData(jsonRequest);

//     juce::String headers = "Authorization: Bearer " + authToken + 
//                           "\r\nContent-Type: application/json" +
//                           "\r\nAccept: application/json";

//     DBG("Generating MIDI: " + request.message);

//     int statusCode = 0;
//     juce::StringPairArray responseHeaders;

//     std::unique_ptr<juce::InputStream> responseStream = url.createInputStream(
//         juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
//             .withExtraHeaders(headers)
//             .withConnectionTimeoutMs(120000)
//             .withResponseHeaders(&responseHeaders)
//             .withStatusCode(&statusCode)
//             .withHttpRequestCmd("POST")
//     );

//     if (responseStream != nullptr)
//     {
//         juce::String responseText = responseStream->readEntireStreamAsString();
        
//         auto json = juce::JSON::parse(responseText);
        
//         if (json.isObject())
//         {
//             auto obj = json.getDynamicObject();
            
//             if (obj->hasProperty("midiUrl") || obj->hasProperty("midiData"))
//             {
//                 response.success = true;
//                 response.message = obj->getProperty("message").toString();
                
//                 // Prefer direct MIDI data if available
//                 if (obj->hasProperty("midiData"))
//                 {
//                     response.midiData = obj->getProperty("midiData").toString();
//                 }
//                 else
//                 {
//                     response.midiUrl = obj->getProperty("midiUrl").toString();
//                 }
                
//                 response.barCount = obj->getProperty("barCount");
                
//                 if (obj->hasProperty("remainingGenerations"))
//                 {
//                     response.remainingGenerations = obj->getProperty("remainingGenerations");
//                 }
                
//                 DBG("Generation successful: " + juce::String(response.barCount) + " bars");
//             }
//             else if (obj->hasProperty("message"))
//             {
//                 response.errorMessage = obj->getProperty("message").toString();
//                 DBG("Generation failed: " + response.errorMessage);
//             }
//             else
//             {
//                 response.errorMessage = "Invalid response from server";
//             }
//         }
//         else
//         {
//             response.errorMessage = "Invalid JSON response";
//         }
//     }
//     else
//     {
//         response.errorMessage = "Failed to connect to server";
//         DBG("Generation failed: Connection error");
//     }

//     return response;
// }

// SimpleAPIClient::MidiFile SimpleAPIClient::loadMidiFile(const juce::File& file)
// {
//     MidiFile result;
//     result.filename = file.getFileName();
    
//     if (file.loadFileAsData(result.data))
//     {
//         result.base64Data = encodeMidiToBase64(result.data);
//         DBG("Loaded MIDI file: " + result.filename + " (" + juce::String(result.data.getSize()) + " bytes)");
//     }
//     else
//     {
//         DBG("Failed to load MIDI file: " + file.getFullPathName());
//     }
    
//     return result;
// }

// juce::String SimpleAPIClient::encodeMidiToBase64(const juce::MemoryBlock& midiData)
// {
//     juce::MemoryOutputStream encoded;
//     juce::Base64::convertToBase64(encoded, midiData.getData(), midiData.getSize());
//     return encoded.toString();
// }

// juce::MemoryBlock SimpleAPIClient::decodeBase64ToMidi(const juce::String& base64Data)
// {
//     juce::MemoryBlock result;
//     juce::MemoryOutputStream decoded(result, false);
    
//     if (juce::Base64::convertFromBase64(decoded, base64Data))
//     {
//         return result;
//     }
    
//     return juce::MemoryBlock();
// }

// void SimpleAPIClient::logout()
// {
//     authToken = "";
//     userEmail = "";
//     userName = "";
//     clearSavedCredentials();
//     DBG("Logged out");
// }

// bool SimpleAPIClient::autoLogin()
// {
//     auto credentials = loadSavedCredentials();
    
//     if (credentials.email.isNotEmpty() && credentials.password.isNotEmpty())
//     {
//         DBG("Auto-login attempt for: " + credentials.email);
//         auto response = login(credentials);
//         return response.success;
//     }
    
//     DBG("No saved credentials for auto-login");
//     return false;
// }

// void SimpleAPIClient::saveCredentials(const juce::String& email, 
//                                      const juce::String& password, 
//                                      const juce::String& token)
// {
//     auto props = getPropertiesFile();
    
//     props->setValue("email", email);
    
//     juce::MemoryOutputStream encodedPassword;
//     juce::Base64::convertToBase64(encodedPassword, password.toRawUTF8(), password.getNumBytesAsUTF8());
//     props->setValue("password", encodedPassword.toString());
    
//     props->setValue("token", token);
//     props->saveIfNeeded();
    
//     DBG("Credentials saved for: " + email);
// }

// SimpleAPIClient::LoginCredentials SimpleAPIClient::loadSavedCredentials()
// {
//     LoginCredentials creds;
//     auto props = getPropertiesFile();
    
//     creds.email = props->getValue("email");
    
//     juce::String encodedPassword = props->getValue("password");
//     if (encodedPassword.isNotEmpty())
//     {
//         juce::MemoryOutputStream decoded;
//         if (juce::Base64::convertFromBase64(decoded, encodedPassword))
//         {
//             creds.password = decoded.toString();
//         }
//     }
    
//     authToken = props->getValue("token");
    
//     return creds;
// }

// void SimpleAPIClient::clearSavedCredentials()
// {
//     auto props = getPropertiesFile();
//     props->removeValue("email");
//     props->removeValue("password");
//     props->removeValue("token");
//     props->saveIfNeeded();
    
//     DBG("Credentials cleared");
// }

// std::unique_ptr<juce::PropertiesFile> SimpleAPIClient::getPropertiesFile()
// {
//     juce::PropertiesFile::Options options;
//     options.applicationName = "MidiGeneratorVST";
//     options.filenameSuffix = ".settings";
//     options.folderName = "MidiGenerator";
//     options.osxLibrarySubFolder = "Application Support";
    
//     return std::make_unique<juce::PropertiesFile>(options);
// }













#include "APIClient.h"

SimpleAPIClient::SimpleAPIClient()
    : baseURL("http://localhost:8080/api")
{
}

void SimpleAPIClient::setBaseURL(const juce::String& url)
{
    baseURL = url;
    DBG("Base URL set to: " + baseURL);
}

SimpleAPIClient::AuthResponse SimpleAPIClient::login(const LoginCredentials& credentials)
{
    AuthResponse response;

    juce::DynamicObject::Ptr requestObj = new juce::DynamicObject();
    requestObj->setProperty("email", credentials.email);
    requestObj->setProperty("password", credentials.password);
    
    juce::String jsonRequest = juce::JSON::toString(juce::var(requestObj.get()));

    juce::URL url = juce::URL(baseURL + "/auth/login")
        .withPOSTData(jsonRequest);

    juce::String headers = "Content-Type: application/json\r\nAccept: application/json";
    int statusCode = 0;
    juce::StringPairArray responseHeaders;

    std::unique_ptr<juce::InputStream> responseStream = url.createInputStream(
        juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
            .withExtraHeaders(headers)
            .withConnectionTimeoutMs(10000)
            .withResponseHeaders(&responseHeaders)
            .withStatusCode(&statusCode)
            .withHttpRequestCmd("POST")
    );

    if (responseStream != nullptr)
    {
        juce::String responseText = responseStream->readEntireStreamAsString();
        
        auto json = juce::JSON::parse(responseText);
        
        if (json.isObject())
        {
            auto obj = json.getDynamicObject();
            
            if (obj->hasProperty("token"))
            {
                response.success = true;
                response.token = obj->getProperty("token").toString();
                response.email = obj->getProperty("email").toString();
                response.fullName = obj->getProperty("fullName").toString();
                
                authToken = response.token;
                userEmail = response.email;
                userName = response.fullName;
                
                saveCredentials(credentials.email, credentials.password, response.token);
                DBG("Login successful: " + response.email);
            }
            else if (obj->hasProperty("message"))
            {
                response.errorMessage = obj->getProperty("message").toString();
                DBG("Login failed: " + response.errorMessage);
            }
            else
            {
                response.errorMessage = "Invalid response from server";
            }
        }
        else
        {
            response.errorMessage = "Invalid JSON response";
        }
    }
    else
    {
        response.errorMessage = "Failed to connect to server";
        DBG("Login failed: Connection error");
    }

    return response;
}

SimpleAPIClient::GenerationResponse SimpleAPIClient::generateMidi(const GenerationRequest& request)
{
    GenerationResponse response;

    if (authToken.isEmpty())
    {
        response.errorMessage = "Not logged in";
        return response;
    }

    juce::DynamicObject::Ptr requestObj = new juce::DynamicObject();
    requestObj->setProperty("message", request.message);
    requestObj->setProperty("creativityLevel", request.creativityLevel);
    requestObj->setProperty("requestedBars", request.requestedBars);
    requestObj->setProperty("source", request.source);
    requestObj->setProperty("sessionId", "vst-" + juce::Uuid().toString());
    requestObj->setProperty("performanceMode", "balanced");
    requestObj->setProperty("editMode", request.editMode);
    
    if (request.uploadedMidiData.isNotEmpty())
    {
        requestObj->setProperty("uploadedMidiData", request.uploadedMidiData);
        requestObj->setProperty("uploadedMidiFilename", request.uploadedMidiFilename);
    }

    juce::String jsonRequest = juce::JSON::toString(juce::var(requestObj.get()));

    juce::URL url = juce::URL(baseURL + "/midi/generate")
        .withPOSTData(jsonRequest);

    juce::String headers = "Authorization: Bearer " + authToken + 
                          "\r\nContent-Type: application/json" +
                          "\r\nAccept: application/json";

    DBG("Generating MIDI: " + request.message);

    int statusCode = 0;
    juce::StringPairArray responseHeaders;

    std::unique_ptr<juce::InputStream> responseStream = url.createInputStream(
        juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
            .withExtraHeaders(headers)
            .withConnectionTimeoutMs(300000)
            .withResponseHeaders(&responseHeaders)
            .withStatusCode(&statusCode)
            .withHttpRequestCmd("POST")
    );

    if (responseStream != nullptr)
    {
        juce::MemoryOutputStream responseData;
        const size_t bufferSize = 8192;
        char buffer[bufferSize];
        
        DBG("Reading response from server...");
        
        while (!responseStream->isExhausted())
        {
            auto bytesRead = responseStream->read(buffer, bufferSize);
            if (bytesRead > 0)
            {
                responseData.write(buffer, static_cast<size_t>(bytesRead));
            }
        }
        
        juce::String responseText = responseData.toString();
        DBG("Response received: " + juce::String(responseText.length()) + " bytes");
        
        auto json = juce::JSON::parse(responseText);
        
        if (json.isObject())
        {
            auto obj = json.getDynamicObject();
            
            if (obj->hasProperty("error"))
            {
                response.errorMessage = obj->getProperty("error").toString();
                DBG("Generation failed: " + response.errorMessage);
                return response;
            }
            
            if (obj->hasProperty("midiUrl") || obj->hasProperty("midiData"))
            {
                response.success = true;
                response.message = obj->getProperty("message").toString();
                
                if (obj->hasProperty("midiData") && !obj->getProperty("midiData").toString().isEmpty())
                {
                    response.midiData = obj->getProperty("midiData").toString();
                    DBG("Got MIDI data directly from response");
                }
                else if (obj->hasProperty("midiUrl"))
                {
                    juce::String midiUrl = obj->getProperty("midiUrl").toString();
                    DBG("Downloading MIDI from: " + midiUrl);
                    
                    juce::String fullUrl;
                    if (midiUrl.startsWith("http"))
                    {
                        fullUrl = midiUrl;
                    }
                    else
                    {
                        juce::String baseWithoutApi = baseURL.upToLastOccurrenceOf("/api", false, true);
                        fullUrl = baseWithoutApi + midiUrl;
                    }
                    
                    DBG("Full MIDI URL: " + fullUrl);
                    
                    juce::URL midiFileUrl(fullUrl);
                    std::unique_ptr<juce::InputStream> midiStream = midiFileUrl.createInputStream(
                        juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
                            .withExtraHeaders("Authorization: Bearer " + authToken)
                            .withConnectionTimeoutMs(30000)
                    );
                    
                    if (midiStream != nullptr)
                    {
                        juce::MemoryOutputStream midiData;
                        
                        while (!midiStream->isExhausted())
                        {
                            auto bytesRead = midiStream->read(buffer, bufferSize);
                            if (bytesRead > 0)
                            {
                                midiData.write(buffer, static_cast<size_t>(bytesRead));
                            }
                        }
                        
                        juce::MemoryBlock midiBlock = midiData.getMemoryBlock();
                        response.midiData = midiBlock.toBase64Encoding();
                        
                        DBG("MIDI file downloaded: " + juce::String(midiBlock.getSize()) + " bytes");
                    }
                    else
                    {
                        DBG("Failed to download MIDI file from: " + fullUrl);
                        response.errorMessage = "Generated but failed to download MIDI file";
                        response.success = false;
                        return response;
                    }
                    
                    response.midiUrl = midiUrl;
                }
                
                response.barCount = obj->getProperty("barCount");
                
                if (obj->hasProperty("remainingGenerations"))
                {
                    response.remainingGenerations = obj->getProperty("remainingGenerations");
                }
                
                DBG("Generation successful: " + juce::String(response.barCount) + " bars");
            }
            else if (obj->hasProperty("message"))
            {
                response.errorMessage = obj->getProperty("message").toString();
                DBG("Generation failed: " + response.errorMessage);
            }
            else
            {
                response.errorMessage = "Invalid response from server";
                DBG("Invalid response: " + responseText.substring(0, 200));
            }
        }
        else
        {
            response.errorMessage = "Invalid JSON response";
            DBG("Failed to parse JSON: " + responseText.substring(0, 200));
        }
    }
    else
    {
        response.errorMessage = "Failed to connect to server (timeout or connection error)";
        DBG("Generation failed: Connection error (status code: " + juce::String(statusCode) + ")");
    }

    return response;
}

SimpleAPIClient::MidiFile SimpleAPIClient::loadMidiFile(const juce::File& file)
{
    MidiFile result;
    result.filename = file.getFileName();
    
    if (file.loadFileAsData(result.data))
    {
        result.base64Data = encodeMidiToBase64(result.data);
        DBG("Loaded MIDI file: " + result.filename + " (" + juce::String(result.data.getSize()) + " bytes)");
    }
    else
    {
        DBG("Failed to load MIDI file: " + file.getFullPathName());
    }
    
    return result;
}

juce::String SimpleAPIClient::encodeMidiToBase64(const juce::MemoryBlock& midiData)
{
    juce::MemoryOutputStream encoded;
    juce::Base64::convertToBase64(encoded, midiData.getData(), midiData.getSize());
    return encoded.toString();
}

juce::MemoryBlock SimpleAPIClient::decodeBase64ToMidi(const juce::String& base64Data)
{
    juce::MemoryBlock result;
    juce::MemoryOutputStream decoded(result, false);
    
    if (juce::Base64::convertFromBase64(decoded, base64Data))
    {
        return result;
    }
    
    return juce::MemoryBlock();
}

void SimpleAPIClient::logout()
{
    authToken = "";
    userEmail = "";
    userName = "";
    clearSavedCredentials();
    DBG("Logged out");
}

bool SimpleAPIClient::autoLogin()
{
    auto credentials = loadSavedCredentials();
    
    if (credentials.email.isNotEmpty() && credentials.password.isNotEmpty())
    {
        DBG("Auto-login attempt for: " + credentials.email);
        auto response = login(credentials);
        return response.success;
    }
    
    DBG("No saved credentials for auto-login");
    return false;
}

void SimpleAPIClient::saveCredentials(const juce::String& email, 
                                     const juce::String& password, 
                                     const juce::String& token)
{
    auto props = getPropertiesFile();
    
    props->setValue("email", email);
    
    juce::MemoryOutputStream encodedPassword;
    juce::Base64::convertToBase64(encodedPassword, password.toRawUTF8(), password.getNumBytesAsUTF8());
    props->setValue("password", encodedPassword.toString());
    
    props->setValue("token", token);
    props->saveIfNeeded();
    
    DBG("Credentials saved for: " + email);
}

SimpleAPIClient::LoginCredentials SimpleAPIClient::loadSavedCredentials()
{
    LoginCredentials creds;
    auto props = getPropertiesFile();
    
    creds.email = props->getValue("email");
    
    juce::String encodedPassword = props->getValue("password");
    if (encodedPassword.isNotEmpty())
    {
        juce::MemoryOutputStream decoded;
        if (juce::Base64::convertFromBase64(decoded, encodedPassword))
        {
            creds.password = decoded.toString();
        }
    }
    
    authToken = props->getValue("token");
    
    return creds;
}

void SimpleAPIClient::clearSavedCredentials()
{
    auto props = getPropertiesFile();
    props->removeValue("email");
    props->removeValue("password");
    props->removeValue("token");
    props->saveIfNeeded();
    
    DBG("Credentials cleared");
}

std::unique_ptr<juce::PropertiesFile> SimpleAPIClient::getPropertiesFile()
{
    juce::PropertiesFile::Options options;
    options.applicationName = "MidiGeneratorVST";
    options.filenameSuffix = ".settings";
    options.folderName = "MidiGenerator";
    options.osxLibrarySubFolder = "Application Support";
    
    return std::make_unique<juce::PropertiesFile>(options);
}