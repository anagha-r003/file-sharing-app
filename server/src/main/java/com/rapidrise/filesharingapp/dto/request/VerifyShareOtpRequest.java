package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyShareOtpRequest {

    @NotBlank
    private String token;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String otp;
}
