# Use Eclipse Temurin JRE 17 (official OpenJDK distribution)
FROM eclipse-temurin:17-jre

# Set working directory
WORKDIR /app

# Copy the pre-built JAR file from local build
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

# Create necessary directories
RUN mkdir -p /app/uploads/excel /app/data

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
