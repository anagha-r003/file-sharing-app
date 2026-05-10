package com.rapidrise.filesharingapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rapidrise.filesharingapp.enums.FileType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "files",
        indexes = {

                @Index(name = "idx_file_user", columnList = "user_id"),

                @Index(name = "idx_file_deleted", columnList = "isDeleted"),

                @Index(name = "idx_file_starred", columnList = "isStarred"),

                @Index(name = "idx_file_type", columnList = "type")
        }
)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Original file name
    @Column(nullable = false)
    private String name;

    // Actual stored filename on disk (UUID based)
    @Column(nullable = false, unique = true)
    private String storedName;

    // File size in bytes
    @Column(nullable = false)
    private Long size;

    // Actual MIME type
    // Example: image/png, application/pdf
    @Column(nullable = false)
    private String mimeType;

    // Physical storage location
    @JsonIgnore
    @Column(nullable = false, unique = true)
    private String path;

    // Thumbnail / preview path
    private String previewPath;

    // File category
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType type;


    // Soft delete flag
    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    // Starred / favorite file
    @Builder.Default
    private Boolean isStarred = false;

    // Upload timestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // Last updated timestamp
    @Column(nullable = false)
    private LocalDateTime lastModified;

    // Trash deletion timestamp
    private LocalDateTime deletedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean encrypted = false;

    // File owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.uploadedAt = now;
        this.lastModified = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }
}
