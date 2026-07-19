# =========================================================================
# Stage 1: Build the application from source
# =========================================================================
FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app

# Copy the pom.xml first to resolve dependencies (improves caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the package
COPY src ./src
RUN mvn clean package -DskipTests

# =========================================================================
# Stage 2: Create the runtime container
# =========================================================================
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

# Copy the compiled JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Spring Boot default)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
