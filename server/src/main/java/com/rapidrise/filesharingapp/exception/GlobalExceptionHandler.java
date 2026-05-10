package com.rapidrise.filesharingapp.exception;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
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


    @ExceptionHandler(MissingAuthorizationHeaderException.class)
    public ResponseEntity<ResponseStructure<String>> handleMissingHeader(
            MissingAuthorizationHeaderException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ResponseStructure<String>> handleTokenExpired(
            TokenExpiredException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ResponseStructure<String>> handleInvalidToken(
            InvalidTokenException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                null
        );
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseStructure<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );

        return ResponseBuilder.build(
                HttpStatus.BAD_REQUEST,
                "Validation Failed",
                errors
        );
    }

    @ExceptionHandler(TokenParsingException.class)
    public ResponseEntity<ResponseStructure<String>> handleTokenParsing(
            TokenParsingException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                null
        );
    }


    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ResponseStructure<String>> handleUserNotFound(
            UserNotFoundException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ResponseStructure<String>> handleInvalidCredentials(
            InvalidCredentialsException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ResponseStructure<String>> handleTooManyRequests(
            TooManyRequestsException ex) {
        return ResponseBuilder.build(
                HttpStatus.TOO_MANY_REQUESTS,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ResponseStructure<String>>
    handleInvalidFileException(
            InvalidFileException ex) {
        return ResponseBuilder.build(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ResponseStructure<String>>
    handleFileStorageException(
            FileStorageException ex) {
        return ResponseBuilder.build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(StorageLimitExceededException.class)
    public ResponseEntity<ResponseStructure<String>>
    handleStorageLimitExceededException(
            StorageLimitExceededException ex
    ) {
        return ResponseBuilder.build(
                HttpStatus.PAYLOAD_TOO_LARGE,
                ex.getMessage(),
                null
        );
    }
}
