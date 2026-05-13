package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DashboardStats {
    private long totalAssets;
    private long activeShares;
    private long totalDownloads;
}
