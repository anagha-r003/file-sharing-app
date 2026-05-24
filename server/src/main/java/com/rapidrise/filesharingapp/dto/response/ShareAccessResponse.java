package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ShareAccessResponse {
    private String accessToken;
}
