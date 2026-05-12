package com.rapidrise.filesharingapp.exception;

public class InvalidFileException extends RuntimeException{

    public InvalidFileException(
            String message
    ) {
        super(message);
    }
}
