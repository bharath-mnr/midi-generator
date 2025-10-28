# Multi-stage build for Spring Boot on Render
# Optimized for Java 21 and Render's free tier

# Stage 1: Build with Maven and Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime with Java 21 JRE (smaller image, faster startup)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render provides $PORT environment variable)
EXPOSE 8080

# Health check (helps Render know when your app is ready)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

# Run the application with optimized JVM settings for Render free tier
# -XX:+UseContainerSupport: Detects container memory limits
# -XX:MaxRAMPercentage=75.0: Use 75% of available RAM (leaves room for OS)
# -Dserver.port=${PORT}: Uses Render's dynamic port
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.jar"]