# Git Collaborator Access Manager (GCAM)

A containerized, full-stack platform for auditing, governing, and automating collaborator access across GitHub repositories.

---

## 🏛 Architecture Overview

GCAM is architected as a **single-unit containerized deployment** consisting of three core services connected over an isolated private bridge network, with an optional Nginx production reverse proxy:

```
                      ┌────────────────────────────────────────┐
                      │    Internet / Client Browser (Port 80) │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │  Nginx Reverse Proxy │ (Optional Production Overlay)
                               └──────────┬──────────┘
                                          │
                                          ▼
                             ┌─────────────────────────┐
                             │    Frontend (Next.js)   │ :3000
                             │  React 19 / Prisma ORM  │
                             └──────┬────────────┬─────┘
                                    │            │
            Prisma Queries / Sync   │            │ Internal REST (HTTP)
                                    ▼            ▼
                   ┌───────────────────┐      ┌─────────────────────────┐
                   │ PostgreSQL 16 DB  │◄─────┤   Backend (Spring Boot) │ :8080
                   │   (Volume Data)   │ JDBC │ Java 23 / Hibernate JPA │
                   └───────────────────┘      └─────────────────────────┘
```

1. **Frontend (`gcam-frontend`)**: Next.js 15 + React 19 web application and API proxy. Serves the UI, handles user authentication/sessions, and performs Prisma schema management.
2. **Backend (`gcam-backend`)**: Spring Boot 3.4.1 (Java 23) microservice. Interacts with the GitHub REST API using your GitHub Personal Access Token (PAT), handles collaborator synchronization, offboarding workflows, and audit logging.
3. **Database (`gcam-postgres`)**: PostgreSQL 16 Alpine with persistent named volumes and automated healthchecks.
4. **Reverse Proxy (`gcam-nginx`)**: Production Nginx container configured with Next.js static asset caching, gzip compression, and security headers.

---

## 🚀 Quick Start (Single-Unit Docker Deployment)

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your desired credentials and GitHub configuration:
```env
# Database Settings
POSTGRES_DB=git_collabration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5433

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
SESSION_SECRET=a_long_random_string_for_cookie_signing

# GitHub API Access
GITHUB_PAT=ghp_your_personal_access_token_here
GITHUB_OWNER=your_github_org_or_username

# Ports
SPRING_BOOT_PORT=8080
FRONTEND_PORT=3000
HTTP_PORT=80
```

### 3. Build & Run
Run the entire application stack as a single unit in detached mode:
```bash
docker compose up -d --build
```

### 4. Verify Services
Check that all containers started and passed health checks:
```bash
docker compose ps
```
All services (`gcam-postgres`, `gcam-backend`, and `gcam-frontend`) should display `(healthy)` status.

Access the application in your browser:
- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **Frontend Health**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🌐 Production Server Deployment (VPS / Cloud)

### Option A: Direct Web Deployment
To expose the web application directly on standard HTTP port `80`:
1. In `.env`, set:
   ```env
   FRONTEND_PORT=80
   ```
2. Start the stack:
   ```bash
   docker compose up -d --build
   ```
The application will be accessible directly on `http://your-server-ip/`.

### Option B: Production Deployment with Nginx Reverse Proxy
To run with an Nginx reverse proxy providing static caching and security headers:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
This starts Nginx on port `80` (configured via `HTTP_PORT=80`) and routes traffic to the internal frontend service.

---

## 🛠 Useful Docker Operations

| Action | Command |
|---|---|
| **View real-time logs** | `docker compose logs -f` |
| **View logs for specific service** | `docker compose logs -f frontend` or `docker compose logs -f backend` |
| **Stop application** | `docker compose down` |
| **Stop and wipe database data** | `docker compose down -v` |
| **Rebuild without cache** | `docker compose build --no-cache` |
| **Check container health** | `docker compose ps` |

---

## 🔒 Security Hardening in Containers

- **Non-Root Execution**: Both `backend` (runs as `spring:spring`) and `frontend` (runs as `nextjs:nodejs`) containers drop root privileges at runtime.
- **Internal Docker Network**: Database and backend services run on an isolated bridge network (`gcam-network`).
- **Log Rotation**: All containers use Docker `json-file` logging with a 10MB limit and 3 files max to prevent disk space exhaustion on servers.
- **Graceful Retries**: Frontend entrypoint retries database schema synchronization during cold starts.
