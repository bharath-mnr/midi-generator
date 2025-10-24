package com.midigenerator.dto.chat;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryResponse {
    private Long id;
    private String sessionId;
    private String userMessage;
    private String botResponse;
    private String messageType;
    private Integer requestedBars;
    private Integer generatedBars;
    private String midiUrl;
    private LocalDateTime createdAt;
}
