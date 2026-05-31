package com.rapidrise.filesharingapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CleanupDataResponse {

    private List<FileResponse> largestFiles;

    private List<DuplicateFileGroupResponse> duplicateGroups;
}
