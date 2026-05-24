package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShareLinkResponse {

    private Long id;

    private String shareUrl;

    private String recipientEmail;

    private String fileName;

    private LocalDateTime expiresAt;

    private Integer downloadCount;

    private boolean active;

    private Boolean accessed;

    private String viewUrl;

    private String downloadUrl;

    private String sharedByName;

    private String sharedByEmail;

    private Boolean requiresOtp;

    private String shareType;
}
