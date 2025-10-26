
package com.midigenerator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_token", columnList = "token", unique = true),      // ✅ FIXED: Made unique
        @Index(name = "idx_user_id", columnList = "user_id"),                 // ✅ FIXED: Added user index
        @Index(name = "idx_expiry", columnList = "expiryDate"),               // ✅ FIXED: Added expiry index
        @Index(name = "idx_token_valid", columnList = "revoked, expiryDate")  // ✅ FIXED: Added composite for validation
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean revoked = false;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !isExpired() && !revoked;
    }
}