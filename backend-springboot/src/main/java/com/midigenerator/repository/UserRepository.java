//midigenerator/repository/UserRepository.java
package com.midigenerator.repository;

import com.midigenerator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.subscriptionExpiryDate <= :now AND u.subscriptionTier != 'FREE'")
    List<User> findExpiredSubscriptions(@Param("now") LocalDateTime now);

    // ✅ NEW: Find users who need daily count reset
    @Query("SELECT u FROM User u WHERE u.lastGenerationDate < :startOfToday AND u.dailyGenerationCount > 0")
    List<User> findUsersToResetDailyCount(@Param("startOfToday") LocalDateTime startOfToday);
}