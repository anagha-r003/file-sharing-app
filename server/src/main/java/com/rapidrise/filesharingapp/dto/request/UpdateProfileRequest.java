package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 30, message = "First name must be 2 to 30 characters")
    @Pattern(
            regexp =
                    "^[A-Za-z_]+$",
            message =
                    "First name can only contain letters and underscore"
    )
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 30, message = "Last name must be 1 to 30 characters")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;
}
