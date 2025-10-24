package com.midigenerator.dto.chat;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionResponse {
    private String sessionId;
    private LocalDateTime lastMessageAt;
    private Integer messageCount;
    private String preview;
}