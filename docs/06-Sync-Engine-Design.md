# 06-Sync-Engine-Design.md

# GitHub Collaborator Management System
## Synchronization Engine Design Specification

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo

---

# 1. Purpose

The Sync Engine is responsible for importing the current state of GitHub into the local database.

The Sync Engine is the most critical component in Phase 1 because every dashboard, search result, report, and future removal workflow depends on the quality of synchronized data.

---

# 2. Design Goals

The Sync Engine must:

- Be manually triggered
- Be predictable
- Be repeatable
- Recover from partial failures
- Avoid data corruption
- Avoid duplicate records
- Preserve audit history

---

# 3. Synchronization Philosophy

GitHub remains the source of truth.

The local database is a synchronized cache.

This means:

```text
GitHub State
        ↓
Local Database
```

Never:

```text
Local Database
        ↓
GitHub
```

during Phases 1–3.

---

# 4. Sync Trigger

Phase 1

Manual Only.

---

Trigger Source

```text
Dashboard

[ Sync Now ]
```

---

API Endpoint

```http
POST /api/sync
```

---

Request

```json
{
  "initiatedBy": "admin"
}
```

---

# Concurrency Rule

Only one sync may run at a time.

Before creating a new sync job, the system must check whether any sync job with status `RUNNING` already exists.

If a `RUNNING` sync job exists:

```text
Reject the new sync request

Return an error: sync already in progress

Do NOT create a new sync job
```

The running sync must complete or fail before a new sync can be started.

---

# 5. Sync Lifecycle

```text
Pending
   ↓

Running
   ↓

Success
```

---

Possible Failure States

```text
Failed

Partial Success
```

---

# 6. High-Level Sync Flow

```text
Admin Clicks Sync
        │
        ▼
Create Sync Job
        │
        ▼
Fetch Repositories
        │
        ▼
Fetch Collaborators
        │
        ▼
Fetch Permissions
        │
        ▼
Build New Dataset
        │
        ▼
Validate Dataset
        │
        ▼
Persist Dataset
        │
        ▼
Complete Sync Job
```

---

# 7. Sync Job Creation

Immediately create a sync record.

Table:

```text
sync_jobs
```

---

Initial State

```text
RUNNING
```

---

Store

```text
Started At

Initiated By

Status
```

---

# 8. Repository Synchronization

Step 1

Fetch repositories.

---

Example

```text
backend

frontend

analytics

mobile-app
```

---

For every repository:

```text
Store Metadata

Queue For Collaborator Discovery
```

---

# 9. Collaborator Synchronization

For each repository:

```text
Repository
      ↓
Collaborators
```

---

Example

```text
backend

rahul123

priya-dev

amit-tech
```

---

Upsert GitHub users.

---

Reason

A collaborator may exist in multiple repositories.

Only one GitHub user record should exist.

---

# 10. Permission Synchronization

For each collaborator:

```text
Repository
        ↓
Collaborator
        ↓
Permission
```

---

Example

```text
backend

rahul123

admin
```

Stored into:

```text
repository_access
```

---

# 11. Temporary Dataset Strategy

Do NOT immediately overwrite production data.

---

Build:

```text
Memory Dataset
```

or

```text
Temporary Sync Dataset
```

first.

---

Reason

Prevents corruption if sync fails halfway.

---

# 12. Validation Stage

Before committing:

Validate:

```text
Repositories Found > 0

Collaborators Retrieved

No Duplicate Keys

No Invalid Permissions
```

---

If validation fails:

```text
Abort Sync
```

---

Current production data remains unchanged.

---

# 13. Commit Strategy

Recommended:

Repository-by-repository transactions.

---

Example

```text
Repository 1
Commit

Repository 2
Commit

Repository 3
Commit
```

---

Avoid:

```text
Single giant transaction
```

---

Reason

Improves fault tolerance.

---

# 14. Repository Access Refresh Strategy

Current Recommendation

```text
Delete Existing Repository Access

Rebuild Access State
```

per repository.

---

Transaction Requirement

The delete and rebuild for each repository must occur within a single database transaction.

```text
BEGIN TRANSACTION

  Delete existing repository_access records for this repository

  Insert new repository_access records for this repository

COMMIT
```

If the insert step fails for any reason, the transaction must be rolled back.

The previous access records for that repository are preserved.

Sync continues to the next repository.

---

Example

```text
backend

Delete Existing Access

Insert Fresh Access
```

---

Result

Current GitHub state becomes authoritative.

---

# 15. Handling Removed Collaborators

Example

Old State

```text
backend

rahul

priya

amit
```

---

GitHub Current State

```text
backend

rahul

priya
```

---

Sync Result

```text
amit
```

removed automatically from:

```text
repository_access
```

---

No manual cleanup required.

---

# 16. Handling Repository Deletion

Example

Previous Sync

```text
analytics-old
```

exists.

---

GitHub Current State

```text
analytics-old
```

missing.

---

Action

```text
Mark Repository Inactive
```

Do NOT hard delete.

---

Reason

Preserve history.

---

# 17. Sync Progress Tracking

Store:

```text
Repositories Total

Repositories Processed

Collaborators Found

Errors Found
```

---

Used for dashboard display.

---

Example

```text
Repositories: 46/46

Collaborators: 92

Errors: 1
```

---

# 18. Error Handling

Repository Failure

---

Example

```text
Permission Error

Temporary API Failure
```

---

Action

```text
Record Error

Continue
```

---

Sync continues.

---

# 19. Partial Success Rules

Example

```text
46 Repositories

45 Successful

1 Failed
```

---

Final Status

```text
PARTIAL_SUCCESS
```

---

Sync remains usable.

---

# 20. Duplicate Prevention

GitHub Users

Unique:

```text
github_username
```

---

Repositories

Unique:

```text
github_repo_id
```

---

Repository Access

Unique:

```text
repository_id
+
github_user_id
```

---

Prevents duplicate relationships.

---

# 21. Sync Duration Expectations

Current Scale

```text
46 repositories

10 users
```

Expected:

```text
5-30 seconds
```

---

Target Maximum

```text
60 seconds
```

---

# 22. Sync Dashboard Requirements

Display:

```text
Last Sync Time

Last Sync Status

Repositories Found

Collaborators Found

Errors
```

---

Example

```text
Last Sync:
2026-07-01 16:22

Status:
Success

Repositories:
46

Collaborators:
11
```

---

# 23. Audit Logging

Every sync creates:

```text
SYNC_STARTED

SYNC_COMPLETED

SYNC_FAILED
```

records.

---

Stored in:

```text
audit_logs
```

---

# 24. Future Phase Compatibility

Phase 2

Employee Mapping

No Sync Changes Required.

---

Phase 3

Governance Reports

No Sync Changes Required.

---

Phase 4

Removal Workflows

Sync Automatically Reflects Removals.

No Sync Changes Required.

---

Phase 5

Bulk Offboarding

Sync Automatically Reflects Offboarding.

No Sync Changes Required.

---

Phase 6

Approval Workflow

No Sync Changes Required.

---

# 25. Recovery Strategy

If sync crashes:

```text
Current Production Data Remains
```

---

Next sync can run normally.

---

No manual repair should be required.

---

# Orphaned Sync Job Recovery

On application startup, the system must check for any sync job with status `RUNNING`.

If a `RUNNING` sync job is found:

```text
Update status to FAILED

Set error_message to: "Sync interrupted by application restart"

Set completed_at to current timestamp
```

Reason:

A sync job left in `RUNNING` state after a crash would permanently block new syncs under the concurrency rule defined in §4.

This recovery step must run before the application begins accepting requests.

---

# 26. Future Optimization Triggers

Do NOT optimize until one of:

```text
500+ repositories

100+ collaborators

5+ minute sync times
```

---

Only then consider:

```text
Background Workers

Parallel Processing

Job Queues
```

---

Not before.

---

# 27. Sync Engine Success Criteria

The Sync Engine is considered successful when:

✓ Sync completes reliably

✓ Data remains accurate

✓ Failures are isolated

✓ No duplicate records exist

✓ Deleted access disappears automatically

✓ Future phases require no redesign

---

# 28. Final Architecture Decision

Synchronization remains:

```text
User Driven
```

and not:

```text
Scheduled
```

This is an intentional product decision.

The administrator explicitly decides when GitHub state should be refreshed.

---

END OF DOCUMENT