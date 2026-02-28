package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.AuthAccount;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AuthAccountRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final AppUserRepository appUserRepository;
  private final AuthAccountRepository authAccountRepository;

  public UserService(
      AppUserRepository appUserRepository, AuthAccountRepository authAccountRepository) {
    this.appUserRepository = appUserRepository;
    this.authAccountRepository = authAccountRepository;
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
}
