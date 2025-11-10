package com.midigenerator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * MIDI generator Application
 * Main entry point for the Spring Boot application
 *
 * Features:
 * - User authentication with JWT
 * - MIDI generation tracking with daily limits
 * - Subscription management
 * - Chat history storage
 *
 * @author MIDI generator Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableRetry
@EnableJpaAuditing
@EnableScheduling
public class MidiGeneratorApplication {

	public static void main(String[] args) {
		SpringApplication.run(MidiGeneratorApplication.class, args);

		System.out.println("\n" +
				"╔══════════════════════════════════════════════╗\n" +
				"║   🎵 MIDI generator API Started Successfully  ║\n" +
				"║                                              ║\n" +
				"║   Port: 8080                                 ║\n" +
				"║   Swagger UI: http://localhost:8080/swagger ║\n" +
				"║   Health: http://localhost:8080/api/health   ║\n" +
				"╚══════════════════════════════════════════════╝\n"
		);
	}
}