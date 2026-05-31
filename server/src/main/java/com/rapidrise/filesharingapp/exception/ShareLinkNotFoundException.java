package com.rapidrise.filesharingapp.exception;

public class ShareLinkNotFoundException extends RuntimeException{

    public ShareLinkNotFoundException(
            String message
    ) {
        super(message);
    }
}
