////midigenerator/service/AuthService.java
//package com.midigenerator.service;
//
//import com.midigenerator.dto.auth.*;
//import com.midigenerator.entity.*;
//import com.midigenerator.exception.*;
//import com.midigenerator.repository.*;
//import com.midigenerator.security.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.authentication.*;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Collections;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class AuthService {
//
//    private final UserRepository userRepository;
//    private final RoleRepository roleRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final AuthenticationManager authenticationManager;
//    private final JwtTokenProvider tokenProvider;
//    private final RefreshTokenService refreshTokenService;
//    private final VerificationTokenService verificationTokenService;
//    private final EmailService emailService;
//
//    @Transactional
//    public AuthResponse signup(SignupRequest request) {
//        if (userRepository.existsByEmail(request.getEmail())) {
//            throw new EmailAlreadyExistsException("Email already in use");
//        }
//
//        User user = new User();
//        user.setEmail(request.getEmail());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        user.setFullName(request.getFullName());
//        user.setSubscriptionTier(User.SubscriptionTier.FREE);
//        user.setIsActive(true);
//        user.setEmailVerified(false); // âœ… NOT VERIFIED BY DEFAULT
//
//        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
//                .orElseThrow(() -> new RuntimeException("Role not found"));
//        user.setRoles(Collections.singleton(userRole));
//
//        User savedUser = userRepository.save(user);
//        log.info("âœ… User created: {} - Email Verified: {}", savedUser.getEmail(), savedUser.getEmailVerified());
//
//        // âœ… Create and send verification email
//        try {
//            VerificationToken verificationToken = verificationTokenService.createEmailVerificationToken(savedUser);
//            emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());
//            log.info("âœ… Verification email sent to: {}", savedUser.getEmail());
//        } catch (Exception e) {
//            log.error("âš ï¸ Failed to send verification email: {}", e.getMessage(), e);
//            // Continue - user can request resend later
//        }
//
//        // âœ… Auto-authenticate but with emailVerified = false
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
//        );
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        String accessToken = tokenProvider.generateToken(authentication);
//        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());
//
//        return AuthResponse.builder()
//                .token(accessToken)
//                .refreshToken(refreshToken.getToken())
//                .userId(savedUser.getId())
//                .email(savedUser.getEmail())
//                .fullName(savedUser.getFullName())
//                .subscriptionTier(savedUser.getSubscriptionTier())
//                .remainingGenerations(savedUser.getRemainingGenerations())
//                .subscriptionExpiryDate(savedUser.getSubscriptionExpiryDate())
//                .emailVerified(false) // âœ… CRITICAL: Return false
//                .build();
//    }
//
//
//    public User getUserByEmail(String email) {
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new UserNotFoundException("User not found"));
//    }
//
//    @Transactional
//    public AuthResponse login(LoginRequest request) {
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
//        );
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new UserNotFoundException("User not found"));
//
//        String accessToken = tokenProvider.generateToken(authentication);
//        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
//
//        return AuthResponse.builder()
//                .token(accessToken)
//                .refreshToken(refreshToken.getToken())
//                .userId(user.getId())
//                .email(user.getEmail())
//                .fullName(user.getFullName())
//                .subscriptionTier(user.getSubscriptionTier())
//                .remainingGenerations(user.getRemainingGenerations())
//                .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
//                .emailVerified(user.getEmailVerified()) // âœ… Return actual status
//                .build();
//    }
//
//    @Transactional
//    public AuthResponse refreshToken(String refreshTokenStr) {
//        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr);
//        refreshTokenService.verifyExpiration(refreshToken);
//
//        User user = refreshToken.getUser();
//
//        UsernamePasswordAuthenticationToken authentication =
//                new UsernamePasswordAuthenticationToken(user.getEmail(), null, null);
//
//        String newAccessToken = tokenProvider.generateToken(authentication);
//        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
//
//        return AuthResponse.builder()
//                .token(newAccessToken)
//                .refreshToken(newRefreshToken.getToken())
//                .userId(user.getId())
//                .email(user.getEmail())
//                .fullName(user.getFullName())
//                .subscriptionTier(user.getSubscriptionTier())
//                .remainingGenerations(user.getRemainingGenerations())
//                .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
//                .emailVerified(user.getEmailVerified()) // âœ… Return actual status
//                .build();
//    }
//
//    @Transactional
//    public EmailVerificationResponse verifyEmail(VerifyEmailRequest request) {
//        try {
//            log.info("ðŸ” Attempting to verify email with token: {}",
//                    request.getToken() != null ? request.getToken().substring(0, 8) + "..." : "NULL TOKEN");
//
//            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
//                throw new RuntimeException("Verification token is required");
//            }
//
//            VerificationToken token = verificationTokenService.validateToken(
//                    request.getToken(), "EMAIL_VERIFICATION"
//            );
//
//            User user = token.getUser();
//            log.info("âœ… Token valid for user: {} (current verified status: {})",
//                    user.getEmail(), user.getEmailVerified());
//
//            // Check if already verified
//            if (user.getEmailVerified()) {
//                log.info("â„¹ï¸ User {} already verified", user.getEmail());
//                return EmailVerificationResponse.builder()
//                        .verified(true)
//                        .message("Email already verified")
//                        .email(user.getEmail())
//                        .build();
//            }
//
//            user.setEmailVerified(true);
//            User savedUser = userRepository.save(user);
//            log.info("âœ… User {} email verified and saved. New status: {}",
//                    savedUser.getEmail(), savedUser.getEmailVerified());
//
//            verificationTokenService.markTokenAsUsed(token);
//
//            log.info("ðŸŽ‰ Email verification completed successfully for: {}", user.getEmail());
//
//            return EmailVerificationResponse.builder()
//                    .verified(true)
//                    .message("Email verified successfully! You can now generate music.")
//                    .email(user.getEmail())
//                    .build();
//
//        } catch (Exception e) {
//            log.error("âŒ Email verification failed: {}", e.getMessage(), e);
//            return EmailVerificationResponse.builder()
//                    .verified(false)
//                    .message("Email verification failed: " + e.getMessage())
//                    .build();
//        }
//    }
//
//    @Transactional
//    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
//        try {
//            log.info("ðŸ” Password reset requested for: {}", request.getEmail());
//
//            User user = userRepository.findByEmail(request.getEmail())
//                    .orElseThrow(() -> new UserNotFoundException("User not found"));
//
//            log.info("âœ… User found: {}", user.getEmail());
//
//            VerificationToken resetToken = verificationTokenService.createPasswordResetToken(user);
//            log.info("âœ… Reset token created: {}", resetToken.getToken().substring(0, 8) + "...");
//
//            try {
//                emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken(), user.getFullName());
//                log.info("âœ… Password reset email sent to: {}", user.getEmail());
//
//                return ForgotPasswordResponse.builder()
//                        .success(true)
//                        .message("Password reset link sent to your email. Check your inbox and spam folder.")
//                        .email(user.getEmail())
//                        .build();
//            } catch (Exception emailException) {
//                log.error("âŒ Failed to send password reset email: {}", emailException.getMessage(), emailException);
//
//                return ForgotPasswordResponse.builder()
//                        .success(false)
//                        .message("Failed to send email. Please contact support or try again later.")
//                        .email(user.getEmail())
//                        .build();
//            }
//
//        } catch (UserNotFoundException e) {
//            log.warn("âš ï¸ Password reset requested for non-existent email: {}", request.getEmail());
//            // For security, return success even if user doesn't exist
//            return ForgotPasswordResponse.builder()
//                    .success(true)
//                    .message("If an account with that email exists, a password reset link has been sent.")
//                    .email(request.getEmail())
//                    .build();
//        }
//    }
//
//    @Transactional
//    public AuthResponse resetPassword(ResetPasswordRequest request) {
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new IllegalArgumentException("Passwords do not match");
//        }
//
//        try {
//            log.info("ðŸ” Attempting password reset with token: {}", request.getToken().substring(0, 8) + "...");
//
//            VerificationToken token = verificationTokenService.validateToken(
//                    request.getToken(), "PASSWORD_RESET"
//            );
//
//            User user = token.getUser();
//            log.info("âœ… Token valid for user: {}", user.getEmail());
//
//            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//            userRepository.save(user);
//            log.info("âœ… Password updated for user: {}", user.getEmail());
//
//            verificationTokenService.markTokenAsUsed(token);
//
//            // Auto-authenticate after password reset
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getNewPassword())
//            );
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//
//            String accessToken = tokenProvider.generateToken(authentication);
//            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
//
//            return AuthResponse.builder()
//                    .token(accessToken)
//                    .refreshToken(refreshToken.getToken())
//                    .userId(user.getId())
//                    .email(user.getEmail())
//                    .fullName(user.getFullName())
//                    .subscriptionTier(user.getSubscriptionTier())
//                    .remainingGenerations(user.getRemainingGenerations())
//                    .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
//                    .emailVerified(user.getEmailVerified())
//                    .build();
//
//        } catch (Exception e) {
//            log.error("âŒ Password reset failed: {}", e.getMessage(), e);
//            throw new RuntimeException("Password reset failed: " + e.getMessage());
//        }
//    }
//
//    // âœ… NEW: Resend verification email
//    @Transactional
//    public ForgotPasswordResponse resendVerificationEmail(String email) {
//        try {
//            log.info("ðŸ”„ Resending verification email to: {}", email);
//
//            User user = userRepository.findByEmail(email)
//                    .orElseThrow(() -> new UserNotFoundException("User not found"));
//
//            // Check if already verified
//            if (user.getEmailVerified()) {
//                return ForgotPasswordResponse.builder()
//                        .success(true)
//                        .message("Email is already verified")
//                        .email(user.getEmail())
//                        .build();
//            }
//
//            VerificationToken verificationToken = verificationTokenService.createEmailVerificationToken(user);
//            emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());
//
//            log.info("âœ… Verification email resent to: {}", user.getEmail());
//
//            return ForgotPasswordResponse.builder()
//                    .success(true)
//                    .message("Verification email sent. Check your inbox and spam folder.")
//                    .email(user.getEmail())
//                    .build();
//
//        } catch (UserNotFoundException e) {
//            log.warn("âš ï¸ Resend verification requested for non-existent email: {}", email);
//            return ForgotPasswordResponse.builder()
//                    .success(true)
//                    .message("If an account with that email exists, a verification email has been sent.")
//                    .email(email)
//                    .build();
//        } catch (Exception e) {
//            log.error("âŒ Failed to resend verification email: {}", e.getMessage(), e);
//            return ForgotPasswordResponse.builder()
//                    .success(false)
//                    .message("Failed to resend verification email. Please try again later.")
//                    .email(email)
//                    .build();
//        }
//    }
//}



















package com.midigenerator.service;

import com.midigenerator.dto.auth.*;
import com.midigenerator.entity.*;
import com.midigenerator.exception.*;
import com.midigenerator.repository.*;
import com.midigenerator.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        user.setIsActive(true);
        user.setEmailVerified(false); // ✅ NOT VERIFIED BY DEFAULT

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);
        log.info("✅ User created: {} - Email Verified: {}", savedUser.getEmail(), savedUser.getEmailVerified());

        // ✅ Send verification email
        try {
            VerificationToken verificationToken = verificationTokenService.createEmailVerificationToken(savedUser);
            emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());
            log.info("✅ Verification email sent to: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send verification email: {}", e.getMessage(), e);
            // Continue - user can request resend later
        }

        // ✅ Auto-authenticate but with emailVerified = false
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .subscriptionTier(savedUser.getSubscriptionTier())
                .remainingGenerations(savedUser.getRemainingGenerations())
                .subscriptionExpiryDate(savedUser.getSubscriptionExpiryDate())
                .emailVerified(false) // ✅ CRITICAL: Return false
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .subscriptionTier(user.getSubscriptionTier())
                .remainingGenerations(user.getRemainingGenerations())
                .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
                .emailVerified(user.getEmailVerified()) // ✅ Return actual status
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr);
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, null);

        String newAccessToken = tokenProvider.generateToken(authentication);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .subscriptionTier(user.getSubscriptionTier())
                .remainingGenerations(user.getRemainingGenerations())
                .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
                .emailVerified(user.getEmailVerified()) // ✅ Return actual status
                .build();
    }

    @Transactional
    public EmailVerificationResponse verifyEmail(VerifyEmailRequest request) {
        try {
            log.info("🔐 Attempting to verify email with token: {}",
                    request.getToken() != null ? request.getToken().substring(0, 8) + "..." : "NULL TOKEN");

            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                throw new RuntimeException("Verification token is required");
            }

            // ✅ FIX: Handle expired tokens gracefully
            VerificationToken token;
            try {
                token = verificationTokenService.validateToken(
                        request.getToken(), "EMAIL_VERIFICATION"
                );
            } catch (RuntimeException e) {
                if (e.getMessage().contains("expired")) {
                    log.warn("⏰ Expired verification token used");
                    return EmailVerificationResponse.builder()
                            .verified(false)
                            .message("Verification link expired. Please request a new verification email.")
                            .build();
                }
                throw e;
            }

            User user = token.getUser();
            log.info("✅ Token valid for user: {} (current verified status: {})",
                    user.getEmail(), user.getEmailVerified());

            // Check if already verified
            if (user.getEmailVerified()) {
                log.info("ℹ️ User {} already verified", user.getEmail());
                return EmailVerificationResponse.builder()
                        .verified(true)
                        .message("Email already verified")
                        .email(user.getEmail())
                        .build();
            }

            user.setEmailVerified(true);
            User savedUser = userRepository.save(user);
            log.info("✅ User {} email verified and saved. New status: {}",
                    savedUser.getEmail(), savedUser.getEmailVerified());

            verificationTokenService.markTokenAsUsed(token);

            log.info("🎉 Email verification completed successfully for: {}", user.getEmail());

            return EmailVerificationResponse.builder()
                    .verified(true)
                    .message("Email verified successfully! You can now generate music.")
                    .email(user.getEmail())
                    .build();

        } catch (Exception e) {
            log.error("❌ Email verification failed: {}", e.getMessage(), e);
            return EmailVerificationResponse.builder()
                    .verified(false)
                    .message("Email verification failed: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        try {
            log.info("🔐 Password reset requested for: {}", request.getEmail());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            log.info("✅ User found: {}", user.getEmail());

            // ✅ FIX: Always create new token (deletes old expired ones)
            VerificationToken resetToken = verificationTokenService.createPasswordResetToken(user);
            log.info("✅ Reset token created: {}", resetToken.getToken().substring(0, 8) + "...");

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken(), user.getFullName());
                log.info("✅ Password reset email sent to: {}", user.getEmail());

                return ForgotPasswordResponse.builder()
                        .success(true)
                        .message("Password reset link sent to your email. Check your inbox and spam folder. Link expires in 1 hour.")
                        .email(user.getEmail())
                        .build();
            } catch (Exception emailException) {
                log.error("❌ Failed to send password reset email: {}", emailException.getMessage(), emailException);

                return ForgotPasswordResponse.builder()
                        .success(false)
                        .message("Failed to send email. Please contact support or try again later.")
                        .email(user.getEmail())
                        .build();
            }

        } catch (UserNotFoundException e) {
            log.warn("⚠️ Password reset requested for non-existent email: {}", request.getEmail());
            // For security, return success even if user doesn't exist
            return ForgotPasswordResponse.builder()
                    .success(true)
                    .message("If an account with that email exists, a password reset link has been sent.")
                    .email(request.getEmail())
                    .build();
        }
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        try {
            log.info("🔐 Attempting password reset with token: {}", request.getToken().substring(0, 8) + "...");

            // ✅ FIX: Handle expired tokens gracefully
            VerificationToken token;
            try {
                token = verificationTokenService.validateToken(
                        request.getToken(), "PASSWORD_RESET"
                );
            } catch (RuntimeException e) {
                if (e.getMessage().contains("expired")) {
                    log.warn("⏰ Expired password reset token used");
                    throw new RuntimeException("Password reset link expired. Please request a new one.");
                }
                throw e;
            }

            User user = token.getUser();
            log.info("✅ Token valid for user: {}", user.getEmail());

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            log.info("✅ Password updated for user: {}", user.getEmail());

            verificationTokenService.markTokenAsUsed(token);

            // Auto-authenticate after password reset
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getNewPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String accessToken = tokenProvider.generateToken(authentication);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .subscriptionTier(user.getSubscriptionTier())
                    .remainingGenerations(user.getRemainingGenerations())
                    .subscriptionExpiryDate(user.getSubscriptionExpiryDate())
                    .emailVerified(user.getEmailVerified())
                    .build();

        } catch (Exception e) {
            log.error("❌ Password reset failed: {}", e.getMessage(), e);
            throw new RuntimeException("Password reset failed: " + e.getMessage());
        }
    }

    /**
     * ✅ NEW: Resend verification email
     * Handles expired tokens automatically by creating new ones
     */
    @Transactional
    public ForgotPasswordResponse resendVerificationEmail(String email) {
        try {
            log.info("📧 Resending verification email to: {}", email);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            // Check if already verified
            if (user.getEmailVerified()) {
                return ForgotPasswordResponse.builder()
                        .success(true)
                        .message("Email is already verified. You can start generating music!")
                        .email(user.getEmail())
                        .build();
            }

            // ✅ FIX: Always create NEW token (automatically deletes old/expired ones)
            VerificationToken verificationToken = verificationTokenService.createEmailVerificationToken(user);
            emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());

            log.info("✅ NEW verification email sent to: {}", user.getEmail());

            return ForgotPasswordResponse.builder()
                    .success(true)
                    .message("New verification email sent! Check your inbox and spam folder. Link expires in 24 hours.")
                    .email(user.getEmail())
                    .build();

        } catch (UserNotFoundException e) {
            log.warn("⚠️ Resend verification requested for non-existent email: {}", email);
            // For security, return success even if user doesn't exist
            return ForgotPasswordResponse.builder()
                    .success(true)
                    .message("If an account with that email exists, a verification email has been sent.")
                    .email(email)
                    .build();
        } catch (Exception e) {
            log.error("❌ Failed to resend verification email: {}", e.getMessage(), e);
            return ForgotPasswordResponse.builder()
                    .success(false)
                    .message("Failed to resend verification email. Please try again later.")
                    .email(email)
                    .build();
        }
    }

    /**
     * ✅ NEW: Check email verification status
     * Useful for frontend to check if user needs to verify
     */
    public Map<String, Object> checkEmailVerification(String email) {
        Map<String, Object> result = new HashMap<>();

        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            result.put("exists", true);
            result.put("verified", user.getEmailVerified());
            result.put("email", user.getEmail());

            if (!user.getEmailVerified()) {
                result.put("message", "Email not verified. Please check your inbox for the verification link.");
            } else {
                result.put("message", "Email verified successfully!");
            }

        } catch (UserNotFoundException e) {
            result.put("exists", false);
            result.put("verified", false);
            result.put("message", "User not found");
        }

        return result;
    }
}