package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.ProfileResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.AuthAccount;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AuthAccountRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  // Substituted for the free-text author of a deleted user's retained packs.
  private static final String ANONYMIZED_AUTHOR = "Anonymous";

  private final AppUserRepository appUserRepository;
  private final AuthAccountRepository authAccountRepository;
  private final PackRepository packRepository;
  private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;

  public UserService(
      AppUserRepository appUserRepository,
      AuthAccountRepository authAccountRepository,
      PackRepository packRepository,
      FindByIndexNameSessionRepository<? extends Session> sessionRepository) {
    this.appUserRepository = appUserRepository;
    this.authAccountRepository = authAccountRepository;
    this.packRepository = packRepository;
    this.sessionRepository = sessionRepository;
  }

  @Transactional
  public Long findOrCreateUser(
      String provider,
      String providerAccountId,
      String login,
      String name,
      String email,
      String image) {
    // 1. Normal path: match on the stable provider account id.
    Optional<AuthAccount> byId =
        authAccountRepository.findByProviderAndProviderAccountId(provider, providerAccountId);
    if (byId.isPresent()) {
      return refreshAccount(byId.get(), providerAccountId, login, name, email, image);
    }

    // 2. Re-key path (SPE-231): a pre-migration row still carries the login in
    //    provider_account_id, so the stable-id lookup misses. Match it by login instead and
    //    re-key it onto the stable id so a future rename can no longer orphan the user.
    if (login != null) {
      Optional<AuthAccount> byLogin = authAccountRepository.findByProviderAndLogin(provider, login);
      if (byLogin.isPresent()) {
        return refreshAccount(byLogin.get(), providerAccountId, login, name, email, image);
      }
    }

    // 3. Genuinely new user.
    AppUser user = appUserRepository.save(new AppUser());

    AuthAccount account = new AuthAccount();
    account.setUser(user);
    account.setProvider(provider);
    account.setProviderAccountId(providerAccountId);
    account.setLogin(login);
    account.setName(name);
    account.setEmail(email);
    account.setImage(image);
    authAccountRepository.save(account);

    return user.getId();
  }

  /** Refreshes profile fields (and re-keys provider_account_id) on each login. */
  private Long refreshAccount(
      AuthAccount account,
      String providerAccountId,
      String login,
      String name,
      String email,
      String image) {
    account.setProviderAccountId(providerAccountId);
    account.setLogin(login);
    account.setName(name);
    account.setEmail(email);
    account.setImage(image);
    authAccountRepository.save(account);
    return account.getUser().getId();
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

    // handle is the display username (login). Fall back to providerAccountId for any row not
    // yet backfilled/re-keyed, which before SPE-231 was itself the login.
    String handle =
        account.getLogin() != null ? account.getLogin() : account.getProviderAccountId();

    return new ProfileResponse(
        user.getId().toString(),
        account.getName(),
        account.getEmail(),
        account.getImage(),
        account.getProvider(),
        handle,
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

    // Authored packs survive the delete with author_user_id set to null (ON DELETE SET NULL),
    // but their separate free-text author string would persist and could still identify the
    // user. De-identify any non-blank ones before the account goes away. (Today the author UI
    // never sets this field, so this is defense-in-depth for a future author-name feature.)
    List<Pack> toAnonymize =
        packRepository.findByAuthorUserId(userId).stream()
            .filter(pack -> pack.getAuthor() != null && !pack.getAuthor().isBlank())
            .toList();
    if (!toAnonymize.isEmpty()) {
      toAnonymize.forEach(pack -> pack.setAuthor(ANONYMIZED_AUTHOR));
      packRepository.saveAll(toAnonymize);
    }

    // Cascades clear auth_accounts, attempts and user_settings. Authored packs and tracks
    // survive with author_user_id set to null.
    appUserRepository.deleteById(userId);
  }
}
