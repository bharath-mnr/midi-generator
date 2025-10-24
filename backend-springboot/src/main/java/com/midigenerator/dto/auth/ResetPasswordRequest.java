package com.midigenerator.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    @Size(min = 36, max = 36, message = "Invalid reset token format")
    @Pattern(regexp = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$",
            message = "Invalid token format")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).*$",
            message = "Password must contain digit, lowercase, uppercase, and special character")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    private String confirmPassword;
}