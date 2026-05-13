package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.DashboardStats;
import com.rapidrise.filesharingapp.dto.response.StorageStatsResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.service.DashboardService;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

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


}
