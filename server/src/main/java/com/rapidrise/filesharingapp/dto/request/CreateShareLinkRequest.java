package com.rapidrise.filesharingapp.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateShareLinkRequest {

    private Long fileId;

    private List<String> recipientEmails;

    private String message;

    private LocalDateTime expiresAt;
}
