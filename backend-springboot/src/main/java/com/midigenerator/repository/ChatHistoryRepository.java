//midigenerator/repository/ChatHistoryRepository.java
package com.midigenerator.repository;

import com.midigenerator.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

    // Find all chats by user, ordered by creation date descending
    @Query("SELECT ch FROM ChatHistory ch WHERE ch.user.id = :userId ORDER BY ch.createdAt DESC")
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    // Find chats by session ID, ordered by creation date ascending
    List<ChatHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // Count chats for a user after a certain date
    @Query("SELECT COUNT(ch) FROM ChatHistory ch WHERE ch.user.id = :userId AND ch.createdAt >= :startDate")
    Long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    // Delete all chats in a session
    void deleteBySessionId(String sessionId);

    // Check if session exists for user
    @Query("SELECT CASE WHEN COUNT(ch) > 0 THEN true ELSE false END FROM ChatHistory ch WHERE ch.sessionId = :sessionId AND ch.user.id = :userId")
    boolean existsBySessionIdAndUserId(@Param("sessionId") String sessionId, @Param("userId") Long userId);
}