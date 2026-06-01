package com.rapidrise.filesharingapp.exception;

public class FileStorageException extends RuntimeException {
    public FileStorageException(
            String message
    ) {
        super(message);
    }
}
