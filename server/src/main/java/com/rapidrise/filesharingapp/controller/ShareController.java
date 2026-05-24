package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.CreateShareLinkRequest;
import com.rapidrise.filesharingapp.dto.request.RequestShareOtpRequest;
import com.rapidrise.filesharingapp.dto.request.VerifyShareOtpRequest;
import com.rapidrise.filesharingapp.dto.response.ShareAccessResponse;
import com.rapidrise.filesharingapp.dto.response.ShareLinkResponse;
import com.rapidrise.filesharingapp.service.RestrictedShareService;
import com.rapidrise.filesharingapp.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/share")
public class ShareController {

    private final ShareService shareService;
    private final RestrictedShareService restrictedShareService;

    @PostMapping("/generate")
    public ResponseEntity<
            ResponseStructure<
                    List<ShareLinkResponse>>>
    generateShareLink(
            @RequestBody
            CreateShareLinkRequest request
    ) {

        return shareService
                .generateShareLink(
                        request
                );
    }

    @PostMapping("/send")
    public ResponseEntity<
            ResponseStructure<String>>
    sendShareEmail(
            @RequestBody
            CreateShareLinkRequest request
    ) {

        return shareService
                .sendShareEmail(
                        request
                );
    }

    @GetMapping("/{token}")
    public ResponseEntity<
            ResponseStructure<ShareLinkResponse>>
    resolveShareLink(

            @PathVariable
            String token
    ) {

        return shareService.resolveShareLink(
                token
        );
    }

    @GetMapping("/download/{token}")
    public ResponseEntity<Resource>
    downloadSharedFile(

            @PathVariable
            String token,

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader
    ) throws IOException {

        return shareService.downloadSharedFile(
                token,authHeader
        );
    }

    @GetMapping("/view/{token}")
    public ResponseEntity<Resource>
    viewSharedFile(

            @PathVariable
            String token,

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader
    ) throws IOException {

        return shareService.viewSharedFile(
                token,authHeader
        );
    }

    // Get my shared files
    @GetMapping("/my-shares")
    public ResponseEntity<
            ResponseStructure<Page<ShareLinkResponse>>>
    getMySharedFiles(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return shareService.getMySharedFiles(
                page,
                size
        );
    }

    // Revoke share link
    @PutMapping("/revoke/{shareId}")
    public ResponseEntity<
            ResponseStructure<String>>
    revokeShareLink(

            @PathVariable
            Long shareId
    ) {

        return shareService.revokeShareLink(
                shareId
        );
    }

    @PostMapping("/request-otp")
    public ResponseEntity<
            ResponseStructure<String>>
    requestOtp(

            @RequestBody
            RequestShareOtpRequest request
    ) {

        return restrictedShareService
                .requestOtp(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<
            ResponseStructure<
                    ShareAccessResponse>>
    verifyOtp(

            @RequestBody
            VerifyShareOtpRequest request
    ) {

        return restrictedShareService
                .verifyOtp(request);
    }


}
