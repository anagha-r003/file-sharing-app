package com.rapidrise.filesharingapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "restricted_share_otps")
@Builder
public class RestrictedShareOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otpHash;

    private LocalDateTime expiryDate;

    private Boolean used;

    private Integer attempts;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "share_link_id")
    private ShareLink shareLink;
}
