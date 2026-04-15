package com.spencerjireh.nthtime.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.spencerjireh.nthtime.config.AdminSecretVerifier;
import com.spencerjireh.nthtime.dto.request.ScheduleFeaturedRequest;
import com.spencerjireh.nthtime.dto.response.ChallengeSummaryResponse;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.FeaturedChallengeService;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class FeaturedChallengeControllerTest {

  private static final String ADMIN_SECRET = "supersecret";
  private static final LocalDate DATE = LocalDate.of(2026, 4, 15);

  @Mock private FeaturedChallengeService featuredChallengeService;

  private AdminSecretVerifier verifier;
  private FeaturedChallengeController controller;

  @BeforeEach
  void setUp() throws Exception {
    verifier = new AdminSecretVerifier(ADMIN_SECRET);
    // The verifier stores the secret in a private final field with the same
    // name; reflective injection keeps the constructor signature honest.
    Field field = AdminSecretVerifier.class.getDeclaredField("adminSecret");
    field.setAccessible(true);
    field.set(verifier, ADMIN_SECRET);
    controller = new FeaturedChallengeController(featuredChallengeService, verifier);
  }

  @Test
  void getFeaturedTodayReturns204WhenNothingScheduled() {
    when(featuredChallengeService.getFeaturedForToday()).thenReturn(Optional.empty());

    ResponseEntity<ChallengeSummaryResponse> response = controller.getFeaturedToday();

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    assertThat(response.getBody()).isNull();
  }

  @Test
  void getFeaturedTodayReturns200WithPayload() {
    ChallengeSummaryResponse summary =
        new ChallengeSummaryResponse(
            "1", "hello", "express", "Hello", "beginner", new String[] {}, 300, 1, "not-attempted");
    when(featuredChallengeService.getFeaturedForToday()).thenReturn(Optional.of(summary));

    ResponseEntity<ChallengeSummaryResponse> response = controller.getFeaturedToday();

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(summary);
  }

  private static ScheduleFeaturedRequest.Batch batchOf(ScheduleFeaturedRequest... entries) {
    return new ScheduleFeaturedRequest.Batch(List.of(entries));
  }

  @Test
  void scheduleFeaturedRejectsMissingAdminSecret() {
    assertThatThrownBy(
            () ->
                controller.scheduleFeatured(
                    null, batchOf(new ScheduleFeaturedRequest(DATE, "express", "hello"))))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void scheduleFeaturedRejectsWrongAdminSecret() {
    assertThatThrownBy(
            () ->
                controller.scheduleFeatured(
                    "wrong", batchOf(new ScheduleFeaturedRequest(DATE, "express", "hello"))))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  void scheduleFeaturedReturns204OnValidSecret() {
    ResponseEntity<Void> response =
        controller.scheduleFeatured(
            ADMIN_SECRET, batchOf(new ScheduleFeaturedRequest(DATE, "express", "hello")));

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
  }

  @Test
  void unscheduleFeaturedReturns404WhenNothingToDelete() {
    when(featuredChallengeService.unschedule(DATE)).thenReturn(false);

    assertThatThrownBy(() -> controller.unscheduleFeatured(ADMIN_SECRET, DATE))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void unscheduleFeaturedReturns204OnSuccess() {
    when(featuredChallengeService.unschedule(DATE)).thenReturn(true);

    ResponseEntity<Void> response = controller.unscheduleFeatured(ADMIN_SECRET, DATE);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
  }
}
