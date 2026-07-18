# 01-MVP-Scope.md

# GitHub Collaborator Management System
## Phase-Based MVP Scope Definition

Version: 1.1
Status: FROZEN FOR PHASE 1 DEVELOPMENT
Owner: Infineo
Architecture Type: Internal Admin Platform

---

# 1. Purpose

The purpose of this system is to provide a centralized interface for managing GitHub repository collaborator access across repositories owned by a personal GitHub account.

The system is intended to eliminate manual tracking of collaborator access and provide visibility into:

- Who has access
- Which repositories they can access
- Permission levels
- Historical access changes
- Future access removal workflows

The platform is not intended to replace GitHub.

The platform acts as an internal access management layer on top of GitHub.

---

# 2. Business Problem

Current workflow:

1. Repository created
2. Collaborator manually added
3. Access information exists only inside GitHub
4. Team manually remembers who has access
5. Offboarding becomes difficult
6. Access reviews become difficult

Current risks:

- Forgotten access
- Stale collaborator permissions
- Manual audits
- No centralized visibility
- No offboarding workflow

---

# 3. Product Goal

Provide a single dashboard where an administrator can:

- View all repositories
- View all collaborators
- Search collaborators
- Search repositories
- View permissions
- Map collaborators to employees
- Remove access (future phases)
- Bulk offboard users (future phases)

---

# 4. Product Principles

## Principle 1

GitHub remains the source of truth.

The application never becomes the primary source of repository access data.

---

## Principle 2

Synchronization is user-driven.

No automatic syncs are required.

Administrators explicitly trigger synchronization.

---

## Principle 3

Simple before scalable.

The architecture should remain understandable by a single developer.

Infrastructure complexity should only be introduced when justified by actual requirements.

---

## Principle 4

Auditability over automation.

Every access change must be traceable.

---

# 5. In Scope

## Phase 1

Visibility Dashboard

Features:

- Manual Sync
- Repository Discovery
- Collaborator Discovery
- User Search
- Repository Search
- Permission Visibility
- Dashboard Metrics

---

## Phase 2

Employee Mapping

Features:

- Internal Employee Records
- GitHub Username Mapping
- Employee Search
- Employee Ownership View

---

## Phase 3

Access Governance

Features:

- Unknown User Detection
- Inactive User Identification
- Repository Ownership Visibility
- Access Review Screens

---

## Phase 4

Access Removal

Features:

- Remove User From Repository
- Permission Confirmation
- Removal Logging
- Success/Failure Tracking

---

## Phase 5

Bulk Offboarding

Features:

- Remove User From Multiple Repositories
- Offboarding Dashboard
- Batch Removal Execution
- Batch Audit Trail

---

## Phase 6

Approval Workflow

Features:

- Access Removal Requests
- Approval Queue
- Approver Assignment
- Approval Audit Trail

---

# 6. Out Of Scope

The following are explicitly excluded:

- GitHub Organization Management
- SAML
- SCIM
- Enterprise Identity Providers
- Google Workspace Integration
- Automatic Email Resolution
- Role-Based Access Control (RBAC)
- Multi-Tenant Support
- GitHub Enterprise Features
- Slack Integration
- Teams Integration
- Automated Provisioning

---

# 7. User Roles

## Administrator

Permissions:

- Sync Data
- View All Data
- Create Employee Mapping
- Remove Access
- Approve Requests

---

## Viewer

Permissions:

- View Data
- Search Data

No modification permissions.

---

# 8. Success Metrics

Phase 1 Success:

Administrator can determine:

- Who has access to a repository
- Which repositories a user can access

Within 30 seconds.

---

Phase 2 Success:

Every known collaborator can be linked to an employee record.

---

Phase 3 Success:

Unknown access can be identified.

---

Phase 4 Success:

Single-repository access removal can be completed from the platform.

---

Phase 5 Success:

Full employee offboarding can be completed from one screen.

---

Phase 6 Success:

All removals require approval before execution.

---

# 9. MVP Release Boundary

Initial MVP Release includes:

- Phase 1
- Phase 2

Only.

No access modifications.

No removals.

No approval workflows.

The first production release is read-only.

This minimizes operational risk and validates the data model before introducing write operations against GitHub.

---

# 10. Phase Exit Criteria

## Phase 1 Exit

Requirements:

- Repository sync working
- Collaborator sync working
- Search working
- Dashboard working

Approval Required:
Product Owner

---

## Phase 2 Exit

Requirements:

- Employee mapping working
- Mapping persistence working
- Search working

Approval Required:
Product Owner

---

## Phase 3 Exit

Requirements:

- Governance reports working
- Unknown user reporting working

Approval Required:
Product Owner

---

## Phase 4 Exit

Requirements:

- Repository access removal working
- Audit logging working

Approval Required:
Product Owner

---

## Phase 5 Exit

Requirements:

- Bulk offboarding working
- Batch logging working

Approval Required:
Product Owner

---

## Phase 6 Exit

Requirements:

- Approval workflow operational
- Audit trail complete

Approval Required:
Product Owner

---

END OF DOCUMENT