package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.RequestShareOtpRequest;
import com.rapidrise.filesharingapp.dto.request.VerifyShareOtpRequest;
import com.rapidrise.filesharingapp.dto.response.ShareAccessResponse;
import com.rapidrise.filesharingapp.entity.RestrictedShareOtp;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.enums.ShareType;
import com.rapidrise.filesharingapp.exception.BadRequestException;
import com.rapidrise.filesharingapp.jwt.JwtService;
import com.rapidrise.filesharingapp.repository.RestrictedShareOtpRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestrictedShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final RestrictedShareOtpRepository otpRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

    @Transactional
    public ResponseEntity<
                ResponseStructure<String>>
    requestOtp(
            RequestShareOtpRequest request
    ) {

        log.info(
                "Restricted OTP request for token={}",
                request.getToken()
        );

        ShareLink shareLink =
                shareLinkRepository
                        .findByToken(
                                request.getToken()
                        )
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Invalid share link"
                                ));
        String recipientEmail =
                shareLink.getRecipientEmail();

        // must be restricted
        if (shareLink.getShareType()
                != ShareType.RESTRICTED) {

            throw new BadRequestException(
                    "OTP not required for this link"
            );
        }


        // expiry validation
        if (shareLink.getExpiresAt()
                .isBefore(
                        LocalDateTime.now()
                )) {

            throw new BadRequestException(
                    "Share link expired"
            );
        }

        // remove old OTP
        otpRepository
                .deleteAllByShareLinkIdAndEmail(
                        shareLink.getId(),
                        recipientEmail
                );

        // generate OTP
        String rawOtp =
                String.valueOf(
                        ThreadLocalRandom
                                .current()
                                .nextInt(
                                        100000,
                                        999999
                                )
                );

        // hash otp
        String hashedOtp =
                DigestUtils.sha256Hex(
                        rawOtp
                );

        RestrictedShareOtp otp =
                RestrictedShareOtp
                        .builder()
                        .email(
                                recipientEmail
                        )
                        .otpHash(
                                hashedOtp
                        )
                        .expiryDate(
                                LocalDateTime.now()
                                        .plusMinutes(5)
                        )
                        .used(false)
                        .attempts(0)
                        .createdAt(
                                LocalDateTime.now()
                        )
                        .shareLink(
                                shareLink
                        )
                        .build();

        otpRepository.save(otp);

        emailService
                .sendRestrictedOtpEmail(
                        recipientEmail,
                        shareLink
                                .getFile()
                                .getName(),
                        rawOtp
                );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "OTP sent successfully",
                null
        );
    }

    public ResponseEntity<
            ResponseStructure<
                    ShareAccessResponse>>
    verifyOtp(
            VerifyShareOtpRequest request
    ) {

        log.info(
                "Verifying OTP for token={}",
                request.getToken()
        );

        ShareLink shareLink =
                shareLinkRepository
                        .findByToken(
                                request.getToken()
                        )
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Invalid share link"
                                ));
        String recipientEmail =
                shareLink.getRecipientEmail();

        RestrictedShareOtp storedOtp =
                otpRepository
                        .findTopByShareLinkIdAndEmailOrderByCreatedAtDesc(
                                shareLink.getId(),
                                recipientEmail
                        )
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "OTP not found"
                                ));

        // already used
        if (Boolean.TRUE.equals(
                storedOtp.getUsed()
        )) {

            throw new BadRequestException(
                    "OTP already used"
            );
        }

        // expired
        if (storedOtp
                .getExpiryDate()
                .isBefore(
                        LocalDateTime.now()
                )) {

            throw new BadRequestException(
                    "OTP expired"
            );
        }

        // attempts exceeded
        if (storedOtp.getAttempts() >= 5) {

            throw new BadRequestException(
                    "Too many invalid attempts"
            );
        }

        String hashedInputOtp =
                DigestUtils.sha256Hex(
                        request.getOtp()
                );

        // wrong otp
        if (!storedOtp
                .getOtpHash()
                .equals(hashedInputOtp)) {

            storedOtp.setAttempts(
                    storedOtp
                            .getAttempts() + 1
            );

            otpRepository.save(
                    storedOtp
            );

            throw new BadRequestException(
                    "Invalid OTP"
            );
        }

        // success
        storedOtp.setUsed(true);

        otpRepository.save(
                storedOtp
        );

        String accessToken =
                jwtService
                        .generateShareAccessToken(
                                shareLink.getToken(),
                                recipientEmail
                        );

        ShareAccessResponse response =
                ShareAccessResponse
                        .builder()
                        .accessToken(
                                accessToken
                        )
                        .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "OTP verified successfully",
                response
        );
    }
}
