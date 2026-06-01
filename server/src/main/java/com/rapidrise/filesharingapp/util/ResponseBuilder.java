package com.rapidrise.filesharingapp.util;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseBuilder {

    private ResponseBuilder() {
    }

    public static <T> ResponseEntity<ResponseStructure<T>> build(
            HttpStatus status,
            String message,
            T data
    ) {
        ResponseStructure<T> response = new ResponseStructure<>();
        response.setData(data);
        response.setMessage(message);
        response.setStatus(status.value());

        return new ResponseEntity<>(response, status);
    }

    public static <T> ResponseStructure<T> buildBody(
            HttpStatus status,
            String message,
            T data
    ) {
        ResponseStructure<T> response = new ResponseStructure<>();
        response.setData(data);
        response.setMessage(message);
        response.setStatus(status.value());

        return response;
    }
}
