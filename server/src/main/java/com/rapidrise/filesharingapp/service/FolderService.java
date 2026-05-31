package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.CreateFolderRequest;
import com.rapidrise.filesharingapp.dto.request.RenameRequest;
import com.rapidrise.filesharingapp.dto.response.FolderResponse;
import com.rapidrise.filesharingapp.entity.Folder;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.exception.FileAlreadyAddedException;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;
import com.rapidrise.filesharingapp.exception.FolderNotFoundException;
import com.rapidrise.filesharingapp.exception.InvalidFolderException;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.FolderRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FolderService {

    private final FolderRepository folderRepository;

    private final FileRepository fileRepository;

    @Transactional
    public ResponseEntity<
                ResponseStructure<String>>
    createFolder(
            CreateFolderRequest request
    ) {

        User user =
                SecurityUtil.getCurrentUser();

        Folder folder =
                Folder.builder()
                        .name(request.getName())
                        .color(request.getColor())
                        .user(user)
                        .build();

        folderRepository.save(folder);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folder created successfully",
                null
        );
    }

    public ResponseEntity<
            ResponseStructure<
                    Page<FolderResponse>>>
    getFolders(
            int page,
            int size
    ) {

        User user =
                SecurityUtil
                        .getCurrentUser();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<Folder> folderPage =
                folderRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId(),
                                pageable
                        );

        Page<FolderResponse>
                folders =
                folderPage.map(folder ->
                        FolderResponse
                                .builder()
                                .id(
                                        folder.getId()
                                )
                                .name(
                                        folder.getName()
                                )
                                .color(
                                        folder.getColor()
                                )
                                .filesCount(
                                        (long)
                                                folder
                                                        .getFiles()
                                                        .size()
                                )
                                .createdAt(
                                        folder
                                                .getCreatedAt()
                                )
                                .build()
                );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folders fetched successfully",
                folders
        );
    }

    @Transactional
    public ResponseEntity<
            ResponseStructure<String>>
    deleteFolder(
            Long folderId
    ) {

        User user =
                SecurityUtil.getCurrentUser();

        Folder folder =
                folderRepository
                        .findByIdAndUserId(
                                folderId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FolderNotFoundException(
                                        "Folder not found"
                                )
                        );



        folderRepository.delete(folder);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folder deleted successfully",
                null
        );
    }

    @Transactional
    public ResponseEntity<
            ResponseStructure<String>>
    addFilesToFolder(
            Long folderId,
            List<Long> fileIds
    ) {

        User user =
                SecurityUtil
                        .getCurrentUser();

        Folder folder =
                folderRepository
                        .findByIdAndUserId(
                                folderId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FolderNotFoundException(
                                        "Folder not found"
                                ));

        List<UserFile> files =
                fileRepository
                        .findAllById(
                                fileIds
                        );

        boolean singleFileRequest =
                fileIds.size() == 1;

        for (UserFile file : files) {

            // Prevent adding
            // someone else's file
            if (!file.getUser()
                    .getId()
                    .equals(user.getId())) {

                continue;
            }

            // Prevent duplicate add
            if (folder.getFiles()
                    .contains(file)) {

                if (singleFileRequest) {

                    throw new FileAlreadyAddedException(
                            file.getName()
                                    + " already exists in folder"
                    );
                }

                // Skip duplicates
                // for bulk add
                continue;
            }

            folder.getFiles()
                    .add(file);
        }

        folderRepository.save(
                folder
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files added successfully",
                "Success"
        );
    }

    @Transactional
    public ResponseEntity<
            ResponseStructure<String>>
    removeFileFromFolder(
            Long folderId,
            Long fileId
    ) {

        User user =
                SecurityUtil.getCurrentUser();

        UserFile file =
                fileRepository
                        .findByIdAndUserIdAndIsDeletedFalse(
                                fileId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FileNotFoundException(
                                        "File not found"
                                )
                        );

        Folder folder =
                folderRepository
                        .findByIdAndUserId(
                                folderId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FolderNotFoundException(
                                        "Folder not found"
                                )
                        );

        // Check file belongs to folder
        if (!folder.getFiles()
                .contains(file)) {

            throw new FileNotFoundException(
                    "File not found in folder"
            );
        }


        folder.getFiles().remove(file);

        folderRepository.save(folder);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File removed from folder successfully",
                null
        );
    }

    public ResponseEntity<
            ResponseStructure<
                    FolderResponse>>
    getFolderById(
            Long folderId,
            int page,
            int size
    ) {

        User user =
                SecurityUtil
                        .getCurrentUser();

        Folder folder =
                folderRepository
                        .findByIdAndUserId(
                                folderId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FolderNotFoundException(
                                        "Folder not found"
                                )
                        );

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<UserFile> files =
                fileRepository
                        .findFolderFiles(
                                folderId,
                                pageable
                        );

        FolderResponse response =
                FolderResponse
                        .builder()
                        .id(folder.getId())
                        .name(folder.getName())
                        .color(folder.getColor())

                        // only paginated files
                        .files(
                                new HashSet<>(
                                        files.getContent()
                                )
                        )

                        .createdAt(
                                folder.getCreatedAt()
                        )

                        // total files count
                        .filesCount(
                                files.getTotalElements()
                        )
                        .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folder fetched successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<
            ResponseStructure<String>>
    renameFolder(
            Long folderId,
            RenameRequest request
    ) {

        User user =
                SecurityUtil
                        .getCurrentUser();

        Folder folder =
                folderRepository
                        .findByIdAndUserId(
                                folderId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new FolderNotFoundException(
                                        "Folder not found"
                                )
                        );

        String newName =
                request.getName()
                        .trim();

        if (newName.isBlank()) {

            throw new InvalidFolderException(
                    "Folder name cannot be empty"
            );
        }

        if (
                folder.getName()
                        .equals(
                                newName
                        )
        ) {

            return ResponseBuilder.build(
                    HttpStatus.OK,
                    "Folder name unchanged",
                    null
            );
        }

        folder.setName(
                newName
        );

        folderRepository.save(
                folder
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folder renamed successfully",
                null
        );
    }
}
