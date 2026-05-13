package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.ActivityLogResponse;
import com.rapidrise.filesharingapp.dto.response.DashboardStats;
import com.rapidrise.filesharingapp.dto.response.StorageStatsResponse;
import com.rapidrise.filesharingapp.entity.ActivityLog;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.service.ActivityLogService;
import com.rapidrise.filesharingapp.service.DashboardService;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ActivityLogService activityLogService;

    @GetMapping("/stats")
    public ResponseEntity<ResponseStructure<DashboardStats>> getStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        DashboardStats stats = dashboardService.getStats(user.getId());
        return ResponseBuilder.build(HttpStatus.OK, "Stats fetched successfully", stats);
    }

    @GetMapping("/storage")
    public ResponseEntity<ResponseStructure<StorageStatsResponse>> getStorageStats() {
        return dashboardService.getStorageStats();
    }

    @GetMapping("/activity")
    public ResponseEntity<ResponseStructure<List<ActivityLogResponse>>> getRecentActivity() {
        User user = SecurityUtil.getCurrentUser();
        List<ActivityLog> logs = activityLogService.getRecentActivity(user.getId(), 10);
        List<ActivityLogResponse> response = logs.stream()
                .map(log -> ActivityLogResponse.builder()
                        .action(log.getAction())
                        .fileName(log.getFileName())
                        .detail(log.getDetail())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
        return ResponseBuilder.build(HttpStatus.OK, "Activity fetched", response);
    }


}
