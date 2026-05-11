package com.rapidrise.filesharingapp.controller;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.dto.response.RecycleBinStatsResponse;
import com.rapidrise.filesharingapp.service.RecycleBinService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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

    @DeleteMapping("/recycle-bin/permanent-delete")
    public ResponseEntity<ResponseStructure<String>>
    permanentlyDeleteFiles(

            @RequestBody
            List<Long> fileIds
    ) throws IOException {

        return recycleBinService.permanentlyDeleteFiles(
                fileIds
        );
    }

    @PutMapping("/recycle-bin/restore-all")
    public ResponseEntity<ResponseStructure<Map<String, Object>>>
    restoreAllFiles() {

        return recycleBinService.restoreAllFiles();
    }

    @DeleteMapping("/recycle-bin/empty")
    public ResponseEntity<ResponseStructure<Map<String, Object>>>
    emptyRecycleBin() throws IOException {

        return recycleBinService.emptyRecycleBin();
    }

    @GetMapping("/recycle-bin/stats")
    public ResponseEntity<
            ResponseStructure<RecycleBinStatsResponse>
            >
    getRecycleBinStats() {

        return recycleBinService.getRecycleBinStats();
    }
}
