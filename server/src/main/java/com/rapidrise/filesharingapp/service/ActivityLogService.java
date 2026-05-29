package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.entity.ActivityLog;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void log(User user, String action, String fileName, String detail) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .fileName(fileName)
                    .detail(detail)
                    .build();
            activityLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to save activity log", e);
        }
    }

    public List<ActivityLog> getRecentActivity(Long userId, int limit) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 5));
    }
}
