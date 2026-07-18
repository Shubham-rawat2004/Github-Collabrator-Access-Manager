# 05-GitHub-API-Integration.md

# GitHub Collaborator Management System
## GitHub API Integration Specification

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo

---

# 1. Purpose

This document defines:

- GitHub API usage
- Authentication strategy
- Synchronization flow
- Repository discovery flow
- Collaborator discovery flow
- Permission retrieval flow
- Future access removal flow

The system must operate entirely using GitHub APIs available to a personal GitHub account.

No GitHub paid plans are required.

---

# 2. Integration Goals

The GitHub integration layer must:

- Discover repositories
- Discover collaborators
- Discover collaborator permissions
- Maintain local inventory
- Support future access removals
- Isolate GitHub-specific logic from business logic

---

# 3. Authentication Strategy

Authentication Method:

```text
GitHub Personal Access Token (PAT)
```

Stored:

```text
Environment Variable
```

Example:

```env
GITHUB_PAT=xxxxxxxxxxxxx
```

---

# 4. Required GitHub Permissions

Phase 1–3

Read-only

Required:

```text
repo
read:user
```

---

Phase 4+

Access Removal

Required:

```text
repo
```

---

# Security Principle

Never request broader permissions than required.

---

# 5. GitHub Client Architecture

A dedicated client must encapsulate all GitHub communication.

Example:

```text
GithubClient
```

Responsibilities:

- Authentication
- API requests
- Pagination
- Rate-limit handling
- Error handling

Business services must never call GitHub directly.

---

# 6. Service Architecture

```text
Business Service
        │
        ▼
Github Client
        │
        ▼
GitHub REST API
```

---

Example

```text
Sync Service
      │
      ▼
Github Client
      │
      ▼
GitHub API
```

---

# 7. Repository Discovery

Purpose:

Retrieve all repositories belonging to the configured account.

---

Endpoint

```http
GET /user/repos
```

This endpoint returns all repositories owned by the authenticated PAT user, including private repositories.

Do NOT use `GET /users/{username}/repos`. That endpoint returns public repositories only and will miss private repositories.

---

Query Parameters

```text
per_page=100
page={n}
```

```text
Repository ID

Repository Name

Full Name

Visibility

Default Branch

Archived Status
```

---

Stored In

```text
repositories
```

table.

---

# 8. Repository Discovery Flow

```text
Admin Clicks Sync
        │
        ▼
Fetch Repositories
        │
        ▼
Store Repositories
        │
        ▼
Begin Collaborator Sync
```

---

# 9. Collaborator Discovery

Purpose:

Identify all collaborators for each repository.

---

Endpoint

```http
GET /repos/{owner}/{repo}/collaborators
```

---

Retrieved Fields

```text
GitHub ID

Username

Profile URL
```

---

Stored In

```text
github_users
```

table.

---

# 10. Collaborator Permission Retrieval

Purpose:

Determine repository permission level.

---

Endpoint

```http
GET /repos/{owner}/{repo}/collaborators/{username}/permission
```

---

Possible Permission Values

```text
admin

maintain

write

triage

read

none
```

The value `none` is returned by GitHub for pending invitations and certain edge cases.

Records with permission value `none` must NOT be stored in `repository_access`.

They must be skipped silently during sync.

---

Stored In

```text
repository_access
```

table.

---

# 11. Synchronization Workflow

```text
Sync Requested
      │
      ▼
Fetch Repositories
      │
      ▼
For Each Repository
      │
      ▼
Fetch Collaborators
      │
      ▼
Fetch Permissions
      │
      ▼
Store Results
      │
      ▼
Complete Sync
```

---

# 12. Synchronization Transaction Strategy

Recommended:

Repository-by-repository commits.

Example:

```text
Repo 1
Commit

Repo 2
Commit

Repo 3
Commit
```

Avoid:

```text
One giant transaction
```

Reason:

Large sync failures become harder to recover.

---

# 13. Pagination Strategy

GitHub APIs are paginated.

Implementation must support:

```text
page

per_page
```

parameters.

---

Recommended:

```text
per_page=100
```

Maximum supported by GitHub.

---

# 14. Rate Limit Strategy

Expected Usage

```text
46 repositories
10 users
```

Current load is extremely low.

---

However:

Client must inspect:

```http
X-RateLimit-Remaining
```

header.

---

If remaining requests become low:

```text
Pause

Retry
```

---

# 15. Error Handling Strategy

Repository Failure

Example:

```text
Repository deleted
Repository inaccessible
```

Action:

```text
Log Error
Continue Sync
```

---

Collaborator Failure

Action:

```text
Log Error
Continue Sync
```

---

Permission Retrieval Failure

Action:

```text
Log Error
Continue Sync
```

---

# 16. Logging Requirements

Every sync records:

```text
Start Time

End Time

Repositories Processed

Users Processed

Errors
```

Stored:

```text
sync_jobs
```

table.

---

# 17. Future Phase 4 API

Single Access Removal

Purpose:

Remove collaborator from repository.

---

Endpoint

```http
DELETE /repos/{owner}/{repo}/collaborators/{username}
```

---

Flow

```text
Admin
   │
   ▼
Remove Access
   │
   ▼
Confirmation
   │
   ▼
GitHub API
   │
   ▼
Audit Log
```

---

# 18. Future Phase 5 API

Bulk Offboarding

Uses same endpoint repeatedly.

---

Flow

```text
Employee Selected
        │
        ▼
Find Repository Access
        │
        ▼
For Each Repository
        │
        ▼
Remove Collaborator
        │
        ▼
Record Result
```

---

# 19. Future Phase 6 API

No new GitHub endpoints required.

Approval workflow exists entirely within application logic.

GitHub receives requests only after approval.

---

# 20. API Abstraction Layer

Required Methods

```ts
getRepositories()

getCollaborators()

getCollaboratorPermission()

syncRepository()

removeCollaborator()
```

---

Future Methods

```ts
addCollaborator()

updatePermission()
```

Reserved for future use.

---

# 21. Sync Service Contract

Input

```ts
{
  initiatedBy: string;
}
```

---

Output

```ts
{
  success: boolean;

  repositoriesProcessed: number;

  collaboratorsProcessed: number;

  errors: number;
}
```

---

# 22. Security Requirements

PAT must:

- Never be exposed to browser
- Never be returned from API
- Never be logged

---

Allowed Location

```text
Server Environment Variables
```

Only.

---

# 23. Recovery Strategy

If sync fails:

```text
Previous Data Remains Available
```

System must never delete current state before replacement state is ready.

---

Recommended Flow

```text
Fetch New State

Validate

Commit

Replace Current State
```

---

# 24. Success Criteria

GitHub integration is successful when:

✓ Repository discovery works

✓ Collaborator discovery works

✓ Permission discovery works

✓ Sync completes reliably

✓ Future removal endpoints can be integrated without redesign

---

# 25. Dependency Validation

The system depends only on:

- GitHub REST APIs
- Personal Access Token

No dependency exists on:

- GitHub Teams
- GitHub Organizations
- GitHub Enterprise
- GitHub SAML
- GitHub SCIM

The system remains fully compatible with a personal GitHub account.

---

END OF DOCUMENT