package com.rapidrise.filesharingapp.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "folders",
        indexes = {
                @Index(
                        name = "idx_folder_user",
                        columnList = "user_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder {

    @Id
    @GeneratedValue(
            strategy =
                    GenerationType.IDENTITY
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    // Folder owner
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    @JsonIgnore
    private User user;

    @ManyToMany
    @JoinTable(
            name = "folder_files",
            joinColumns = @JoinColumn(
                    name = "folder_id"
            ),
            inverseJoinColumns =
            @JoinColumn(
                    name = "file_id"
            )
    )
    @JsonIgnore
    private Set<UserFile> files =
            new HashSet<>();

    @PrePersist
    public void onCreate() {
        this.createdAt =
                LocalDateTime.now();
    }
}
