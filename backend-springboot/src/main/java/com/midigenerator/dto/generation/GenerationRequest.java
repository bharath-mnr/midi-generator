package com.midigenerator.dto.generation;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerationRequest {

    @NotBlank(message = "Message is required")
    @Size(min = 1, max = 1000, message = "Message must be between 1 and 1000 characters")
    private String message;

    @Pattern(regexp = "low|medium|high", message = "Creativity level must be: low, medium, or high")
    private String creativityLevel = "medium";

    @Pattern(regexp = "fast|balanced|quality", message = "Performance mode must be: fast, balanced, or quality")
    private String performanceMode = "balanced";

    @Min(value = 1, message = "Must request at least 1 bar")
    @Max(value = 500, message = "Maximum 500 bars allowed")
    private Integer requestedBars;

    private Boolean editMode = false;

    @Size(max = 50000, message = "Original content too large")  // ✅ Increased from 5000
    private String originalContent;

    @Size(min = 1, max = 100, message = "Session ID must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Invalid session ID format")
    private String sessionId;

    // ✅ FIX: Increased size limit for base64 MIDI data
    // Base64 encoding increases size by ~33%, so 5MB file becomes ~6.7MB base64
    @Size(max = 10485760, message = "MIDI data cannot exceed 10MB")  // 10MB limit
    private String uploadedMidiData;

    // ✅ FIX: More lenient filename validation
    @Size(min = 5, max = 255, message = "Filename must be between 5 and 255 characters")
    private String uploadedMidiFilename;

    @Pattern(regexp = "web|vst", message = "Source must be: web or vst")
    private String source = "web";
}