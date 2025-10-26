
//midigenerator/scheduler/DailyLimitResetScheduler.java
package com.midigenerator.scheduler;

import com.midigenerator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * ✅ Scheduler to reset daily generation counts at midnight UTC
 * Runs once per day at 00:00:01 (1 second after midnight UTC)
 *
 * IMPORTANT: Only ONE method with the cron schedule to avoid duplicates
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyLimitResetScheduler {

    private final UserRepository userRepository;

    /**
     * ✅ SINGLE method to reset daily generation counts
     *
     * Cron: "second minute hour day month day-of-week"
     * "1 0 0 * * *" = 00:00:01 UTC every day
     *
     * Uses efficient single SQL UPDATE query instead of loading all users
     */
    @Scheduled(cron = "1 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyGenerationCounts() {
        try {
            long startTime = System.currentTimeMillis();
            LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));
            LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();

            log.info("🔄 Starting daily generation count reset at {}", now);
            log.info("📅 Resetting counts for users with lastGenerationDate before {}", startOfToday);

            // ✅ Single efficient SQL UPDATE query
            int resetCount = userRepository.resetDailyCountsForDateBefore(startOfToday);

            long duration = System.currentTimeMillis() - startTime;

            if (resetCount > 0) {
                log.info("✅ Daily generation counts reset for {} users in {}ms", resetCount, duration);
            } else {
                log.info("ℹ️ No users needed daily count reset (duration: {}ms)", duration);
            }

            // ✅ Log summary for monitoring
            logResetSummary(resetCount, duration);

        } catch (Exception e) {
            log.error("❌ Critical error resetting daily generation counts: {}", e.getMessage(), e);
            // ⚠️ Consider sending alert notification here for production
        }
    }

    /**
     * ✅ Optional: Manual reset endpoint (for testing/admin)
     * Called by AdminController only
     */
    @Transactional
    public int manualReset() {
        try {
            log.info("🔧 Manual daily reset triggered");
            LocalDateTime startOfToday = LocalDate.now(ZoneId.of("UTC")).atStartOfDay();
            int resetCount = userRepository.resetDailyCountsForDateBefore(startOfToday);
            log.info("✅ Manual reset complete: {} users", resetCount);
            return resetCount;
        } catch (Exception e) {
            log.error("❌ Manual reset failed: {}", e.getMessage(), e);
            throw new RuntimeException("Manual reset failed: " + e.getMessage());
        }
    }

    /**
     * ✅ Log detailed summary for monitoring/debugging
     */
    private void logResetSummary(int resetCount, long duration) {
        log.info("═══════════════════════════════════════════════════════");
        log.info("📊 Daily Reset Summary");
        log.info("═══════════════════════════════════════════════════════");
        log.info("   Users Reset: {}", resetCount);
        log.info("   Duration: {}ms", duration);
        log.info("   Status: {}", resetCount > 0 ? "SUCCESS" : "NO ACTION NEEDED");
        log.info("   Timestamp: {}", LocalDateTime.now(ZoneId.of("UTC")));
        log.info("═══════════════════════════════════════════════════════");
    }
}