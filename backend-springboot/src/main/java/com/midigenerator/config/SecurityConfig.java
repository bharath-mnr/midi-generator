
// package com.midigenerator.config;

// import com.midigenerator.security.*;
// import lombok.RequiredArgsConstructor;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
// import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import java.util.Arrays;
// import java.util.List;

// @Configuration
// @EnableWebSecurity
// @EnableMethodSecurity
// @RequiredArgsConstructor
// public class SecurityConfig {

//     private final UserDetailsServiceImpl userDetailsService;
//     private final JwtAuthenticationFilter jwtAuthenticationFilter;

//     @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
//     private String allowedOrigins;

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder(12);
//     }

//     @Bean
//     public DaoAuthenticationProvider authenticationProvider() {
//         DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//         authProvider.setUserDetailsService(userDetailsService);
//         authProvider.setPasswordEncoder(passwordEncoder());
//         return authProvider;
//     }

//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
//         return authConfig.getAuthenticationManager();
//     }

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();

//         List<String> origins = Arrays.stream(allowedOrigins.split(","))
//                 .map(String::trim)
//                 .filter(origin -> !origin.isEmpty())
//                 .toList();

//         if (origins.isEmpty()) {
//             configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
//         } else {
//             configuration.setAllowedOrigins(origins);
//         }

//         configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
//         configuration.setAllowedHeaders(Arrays.asList("*"));
//         configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN"));
//         configuration.setAllowCredentials(true);
//         configuration.setMaxAge(3600L);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         return source;
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         // ✅ CRITICAL FIX: Use proper CSRF configuration
//         CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
//         requestHandler.setCsrfRequestAttributeName(null); // ✅ Important for stateless apps

//         CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
//         tokenRepository.setCookieName("XSRF-TOKEN");
//         tokenRepository.setHeaderName("X-XSRF-TOKEN");
//         tokenRepository.setCookiePath("/");

//         http
//                 .csrf(csrf -> csrf
//                         .csrfTokenRepository(tokenRepository)
//                         .csrfTokenRequestHandler(requestHandler)
//                         // ✅ ONLY exempt endpoints that truly don't need CSRF
//                         .ignoringRequestMatchers(
//                                 "/api/auth/**",
//                                 "/h2-console/**"
//                         )
//                 )
//                 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(auth -> auth
//                         // ✅ Public endpoints
//                         .requestMatchers("/api/auth/**").permitAll()
//                         .requestMatchers("/api/health").permitAll()
//                         .requestMatchers("/api/csrf").permitAll()
//                         .requestMatchers("/api/pricing/plans").permitAll()
//                         .requestMatchers("/api/midi-files/**").permitAll()
//                         .requestMatchers("/h2-console/**").permitAll()

//                         // ✅ All other endpoints require authentication
//                         .anyRequest().authenticated()
//                 )
//                 .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

//         http.authenticationProvider(authenticationProvider());
//         http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }
// }












// backend/src/main/java/com/midigenerator/config/SecurityConfig.java
// ✅ FIXED FOR VERCEL (Frontend) + RENDER (Backend) - Cross-Origin Setup

package com.midigenerator.config;

import com.midigenerator.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();

        if (origins.isEmpty()) {
            configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        } else {
            configuration.setAllowedOrigins(origins);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        // ✅ CRITICAL FIX FOR VERCEL + RENDER CROSS-ORIGIN
        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        tokenRepository.setCookieName("XSRF-TOKEN");
        tokenRepository.setHeaderName("X-XSRF-TOKEN");
        tokenRepository.setCookiePath("/");
        
        // ✅ FIX: Configure cookie for cross-origin (Vercel → Render)
        tokenRepository.setCookieCustomizer(cookie -> {
            cookie.sameSite("None");      // CRITICAL: Allow cross-origin
            cookie.secure(true);          // CRITICAL: HTTPS only (both Vercel & Render use HTTPS)
            cookie.domain(null);          // Don't restrict domain (allows Vercel to send to Render)
        });

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(tokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers(
                                "/api/auth/**",      // Auth endpoints don't need CSRF
                                "/h2-console/**"
                        )
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/csrf").permitAll()
                        .requestMatchers("/api/pricing/plans").permitAll()
                        .requestMatchers("/api/midi-files/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}