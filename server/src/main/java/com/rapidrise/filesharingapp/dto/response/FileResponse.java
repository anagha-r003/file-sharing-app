package com.rapidrise.filesharingapp.dto.response;

import com.rapidrise.filesharingapp.enums.FileType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FileResponse {

    private Long id;

    private String name;

    private Long size;

    private String mimeType;

    private FileType type;

    private String previewPath;

    private Boolean isStarred;

    private LocalDateTime uploadedAt;
}
