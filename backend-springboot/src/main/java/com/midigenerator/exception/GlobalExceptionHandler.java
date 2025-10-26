
package com.midigenerator.exception;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ✅ FIX 5: Add MDC (Mapped Diagnostic Context) for better error tracking
    private String getErrorId() {
        String errorId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("errorId", errorId);

        // Get user context if authenticated
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                MDC.put("userId", auth.getName());
            }
        } catch (Exception e) {
            // Ignore if can't get user
        }

        return errorId;
    }

    private void clearMDC() {
        MDC.remove("errorId");
        MDC.remove("userId");
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Email already exists: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] User not found: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    @ExceptionHandler(org.springframework.web.client.HttpClientErrorException.TooManyRequests.class)
    public ResponseEntity<ErrorResponse> handleTooManyRequests(
            HttpClientErrorException.TooManyRequests ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Rate limit exceeded from external service", errorId);
        clearMDC();
        return buildResponse(HttpStatus.TOO_MANY_REQUESTS,
                "Rate limit exceeded. Please try again later.");
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPassword(
            InvalidPasswordException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Invalid password attempt", errorId);
        clearMDC();
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(GenerationLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleGenerationLimitExceeded(
            GenerationLimitExceededException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Generation limit exceeded: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Resource not found: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(
            UnauthorizedAccessException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Unauthorized access attempt: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Bad credentials attempt", errorId);
        clearMDC();
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        String errorId = getErrorId();
        log.error("[{}] Authentication failed: {}", errorId, ex.getMessage());
        clearMDC();
        return buildResponse(HttpStatus.UNAUTHORIZED, "Authentication failed");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        String errorId = getErrorId();
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());
        response.put("errorId", errorId);

        log.warn("[{}] Validation failed: {}", errorId, errors);
        clearMDC();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        String errorId = getErrorId();
        log.warn("[{}] Input validation failed: {}", errorId, ex.getMessage());

        String userMessage;
        String originalMessage = ex.getMessage();

        if (originalMessage.contains("dangerous characters") ||
                originalMessage.contains("dangerous content")) {
            userMessage = "Your input contains invalid characters. Please remove special characters and try again.";
        } else if (originalMessage.contains("path traversal")) {
            userMessage = "Invalid filename. Please use only letters, numbers, hyphens, and underscores.";
        } else if (originalMessage.contains("MIDI filename format")) {
            userMessage = "Filename must end with .mid or .midi";
        } else if (originalMessage.contains("Input too long")) {
            userMessage = "Your input is too long. Please shorten it and try again.";
        } else if (originalMessage.contains("Too many email requests")) {
            userMessage = "Too many email requests. Please try again in an hour.";
        } else {
            userMessage = originalMessage.replaceAll("\\n|\\r", " ").trim();
        }

        clearMDC();
        return buildResponse(HttpStatus.BAD_REQUEST, userMessage);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex, WebRequest request) {
        String errorId = getErrorId();

        // ✅ FIX 5: Log full stack trace with context for database errors
        log.error("[{}] Database constraint violation - User: {}, Error: {}",
                errorId,
                MDC.get("userId"),
                ex.getMessage());
        log.error("[{}] Full stack trace:", errorId, ex);

        clearMDC();

        // Return generic message to user
        return buildResponse(HttpStatus.CONFLICT,
                "A database constraint was violated. Please check your input and try again.");
    }

    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLocking(
            org.springframework.orm.ObjectOptimisticLockingFailureException ex, WebRequest request) {
        String errorId = getErrorId();

        log.warn("[{}] Optimistic locking failure - User: {}, Entity: {}",
                errorId,
                MDC.get("userId"),
                ex.getMessage());

        clearMDC();
        return buildResponse(HttpStatus.CONFLICT,
                "The resource was modified by another process. Please try again.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        String errorId = getErrorId();

        // ✅ FIX 5: Log full exception with context for debugging in production
        log.error("[{}] Unexpected error - User: {}, Type: {}, Message: {}",
                errorId,
                MDC.get("userId"),
                ex.getClass().getName(),
                ex.getMessage());
        log.error("[{}] Full stack trace:", errorId, ex);

        // Check for specific SQL exceptions and log them
        Throwable rootCause = ex;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }

        if (rootCause instanceof java.sql.SQLException) {
            log.error("[{}] Root cause SQL error: {}", errorId, rootCause.getMessage());
        }

        clearMDC();

        // Return generic message to avoid exposing internal details
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please try again later. (Error ID: " + errorId + ")",
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message) {
        ErrorResponse error = new ErrorResponse(
                status.value(),
                message,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(error, status);
    }
}
