package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.service.RecycleBinService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class RecycleBinController {

    private final RecycleBinService recycleBinService;

    @GetMapping("/recycle-bin")
    public ResponseEntity<ResponseStructure<Page<FileResponse>>>
    getDeletedFiles(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return recycleBinService.getDeletedFiles(
                page,
                size
        );
    }

    @PutMapping("/recycle-bin/restore")
    public ResponseEntity<ResponseStructure<String>>
    restoreFiles(

            @RequestBody
            List<Long> fileIds
    ) {

        return recycleBinService.restoreFiles(
                fileIds
        );
    }
}
