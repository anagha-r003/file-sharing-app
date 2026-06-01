package com.rapidrise.filesharingapp.exception;

public class MissingAuthorizationHeaderException extends RuntimeException{
    public MissingAuthorizationHeaderException(String message) {
        super(message);
    }
}
