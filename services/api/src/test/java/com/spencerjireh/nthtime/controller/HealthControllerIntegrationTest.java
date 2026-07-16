package com.spencerjireh.nthtime.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spencerjireh.nthtime.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

class HealthControllerIntegrationTest extends AbstractIntegrationTest {

  @Test
  void healthReportsOkAndProbesTheDatabase() throws Exception {
    // Testcontainers Postgres is up, so the DB probe should pass and the response should keep the
    // historical {status:ok, timestamp} shape plus the new db field.
    mockMvc
        .perform(get("/api/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.db").value("up"))
        .andExpect(jsonPath("$.timestamp").isNumber());
  }
}
