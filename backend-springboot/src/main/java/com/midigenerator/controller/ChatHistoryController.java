//midigenerator/controller/ChatHistoryController.java
package com.midigenerator.controller;

import com.midigenerator.dto.chat.ChatHistoryResponse;
import com.midigenerator.dto.chat.ChatSessionResponse;
import com.midigenerator.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
// @CrossOrigin(origins = "*", maxAge = 3600)
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionResponse>> getUserSessions() {
        return ResponseEntity.ok(chatHistoryService.getUserSessions());
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<ChatHistoryResponse>> getSessionMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatHistoryService.getSessionMessages(sessionId));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId) {
        chatHistoryService.deleteSession(sessionId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Session deleted successfully");
        return ResponseEntity.ok(response);
    }
}
