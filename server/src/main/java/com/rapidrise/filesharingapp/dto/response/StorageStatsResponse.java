package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorageStatsResponse {

    private double totalUsedMB;
    private double storageLimitMB;
    private int percentage;

    private double imagesMB;
    private double videosMB;
    private double documentsMB;
    private double othersMB;

    private double remainingMB;
    private int remainingPercentage;
}
