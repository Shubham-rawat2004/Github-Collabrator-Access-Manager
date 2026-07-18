# 07-Access-Removal-Architecture.md

# GitHub Collaborator Management System
## Access Removal & Offboarding Architecture

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo

---

# 1. Purpose

This document defines all workflows that modify GitHub collaborator access.

These workflows are introduced in:

```text
Phase 4
```

and expanded in:

```text
Phase 5
```

Because these operations directly affect production repositories, safety and auditability are prioritized over speed.

---

# 2. Design Principles

## Principle 1

Removal actions must be intentional.

No automatic removals.

---

## Principle 2

Every removal must be auditable.

---

## Principle 3

GitHub remains the authority.

Success is determined by GitHub API response.

---

## Principle 4

Removal operations must be reversible through GitHub UI.

The application itself does not implement rollback.

---

# 3. Scope

Phase 4

```text
Single Repository Removal
```

---

Phase 5

```text
Bulk Offboarding
```

---

# 4. Access Removal Types

Type 1

```text
Remove User From Repository
```

Phase 4

---

Type 2

```text
Remove User From All Repositories
```

Phase 5

---

Type 3

```text
Remove User From Selected Repositories
```

Phase 5

---

# 5. Single Repository Removal

Example

```text
Repository:
backend

User:
rahul123
```

---

Action

```text
Remove Access
```

---

Flow

```text
Admin
  │
  ▼
User Profile
  │
  ▼
Repository List
  │
  ▼
Remove Button
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

# 6. Confirmation Screen

Required.

Example

```text
You are about to remove:

User:
rahul123

Repository:
backend

Permission:
admin

This action affects GitHub immediately.

[Cancel]

[Confirm Removal]
```

---

No removal should execute without confirmation.

---

# 7. GitHub Execution

Endpoint

```http
DELETE /repos/{owner}/{repo}/collaborators/{username}
```

---

Success Response

```text
204 No Content
```

---

Considered:

```text
SUCCESS
```

---

# 8. Failure Handling

Examples

```text
Repository Missing

User Already Removed

GitHub Permission Error

GitHub API Failure
```

---

Action

```text
Record Failure

Display Error

No Retry Automatically
```

---

Administrator decides next action.

---

# 9. Removal Request Lifecycle

```text
Pending
   │
   ▼

Executing
   │
   ▼

Success
```

---

Failure Path

```text
Pending
   │
   ▼

Executing
   │
   ▼

Failed
```

---

# 10. Removal Request Record

Table

```text
removal_requests
```

---

Fields

```text
Requested By

User

Repository

Reason

Status

Executed At
```

---

# 11. Audit Logging

Required Events

```text
ACCESS_REMOVAL_REQUESTED

ACCESS_REMOVAL_STARTED

ACCESS_REMOVAL_SUCCESS

ACCESS_REMOVAL_FAILED
```

---

All events stored.

---

# 12. Repository Detail View

Future UI

```text
backend

Collaborators

--------------------------------

rahul123

admin

[ Remove ]

--------------------------------

priya-dev

write

[ Remove ]
```

---

# 13. User Detail View

Future UI

```text
rahul123

Repositories

--------------------------------

backend

admin

[ Remove ]

--------------------------------

frontend

write

[ Remove ]
```

---

# 14. Phase 5 Overview

Bulk Offboarding

Purpose:

Remove one user from many repositories.

---

Example

```text
Employee:
Rahul

Repositories:
23
```

---

Action

```text
Remove From All
```

---

# 15. Offboarding Workflow

```text
Employee Selected
        │
        ▼
Fetch Access List
        │
        ▼
Display Summary
        │
        ▼
Confirmation
        │
        ▼
Execute Removals
        │
        ▼
Generate Report
```

---

# 16. Offboarding Confirmation

Example

```text
Employee:
Rahul

GitHub:
rahul123

Repositories:
23

This action will remove access
from all listed repositories.

[ Cancel ]

[ Start Offboarding ]
```

---

# 17. Execution Strategy

For current scale:

```text
Sequential Execution
```

---

Example

```text
Repo 1

Success

Repo 2

Success

Repo 3

Failed

Repo 4

Success
```

---

No queue system required.

---

# 18. Why Sequential?

Current Scale

```text
46 repositories

10 users
```

---

Benefits

```text
Simple

Easy Debugging

Easy Audit
```

---

No additional infrastructure required.

---

# 19. Progress Tracking

Display

```text
Repository 1/23

Repository 2/23

Repository 3/23
```

---

Dashboard Example

```text
Progress

18 / 23 Completed

4 Remaining

1 Failed
```

---

# 20. Partial Failure Rules

Example

```text
23 repositories

22 successful

1 failed
```

---

Status

```text
PARTIAL_SUCCESS
```

---

Offboarding continues.

---

# 21. Offboarding Job Storage

Table

```text
offboarding_jobs
```

---

Tracks

```text
Started At

Completed At

Repositories Total

Repositories Processed

Failures
```

---

# 22. Offboarding Item Storage

Table

```text
offboarding_job_items
```

---

Tracks

```text
Repository

Status

Error Message
```

---

One record per repository.

---

# 23. Rollback Philosophy

No automated rollback.

Reason:

GitHub removals are immediate.

Automatic restoration could introduce security risks.

---

If rollback required:

```text
Administrator manually re-adds collaborator
```

through GitHub or future platform features.

---

# 24. Safety Rules

Rule 1

Always require confirmation.

---

Rule 2

Always log actions.

---

Rule 3

Never remove multiple users accidentally.

---

Rule 4

Never execute hidden actions.

---

Rule 5

Display affected repositories before execution.

---

# 25. Future Approval Compatibility

Phase 6 introduces:

```text
Approval Workflow
```

---

Current Flow

```text
Admin

↓

Execute
```

---

Future Flow

```text
Admin

↓

Request

↓

Approval

↓

Execute
```

---

No redesign required.

---

# 26. UI Requirements

Phase 4

```text
Remove Button

Confirmation Modal

Result Notification
```

---

Phase 5

```text
Offboarding Screen

Progress Screen

Summary Screen
```

---

# 27. Reporting Requirements

After every offboarding:

Generate summary.

Example

```text
Employee:
Rahul

Repositories:
23

Success:
22

Failed:
1
```

---

Stored permanently.

---

# 28. Security Requirements

Only administrators may:

```text
Remove Access

Start Offboarding
```

---

View-only users cannot perform write operations.

---

# 29. Success Criteria

Phase 4

✓ Single repository removal works

✓ Audit logs generated

✓ Confirmation required

---

Phase 5

✓ Offboarding works

✓ Progress visible

✓ Partial failures handled

✓ Full audit trail maintained

---

# 30. Final Architecture Decision

For current and medium scale:

```text
Direct Execution
```

is preferred over:

```text
Background Queues

Workers

Redis

BullMQ
```

These technologies should only be considered if future repository volume justifies them.

---

END OF DOCUMENT