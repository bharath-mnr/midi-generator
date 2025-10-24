//midigenerator/entity/ChatHistory.java
package com.midigenerator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_histories", indexes = {
        @Index(name = "idx_user_session", columnList = "user_id, session_id"),
        @Index(name = "idx_session_id", columnList = "session_id"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_chat_hist_source", columnList = "user_id, source")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String sessionId;

    @Column(columnDefinition = "TEXT")
    private String userMessage;

    @Column(columnDefinition = "TEXT")
    private String botResponse;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MessageType messageType;

    @Column
    private Integer requestedBars;

    @Column
    private Integer generatedBars;

    @Column(length = 500)
    private String midiUrl;

    @Column(length = 10)
    private String source = "web"; // ✅ NEW: "web" or "vst"

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum MessageType {
        GENERATE,
        EDIT,
        UPLOAD
    }
}