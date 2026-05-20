package com.rapidrise.filesharingapp.exception;

public class FolderNotFoundException extends RuntimeException{

    public FolderNotFoundException(
            String message
    ) {
        super(message);
    }
}
