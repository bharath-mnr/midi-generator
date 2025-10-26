
package com.midigenerator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens", indexes = {
        @Index(name = "idx_token", columnList = "token", unique = true),              // ✅ FIXED: Made unique
        @Index(name = "idx_token_type", columnList = "tokenType"),
        @Index(name = "idx_expiry_date", columnList = "expiryDate"),
        @Index(name = "idx_user_token_type", columnList = "user_id, tokenType"),
        @Index(name = "idx_token_valid", columnList = "used, expiryDate")            // ✅ FIXED: Added composite for validation
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean used = false;

    @Column(nullable = false, length = 50)
    private String tokenType; // "EMAIL_VERIFICATION" or "PASSWORD_RESET"

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !isExpired() && !used;
    }
}
