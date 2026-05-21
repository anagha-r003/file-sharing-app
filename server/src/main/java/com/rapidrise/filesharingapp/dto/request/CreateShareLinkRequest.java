package com.rapidrise.filesharingapp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateShareLinkRequest {

    private Long fileId;

    @NotEmpty
    private List<
            @Email(
                    message =
                            "Invalid email"
            )
                    String>
            recipientEmails;

    private String message;

    private LocalDateTime expiresAt;
}
