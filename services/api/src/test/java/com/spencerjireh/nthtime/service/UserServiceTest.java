package com.spencerjireh.nthtime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.spencerjireh.nthtime.dto.response.ProfileResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.AuthAccount;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AuthAccountRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock private AppUserRepository appUserRepository;
  @Mock private AuthAccountRepository authAccountRepository;
  @Mock private FindByIndexNameSessionRepository<Session> sessionRepository;
  @Mock private Session session;

  @InjectMocks private UserService userService;

  private AppUser user(Long id) {
    AppUser user = new AppUser();
    user.setId(id);
    user.setCreatedAt(Instant.parse("2026-03-15T00:00:00Z"));
    return user;
  }

  private AuthAccount account(AppUser user, String handle) {
    AuthAccount account = new AuthAccount();
    account.setUser(user);
    account.setProvider("github");
    account.setProviderAccountId(handle);
    account.setName("Spencer Jireh");
    account.setEmail("spencer@example.com");
    account.setImage("https://avatars.githubusercontent.com/u/1?v=4");
    return account;
  }

  @Test
  void findOrCreateUserRefreshesProfileFieldsOnAnExistingAccount() {
    AppUser existing = user(7L);
    AuthAccount stored = account(existing, "spencerjireh");
    when(authAccountRepository.findByProviderAndProviderAccountId("github", "spencerjireh"))
        .thenReturn(Optional.of(stored));

    Long id =
        userService.findOrCreateUser(
            "github", "spencerjireh", "New Name", "new@example.com", "new-image");

    assertThat(id).isEqualTo(7L);
    assertThat(stored.getName()).isEqualTo("New Name");
    assertThat(stored.getEmail()).isEqualTo("new@example.com");
    assertThat(stored.getImage()).isEqualTo("new-image");
    verify(appUserRepository, never()).save(any());
  }

  @Test
  void findOrCreateUserCreatesAUserAndAccountWhenNoneExists() {
    when(authAccountRepository.findByProviderAndProviderAccountId("github", "newcomer"))
        .thenReturn(Optional.empty());
    when(appUserRepository.save(any(AppUser.class))).thenReturn(user(11L));

    Long id = userService.findOrCreateUser("github", "newcomer", "New", "new@example.com", null);

    assertThat(id).isEqualTo(11L);
    verify(authAccountRepository).save(any(AuthAccount.class));
  }

  @Test
  void getProfileReturnsTheOldestLinkedAccount() {
    AppUser appUser = user(3L);
    when(appUserRepository.findById(3L)).thenReturn(Optional.of(appUser));
    when(authAccountRepository.findFirstByUserIdOrderByCreatedAtAsc(3L))
        .thenReturn(Optional.of(account(appUser, "spencerjireh")));

    ProfileResponse profile = userService.getProfile(3L);

    assertThat(profile.userId()).isEqualTo("3");
    assertThat(profile.handle()).isEqualTo("spencerjireh");
    assertThat(profile.provider()).isEqualTo("github");
    assertThat(profile.name()).isEqualTo("Spencer Jireh");
    assertThat(profile.createdAt()).isEqualTo(Instant.parse("2026-03-15T00:00:00Z"));
  }

  @Test
  void getProfileToleratesAMissingNameAndEmail() {
    AppUser appUser = user(4L);
    AuthAccount bare = account(appUser, "ghost");
    bare.setName(null);
    bare.setEmail(null);
    bare.setImage(null);
    when(appUserRepository.findById(4L)).thenReturn(Optional.of(appUser));
    when(authAccountRepository.findFirstByUserIdOrderByCreatedAtAsc(4L))
        .thenReturn(Optional.of(bare));

    ProfileResponse profile = userService.getProfile(4L);

    assertThat(profile.name()).isNull();
    assertThat(profile.email()).isNull();
    assertThat(profile.image()).isNull();
    assertThat(profile.handle()).isEqualTo("ghost");
  }

  @Test
  void deleteUserReadsTheAccountBeforeDeletingTheUser() {
    AppUser appUser = user(5L);
    when(authAccountRepository.findFirstByUserIdOrderByCreatedAtAsc(5L))
        .thenReturn(Optional.of(account(appUser, "spencerjireh")));
    when(sessionRepository.findByPrincipalName("spencerjireh"))
        .thenReturn(Map.of("session-a", session));

    userService.deleteUser(5L);

    // The cascade destroys auth_accounts, so reading it after the delete would find
    // nothing and silently leave the user's sessions alive.
    InOrder order = inOrder(authAccountRepository, sessionRepository, appUserRepository);
    order.verify(authAccountRepository).findFirstByUserIdOrderByCreatedAtAsc(5L);
    order.verify(sessionRepository).findByPrincipalName("spencerjireh");
    order.verify(appUserRepository).deleteById(5L);
  }

  @Test
  void deleteUserDropsEverySessionForThePrincipal() {
    AppUser appUser = user(6L);
    when(authAccountRepository.findFirstByUserIdOrderByCreatedAtAsc(6L))
        .thenReturn(Optional.of(account(appUser, "spencerjireh")));
    when(sessionRepository.findByPrincipalName("spencerjireh"))
        .thenReturn(Map.of("session-a", session, "session-b", session));

    userService.deleteUser(6L);

    verify(sessionRepository).deleteById("session-a");
    verify(sessionRepository).deleteById("session-b");
    verify(appUserRepository).deleteById(6L);
  }

  @Test
  void deleteUserStillDeletesTheUserWhenNoAccountIsLinked() {
    when(authAccountRepository.findFirstByUserIdOrderByCreatedAtAsc(8L))
        .thenReturn(Optional.empty());

    userService.deleteUser(8L);

    verify(sessionRepository, never()).findByPrincipalName(any());
    verify(appUserRepository).deleteById(eq(8L));
  }
}
