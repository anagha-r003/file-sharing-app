package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder,Long> {

    List<Folder>
    findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<Folder>
    findByIdAndUserId(
            Long folderId,
            Long userId
    );


}
