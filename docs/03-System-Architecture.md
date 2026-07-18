# 03-System-Architecture.md

# GitHub Collaborator Management System
## Technical System Architecture

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo

---

# 1. Architecture Objectives

The architecture must:

- Remain simple enough for a single developer
- Require minimal infrastructure
- Operate on a personal GitHub account
- Avoid vendor lock-in
- Support future access removal workflows
- Support future offboarding workflows
- Support future approval workflows
- Avoid major rewrites across all six phases

---

# 2. Architecture Principles

## Principle 1

GitHub remains the source of truth.

The application stores synchronized copies only.

---

## Principle 2

Synchronization is manually initiated.

No automated scheduler is required.

---

## Principle 3

Single deployment unit.

Frontend and backend exist within one application.

---

## Principle 4

Database-first design.

All GitHub data must be normalized before use.

---

## Principle 5

Future write operations must be isolated from read operations.

This prevents accidental access modifications.

---

# 3. Technology Stack

## Frontend

```text
Next.js
TypeScript
TailwindCSS
```

---

## Backend

```text
Next.js Route Handlers
TypeScript
```

---

## Database

```text
PostgreSQL
```

---

## ORM

```text
Prisma
```

---

## GitHub Integration

```text
GitHub REST API
Personal Access Token (PAT)
```

---

## Hosting

```text
Any VPS

Examples:

- Hetzner
- Hostinger VPS
- DigitalOcean
- Oracle Free Tier
```

---

# 4. High-Level Architecture

```text
┌────────────────────────────┐
│         Admin UI           │
│         Next.js            │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│      API Route Layer       │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│     Business Services      │
│                            │
│ - GitHub Sync Service      │
│ - Employee Service         │
│ - Repository Service       │
│ - Governance Service       │
│ - Access Service           │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│        PostgreSQL          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│        GitHub API          │
└────────────────────────────┘
```

---

# 5. Module Architecture

The system is divided into business modules.

---

## Dashboard Module

Responsibilities:

- Summary metrics
- Last sync status
- Health indicators

Used in:

Phase 1+

---

## Repository Module

Responsibilities:

- Repository retrieval
- Repository search
- Repository details

Used in:

Phase 1+

---

## Collaborator Module

Responsibilities:

- Collaborator search
- Permission display
- Repository associations

Used in:

Phase 1+

---

## Employee Module

Responsibilities:

- Employee records
- Employee mapping
- Employee ownership

Used in:

Phase 2+

---

## Governance Module

Responsibilities:

- Unknown user detection
- Access review reports
- Excessive access reports

Used in:

Phase 3+

---

## Access Management Module

Responsibilities:

- Remove collaborator
- Bulk offboarding

Used in:

Phase 4+

---

## Approval Module

Responsibilities:

- Request approval
- Approval queue
- Approval history

Used in:

Phase 6+

---

## Audit Module

Responsibilities:

- Change tracking
- Sync tracking
- Removal tracking

Used in:

All phases

---

# 6. Project Structure

```text
src/

├── app/
│
├── components/
│
├── lib/
│
├── services/
│   ├── github/
│   ├── sync/
│   ├── employee/
│   ├── repository/
│   ├── governance/
│   ├── access/
│   └── audit/
│
├── prisma/
│
├── types/
│
├── hooks/
│
└── utils/
```

---

# 7. Frontend Architecture

UI is organized by feature.

```text
Dashboard

Repositories

Collaborators

Employees

Governance

Offboarding

Approvals
```

Each feature owns:

```text
Page

Components

API calls

Validation
```

---

# 8. Backend Architecture

Route handlers remain thin.

Example:

```text
API Route
      ↓
Service Layer
      ↓
Repository Layer
      ↓
Database
```

No business logic should live inside route handlers.

---

# 9. GitHub Integration Architecture

A dedicated GitHub client must be created.

Responsibilities:

- Authentication
- API abstraction
- Error handling
- Rate-limit handling

---

Example:

```text
GitHubClient

getRepositories()

getCollaborators()

getPermissions()

removeCollaborator()
```

Future methods can be added without affecting business logic.

---

# 10. Synchronization Architecture

Synchronization is administrator initiated.

Flow:

```text
Admin
  │
  ▼
Sync Button
  │
  ▼
API Endpoint
  │
  ▼
GitHub Service
  │
  ▼
Repository Discovery
  │
  ▼
Collaborator Discovery
  │
  ▼
Database Update
  │
  ▼
Sync Report
```

---

# 11. Sync Strategy

For each repository:

```text
Fetch Repository
      ↓
Fetch Collaborators
      ↓
Fetch Permissions
      ↓
Persist Data
```

Continue processing even if one repository fails.

---

Example:

```text
46 repositories

Repo 17 fails

45 repositories still synchronize
```

---

# 12. Failure Handling

Failures must be isolated.

---

Repository Failure

Action:

- Log failure
- Continue sync

---

GitHub API Failure

Action:

- Retry once
- Log failure

---

Database Failure

Action:

- Abort transaction
- Record error

---

# 13. Security Architecture

PAT never exposed to frontend.

PAT only available within backend services.

Storage:

```text
Environment Variable
```

Example:

```env
GITHUB_PAT=*****
```

---

# 14. Write Operation Isolation

Future write operations must be isolated.

Read Services:

```text
Dashboard
Repository
Collaborator
Employee
Governance
```

Write Services:

```text
Access Removal
Offboarding
Approval Workflow
```

This prevents accidental access modifications.

---

# 15. Deployment Architecture

Single Server Deployment

```text
┌────────────────────┐
│     Next.js        │
│                    │
│ Frontend + API     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│    PostgreSQL      │
└────────────────────┘
```

No additional services required.

---

# 16. Scalability Targets

Target Capacity

Repositories:

```text
500+
```

Collaborators:

```text
100+
```

Employee Records:

```text
500+
```

Audit Events:

```text
100,000+
```

Supported without architectural changes.

---

# 17. Future Architecture Evolution

Phase 1-4

No infrastructure changes.

---

Phase 5

Optional:

Background job processing.

Only if bulk offboarding becomes slow.

---

Phase 6

Approval workflows.

Database additions only.

No infrastructure changes.

---

# 18. Architecture Decision Log

Decision:

Single Next.js Application

Reason:

Lower operational complexity

---

Decision:

PostgreSQL

Reason:

Avoid future migrations

---

Decision:

Manual Sync

Reason:

Explicit administrator control

---

Decision:

No Redis

Reason:

Not required

---

Decision:

No Docker Requirement

Reason:

Simpler deployment

---

Decision:

No Scheduler

Reason:

Synchronization is user-driven

---

# 19. Architecture Success Criteria

System is considered successful when:

- Administrator can sync repositories
- Administrator can locate collaborator access instantly
- Employee mapping is maintained
- Future phases can be added without rewrites

---

END OF DOCUMENT