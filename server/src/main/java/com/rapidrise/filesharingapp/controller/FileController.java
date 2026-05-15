package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseStructure<String>>
    uploadFiles(

            @RequestParam("files")
            List<MultipartFile> files
    ) {

        return fileService.uploadFiles(files);

    }

    @GetMapping
    public ResponseEntity<ResponseStructure<Page<FileResponse>>>
    getUserFiles(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        size = Math.min(size, 100);

        return fileService.getUserFiles(
                page,
                size
        );
    }

    @PostMapping("/download")
    public ResponseEntity<Resource>
    downloadFiles(

            @RequestBody
            List<Long> fileIds
    ) throws IOException {

        return fileService.downloadFiles(
                fileIds
        );
    }

    @DeleteMapping
    public ResponseEntity<ResponseStructure<String>>
    deleteFiles(

            @RequestBody
            List<Long> fileIds
    ) {

        return fileService.deleteFile(fileIds);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource>
    getPreview(
            @PathVariable Long id
    ) throws IOException{
        return fileService.getPreview(id);
    }


}


