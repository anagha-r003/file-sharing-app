package com.rapidrise.filesharingapp.entity;

import com.rapidrise.filesharingapp.enums.ShareType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String recipientEmail;

    private String message;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private Integer downloadCount = 0;

    @Enumerated(EnumType.STRING)
    private ShareType shareType;

    private Boolean requiresOtp;

    private Boolean hiddenByRecipient = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private UserFile file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
