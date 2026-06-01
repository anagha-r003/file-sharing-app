package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ProfileResponse {

    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dob;
}
