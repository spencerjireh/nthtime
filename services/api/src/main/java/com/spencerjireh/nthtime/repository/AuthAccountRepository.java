package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.AuthAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthAccountRepository extends JpaRepository<AuthAccount, Long> {
  Optional<AuthAccount> findByProviderAndProviderAccountId(
      String provider, String providerAccountId);
}
