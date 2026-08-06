package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.AuthAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthAccountRepository extends JpaRepository<AuthAccount, Long> {
  Optional<AuthAccount> findByProviderAndProviderAccountId(
      String provider, String providerAccountId);

  // A user may hold more than one account once a second provider exists; the oldest
  // is treated as primary. Deliberately not a single-result findByUserId, which would
  // throw in that case.
  Optional<AuthAccount> findFirstByUserIdOrderByCreatedAtAsc(Long userId);
}
