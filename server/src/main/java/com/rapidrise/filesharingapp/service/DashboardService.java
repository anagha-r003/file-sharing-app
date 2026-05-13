package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.DashboardStats;
import com.rapidrise.filesharingapp.dto.response.StorageStatsResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final FileRepository fileRepository;
    private final ShareLinkRepository shareLinkRepository;

    public ResponseEntity<ResponseStructure<StorageStatsResponse>> getStorageStats() {

        log.info("Fetching storage stats (optimized)");

        User user = SecurityUtil.getCurrentUser();

        List<Object[]> results = fileRepository.getStorageStats(user.getId());

        if (results == null || results.isEmpty()) {
            throw new RuntimeException("No storage data found");
        }

        Object[] row = results.get(0);

        long totalSize = ((Number) row[0]).longValue();
        long imageSize = ((Number) row[1]).longValue();
        long videoSize = ((Number) row[2]).longValue();
        long docSize   = ((Number) row[3]).longValue();
        long otherSize = ((Number) row[4]).longValue();

        long limit = user.getStorageLimit() != null
                ? user.getStorageLimit()
                : 1024L * 1024 * 1024; // fallback


        double totalMB = totalSize / (1024.0 * 1024);
        double limitMB = limit / (1024.0 * 1024);

        double imageMB = imageSize / (1024.0 * 1024);
        double videoMB = videoSize / (1024.0 * 1024);
        double docMB   = docSize / (1024.0 * 1024);
        double otherMB = otherSize / (1024.0 * 1024);

        // round to 2 decimals
        totalMB = Math.round(totalMB * 100) / 100.0;
        imageMB = Math.round(imageMB * 100) / 100.0;
        videoMB = Math.round(videoMB * 100) / 100.0;
        docMB   = Math.round(docMB * 100) / 100.0;
        otherMB = Math.round(otherMB * 100) / 100.0;

        int percentage = limit > 0
                ? (int) ((totalSize * 100.0) / limit)
                : 0;

        long remainingBytes = Math.max(0, limit - totalSize);
        double remainingMB = remainingBytes / (1024.0 * 1024);
        remainingMB = Math.round(remainingMB * 100) / 100.0;

        int remainingPercentage = limit > 0
                ? (int) ((remainingBytes * 100.0) / limit)
                : 0;

        StorageStatsResponse response = StorageStatsResponse.builder()
                .totalUsedMB(totalMB)
                .storageLimitMB(limitMB)
                .percentage(percentage)
                .imagesMB(imageMB)
                .videosMB(videoMB)
                .documentsMB(docMB)
                .othersMB(otherMB)
                .remainingMB(remainingMB)
                .remainingPercentage(remainingPercentage)
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Storage stats fetched successfully",
                response
        );
    }

    public DashboardStats getStats(Long userId) {
        long totalAssets = fileRepository.countByUserId(userId);
        long activeShares = shareLinkRepository
                .countByCreatedByIdAndExpiresAtAfter(userId, LocalDateTime.now());
        long totalDownloads = fileRepository.sumDownloadCountByUserId(userId);  // ← new

        return DashboardStats.builder()
                .totalAssets(totalAssets)
                .activeShares(activeShares)
                .totalDownloads(totalDownloads)  // ← rename field
                .build();
    }
}
