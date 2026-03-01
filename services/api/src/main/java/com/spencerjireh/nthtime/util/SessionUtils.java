package com.spencerjireh.nthtime.util;

import com.spencerjireh.nthtime.exception.ForbiddenException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public final class SessionUtils {

  private SessionUtils() {}

  public static Long getUserId(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session == null) return null;
    Object attr = session.getAttribute("appUserId");
    return attr instanceof Long l ? l : null;
  }

  public static Long requireUserId(HttpServletRequest request) {
    Long userId = getUserId(request);
    if (userId == null) throw new ForbiddenException("Not authenticated");
    return userId;
  }
}
