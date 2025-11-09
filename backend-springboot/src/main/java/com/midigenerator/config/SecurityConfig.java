// // backend/src/main/java/com/midigenerator/config/SecurityConfig.java
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
//         configuration.setAllowCredentials(false); // ✅ Changed to false - no cookies needed
//         configuration.setMaxAge(3600L);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         return source;
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//                 // ✅ DISABLE CSRF - using JWT authentication
//                 .csrf(csrf -> csrf.disable())
//                 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(auth -> auth
//                         .requestMatchers("/api/auth/**").permitAll()
//                         .requestMatchers("/api/health").permitAll()
//                         .requestMatchers("/api/pricing/plans").permitAll()
//                         .requestMatchers("/api/midi-files/**").permitAll()
//                         .requestMatchers("/h2-console/**").permitAll()
//                         .anyRequest().authenticated()
//                 )
//                 .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

//         http.authenticationProvider(authenticationProvider());
//         http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }
// }











//midigenerator/config/SecurityConfig.java
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // ✅ Load URLs from environment variables
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    @Value("${midi.generator.url:http://localhost:5000/api}")
    private String midiGeneratorUrl;

    // ✅ NEW: Base URL for Node.js backend (without /api)
    @Value("${midi.generator.base-url:http://localhost:5000}")
    private String midiGeneratorBaseUrl;

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

        // ✅ Build allowed origins from environment variables
        List<String> allowedOrigins = Stream.of(
                frontendUrl,
                backendUrl,
                midiGeneratorUrl.replace("/api", ""), // Remove /api suffix
                midiGeneratorBaseUrl,
                // Development URLs (always include for local testing)
                "http://localhost:5173",
                "http://localhost:5137",
                "http://localhost:8080",
                "http://localhost:3000",
                "http://localhost:5000"
        )
        .filter(url -> url != null && !url.trim().isEmpty())
        .distinct() // Remove duplicates
        .collect(Collectors.toList());

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));

        // ✅ Specify allowed headers explicitly
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "X-CSRF-TOKEN"
        ));

        configuration.setExposedHeaders(Arrays.asList(
                "Content-Disposition",
                "Content-Type",
                "Content-Length",
                "Authorization",
                "X-CSRF-TOKEN"
        ));

        // ✅ Allow credentials with specific origins
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        // ✅ Log configured CORS origins on startup
        System.out.println("✅ CORS Configured with origins:");
        allowedOrigins.forEach(origin -> System.out.println("   - " + origin));

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Disable CSRF for stateless JWT API
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/pricing/plans").permitAll()

                        // ✅ CRITICAL: Allow MIDI file downloads without authentication
                        .requestMatchers("/api/midi-files/**").permitAll()

                        .requestMatchers("/h2-console/**").permitAll()

                        // ✅ All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}