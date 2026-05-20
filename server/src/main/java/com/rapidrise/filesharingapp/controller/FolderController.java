package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.CreateFolderRequest;
import com.rapidrise.filesharingapp.dto.response.FolderResponse;
import com.rapidrise.filesharingapp.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/folders")
public class FolderController {

    private final FolderService
            folderService;

    @PostMapping
    public ResponseEntity<
            ResponseStructure<String>>
    createFolder(

            @RequestBody
            CreateFolderRequest request
    ) {

        return folderService
                .createFolder(request);
    }

    @GetMapping
    public ResponseEntity<
                ResponseStructure<
                        List<FolderResponse>>>
    getFolders() {

        return folderService
                .getFolders();
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<
            ResponseStructure<String>>
    deleteFolder(

            @PathVariable
            Long folderId
    ) {

        return folderService
                .deleteFolder(folderId);
    }

    @PatchMapping("/files")
    public ResponseEntity<
            ResponseStructure<String>>
    addFilesToFolder(
            @RequestParam
            Long folderId,

            @RequestBody
            List<Long> fileIds
    ) {

        return folderService
                .addFilesToFolder(
                        folderId,
                        fileIds
                );
    }

    @DeleteMapping(
            "/{folderId}/files/{fileId}"
    )
    public ResponseEntity<
            ResponseStructure<String>>
    removeFileFromFolder(
            @PathVariable
            Long folderId,

            @PathVariable
            Long fileId
    ) {

        return folderService
                .removeFileFromFolder(
                        folderId,
                        fileId
                );
    }

    @GetMapping("/{folderId}")
    public ResponseEntity<
            ResponseStructure<
                    FolderResponse>>
    getFolderById(
            @PathVariable
            Long folderId
    ) {

        return folderService
                .getFolderById(
                        folderId
                );
    }
}
