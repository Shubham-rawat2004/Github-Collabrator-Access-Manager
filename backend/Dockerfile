# Use Eclipse Temurin JRE 23 runtime image
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

# Copy the pre-built jar from target directory
COPY target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
