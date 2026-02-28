package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {}
