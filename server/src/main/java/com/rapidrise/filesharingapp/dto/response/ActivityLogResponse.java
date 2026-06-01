package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityLogResponse {
    private String action;      // UPLOAD, SHARE, DOWNLOAD, ACCESS
    private String fileName;
    private String detail;
    private LocalDateTime createdAt;
}
