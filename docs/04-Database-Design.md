# 04-Database-Design.md

# GitHub Collaborator Management System
## Database Design Specification

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo

---

# 1. Design Objectives

The database must support:

- Phase 1: Visibility Dashboard
- Phase 2: Employee Mapping
- Phase 3: Governance
- Phase 4: Access Removal
- Phase 5: Bulk Offboarding
- Phase 6: Approval Workflow

Without requiring schema redesign.

---

# 2. Database Technology

```text
PostgreSQL
```

Reason:

- Mature
- Reliable
- Excellent indexing
- Strong relational integrity
- Future-proof

---

# 3. Entity Relationship Overview

```text
Employee
    │
    ▼
GithubUser
    │
    ▼
RepositoryAccess
    ▲
    │
Repository

--------------------------------

SyncJob

--------------------------------

AuditLog

--------------------------------

RemovalRequest

--------------------------------

ApprovalRequest
```

---

# 4. Core Entities

---

## Employee

Represents an internal team member.

Phase:

```text
2+
```

---

## GithubUser

Represents a GitHub username.

Phase:

```text
1+
```

---

## Repository

Represents a GitHub repository.

Phase:

```text
1+
```

---

## RepositoryAccess

Represents access granted to a repository.

Phase:

```text
1+
```

---

## SyncJob

Tracks synchronization runs.

Phase:

```text
1+
```

---

## AuditLog

Tracks system events.

Phase:

```text
1+
```

---

## RemovalRequest

Tracks access removal requests.

Phase:

```text
4+
```

---

## ApprovalRequest

Tracks approval workflow.

Phase:

```text
6+
```

---

# 5. Employee Table

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY,

    full_name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    department VARCHAR(255),

    is_active BOOLEAN DEFAULT TRUE,

    notes TEXT,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL
);
```

---

# 6. Github Users Table

Represents GitHub identities.

```sql
CREATE TABLE github_users (
    id UUID PRIMARY KEY,

    github_id BIGINT,

    github_username VARCHAR(255) NOT NULL UNIQUE,

    github_profile_url TEXT,

    employee_id UUID,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);
```

---

# Why Separate Employee and GitHub User?

Future possibility:

```text
Employee
      │
      ├── github-main
      ├── github-personal
      └── github-consulting
```

Supports multiple GitHub accounts.

No redesign later.

---

# 7. Repositories Table

```sql
CREATE TABLE repositories (
    id UUID PRIMARY KEY,

    github_repo_id BIGINT UNIQUE,

    name VARCHAR(255) NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    description TEXT,

    visibility VARCHAR(50),

    default_branch VARCHAR(255),

    archived BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    last_synced_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL
);
```

---

# 8. Repository Access Table

Most important table.

Represents:

```text
User
  ↔
Repository
```

Relationship.

```sql
CREATE TABLE repository_access (
    id UUID PRIMARY KEY,

    repository_id UUID NOT NULL,

    github_user_id UUID NOT NULL,

    permission VARCHAR(50),

    source VARCHAR(50),

    synced_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id),

    FOREIGN KEY (github_user_id)
        REFERENCES github_users(id),

    UNIQUE (repository_id, github_user_id)
);
```

---

# Example

```text
rahul123
      ↓
backend
      ↓
admin
```

Stored as:

```text
repository_access
```

---

# source Column Definition

The `source` column records how access was granted.

Phase 1 valid value:

```text
direct
```

Meaning: collaborator was added directly to the repository.

Reserved for future use to distinguish team-based or organization-based access in later phases.

All Phase 1 sync records must set `source = 'direct'`.

---

# 9. Sync Jobs Table

Tracks every synchronization.

```sql
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    status VARCHAR(50),

    initiated_by VARCHAR(255),

    repositories_scanned INTEGER,

    collaborators_found INTEGER,

    error_count INTEGER,

    error_message TEXT,

    created_at TIMESTAMP NOT NULL
);
```

---

# Status Values

```text
PENDING
RUNNING
SUCCESS
FAILED
PARTIAL_SUCCESS
```

---

# 10. Sync Job Details Table

Optional.

Useful for troubleshooting.

```sql
CREATE TABLE sync_job_details (
    id UUID PRIMARY KEY,

    sync_job_id UUID,

    repository_id UUID,

    status VARCHAR(50),

    error_message TEXT,

    created_at TIMESTAMP NOT NULL,

    FOREIGN KEY (sync_job_id)
        REFERENCES sync_jobs(id),

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
);
```

---

# 11. Audit Log Table

Tracks everything.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,

    action_type VARCHAR(100),

    entity_type VARCHAR(100),

    entity_id UUID,

    performed_by VARCHAR(255),

    details JSONB,

    created_at TIMESTAMP NOT NULL
);
```

---

# Example Actions

```text
SYNC_STARTED

SYNC_COMPLETED

EMPLOYEE_CREATED

EMPLOYEE_UPDATED

USER_MAPPED

ACCESS_REMOVED

OFFBOARDING_STARTED

APPROVAL_GRANTED
```

---

# 12. Removal Requests Table

Phase 4+

```sql
CREATE TABLE removal_requests (
    id UUID PRIMARY KEY,

    github_user_id UUID,

    repository_id UUID,

    status VARCHAR(50),

    requested_by VARCHAR(255),

    reason TEXT,

    executed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,

    FOREIGN KEY (github_user_id)
        REFERENCES github_users(id),

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
);
```

---

# Status Values

```text
PENDING

EXECUTED

FAILED

CANCELLED
```

---

# 13. Bulk Offboarding Table

Phase 5+

```sql
CREATE TABLE offboarding_jobs (
    id UUID PRIMARY KEY,

    employee_id UUID,

    status VARCHAR(50),

    repositories_total INTEGER,

    repositories_processed INTEGER,

    repositories_failed INTEGER,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,

    FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);
```

---

# 14. Offboarding Details Table

```sql
CREATE TABLE offboarding_job_items (
    id UUID PRIMARY KEY,

    offboarding_job_id UUID,

    repository_id UUID,

    status VARCHAR(50),

    error_message TEXT,

    created_at TIMESTAMP NOT NULL,

    FOREIGN KEY (offboarding_job_id)
        REFERENCES offboarding_jobs(id),

    FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
);
```

---

# 15. Approval Requests Table

Phase 6+

```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY,

    request_type VARCHAR(100),

    reference_id UUID,

    status VARCHAR(50),

    requested_by VARCHAR(255),

    approved_by VARCHAR(255),

    approved_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL
);
```

---

# Example

```text
request_type

ACCESS_REMOVAL

OFFBOARDING
```

---

# 16. Indexing Strategy

Github Username Search

```sql
CREATE INDEX idx_github_username
ON github_users(github_username);
```

---

Employee Search

```sql
CREATE INDEX idx_employee_name
ON employees(full_name);
```

---

Repository Search

```sql
CREATE INDEX idx_repository_name
ON repositories(name);
```

---

Repository Access Search

```sql
CREATE INDEX idx_repository_access_user
ON repository_access(github_user_id);

CREATE INDEX idx_repository_access_repo
ON repository_access(repository_id);
```

---

# 17. Sync Strategy

Recommended:

```text
Delete Existing Access Data

↓

Rebuild Repository Access Table
```

Reason:

Simpler

Safer

Avoids stale permissions

---

Process:

Sync

↓

Fetch Current GitHub State

↓

Replace Current Access Records

↓

Commit

---

# 18. Data Retention

Repository Data

```text
Keep Forever
```

---

Audit Logs

```text
Keep Forever
```

---

Sync Jobs

```text
Keep Forever
```

---

Optional cleanup later.

---

# 19. Database Success Criteria

Database supports:

✓ Repository visibility

✓ Collaborator visibility

✓ Employee mapping

✓ Governance reports

✓ Access removal

✓ Bulk offboarding

✓ Approval workflows

Without schema redesign.

---

# 20. Future Schema Changes

Expected:

- Notification tables
- Role management
- Multi-admin support

Not expected:

- Major core table redesign

Core schema should remain stable.

---

END OF DOCUMENT