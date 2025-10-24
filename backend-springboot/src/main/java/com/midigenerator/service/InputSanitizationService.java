//package com.midigenerator.service;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.util.StringUtils;
//import java.util.regex.Pattern;
//
//@Slf4j
//@Service
//public class InputSanitizationService {
//
//    // Pattern to detect XSS attacks
//    private static final Pattern DANGEROUS_PATTERN = Pattern.compile(
//            "<script|javascript:|on\\w+\\s*=|<iframe|<object|<embed",
//            Pattern.CASE_INSENSITIVE
//    );
//
//    // Pattern to detect path traversal in filenames
//    private static final Pattern PATH_TRAVERSAL = Pattern.compile("\\.\\.|/|\\\\");
//
//    /**
//     * Sanitizes user input to prevent XSS attacks in HTML context
//     * @param input Raw user input
//     * @return Sanitized string safe for HTML display
//     */
//    public String sanitizeHtml(String input) {
//        if (input == null || input.isEmpty()) {
//            return input;
//        }
//
//        return input
//                .replace("&", "&amp;")   // Must be first to avoid double-encoding
//                .replace("<", "&lt;")
//                .replace(">", "&gt;")
//                .replace("\"", "&quot;")
//                .replace("'", "&#x27;")
//                .trim();
//    }
//
//    /**
//     * Validates input for dangerous XSS patterns
//     * @param input String to validate
//     * @throws IllegalArgumentException if dangerous patterns found
//     */
//    public void validateInput(String input) {
//        if (input == null || input.isEmpty()) {
//            return;
//        }
//
//        if (DANGEROUS_PATTERN.matcher(input).find()) {
//            log.warn("Dangerous pattern detected in input: {}",
//                    input.substring(0, Math.min(50, input.length())));
//            throw new IllegalArgumentException("Input contains potentially dangerous characters");
//        }
//    }
//
//    /**
//     * Validates filename to prevent path traversal attacks
//     * @param filename Filename to validate
//     * @throws IllegalArgumentException if path traversal detected or invalid format
//     */
//    public void validateFilename(String filename) {
//        if (filename == null || filename.isEmpty()) {
//            return;
//        }
//
//        // Check for path traversal
//        if (PATH_TRAVERSAL.matcher(filename).find()) {
//            log.warn("Path traversal attempt detected: {}", filename);
//            throw new IllegalArgumentException("Invalid filename - path traversal detected");
//        }
//
//        // Validate MIDI file extension
//        if (!filename.matches("^[a-zA-Z0-9_-]+\\.(mid|midi)$")) {
//            log.warn("Invalid MIDI filename format: {}", filename);
//            throw new IllegalArgumentException("Invalid MIDI filename format");
//        }
//    }
//}



















//midigenerator/service/InputSanitizationService.java
package com.midigenerator.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.regex.Pattern;

@Slf4j
@Service
public class InputSanitizationService {

    // Pattern to detect XSS attacks
    private static final Pattern DANGEROUS_PATTERN = Pattern.compile(
            "<script|javascript:|on\\w+\\s*=|<iframe|<object|<embed",
            Pattern.CASE_INSENSITIVE
    );

    // ✅ FIX: More flexible pattern for MIDI filenames
    private static final Pattern VALID_MIDI_FILENAME = Pattern.compile(
            "^[a-zA-Z0-9_\\-\\s\\.]+\\.(mid|midi)$",
            Pattern.CASE_INSENSITIVE
    );

    // Pattern to detect path traversal
    private static final Pattern PATH_TRAVERSAL = Pattern.compile("\\.\\.|/|\\\\");

    /**
     * Sanitizes user input to prevent XSS attacks in HTML context
     */
    public String sanitizeHtml(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .trim();
    }

    /**
     * Validates input for dangerous XSS patterns
     */
    public void validateInput(String input) {
        if (input == null || input.isEmpty()) {
            return;
        }

        // Only check for actual script/HTML injection attempts
        String lowerInput = input.toLowerCase();
        if (lowerInput.contains("<script") ||
                lowerInput.contains("javascript:") ||
                lowerInput.contains("onerror=") ||
                lowerInput.contains("onclick=")) {
            log.warn("Dangerous pattern detected in input");
            throw new IllegalArgumentException("Input contains potentially dangerous characters");
        }
    }

    /**
     * ✅ FIX: Enhanced filename validation for MIDI files
     */
    public void validateFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return;
        }

        // Check for path traversal
        if (PATH_TRAVERSAL.matcher(filename).find()) {
            log.warn("Path traversal attempt detected: {}", filename);
            throw new IllegalArgumentException("Invalid filename - path traversal detected");
        }

        // Clean filename (remove spaces, special chars)
        String cleanedFilename = filename.trim().replaceAll("[^a-zA-Z0-9_.-]", "_");

        // Validate MIDI file extension
        if (!VALID_MIDI_FILENAME.matcher(cleanedFilename).matches()) {
            log.warn("Invalid MIDI filename format: {}", filename);
            throw new IllegalArgumentException("Filename must end with .mid or .midi and contain only safe characters");
        }

        // Check filename length
        if (cleanedFilename.length() < 5 || cleanedFilename.length() > 255) {
            throw new IllegalArgumentException("Filename must be between 5 and 255 characters");
        }
    }

    /**
     * ✅ NEW: Validate base64 MIDI data
     */
    public void validateMidiData(String base64Data) {
        if (base64Data == null || base64Data.isEmpty()) {
            return;
        }

        // Check if it looks like valid base64
        if (!base64Data.matches("^[A-Za-z0-9+/]*={0,2}$")) {
            log.warn("Invalid base64 format detected");
            throw new IllegalArgumentException("Invalid MIDI data format");
        }

        // Check size (10MB max for base64)
        if (base64Data.length() > 10485760) {
            log.warn("MIDI data too large: {} bytes", base64Data.length());
            throw new IllegalArgumentException("MIDI file too large (max 10MB)");
        }
    }

    /**
     * ✅ NEW: Clean filename for safe storage
     */
    public String cleanFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "unknown.mid";
        }

        // Remove any path components
        String baseName = filename.substring(filename.lastIndexOf('/') + 1);
        baseName = baseName.substring(baseName.lastIndexOf('\\') + 1);

        // Replace unsafe characters with underscores
        String cleaned = baseName.replaceAll("[^a-zA-Z0-9_.-]", "_");

        // Ensure .mid or .midi extension
        if (!cleaned.toLowerCase().endsWith(".mid") && !cleaned.toLowerCase().endsWith(".midi")) {
            cleaned = cleaned + ".mid";
        }

        return cleaned;
    }
}