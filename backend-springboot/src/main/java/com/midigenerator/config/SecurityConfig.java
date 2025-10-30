
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












//// ✅ FIXED SecurityConfig with proper CSRF for cross-origin (Vercel + Render)
//package com.midigenerator.config;
//
//import com.midigenerator.security.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
//import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final UserDetailsServiceImpl userDetailsService;
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
//    private String allowedOrigins;
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder(12);
//    }
//
//    @Bean
//    public DaoAuthenticationProvider authenticationProvider() {
//        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//        authProvider.setUserDetailsService(userDetailsService);
//        authProvider.setPasswordEncoder(passwordEncoder());
//        return authProvider;
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
//        return authConfig.getAuthenticationManager();
//    }
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        List<String> origins = Arrays.stream(allowedOrigins.split(","))
//                .map(String::trim)
//                .filter(origin -> !origin.isEmpty())
//                .toList();
//
//        if (origins.isEmpty()) {
//            configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
//        } else {
//            configuration.setAllowedOrigins(origins);
//        }
//
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
//        configuration.setAllowedHeaders(Arrays.asList("*"));
//        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN", "Set-Cookie"));
//        configuration.setAllowCredentials(true);
//        configuration.setMaxAge(3600L);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        // ✅ CRITICAL FIX: Proper CSRF setup for cross-origin
//        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
//        requestHandler.setCsrfRequestAttributeName("_csrf");
//
//        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
//        tokenRepository.setCookieName("XSRF-TOKEN");
//        tokenRepository.setHeaderName("X-XSRF-TOKEN");
//        tokenRepository.setCookiePath("/");
//
//        // ✅ FIX: Critical cookie settings for Vercel → Render
//        tokenRepository.setCookieCustomizer(cookie -> {
//            cookie.sameSite("None");       // MUST be None for cross-origin
//            cookie.secure(true);           // MUST be true (both use HTTPS)
//            cookie.maxAge(3600);           // 1 hour expiry
//            cookie.path("/");
//            // Don't set domain - let browser handle it
//        });
//
//        http
//                .csrf(csrf -> csrf
//                        .csrfTokenRepository(tokenRepository)
//                        .csrfTokenRequestHandler(requestHandler)
//                        // ✅ Only exempt public endpoints
//                        .ignoringRequestMatchers(
//                                "/api/auth/login",
//                                "/api/auth/signup",
//                                "/api/auth/refresh",
//                                "/api/health",
//                                "/api/pricing/plans",
//                                "/h2-console/**"
//                        )
//                )
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        // Public endpoints
//                        .requestMatchers("/api/auth/**").permitAll()
//                        .requestMatchers("/api/health").permitAll()
//                        .requestMatchers("/api/csrf").permitAll()
//                        .requestMatchers("/api/pricing/plans").permitAll()
//                        .requestMatchers("/api/midi-files/**").permitAll()
//                        .requestMatchers("/h2-console/**").permitAll()
//
//                        // All other endpoints require authentication
//                        .anyRequest().authenticated()
//                )
//                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
//
//        http.authenticationProvider(authenticationProvider());
//        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}














// ✅ FIXED SecurityConfig with proper CSRF for cross-origin (Vercel + Render)
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
        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // ✅ CRITICAL FIX: Proper CSRF setup for cross-origin
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName("_csrf");

        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        tokenRepository.setCookieName("XSRF-TOKEN");
        tokenRepository.setHeaderName("X-XSRF-TOKEN");
        tokenRepository.setCookiePath("/");

        // ✅ FIX: Critical cookie settings for Vercel → Render
        tokenRepository.setCookieCustomizer(cookie -> {
            cookie.sameSite("None");       // MUST be None for cross-origin
            cookie.secure(true);           // MUST be true (both use HTTPS)
            cookie.maxAge(3600);           // 1 hour expiry
            cookie.path("/");
            // Don't set domain - let browser handle it
        });

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(tokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        // ✅ Only exempt public endpoints
                        .ignoringRequestMatchers(
                                "/api/auth/login",
                                "/api/auth/signup",
                                "/api/auth/refresh",
                                "/api/health",
                                "/api/pricing/plans",
                                "/h2-console/**"
                        )
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/csrf").permitAll()
                        .requestMatchers("/api/pricing/plans").permitAll()
                        .requestMatchers("/api/midi-files/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}