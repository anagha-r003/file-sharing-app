package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DuplicateFileGroupResponse {

    private String name;

    private Long size;

    private List<FileResponse> files;
}
