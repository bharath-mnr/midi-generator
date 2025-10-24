//midigenerator/service/VerificationTokenService.java
package com.midigenerator.service;

import com.midigenerator.entity.User;
import com.midigenerator.entity.VerificationToken;
import com.midigenerator.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationTokenService {

    private final VerificationTokenRepository verificationTokenRepository;

    @Value("${app.token.expiry.email-verification:86400}") // 24 hours
    private Long emailVerificationExpirySeconds;

    @Value("${app.token.expiry.password-reset:3600}") // 1 hour
    private Long passwordResetExpirySeconds;

    @Transactional
    public VerificationToken createEmailVerificationToken(User user) {
        try {
            // Delete existing email verification tokens for this user
            verificationTokenRepository.deleteByUserIdAndTokenType(user.getId(), "EMAIL_VERIFICATION");

            String token = UUID.randomUUID().toString();
            log.info("ðŸ” Creating email verification token for user: {} - Token: {}",
                    user.getEmail(), token.substring(0, 8) + "...");

            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setUser(user);
            verificationToken.setTokenType("EMAIL_VERIFICATION");
            verificationToken.setExpiryDate(LocalDateTime.now().plusSeconds(emailVerificationExpirySeconds));
            verificationToken.setUsed(false);

            VerificationToken savedToken = verificationTokenRepository.save(verificationToken);
            log.info("âœ… Email verification token created successfully for user: {}", user.getEmail());

            return savedToken;
        } catch (Exception e) {
            log.error("âŒ Failed to create email verification token for user {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create verification token: " + e.getMessage());
        }
    }

    @Transactional
    public VerificationToken createPasswordResetToken(User user) {
        try {
            // Delete existing password reset tokens for this user
            verificationTokenRepository.deleteByUserIdAndTokenType(user.getId(), "PASSWORD_RESET");

            String token = UUID.randomUUID().toString();
            log.info("ðŸ” Creating password reset token for user: {} - Token: {}",
                    user.getEmail(), token.substring(0, 8) + "...");

            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setUser(user);
            verificationToken.setTokenType("PASSWORD_RESET");
            verificationToken.setExpiryDate(LocalDateTime.now().plusSeconds(passwordResetExpirySeconds));
            verificationToken.setUsed(false);

            VerificationToken savedToken = verificationTokenRepository.save(verificationToken);
            log.info("âœ… Password reset token created successfully for user: {}", user.getEmail());

            return savedToken;
        } catch (Exception e) {
            log.error("âŒ Failed to create password reset token for user {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create password reset token: " + e.getMessage());
        }
    }

    @Transactional
    public VerificationToken validateToken(String token, String tokenType) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token cannot be empty");
        }

        log.info("ðŸ” Validating {} token: {}", tokenType, token.substring(0, 8) + "...");

        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.error("âŒ Token not found in database: {}", token.substring(0, 8) + "...");
                    return new RuntimeException("Invalid or expired verification link");
                });

        log.info("ðŸ“‹ Token found - Type: {}, Expired: {}, Used: {}, User: {}",
                verificationToken.getTokenType(),
                verificationToken.isExpired(),
                verificationToken.getUsed(),
                verificationToken.getUser().getEmail());

        if (!verificationToken.getTokenType().equals(tokenType)) {
            log.error("âŒ Token type mismatch. Expected: {}, Got: {}",
                    tokenType, verificationToken.getTokenType());
            throw new RuntimeException("Invalid token type");
        }

        if (verificationToken.isExpired()) {
            log.error("âŒ Token expired on: {}", verificationToken.getExpiryDate());
            throw new RuntimeException("Verification link has expired. Please request a new one.");
        }

        if (verificationToken.getUsed()) {
            log.error("âŒ Token already used");
            throw new RuntimeException("Verification link has already been used");
        }

        log.info("âœ… Token validation successful for user: {}", verificationToken.getUser().getEmail());
        return verificationToken;
    }

    @Transactional
    public void markTokenAsUsed(VerificationToken token) {
        try {
            token.setUsed(true);
            verificationTokenRepository.save(token);
            log.info("âœ… Token marked as used: {}", token.getToken().substring(0, 8) + "...");
        } catch (Exception e) {
            log.error("âŒ Failed to mark token as used: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update token status");
        }
    }

    @Transactional
    public void deleteExpiredTokens() {
        try {
            verificationTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
            log.info("âœ… Expired tokens cleaned up");
        } catch (Exception e) {
            log.error("âŒ Error cleaning up expired tokens: {}", e.getMessage());
        }
    }
}