# Use Debian-based JDK 17 image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:resolve -B

# Copy source code
COPY src src

# Build the application
RUN mvn package -DskipTests

# Create necessary directories
RUN mkdir -p /app/uploads/excel /app/data

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]
