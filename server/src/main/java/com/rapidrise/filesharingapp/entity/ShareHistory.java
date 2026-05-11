package com.rapidrise.filesharingapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "share_history")
public class ShareHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Snapshot file details
    private Long fileId;

    private String fileName;

    private String fileType;

    private Long fileSize;

    // Share details
    private Long sharedByUserId;

    private String recipientEmail;

    private LocalDateTime sharedAt;

    // History info
    private LocalDateTime deletedAt;
}
