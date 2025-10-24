package com.midigenerator.dto.generation;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerationResponse {
    private Long id;
    private String message;
    private String midiUrl;
    private Integer barCount;
    private Integer voiceCount;
    private Boolean valid;
    private String conversionError;
    private List<String> validationWarnings;
    private Boolean autoFixed;
    private LocalDateTime timestamp;
    private Integer remainingGenerations;
    private Boolean limitReached;
    private String limitMessage;
}
