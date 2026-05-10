package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecycleBinStatsResponse {

    // Total deleted files in recycle bin
    private int totalFiles;

    // Files expiring within next 5 days
    private int expiringSoon;

    // Total recycle bin space usage in MB
    private long spaceUsedMB;

    // Auto-delete retention period
    private int retentionDays;
}
