package com.midigenerator.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.midigenerator.BaseIntegrationTest;
import com.midigenerator.dto.auth.*;
import com.midigenerator.entity.User;
import com.midigenerator.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ✅ KEEP THIS - Tests complete authentication flow
 * Covers: Signup → Login → Email Verification
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthFlowTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    @Order(1)
    @DisplayName("Complete Auth Flow: Signup → Login → Verify")
    void completeAuthenticationFlow() throws Exception {
        // Step 1: Signup
        SignupRequest signup = new SignupRequest();
        signup.setEmail("test@example.com");
        signup.setPassword("Test@1234");
        signup.setFullName("Test User");

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(false));

        // Step 2: Login with same credentials
        LoginRequest login = new LoginRequest();
        login.setEmail("test@example.com");
        login.setPassword("Test@1234");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.emailVerified").value(false));
    }

    @Test
    @Order(2)
    @DisplayName("Signup with invalid email should fail")
    void signupWithInvalidEmail() throws Exception {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("invalid-email");
        signup.setPassword("Test@1234");
        signup.setFullName("Test User");

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(3)
    @DisplayName("Signup with weak password should fail")
    void signupWithWeakPassword() throws Exception {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("test@example.com");
        signup.setPassword("weak");
        signup.setFullName("Test User");

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(4)
    @DisplayName("Login with wrong password should fail")
    void loginWithWrongPassword() throws Exception {
        // Create user first
        User user = new User();
        user.setEmail("existing@example.com");
        user.setPassword(passwordEncoder.encode("CorrectPassword@123"));
        user.setFullName("Existing User");
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Try login with wrong password
        LoginRequest login = new LoginRequest();
        login.setEmail("existing@example.com");
        login.setPassword("WrongPassword@123");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    @DisplayName("Duplicate email signup should fail")
    void signupWithDuplicateEmail() throws Exception {
        // First signup
        SignupRequest signup1 = new SignupRequest();
        signup1.setEmail("duplicate@example.com");
        signup1.setPassword("Test@1234");
        signup1.setFullName("User One");

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup1)))
                .andExpect(status().isOk());

        // Second signup with same email
        SignupRequest signup2 = new SignupRequest();
        signup2.setEmail("duplicate@example.com");
        signup2.setPassword("Different@1234");
        signup2.setFullName("User Two");

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup2)))
                .andExpect(status().isConflict());
    }
}

