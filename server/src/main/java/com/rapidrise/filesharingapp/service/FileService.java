package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.enums.FileType;
import com.rapidrise.filesharingapp.exception.FileStorageException;
import com.rapidrise.filesharingapp.exception.InvalidFileException;
import com.rapidrise.filesharingapp.exception.StorageLimitExceededException;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;

import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.max-size}")
    private DataSize maxFileSize;

    @Value("${file.default-storage-limit}")
    private DataSize defaultStorageLimit;

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FilePreviewService filePreviewService;



    private final Tika tika = new Tika();

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(

            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",

            "application/pdf",

            "text/plain",
            "text/csv",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "application/vnd.ms-excel",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "application/zip",
            "application/x-zip-compressed",

            "video/mp4",
            "video/webm",
            "video/x-matroska",
            "application/x-matroska",

            "audio/mpeg",
            "audio/wav"
    );

    @Transactional
    public ResponseEntity<ResponseStructure<String>> uploadFiles(
            List<MultipartFile> files
    ) {

        log.info(
                "File upload request received for {} file(s)",
                files.size()
        );

        User user = SecurityUtil.getCurrentUser();

        log.info("Current user = {}", user.getEmail());

        initializeUserStorage(user);

        validateUploadRequest(files, user);

        Path uploadPath = createUploadDirectories();

        List<UserFile> savedFiles = new ArrayList<>();

        List<Path> writtenPaths = new ArrayList<>();

        long totalUploadedSize = 0;

        try {

            for (MultipartFile file : files) {

                String originalName =
                        sanitizeFilename(file.getOriginalFilename());

                String extension =
                        getExtension(originalName);

                String storedFileName =
                        UUID.randomUUID() + extension;

                Path filePath = uploadPath
                        .resolve(storedFileName)
                        .normalize();

                validateResolvedPath(filePath, uploadPath);

                String mimeType = detectMimeType(file);

                if (!ALLOWED_MIME_TYPES.contains(mimeType)) {

                    throw new InvalidFileException(
                            "File type not allowed: " + mimeType
                    );
                }

                storeFile(file, filePath);

                writtenPaths.add(filePath);

                String previewPath =
                        generatePreviewSafely(
                                filePath,
                                storedFileName,
                                mimeType
                        );

                if (previewPath != null) {

                    writtenPaths.add(
                            Paths.get(uploadDir)
                                    .resolve(previewPath)
                    );
                }

                UserFile userFile = UserFile.builder()
                        .name(originalName)
                        .storedName(storedFileName)
                        .path(filePath.toString())
                        .mimeType(mimeType)
                        .type(FileType.fromMimeType(mimeType))
                        .size(file.getSize())
                        .previewPath(previewPath)
                        .isDeleted(false)
                        .isStarred(false)
                        .user(user)
                        .build();

                savedFiles.add(userFile);

                totalUploadedSize += file.getSize();
            }

        } catch (Exception e) {

            log.error(
                    "Upload failed. Cleaning up {} file(s)",
                    writtenPaths.size(),
                    e
            );

            cleanupWrittenFiles(writtenPaths);

            throw e;
        }

        fileRepository.saveAll(savedFiles);

        user.setStorageUsed(
                user.getStorageUsed() + totalUploadedSize
        );

        userRepository.save(user);

        log.info(
                "{} file(s) uploaded successfully by userId={}",
                savedFiles.size(),
                user.getId()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files uploaded successfully",
                null
        );
    }

    public ResponseEntity<ResponseStructure<Page<FileResponse>>>
    getUserFiles(
            int page,
            int size
    ) {

        log.info("Fetching user files");

        User user = SecurityUtil.getCurrentUser();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("uploadedAt").descending()
        );

        Page<UserFile> files =
                fileRepository
                        .findByUserIdAndIsDeletedFalse(
                                user.getId(),
                                pageable
                        );

        Page<FileResponse> dtoPage =
                files.map(file -> FileResponse.builder()

                        .id(file.getId())

                        .name(file.getName())

                        .size(file.getSize())

                        .mimeType(file.getMimeType())

                        .type(file.getType())

                        .previewPath(file.getPreviewPath())

                        .isStarred(file.getIsStarred())

                        .uploadedAt(file.getUploadedAt())

                        .build()
                );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files fetched successfully",
                dtoPage
        );
    }

    public ResponseEntity<Resource> downloadFiles(List<Long> fileIds) throws IOException {

        log.info("Download request for {} file(s)", fileIds.size());

        User user = SecurityUtil.getCurrentUser();

        if (fileIds == null || fileIds.isEmpty()) {
            throw new InvalidFileException("No files selected");
        }

        log.info("Searching for fileIds: {}", fileIds);
        log.info("Current user id: {}", user.getId());

        // Fetch all files in one query instead of N+1
        List<UserFile> files = fileRepository
                .findAllByIdInAndUserIdAndIsDeletedFalse(fileIds, user.getId());

        log.info("Files found: {}", files.size());

        if (files.isEmpty()) {
            throw new FileNotFoundException("No valid files found");
        }

        // SINGLE FILE DOWNLOAD
        if (files.size() == 1) {

            UserFile file = files.get(0);

            Path filePath = Paths.get(file.getPath()).toAbsolutePath().normalize();
            validateDownloadPath(filePath);

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new FileNotFoundException("File not found on server");
            }

            updateDownloadAnalytics(file);
            fileRepository.save(file);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(file.getMimeType()))
                    .contentLength(file.getSize())
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
        }

        // MULTI FILE ZIP DOWNLOAD
        Path zipPath = Files.createTempFile("downloads_", ".zip");

        try {
            List<UserFile> downloadedFiles = new ArrayList<>();
            Set<String> usedNames = new HashSet<>();

            try (ZipOutputStream zipOut = new ZipOutputStream(Files.newOutputStream(zipPath))) {

                for (UserFile file : files) {

                    Path filePath = Paths.get(file.getPath()).toAbsolutePath().normalize();
                    validateDownloadPath(filePath);

                    if (!Files.exists(filePath)) {
                        log.warn("File missing on disk, skipping: {}", file.getId());
                        continue;
                    }

                    // Deduplicate entry names
                    String entryName = file.getName();
                    int counter = 1;
                    while (!usedNames.add(entryName)) {
                        entryName = counter++ + "_" + file.getName();
                    }

                    zipOut.putNextEntry(new ZipEntry(entryName));
                    Files.copy(filePath, zipOut);
                    zipOut.closeEntry();

                    updateDownloadAnalytics(file);
                    downloadedFiles.add(file); // only track files actually zipped
                }
            }

            if (downloadedFiles.isEmpty()) {
                throw new FileNotFoundException("None of the selected files were found on server");
            }

            fileRepository.saveAll(downloadedFiles);

            // Read into memory and delete temp file
            byte[] zipBytes = Files.readAllBytes(zipPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(zipBytes.length)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"downloads.zip\"")
                    .body(new ByteArrayResource(zipBytes));

        } finally {
            Files.deleteIfExists(zipPath); // always clean up temp file
        }
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>> deleteFile(
            List<Long> fileIds
    ) {

        log.info("Delete request for fileIds: {}", fileIds);

        if (fileIds == null || fileIds.isEmpty()) {
            throw new InvalidFileException(
                    "No files selected"
            );
        }

        User user = SecurityUtil.getCurrentUser();

        Set<Long> uniqueIds = new HashSet<>(fileIds);

        List<UserFile> files =
                fileRepository.findAllByIdInAndUserIdAndIsDeletedFalse(
                        new ArrayList<>(uniqueIds),
                        user.getId()
                );

        if (files.size() != uniqueIds.size()) {

            throw new FileNotFoundException(
                    "One or more files not found"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        for (UserFile file : files) {

            file.setIsDeleted(true);
            file.setDeletedAt(now);
        }

        fileRepository.saveAll(files);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files moved to Recycle Bin",
                null
        );
    }

    private void updateDownloadAnalytics(UserFile file) {
        file.setDownloadCount(file.getDownloadCount() + 1);
        file.setMonthlyDownloadCount(file.getMonthlyDownloadCount() + 1);
        file.setLastDownloadedAt(LocalDateTime.now());
    }

    private void validateDownloadPath(Path filePath) {

        Path allowedDirectory = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Path normalizedFilePath = filePath
                .toAbsolutePath()
                .normalize();

        if (!normalizedFilePath.startsWith(allowedDirectory)) {

            throw new SecurityException(
                    "Access denied: invalid file path"
            );
        }
    }

    private void initializeUserStorage(User user) {

        if (user.getStorageUsed() == null) {
            user.setStorageUsed(0L);
        }

        if (user.getStorageLimit() == null) {
            user.setStorageLimit(
                    defaultStorageLimit.toBytes()
            );
        }
    }

    private void validateUploadRequest(
            List<MultipartFile> files,
            User user
    ) {

        if (files == null || files.isEmpty()) {

            throw new InvalidFileException(
                    "No files uploaded"
            );
        }

        for (MultipartFile file : files) {
            validateFile(file);
        }

        long totalSize = files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();

        if (user.getStorageUsed() + totalSize >
                user.getStorageLimit()) {

            throw new StorageLimitExceededException(
                    "Storage limit exceeded"
            );
        }
    }

    private void validateFile(MultipartFile file) {

        if (file.isEmpty()) {

            throw new InvalidFileException(
                    "Empty file is not allowed"
            );
        }

        if (file.getSize() > maxFileSize.toBytes()) {

            throw new InvalidFileException(
                    "File size exceeds limit of "
                            + maxFileSize.toMegabytes()
                            + " MB"
            );
        }

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {

            throw new InvalidFileException(
                    "Invalid filename"
            );
        }
    }

    private Path createUploadDirectories() {

        try {

            Path uploadPath = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(uploadPath);

            Files.createDirectories(
                    uploadPath.resolve("previews")
            );

            return uploadPath;

        } catch (IOException e) {

            throw new FileStorageException(
                    "Failed to create upload directories"
            );
        }
    }

    private String sanitizeFilename(String filename) {

        if (filename == null || filename.isBlank()) {
            return "file";
        }

        String name = Paths.get(filename)
                .getFileName()
                .toString();

        name = name
                .replaceAll("[\\\\/:*?\"<>|]", "_")
                .replaceAll("\\s+", "_");

        name = name.replaceAll("^\\.+", "");

        return name.isBlank() ? "file" : name;
    }

    private String getExtension(String filename) {

        int lastDot = filename.lastIndexOf('.');

        if (lastDot == -1) {
            return "";
        }

        return filename.substring(lastDot);
    }

    private void validateResolvedPath(
            Path filePath,
            Path uploadPath
    ) {

        if (!filePath.toAbsolutePath()
                .startsWith(uploadPath.toAbsolutePath())) {

            throw new SecurityException(
                    "Invalid file path detected"
            );
        }
    }

    private String detectMimeType(
            MultipartFile file
    ) {

        try {

            return tika.detect(
                    file.getInputStream()
            );

        } catch (IOException e) {

            log.warn(
                    "Failed to detect MIME type"
            );

            return "application/octet-stream";
        }
    }

    private void storeFile(
            MultipartFile file,
            Path filePath
    ) {

        try (
                InputStream inputStream =
                        file.getInputStream()
        ) {

            Files.copy(
                    inputStream,
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new FileStorageException(
                    "Failed to store file: "
                            + file.getOriginalFilename()
            );
        }
    }

    private String generatePreviewSafely(
            Path filePath,
            String storedFileName,
            String mimeType
    ) {

        try {

            return filePreviewService.generatePreview(
                    filePath.toString(),
                    storedFileName,
                    mimeType
            );

        } catch (Exception e) {

            log.warn(
                    "Preview generation failed for file={}",
                    storedFileName,
                    e
            );

            return null;
        }
    }

    private void cleanupWrittenFiles(
            List<Path> writtenPaths
    ) {

        for (Path path : writtenPaths) {

            try {

                Files.deleteIfExists(path);

            } catch (IOException e) {

                log.warn(
                        "Failed to cleanup file={}",
                        path,
                        e
                );
            }
        }
    }
}
