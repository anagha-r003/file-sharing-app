package com.rapidrise.filesharingapp.exception;

public class StorageLimitExceededException extends RuntimeException{
    public StorageLimitExceededException(
            String message
    ) {
        super(message);
    }
}
