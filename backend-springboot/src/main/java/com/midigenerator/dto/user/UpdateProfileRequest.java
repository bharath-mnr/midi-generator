package com.midigenerator.dto.user;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[\\p{L}\\s'\\-\\.]+$",
            message = "Name can only contain letters, spaces, apostrophes, hyphens, and periods")
    private String fullName;
}