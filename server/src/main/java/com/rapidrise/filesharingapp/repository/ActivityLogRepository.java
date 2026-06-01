package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog,Long> {

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<ActivityLog> findByUserIdAndActionAndFileNameIn(
            Long userId,
            String action,
            Collection<String> fileNames
    );
}
