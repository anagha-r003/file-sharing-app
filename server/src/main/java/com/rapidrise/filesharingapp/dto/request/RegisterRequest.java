package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 30, message = "First name must be 2 to 30 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 30, message = "Last name must be 1 to 30 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 20, message = "Password must be 8 to 20 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).*$",
            message = "Password must contain uppercase, lowercase, special character and number"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;
}
