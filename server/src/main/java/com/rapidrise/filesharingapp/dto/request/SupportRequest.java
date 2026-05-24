package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportRequest {

    @NotBlank(message = "Subject cannot be blank")
    private String subject;

    @NotBlank(message = "Message cannot be blank")
    private String message;
}
