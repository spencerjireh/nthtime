package com.spencerjireh.nthtime.exception;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(SlugConflictException.class)
  public ResponseEntity<Map<String, String>> handleSlugConflict(SlugConflictException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<Map<String, String>> handleBadRequest(BadRequestException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(PayloadTooLargeException.class)
  public ResponseEntity<Map<String, String>> handlePayloadTooLarge(PayloadTooLargeException ex) {
    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
        .body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(RateLimitExceededException.class)
  public ResponseEntity<Map<String, String>> handleRateLimitExceeded(
      RateLimitExceededException ex) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .body(Map.of("error", "Rate limit exceeded"));
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<Map<String, String>> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid ID format"));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
    String errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
            .collect(Collectors.joining(", "));
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errors));
  }
}
