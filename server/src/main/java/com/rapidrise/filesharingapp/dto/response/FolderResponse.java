package com.rapidrise.filesharingapp.dto.response;

import com.rapidrise.filesharingapp.entity.UserFile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class FolderResponse {

    private Long id;

    private String name;

    private String color;

    private Long filesCount;

    private LocalDateTime createdAt;

    private Set<UserFile> files;
}
