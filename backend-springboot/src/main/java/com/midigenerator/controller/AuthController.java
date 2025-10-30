package com.midigenerator.controller;

import com.midigenerator.dto.auth.*;
import com.midigenerator.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * User signup endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Refresh access token using refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    /**
     * Verify email address with token from email
     */
    @PostMapping("/verify-email")
    public ResponseEntity<EmailVerificationResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    /**
     * Request password reset email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Reset password with token from email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /**
     * ✅ NEW: Resend verification email
     * Handles both expired and lost emails
     * Can be called anytime user needs a fresh verification link
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerificationEmail(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("📧 Resend verification email requested for: {}", request.getEmail());

        ForgotPasswordResponse response = authService.resendVerificationEmail(request.getEmail());

        Map<String, Object> result = new HashMap<>();
        result.put("success", response.getSuccess());
        result.put("message", response.getMessage());
        result.put("email", response.getEmail());

        return ResponseEntity.ok(result);
    }

    /**
     * ✅ NEW: Check if email is verified
     * Useful for frontend to know user's verification status
     */
    @PostMapping("/check-verification")
    public ResponseEntity<Map<String, Object>> checkEmailVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("🔍 Checking verification status for: {}", request.getEmail());
        Map<String, Object> result = authService.checkEmailVerification(request.getEmail());
        return ResponseEntity.ok(result);
    }
}