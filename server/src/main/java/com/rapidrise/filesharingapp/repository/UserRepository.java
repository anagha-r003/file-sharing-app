package com.rapidrise.filesharingapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.rapidrise.filesharingapp.entity.User;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
