package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.SupportRequest;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportService {

    private final EmailService emailService;

    public ResponseEntity<ResponseStructure<Void>> sendSupportMessage(SupportRequest request) {
        User user = SecurityUtil.getCurrentUser();
        log.info("Processing support message request from user: {}", user.getEmail());

        String senderName = user.getFirstName() + " " + user.getLastName();
        emailService.sendSupportEmail(
                user.getEmail(),
                senderName.trim(),
                request.getSubject(),
                request.getMessage()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Support message sent to administrator successfully.",
                null
        );
    }
}
