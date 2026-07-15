package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.ProfileResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.AuthAccount;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AuthAccountRepository;
import java.util.Optional;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final AppUserRepository appUserRepository;
  private final AuthAccountRepository authAccountRepository;
  private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;

  public UserService(
      AppUserRepository appUserRepository,
      AuthAccountRepository authAccountRepository,
      FindByIndexNameSessionRepository<? extends Session> sessionRepository) {
    this.appUserRepository = appUserRepository;
    this.authAccountRepository = authAccountRepository;
    this.sessionRepository = sessionRepository;
  }

  @Transactional
  public Long findOrCreateUser(
      String provider, String providerAccountId, String name, String email, String image) {
    Optional<AuthAccount> existing =
        authAccountRepository.findByProviderAndProviderAccountId(provider, providerAccountId);

    if (existing.isPresent()) {
      AuthAccount account = existing.get();
      // Update profile info on each login
      account.setName(name);
      account.setEmail(email);
      account.setImage(image);
      authAccountRepository.save(account);
      return account.getUser().getId();
    }

    AppUser user = new AppUser();
    user = appUserRepository.save(user);

    AuthAccount account = new AuthAccount();
    account.setUser(user);
    account.setProvider(provider);
    account.setProviderAccountId(providerAccountId);
    account.setName(name);
    account.setEmail(email);
    account.setImage(image);
    authAccountRepository.save(account);

    return user.getId();
  }

  @Transactional(readOnly = true)
  public ProfileResponse getProfile(Long userId) {
    AppUser user =
        appUserRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    AuthAccount account =
        authAccountRepository
            .findFirstByUserIdOrderByCreatedAtAsc(userId)
            .orElseThrow(() -> new ResourceNotFoundException("No linked account for user"));

    return new ProfileResponse(
        user.getId().toString(),
        account.getName(),
        account.getEmail(),
        account.getImage(),
        account.getProvider(),
        account.getProviderAccountId(),
        user.getCreatedAt());
  }

  @Transactional
  public void deleteUser(Long userId) {
    // Read the account BEFORE the delete: the ON DELETE CASCADE on auth_accounts.user_id
    // destroys this row, and the principal name is the only key into the user's sessions.
    String principalName =
        authAccountRepository
            .findFirstByUserIdOrderByCreatedAtAsc(userId)
            .map(AuthAccount::getProviderAccountId)
            .orElse(null);

    // Spring Session tables have no FK to app_users, so sessions on other devices would
    // otherwise survive the account and keep resolving to a dangling user id.
    if (principalName != null) {
      sessionRepository
          .findByPrincipalName(principalName)
          .keySet()
          .forEach(sessionRepository::deleteById);
    }

    // Cascades clear auth_accounts, attempts and user_settings. Authored packs and tracks
    // survive with author_user_id set to null.
    appUserRepository.deleteById(userId);
  }
}
