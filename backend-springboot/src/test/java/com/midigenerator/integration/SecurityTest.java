package com.midigenerator.integration;

import com.midigenerator.BaseIntegrationTest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ✅ KEEP THIS - Tests endpoint security
 * Verifies protected endpoints require authentication
 */
class SecurityTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoints are accessible without auth")
    void publicEndpointsAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pricing/plans"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints require authentication")
    void protectedEndpointsRequireAuth() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/midi/generations"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/chat/sessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    @DisplayName("Authenticated users can access protected endpoints")
    void authenticatedUsersCanAccessProtectedEndpoints() throws Exception {
        // Note: These will fail with 500 if user doesn't exist in DB
        // but the security check (401 vs 403 vs 500) is what matters
        mockMvc.perform(get("/api/user/generation-limit"))
                .andExpect(status().isNotFound()); // 404 because user not in test DB
    }
}
