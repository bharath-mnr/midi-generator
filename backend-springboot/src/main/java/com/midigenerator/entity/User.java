//midigenerator/entity/User.java
package com.midigenerator.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email_verified", columnList = "emailVerified, isActive")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(nullable = false)
    private Integer dailyGenerationCount = 0;

    @Column
    private LocalDateTime lastGenerationDate;

    @Column
    private LocalDateTime subscriptionExpiryDate;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ChatHistory> chatHistories = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MidiGeneration> midiGenerations = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public enum SubscriptionTier {
        FREE(5, "Free Plan - 5 generations/day"),
        BASIC(20, "Basic Plan - 20 generations/day - $9.99/month"),
        PRO(100, "Pro Plan - 100 generations/day - $24.99/month"),
        UNLIMITED(-1, "Unlimited Plan - Unlimited generations - $49.99/month");

        private final int dailyLimit;
        private final String description;

        SubscriptionTier(int dailyLimit, String description) {
            this.dailyLimit = dailyLimit;
            this.description = description;
        }

        public int getDailyLimit() {
            return dailyLimit;
        }

        public String getDescription() {
            return description;
        }

        public boolean hasUnlimitedGenerations() {
            return dailyLimit == -1;
        }
    }

    // ✅ FIX: Enhanced daily reset check with proper date comparison
    private boolean isNewDay() {
        if (lastGenerationDate == null) {
            return true;
        }

        LocalDate lastDate = lastGenerationDate.toLocalDate();
        LocalDate today = LocalDate.now();

        return !lastDate.isEqual(today);
    }

    // ✅ FIX: Reset counter at the start of each check
    private void resetDailyCountIfNeeded() {
        if (isNewDay()) {
            this.dailyGenerationCount = 0;
            this.lastGenerationDate = LocalDateTime.now();
        }
    }

    public boolean canGenerateMore() {
        // ✅ FIX: Always reset if it's a new day BEFORE checking
        resetDailyCountIfNeeded();

        // Check subscription expiry
        if (subscriptionExpiryDate != null && subscriptionExpiryDate.isBefore(LocalDateTime.now())) {
            subscriptionTier = SubscriptionTier.FREE;
        }

        // Unlimited tier
        if (subscriptionTier.hasUnlimitedGenerations()) {
            return true;
        }

        return dailyGenerationCount < subscriptionTier.getDailyLimit();
    }

    public void incrementGenerationCount() {
        // ✅ FIX: Reset if new day before incrementing
        resetDailyCountIfNeeded();

        dailyGenerationCount++;
        lastGenerationDate = LocalDateTime.now();
    }

    public int getRemainingGenerations() {
        // Reset if new day before calculating
        resetDailyCountIfNeeded();

        if (subscriptionTier.hasUnlimitedGenerations()) {
            return -1; // Unlimited
        }

        return Math.max(0, subscriptionTier.getDailyLimit() - dailyGenerationCount);
    }

    public Boolean getEmailVerified() {
        return emailVerified != null ? emailVerified : false;
    }
}