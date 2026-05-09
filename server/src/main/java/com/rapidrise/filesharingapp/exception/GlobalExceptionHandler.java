package com.rapidrise.filesharingapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ResponseStructure<String>> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ResponseStructure<Map<String, String>>> handlePasswordMismatch(
            PasswordMismatchException ex
    ) {
        Map<String, String> errors = new HashMap<>();
        errors.put("confirmPassword", ex.getMessage());

        return ResponseBuilder.build(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                errors
        );
    }
}
