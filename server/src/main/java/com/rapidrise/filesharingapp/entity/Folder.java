package com.rapidrise.filesharingapp.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // One folder -> many files
    @OneToMany(
            mappedBy = "folder"
    )
    @JsonIgnore
    private List<UserFile> files =
            new ArrayList<>();

    @PrePersist
    public void onCreate() {
        this.createdAt =
                LocalDateTime.now();
    }
}
