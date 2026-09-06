# Build Stage
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Set UTF-8 locale environment variables to eliminate locale warnings
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package application, skipping tests for faster docker image creation
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Set UTF-8 locale environment variables to eliminate locale warnings
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Create a dedicated non-root user and group for security
RUN addgroup -S spring && adduser -S spring -G spring && \
    mkdir -p /app/logs && \
    chown -R spring:spring /app

# Copy built JAR artifact from build stage with correct ownership
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

# Switch to non-root user
USER spring:spring

# Expose backend port
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
