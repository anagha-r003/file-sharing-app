package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.ShareHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;

public interface ShareHistoryRepository extends JpaRepository<ShareHistory,Long> {

    Page<ShareHistory>
    findBySharedByUserIdOrderByDeletedAtDesc(
            Long userId,
            Pageable pageable
    );
}
