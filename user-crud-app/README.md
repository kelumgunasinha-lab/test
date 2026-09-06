# Full-Stack User Registration CRUD Web Application (Dockerized)

A clean, modern, beginner-friendly full-stack **User Registration Management System** built with **Spring Boot 3 (Java 21)** on the backend, **React (Vite)** on the frontend, and **PostgreSQL** as the database, fully containerized using **Docker** and **Docker Compose**.

---

## Target Architecture

```
                Browser
                   │
                   │ HTTP (Port 80)
                   ▼
          ┌─────────────────┐
          │ React + Nginx   │  (frontend container: port 80)
          │ frontend:80     │
          └────────┬────────┘
                   │
                   │ /api/* reverse proxy (http://backend:8080/api/)
                   ▼
          ┌─────────────────┐
          │ Spring Boot     │  (backend container: port 8080)
          │ backend:8080    │  [USER spring:spring] [Volume: backend_logs]
          └────────┬────────┘
                   │
                   │ JDBC (jdbc:postgresql://postgres:5432/user_crud_db)
                   ▼
          ┌─────────────────┐
          │ PostgreSQL      │  (postgres container: port 5432)
          │ postgres:5432   │  [Volume: postgres_data]
          └────────┬────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 postgres_data          backend_logs
    volume                 volume
```

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Docker Architecture & File Explanation](#docker-architecture--file-explanation)
- [Locale Warning Fix](#locale-warning-fix)
- [Persistent Volumes Audit & Rationale](#persistent-volumes-audit--rationale)
- [Container Security & Non-Root User](#container-security--non-root-user)
- [Docker Networking: Why Service Names Instead of Localhost](#docker-networking-why-service-names-instead-of-localhost)
- [How to Run with Docker Compose](#how-to-run-with-docker-compose)
- [Docker Management Commands](#docker-management-commands)
- [Volume & Data Persistence Verification](#volume--data-persistence-verification)
- [Application URLs](#application-urls)
- [REST API Endpoints & Verification](#rest-api-endpoints--verification)

---

## Overview

This project provides a complete CRUD (Create, Read, Update, Delete) User Registration interface:
- Registering new users with field validation (First Name, Last Name, Email, Phone).
- Unique email checks on creation and update.
- Displaying registered users in a responsive table.
- Editing existing user details.
- Deleting users with a confirmation modal dialog.
- Global exception handling returning clean JSON error responses.
- Persistent data storage using PostgreSQL Docker volume (`postgres_data`) and backend log volume (`backend_logs`).

---

## Tech Stack

- **Frontend**: React 18, Vite, JavaScript, Axios, React Router v6, Nginx, Vanilla CSS.
- **Backend**: Java 21, Spring Boot 3.3.4, Maven (with Maven Wrapper `mvnw`), Spring Data JPA, Jakarta Bean Validation, PostgreSQL Driver, Lombok.
- **Database**: PostgreSQL 16 (Alpine Docker Container).
- **Containerization**: Docker, Docker Compose, Nginx Reverse Proxy.

---

## Project Structure

```
user-crud-app/
│
├── frontend/                          # React + Vite Application & Nginx
│   ├── src/
│   │   ├── components/ (ConfirmDialog.jsx, UserForm.jsx, UserTable.jsx)
│   │   ├── pages/ (UserFormPage.jsx, UsersPage.jsx)
│   │   ├── services/ (userService.js)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf                     # Nginx static file & API proxy configuration
│   ├── Dockerfile                     # Multi-stage Dockerfile (Node 22 -> Nginx Alpine)
│   └── .dockerignore                  # Ignores node_modules, dist, .git, *.log
│
├── backend/                           # Spring Boot Application
│   ├── src/
│   │   ├── main/java/com/example/userapp/
│   │   │   ├── controller/UserController.java
│   │   │   ├── service/UserService.java
│   │   │   ├── repository/UserRepository.java
│   │   │   ├── entity/User.java
│   │   │   ├── dto/ (UserRequest.java, UserResponse.java)
│   │   │   ├── exception/ (GlobalExceptionHandler, Custom Exceptions)
│   │   │   └── UserAppApplication.java
│   │   └── resources/application.properties
│   ├── pom.xml
│   ├── mvnw                           # Maven wrapper script (Unix)
│   ├── mvnw.cmd                       # Maven wrapper script (Windows)
│   ├── Dockerfile                     # Multi-stage Dockerfile (Temurin Java 21 JRE, Non-root)
│   └── .dockerignore                  # Ignores target, .git, *.log, .idea, .vscode
│
├── docker-compose.yml                 # Orchestration for postgres, backend, and frontend
├── .env.example                       # Environment variables template
├── .dockerignore                      # Root docker ignore file
├── init.sql                           # Database creation and seed script
└── README.md                          # Complete application documentation
```

---

## Docker Architecture & File Explanation

### 1. Backend Dockerfile ([`backend/Dockerfile`](file:///d:/My/test/user-crud-app/backend/Dockerfile))
Uses a multi-stage Docker build:
- **Build Stage**: `maven:3.9.8-eclipse-temurin-21-alpine` builds the Spring Boot application using Maven (`mvn clean package -DskipTests`).
- **Runtime Stage**: `eclipse-temurin:21-jre-alpine` provides a lightweight Java 21 runtime.
- **Security & Locale**: Sets `ENV LANG=C.UTF-8` and `ENV LC_ALL=C.UTF-8`, creates non-root user/group `spring:spring`, creates `/app/logs` owned by `spring`, copies `app.jar` with `spring:spring` ownership, and runs under `USER spring:spring`. Exposes port `8080`.

```dockerfile
# Build Stage
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
RUN addgroup -S spring && adduser -S spring -G spring && \
    mkdir -p /app/logs && \
    chown -R spring:spring /app
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar
USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Frontend Dockerfile & Nginx ([`frontend/Dockerfile`](file:///d:/My/test/user-crud-app/frontend/Dockerfile) & [`frontend/nginx.conf`](file:///d:/My/test/user-crud-app/frontend/nginx.conf))
Uses a multi-stage Docker build:
- **Build Stage**: `node:22-alpine` installs dependencies and compiles the Vite production bundle into `dist/`.
- **Runtime Stage**: `nginx:alpine` copies `dist/` to `/usr/share/nginx/html` and applies `nginx.conf`.
- **Nginx Configuration**:
  - Serves static build files for frontend routes with SPA fallback (`try_files $uri $uri/ /index.html`).
  - Reverse proxies requests starting with `/api/` to `http://backend:8080/api/`.

```dockerfile
# Build Stage
FROM node:22-alpine AS build
WORKDIR /app
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
RUN rm -rf ./*
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose ([`docker-compose.yml`](file:///d:/My/test/user-crud-app/docker-compose.yml))
Orchestrates three services:
- **`postgres`**: Runs PostgreSQL 16 on port `5432`, attaches persistent volume `postgres_data`, and provides a health check (`pg_isready`).
- **`backend`**: Builds `./backend`, waits for `postgres` health check, mounts `backend_logs:/app/logs`, sets `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/user_crud_db`, and exposes port `8080`.
- **`frontend`**: Builds `./frontend`, depends on `backend`, and exposes port `80`.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-user_crud_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      LANG: C.UTF-8
      LC_ALL: C.UTF-8
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-user_crud_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL:-jdbc:postgresql://postgres:5432/user_crud_db}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD:-postgres}
      LANG: C.UTF-8
      LC_ALL: C.UTF-8
    ports:
      - "8080:8080"
    volumes:
      - backend_logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    depends_on:
      backend:
        condition: service_started
    environment:
      LANG: C.UTF-8
      LC_ALL: C.UTF-8
    ports:
      - "80:80"

volumes:
  postgres_data:
  backend_logs:
```

---

## Locale Warning Fix

### Problem
When executing interactive shells or commands in Alpine-based containers, the following warning may occur if locale environment variables are missing:
```
bash: warning: setlocale: LC_ALL: cannot change locale (en_US.UTF-8): No such file or directory
```

### Solution
Instead of installing bloated extra packages, we configure standard UTF-8 locale environment variables across all container Dockerfiles and Compose service definitions:
```dockerfile
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
```
`C.UTF-8` is natively supported by `musl` libc in Alpine and eliminates `setlocale` warnings while maintaining tiny container image sizes.

---

## Persistent Volumes Audit & Rationale

| Container | Named Volume | Mount Path | Purpose & Persistence Rationale |
| :--- | :--- | :--- | :--- |
| **`postgres`** | `postgres_data` | `/var/lib/postgresql/data` | **Required**: Stores all PostgreSQL database tables, rows, indexes, and transaction logs. Must survive container restarts and `docker compose down`. |
| **`backend`** | `backend_logs` | `/app/logs` | **Required for State**: Stores Spring Boot application log files, stack traces, and audit logs outside container ephemeral storage. |
| **`frontend`** | *None* | *N/A* | **Stateless**: Serves compiled React static assets built directly into the Nginx container image. Nginx access/error logs stream directly to `stdout`/`stderr` per Docker best practices. |

---

## Container Security & Non-Root User

Running applications as `root` inside Docker containers presents container breakout risks.

- In [`backend/Dockerfile`](file:///d:/My/test/user-crud-app/backend/Dockerfile), we create a dedicated non-root system group `spring` and user `spring`:
  ```dockerfile
  RUN addgroup -S spring && adduser -S spring -G spring
  ```
- Application files and `/app/logs` directory are granted `spring:spring` ownership:
  ```dockerfile
  COPY --from=build --chown=spring:spring /app/target/*.jar app.jar
  USER spring:spring
  ```
- The Spring Boot application executes with restricted unprivileged permissions.

---

## Docker Networking: Why Service Names Instead of Localhost

Inside Docker containers, `localhost` refers to the **isolated container itself**, NOT your host machine or other containers.

- If the Spring Boot container attempted to connect to `jdbc:postgresql://localhost:5432/...`, it would fail because PostgreSQL is NOT running inside the Spring Boot container.
- Docker Compose automatically creates a shared virtual network for all services. Service names act as hostnames in DNS:
  - Backend connects to PostgreSQL using **`postgres:5432`** (`jdbc:postgresql://postgres:5432/user_crud_db`).
  - Nginx reverse proxies API calls to **`http://backend:8080/api/`**.
  - Browsers access Nginx on **`http://localhost`** (port 80).

---

## How to Run with Docker Compose

### Step 1: Navigate to Project Root
```bash
cd user-crud-app
```

### Step 2: Validate Compose File Syntax
```bash
docker compose config
```

### Step 3: Build and Start Containers
Start in detached (background) mode:
```bash
docker compose up -d --build
```

---

## Docker Management Commands

| Action | Command |
| :--- | :--- |
| **Validate configuration** | `docker compose config` |
| **Build images** | `docker compose build` |
| **Start containers (Background)** | `docker compose up -d` |
| **Rebuild & start** | `docker compose up -d --build` |
| **Check running containers** | `docker compose ps` |
| **View logs (All)** | `docker compose logs -f` |
| **View backend logs** | `docker compose logs -f backend` |
| **View PostgreSQL logs** | `docker compose logs -f postgres` |
| **View frontend logs** | `docker compose logs -f frontend` |
| **Stop containers (Keep DB data)** | `docker compose down` |
| **Stop containers & delete DB data** | `docker compose down -v` |

---

## Volume & Data Persistence Verification

### 1. Verify Named Volumes Created
List Docker volumes:
```bash
docker volume ls
```
Expected output:
```
DRIVER    VOLUME NAME
local     user-crud-app_backend_logs
local     user-crud-app_postgres_data
```

Inspect volume details:
```bash
docker volume inspect user-crud-app_postgres_data
```

### 2. Verify Database Data Persistence Across Container Restarts
1. Open browser at [http://localhost](http://localhost) and register a new user (e.g. `Jane Doe`, `jane@example.com`).
2. Stop and remove containers:
   ```bash
   docker compose down
   ```
3. Re-create and start containers:
   ```bash
   docker compose up -d
   ```
4. Refresh browser at [http://localhost](http://localhost) or run:
   ```bash
   curl http://localhost/api/users
   ```
5. **Result**: `Jane Doe` is still present in PostgreSQL because the data was safely stored inside the persistent `postgres_data` volume!

---

## Application URLs

| Service | Container URL | Host Browser URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `http://frontend:80` | `http://localhost` | React SPA served via Nginx |
| **Backend REST API** | `http://backend:8080` | `http://localhost/api/users` | Spring Boot REST Controller |
| **PostgreSQL Database** | `postgres:5432` | `localhost:5432` | PostgreSQL Database Service |

---

## REST API Endpoints & Verification

Base URL: `http://localhost/api/users` (proxied by Nginx to Spring Boot)

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | Get all registered users | None | `200 OK` |
| **GET** | `/api/users/{id}` | Get user by ID | None | `200 OK` / `404 Not Found` |
| **POST** | `/api/users` | Register a new user | `UserRequest` | `201 Created` / `400 Bad Request` / `409 Conflict` |
| **PUT** | `/api/users/{id}` | Update existing user | `UserRequest` | `200 OK` / `400 Bad Request` / `404` / `409` |
| **DELETE** | `/api/users/{id}` | Delete user by ID | None | `204 No Content` / `404 Not Found` |
