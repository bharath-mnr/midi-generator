//
//package com.midigenerator.repository;
//
//import com.midigenerator.entity.User;
//import jakarta.persistence.LockModeType;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Lock;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface UserRepository extends JpaRepository<User, Long> {
//
//    Optional<User> findByEmail(String email);
//
//    Boolean existsByEmail(String email);
//
//    @Query("SELECT u FROM User u WHERE u.subscriptionExpiryDate <= :now AND u.subscriptionTier != 'FREE'")
//    List<User> findExpiredSubscriptions(@Param("now") LocalDateTime now);
//
//    @Query("SELECT u FROM User u WHERE u.lastGenerationDate < :startOfToday AND u.dailyGenerationCount > 0")
//    List<User> findUsersToResetDailyCount(@Param("startOfToday") LocalDateTime startOfToday);
//
//    // ✅ NEW: Efficient single SQL UPDATE query for daily reset
//    /**
//     * Resets dailyGenerationCount to 0 for all users whose lastGenerationDate
//     * is before the start of today (UTC).
//     *
//     * This is MUCH faster than:
//     * 1. Fetching all users
//     * 2. Updating each in memory
//     * 3. Saving all back to database
//     *
//     * @param date Start of today (UTC timezone)
//     * @return Number of users whose count was reset
//     */
//    @Modifying
//    @Query("UPDATE User u SET u.dailyGenerationCount = 0 " +
//            "WHERE u.lastGenerationDate < :date " +
//            "AND u.dailyGenerationCount > 0")
//    int resetDailyCountsForDateBefore(@Param("date") LocalDateTime date);
//
//    // ✅ NEW: Optional query to get count of users who will be reset (for monitoring)
//    /**
//     * Count users who need daily count reset
//     * Useful for monitoring and logging purposes
//     */
//    @Query("SELECT COUNT(u) FROM User u " +
//            "WHERE u.lastGenerationDate < :date " +
//            "AND u.dailyGenerationCount > 0")
//    long countUsersNeedingReset(@Param("date") LocalDateTime date);
//
//    // ✅ Pessimistic lock prevents concurrent modification conflicts
//    // Use this method when you need to modify user data to prevent
//    // OptimisticLockingFailureException in high-concurrency scenarios
//    @Lock(LockModeType.PESSIMISTIC_WRITE)
//    @Query("SELECT u FROM User u WHERE u.id = :id")
//    Optional<User> findByIdWithLock(@Param("id") Long id);
//
//    // ✅ OPTIONAL: Atomic decrement at SQL level (alternative to Java-based decrement)
//    // Use this if you prefer database-level atomicity instead of pessimistic locking
//    @Modifying
//    @Query("UPDATE User u SET u.dailyGenerationCount = GREATEST(0, u.dailyGenerationCount - 1) WHERE u.id = :userId")
//    void decrementGenerationCount(@Param("userId") Long userId);
//
//    // ✅ OPTIONAL: Atomic increment at SQL level with built-in limit check
//    // Returns number of rows updated (0 if limit already reached)
//    @Modifying
//    @Query("UPDATE User u SET u.dailyGenerationCount = u.dailyGenerationCount + 1 " +
//            "WHERE u.id = :userId AND u.dailyGenerationCount < " +
//            "(CASE u.subscriptionTier " +
//            "WHEN 'FREE' THEN 5 " +
//            "WHEN 'BASIC' THEN 20 " +
//            "WHEN 'PRO' THEN 100 " +
//            "ELSE 5 END)")
//    int incrementGenerationCount(@Param("userId") Long userId);
//}













package com.midigenerator.repository;

import com.midigenerator.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT u FROM User u WHERE u.lastGenerationDate < :startOfToday AND u.dailyGenerationCount > 0")
    List<User> findUsersToResetDailyCount(@Param("startOfToday") LocalDateTime startOfToday);

    // ✅ Efficient bulk update for daily reset
    @Modifying
    @Query("UPDATE User u SET u.dailyGenerationCount = 0 " +
            "WHERE u.lastGenerationDate < :date " +
            "AND u.dailyGenerationCount > 0")
    int resetDailyCountsForDateBefore(@Param("date") LocalDateTime date);

    // ✅ Count users who need daily count reset
    @Query("SELECT COUNT(u) FROM User u " +
            "WHERE u.lastGenerationDate < :date " +
            "AND u.dailyGenerationCount > 0")
    long countUsersNeedingReset(@Param("date") LocalDateTime date);

    // ✅ Pessimistic lock prevents concurrent modification conflicts
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithLock(@Param("id") Long id);

    // ✅ Atomic decrement at SQL level
    @Modifying
    @Query("UPDATE User u SET u.dailyGenerationCount = GREATEST(0, u.dailyGenerationCount - 1) WHERE u.id = :userId")
    void decrementGenerationCount(@Param("userId") Long userId);

    // ✅ Atomic increment at SQL level with built-in limit check
    @Modifying
    @Query("UPDATE User u SET u.dailyGenerationCount = u.dailyGenerationCount + 1 " +
            "WHERE u.id = :userId AND u.dailyGenerationCount < " +
            "(CASE u.subscriptionTier " +
            "WHEN 'FREE' THEN 5 " +
            "WHEN 'BASIC' THEN 20 " +
            "WHEN 'PRO' THEN 100 " +
            "ELSE 5 END)")
    int incrementGenerationCount(@Param("userId") Long userId);
}