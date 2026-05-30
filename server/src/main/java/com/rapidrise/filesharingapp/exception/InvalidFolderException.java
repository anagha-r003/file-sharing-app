package com.rapidrise.filesharingapp.exception;

public class InvalidFolderException extends RuntimeException{

    public InvalidFolderException(
            String message
    ) {

        super(message);
    }
}
