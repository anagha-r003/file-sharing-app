package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileCleanupService {

    private static final int RETENTION_DAYS = 30;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final ShareLinkRepository shareLinkRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public void deleteExpiredFiles() {
        LocalDateTime expiryTime = LocalDateTime.now().minusDays(RETENTION_DAYS);
        List<UserFile> expiredFiles =
                fileRepository.findByIsDeletedTrueAndDeletedAtBefore(expiryTime);

        log.info("Found {} expired files to clean up", expiredFiles.size());

        // Group total size to deduct per user
        Map<User, Long> storageToDeduct = new HashMap<>();

        for (UserFile file : expiredFiles) {
            // 1. Delete physical file
            File diskFile = new File(file.getPath());
            if (diskFile.exists()) {
                boolean deleted = diskFile.delete();
                if (!deleted) {
                    log.warn("Failed to delete physical file: {}", file.getPath());
                }
            }

            if (file.getPreviewPath() != null) {
                String fullPreviewPath = uploadDir + "/" + file.getPreviewPath();

                // ADD THIS — see the exact path being checked
                log.info("Trying to delete preview: {}", fullPreviewPath);

                File previewFile = new File(fullPreviewPath);

                // ADD THIS — see if file is found
                log.info("Preview file exists: {}", previewFile.exists());

                if (previewFile.exists()) {
                    boolean previewDeleted = previewFile.delete();
                    log.info("Preview deleted: {}", previewDeleted);
                    if (!previewDeleted) {
                        log.warn("Failed to delete preview file: {}", fullPreviewPath);
                    }
                }
            }
            // 2. Accumulate storage per user
            if (file.getUser() != null && file.getSize() != null) {
                storageToDeduct.merge(file.getUser(), file.getSize(), Long::sum);
            }
        }

        List<Long> fileIds = expiredFiles.stream()
                .map(UserFile::getId)
                .toList();

        // 3. Update storage — one save per user
        for (Map.Entry<User, Long> entry : storageToDeduct.entrySet()) {
            User user = entry.getKey();
            long newStorage = user.getStorageUsed() - entry.getValue();
            user.setStorageUsed(Math.max(0, newStorage));
            userRepository.save(user);
        }

        shareLinkRepository.deleteAllByFileIdIn(fileIds);

        // 4. Delete from DB
        fileRepository.deleteAll(expiredFiles);
        log.info("Deleted {} expired files successfully", expiredFiles.size());
    }
}
