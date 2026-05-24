package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.SupportRequest;
import com.rapidrise.filesharingapp.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/support")
public class SupportController {

    private final SupportService supportService;

    @PostMapping
    public ResponseEntity<ResponseStructure<Void>> sendSupportMessage(
            @Valid @RequestBody SupportRequest request
    ) {
        return supportService.sendSupportMessage(request);
    }
}
