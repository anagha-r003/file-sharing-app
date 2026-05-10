package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.enums.FileType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<UserFile,Long> {

    // Active files (not deleted)
    Page<UserFile> findByUserIdAndIsDeletedFalse(
            Long userId,
            Pageable pageable
    );

    // Recycle bin files
    Page<UserFile> findByUserIdAndIsDeletedTrue(
            Long userId,
            Pageable pageable
    );

    // Starred files
    List<UserFile> findByUserIdAndIsDeletedFalseAndIsStarredTrue(
            Long userId
    );

    // Filter files by type
    List<UserFile> findByUserIdAndTypeAndIsDeletedFalse(
            Long userId,
            FileType type
    );

    // Count total files for user
    long countByUserId(
            Long userId
    );


    // Secure ownership validation

    Optional<UserFile> findByIdAndUserId(
            Long fileId,
            Long userId
    );

    // Restore validation
    Optional<UserFile> findByIdAndUserIdAndIsDeletedTrue(
            Long fileId,
            Long userId
    );

    // Find by stored filename
    Optional<UserFile> findByStoredName(
            String storedName
    );


    // Check stored filename existence
    boolean existsByStoredName(
            String storedName
    );

    // Trash cleanup scheduler query
    List<UserFile> findByIsDeletedTrueAndDeletedAtBefore(
            LocalDateTime time
    );

    List<UserFile> findAllByIdInAndUserIdAndIsDeletedFalse(List<Long> ids, Long userId);

    // Storage statistics
    @Query("""
SELECT 
    COALESCE(SUM(f.size), 0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'IMAGE' 
                THEN f.size 
            END
        ), 
    0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'VIDEO' 
                THEN f.size 
            END
        ), 
    0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'DOCUMENT' 
                THEN f.size 
            END
        ), 
    0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'AUDIO' 
                THEN f.size 
            END
        ), 
    0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'ARCHIVE' 
                THEN f.size 
            END
        ), 
    0),

    COALESCE(
        SUM(
            CASE 
                WHEN f.type = 'OTHER' 
                THEN f.size 
            END
        ), 
    0)

FROM UserFile f
WHERE f.user.id = :userId
AND f.isDeleted = false
""")
    List<Object[]> getStorageStats(
            @Param("userId") Long userId
    );

    List<UserFile> findAllByIdInAndUserIdAndIsDeletedTrue(ArrayList<Long> longs, Long id);
}
