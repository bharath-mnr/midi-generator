//midigenerator/service/ChatHistoryService.java
package com.midigenerator.service;

import com.midigenerator.dto.chat.ChatHistoryResponse;
import com.midigenerator.dto.chat.ChatSessionResponse;
import com.midigenerator.entity.*;
import com.midigenerator.exception.*;
import com.midigenerator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserService userService;

    public List<ChatSessionResponse> getUserSessions() {
        User user = userService.getCurrentUser();

        try {
            // Get all chat histories for user
            List<ChatHistory> allChats = chatHistoryRepository
                    .findByUserIdOrderByCreatedAtDesc(user.getId());

            log.info("Found {} total chat messages for user {}", allChats.size(), user.getEmail());

            if (allChats.isEmpty()) {
                return Collections.emptyList();
            }

            // Group by session ID manually
            Map<String, List<ChatHistory>> sessionMap = allChats.stream()
                    .filter(chat -> chat.getSessionId() != null && !chat.getSessionId().trim().isEmpty())
                    .collect(Collectors.groupingBy(ChatHistory::getSessionId));

            // Convert to response objects
            return sessionMap.entrySet().stream()
                    .map(entry -> {
                        String sessionId = entry.getKey();
                        List<ChatHistory> chats = entry.getValue();

                        if (chats.isEmpty()) {
                            return null;
                        }

                        // Get latest message for sorting
                        ChatHistory latest = chats.stream()
                                .max(Comparator.comparing(ChatHistory::getCreatedAt))
                                .orElse(chats.get(0));

                        // Get preview from first message
                        String preview = chats.stream()
                                .min(Comparator.comparing(ChatHistory::getCreatedAt))
                                .map(ChatHistory::getUserMessage)
                                .orElse("Empty session");

                        if (preview != null && preview.length() > 50) {
                            preview = preview.substring(0, 50) + "...";
                        }

                        return ChatSessionResponse.builder()
                                .sessionId(sessionId)
                                .lastMessageAt(latest.getCreatedAt())
                                .messageCount(chats.size())
                                .preview(preview != null ? preview : "Empty session")
                                .build();
                    })
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(ChatSessionResponse::getLastMessageAt).reversed())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error fetching chat sessions for user {}: {}", user.getEmail(), e.getMessage(), e);
            // Return empty list instead of throwing exception
            return Collections.emptyList();
        }
    }

    public List<ChatHistoryResponse> getSessionMessages(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID cannot be empty");
        }

        User user = userService.getCurrentUser();

        try {
            List<ChatHistory> chats = chatHistoryRepository
                    .findBySessionIdOrderByCreatedAtAsc(sessionId);

            if (chats.isEmpty()) {
                log.warn("No messages found for session {}", sessionId);
                return Collections.emptyList();
            }

            // Verify ownership
            if (!chats.get(0).getUser().getId().equals(user.getId())) {
                log.warn("User {} attempted to access session {} owned by user {}",
                        user.getId(), sessionId, chats.get(0).getUser().getId());
                throw new UnauthorizedAccessException("You don't have permission to access this session");
            }

            return chats.stream()
                    .map(chat -> ChatHistoryResponse.builder()
                            .id(chat.getId())
                            .sessionId(chat.getSessionId())
                            .userMessage(chat.getUserMessage())
                            .botResponse(chat.getBotResponse())
                            .messageType(chat.getMessageType() != null ?
                                    chat.getMessageType().name() : "GENERATE")
                            .requestedBars(chat.getRequestedBars())
                            .generatedBars(chat.getGeneratedBars())
                            .midiUrl(chat.getMidiUrl())
                            .createdAt(chat.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());

        } catch (UnauthorizedAccessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching session messages for session {}: {}", sessionId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Transactional
    public void deleteSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID cannot be empty");
        }

        User user = userService.getCurrentUser();

        try {
            List<ChatHistory> chats = chatHistoryRepository
                    .findBySessionIdOrderByCreatedAtAsc(sessionId);

            if (chats.isEmpty()) {
                log.warn("No messages found for session {} to delete", sessionId);
                return;
            }

            // Verify ownership
            if (!chats.get(0).getUser().getId().equals(user.getId())) {
                log.warn("User {} attempted to delete session {} owned by user {}",
                        user.getId(), sessionId, chats.get(0).getUser().getId());
                throw new UnauthorizedAccessException("You don't have permission to delete this session");
            }

            log.info("Deleting {} messages from session {} for user {}",
                    chats.size(), sessionId, user.getEmail());

            chatHistoryRepository.deleteBySessionId(sessionId);

        } catch (UnauthorizedAccessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting session {}: {}", sessionId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete session: " + e.getMessage());
        }
    }
}