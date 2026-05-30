package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private LocalDate dob;
}
