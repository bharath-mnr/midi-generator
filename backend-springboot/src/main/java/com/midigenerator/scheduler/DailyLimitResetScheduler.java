//midigenerator/scheduler/DailyLimitResetScheduler.java
package com.midigenerator.scheduler;

import com.midigenerator.entity.User;
import com.midigenerator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ✅ Scheduler to reset daily generation counts at midnight
 * Runs every day at 00:00:01 (1 second after midnight)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyLimitResetScheduler {

    private final UserRepository userRepository;

    /**
     * Reset daily generation counts at midnight
     * Cron: "second minute hour day month day-of-week"
     * "1 0 0 * * *" = 00:00:01 every day
     */
    @Scheduled(cron = "1 0 0 * * *")
    @Transactional
    public void resetDailyGenerationCounts() {
        try {
            log.info("🔄 Starting daily generation count reset...");

            LocalDateTime today = LocalDateTime.now();
            LocalDate todayDate = today.toLocalDate();

            // Find all users whose lastGenerationDate is before today
            List<User> users = userRepository.findAll();

            int resetCount = 0;
            for (User user : users) {
                if (user.getLastGenerationDate() != null) {
                    LocalDate lastGenDate = user.getLastGenerationDate().toLocalDate();

                    // Reset if last generation was on a different day
                    if (!lastGenDate.isEqual(todayDate)) {
                        user.setDailyGenerationCount(0);
                        resetCount++;
                    }
                }
            }

            if (resetCount > 0) {
                userRepository.saveAll(users);
                log.info("✅ Daily generation counts reset for {} users", resetCount);
            } else {
                log.info("ℹ️ No users needed daily count reset");
            }

        } catch (Exception e) {
            log.error("❌ Error resetting daily generation counts: {}", e.getMessage(), e);
        }
    }

    /**
     * ✅ Alternative: Reset only active users who generated yesterday
     * More efficient for large user bases
     */
    @Scheduled(cron = "1 0 0 * * *")
    @Transactional
    public void resetDailyGenerationCountsEfficient() {
        try {
            log.info("🔄 Starting efficient daily generation count reset...");

            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

            // Find users who have generations and whose last generation was before today
            List<User> usersToReset = userRepository.findUsersToResetDailyCount(startOfToday);

            if (!usersToReset.isEmpty()) {
                for (User user : usersToReset) {
                    user.setDailyGenerationCount(0);
                }

                userRepository.saveAll(usersToReset);
                log.info("✅ Daily generation counts reset for {} active users", usersToReset.size());
            } else {
                log.info("ℹ️ No active users needed daily count reset");
            }

        } catch (Exception e) {
            log.error("❌ Error in efficient daily reset: {}", e.getMessage(), e);
        }
    }
}