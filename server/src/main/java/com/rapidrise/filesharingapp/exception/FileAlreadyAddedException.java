package com.rapidrise.filesharingapp.exception;

public class FileAlreadyAddedException extends RuntimeException{

    public FileAlreadyAddedException(
            String message
    ) {
        super(message);
    }
}
