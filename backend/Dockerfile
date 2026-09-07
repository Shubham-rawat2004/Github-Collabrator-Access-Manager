# =========================================================================
# Stage 1: Build the application from source
# =========================================================================
FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app

# Copy pom.xml first to resolve dependencies (improves layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production JAR (skip tests for build)
COPY src ./src
RUN mvn clean package -DskipTests

# =========================================================================
# Stage 2: Create hardened runtime container
# =========================================================================
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

# Install curl and wget for health checks
RUN apk add --no-cache curl wget

# Create non-root system user and group for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the compiled JAR file from build stage with correct ownership
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

# Run as non-root user
USER spring:spring

# Expose Spring Boot default port
EXPOSE 8080

# Configure container memory awareness
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Start the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
