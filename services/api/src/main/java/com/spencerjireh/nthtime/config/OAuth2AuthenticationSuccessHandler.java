package com.spencerjireh.nthtime.config;

import com.spencerjireh.nthtime.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final UserService userService;
  private final String frontendUrl;

  public OAuth2AuthenticationSuccessHandler(
      UserService userService, @Value("${nthtime.frontend-url}") String frontendUrl) {
    this.userService = userService;
    this.frontendUrl = frontendUrl;
  }

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException {

    OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
    OAuth2User oauthUser = token.getPrincipal();

    String provider = token.getAuthorizedClientRegistrationId();
    // With user-name-attribute: id, getName() is GitHub's stable numeric account id. The login
    // is captured separately as a display handle (SPE-231).
    String providerAccountId = oauthUser.getName();
    String login = oauthUser.getAttribute("login");
    String name = oauthUser.getAttribute("name");
    String email = oauthUser.getAttribute("email");
    String image = oauthUser.getAttribute("avatar_url");

    Long appUserId =
        userService.findOrCreateUser(provider, providerAccountId, login, name, email, image);

    request.getSession().setAttribute("appUserId", appUserId);

    response.sendRedirect(frontendUrl);
  }
}
