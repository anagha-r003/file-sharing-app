package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.LoginRequest;
import com.rapidrise.filesharingapp.dto.request.RegisterRequest;
import com.rapidrise.filesharingapp.dto.response.LoginResponse;
import com.rapidrise.filesharingapp.dto.response.RefreshTokenResponse;
import com.rapidrise.filesharingapp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ResponseStructure<String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseStructure<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request, HttpServletResponse response,HttpServletRequest httpRequest
    ) {
        return authService.login(request,response,httpRequest);
    }


    @PostMapping("/refresh")
    public ResponseEntity<ResponseStructure<RefreshTokenResponse>> refresh(
            HttpServletRequest request
    ) {
        return authService.refreshToken(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseStructure<String>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return authService.logout(request, response);
    }
}
