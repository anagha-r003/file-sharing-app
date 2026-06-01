package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.CleanupDataResponse;
import com.rapidrise.filesharingapp.dto.response.DashboardStats;
import com.rapidrise.filesharingapp.dto.response.DuplicateFileGroupResponse;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.dto.response.StorageStatsResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        long totalSize =
                ((Number) row[0])
                        .longValue();

        long imageSize =
                ((Number) row[1])
                        .longValue();

        long videoSize =
                ((Number) row[2])
                        .longValue();

        long docSize =
                ((Number) row[3])
                        .longValue();

        long otherSize =
                ((Number) row[4]).longValue() + // audio
                        ((Number) row[5]).longValue() + // archive
                        ((Number) row[6]).longValue();  // other



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

    public ResponseEntity<ResponseStructure<CleanupDataResponse>> getCleanupData() {
        log.info("Fetching storage cleanup data");

        User user = SecurityUtil.getCurrentUser();
        Long userId = user.getId();

        Pageable topTwenty = PageRequest.of(0, 20);
        List<UserFile> largestFiles =
                fileRepository.findActiveFilesByUserOrderBySizeDesc(userId, topTwenty);

        List<UserFile> allActive = fileRepository.findAllActiveByUserId(userId);

        Map<String, List<UserFile>> duplicateMap = new LinkedHashMap<>();
        for (UserFile file : allActive) {
            String key =
                    file.getFileHash()
                            + "\0"
                            + file.getSize();
            duplicateMap.computeIfAbsent(key, k -> new ArrayList<>()).add(file);
        }

        List<DuplicateFileGroupResponse> duplicateGroups = duplicateMap.values().stream()
                .filter(files -> files.size() > 1)
                .map(files -> DuplicateFileGroupResponse.builder()
                        .name(files.get(0).getName())
                        .size(files.get(0).getSize())
                        .files(files.stream().map(this::toFileResponse).toList())
                        .build())
                .sorted(Comparator.comparingLong(
                        (DuplicateFileGroupResponse group) ->
                                group.getSize() * group.getFiles().size()
                ).reversed())
                .collect(Collectors.toList());

        CleanupDataResponse response = CleanupDataResponse.builder()
                .largestFiles(largestFiles.stream().map(this::toFileResponse).toList())
                .duplicateGroups(duplicateGroups)
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Cleanup data fetched successfully",
                response
        );
    }

    private FileResponse toFileResponse(UserFile file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .size(file.getSize())
                .mimeType(file.getMimeType())
                .type(file.getType())
                .previewPath(file.getPreviewPath())
                .isStarred(file.getIsStarred())
                .uploadedAt(file.getUploadedAt())
                .build();
    }

    public DashboardStats getStats(Long userId) {
        long totalAssets = fileRepository.countByUserId(userId);
        long activeShares = shareLinkRepository
                .countByCreatedByIdAndActiveTrueAndExpiresAtAfter(userId,
                        LocalDateTime.now());
        long totalDownloads = fileRepository.sumDownloadCountByUserId(userId);  // ← new

        return DashboardStats.builder()
                .totalAssets(totalAssets)
                .activeShares(activeShares)
                .totalDownloads(totalDownloads)  // ← rename field
                .build();
    }
}
