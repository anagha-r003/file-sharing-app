package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.ChangePasswordRequest;
import com.rapidrise.filesharingapp.dto.request.UpdateProfileRequest;
import com.rapidrise.filesharingapp.dto.response.ProfileResponse;
import com.rapidrise.filesharingapp.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ResponseStructure<ProfileResponse>>
    getProfile() {

        return profileService.getProfile();
    }

    @PutMapping
    public ResponseEntity<ResponseStructure<ProfileResponse>>
    updateProfile(
            @Valid @RequestBody
            UpdateProfileRequest request
    ) {

        return profileService.updateProfile(request);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ResponseStructure<String>>
    changePassword(
            @RequestBody @Valid
            ChangePasswordRequest request,
            Authentication authentication
    ) {

        return profileService
                .changePassword(
                        request,
                        authentication
                );
    }
}
