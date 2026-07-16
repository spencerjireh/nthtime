plugins {
    java
    id("org.springframework.boot") version "3.5.11"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "8.2.1"
}

group = "com.spencerjireh"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

spotless {
    java {
        googleJavaFormat()
        removeUnusedImports()
        formatAnnotations()
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.session:spring-session-jdbc")

    // Database
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Rate limiting
    implementation("com.bucket4j:bucket4j-core:8.10.1")

    // JSON type support for Hibernate
    implementation("io.hypersistence:hypersistence-utils-hibernate-63:3.9.0")

    // API docs
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.3")

    // Observability
    implementation("io.micrometer:micrometer-registry-prometheus")
    // Error tracking. Inert unless SENTRY_DSN is set (see application.yml), mirroring the
    // frontend's DSN-gated Sentry setup.
    implementation("io.sentry:sentry-spring-boot-starter-jakarta:8.16.0")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:postgresql:1.20.4")
    testImplementation("org.testcontainers:junit-jupiter:1.20.4")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
