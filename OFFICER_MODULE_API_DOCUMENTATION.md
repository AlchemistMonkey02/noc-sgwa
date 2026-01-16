# Officer Portal API Documentation

## Overview
This document outlines the API endpoints for the Officer Portal in the SGWA Application.
- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.
- **Roles**: DGO, SGWA, ENFORCEMENT, INSPECTION

## Shared Resources
Accessible by all officer roles.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/profile` | Get current officer details. |
| **PUT** | `/officer/profile` | Update profile information. |
| **POST** | `/officer/change-password` | Change password. |
| **GET** | `/officer/notifications` | List notifications with filters. |
| **PUT** | `/officer/notifications/:id/read` | Mark a notification as read. |
| **PUT** | `/officer/notifications/mark-all-read` | Mark all as read. |
| **GET** | `/officer/activity-log` | Get officer's activity log. |

### Document Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/officer/documents/upload` | Upload a document (Multipart). |
| **GET** | `/officer/documents/:id/download` | Download a specific document. |
| **GET** | `/officer/documents/:id/view` | View document content (Temporary URL). |

---

## DGO Module (District Ground Water Officer)
Responsible for initial review, site inspection assignments, and technical recommendation.

### Dashboard & Applications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/dgo/dashboard` | Returns statistics (pending, forwarded, rejected). |
| **GET** | `/officer/dgo/applications` | Query Params: `status`, `district`, `block`, `search`. |
| **GET** | `/officer/dgo/applications/:id` | Returns full application details. |

### Actions
| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| **POST** | `/officer/dgo/applications/:id/forward` | Forward to SGWA. | `{ "recommendation": "APPROVED", "remarks": "..." }` |
| **POST** | `/officer/dgo/applications/:id/reject` | Reject application. | `{ "reason": "...", "remarks": "..." }` |
| **POST** | `/officer/dgo/applications/:id/query` | Raise query to applicant. | `{ "queryTitle": "...", "description": "..." }` |
| **POST** | `/officer/dgo/applications/:id/schedule-inspection` | Schedule Site Inspection. | `{ "inspectionDate": "2026-02-01", "officerId": "..." }` |

### Queries Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/dgo/queries` | List all queries raised. |
| **POST** | `/officer/dgo/queries/:id/accept` | Accept applicant's response. |
| **POST** | `/officer/dgo/queries/:id/reject` | Reject applicant's response. |

---

## SGWA Module (State Ground Water Authority)
Responsible for technical review, final recommendation, and conditional approval.

### Applications & Actions
| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| **GET** | `/officer/sgwa/dashboard` | State-level statistics. | |
| **GET** | `/officer/sgwa/applications` | List forwarded applications. | |
| **POST** | `/officer/sgwa/applications/:id/approve` | Recommend for NOC. | `{ "status": "RECOMMENDED", "conditions": [...] }` |
| **POST** | `/officer/sgwa/applications/:id/reject` | Reject application. | `{ "reason": "..." }` |
| **POST** | `/officer/sgwa/applications/:id/assign` | Assign to technical officer. | `{ "officerId": "..." }` |

---

## Enforcement Wing
Responsible for final NOC issuance (Generation), compliance monitoring, and revocation.

### Workflow
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/enforcement/dashboard` | Stats on Issued NOCs, Compliance, Finals. |
| **GET** | `/officer/enforcement/approval-queue` | List applications pending Final Approval. |
| **POST** | `/officer/enforcement/applications/:id/issue-noc` | Generate & Issue Final NOC. |
| **POST** | `/officer/enforcement/applications/:id/return` | Return to SGWA for clarification. |

### Post-NOC Actions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/enforcement/nocs` | List of all issued NOCs. |
| **POST** | `/officer/enforcement/nocs/:id/revoke` | Revoke an existing NOC. |

---

## Inspection Module [NEW]
Responsible for field verification, geolocation tagging, and site reporting.

### Inspection Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/officer/inspection/dashboard` | Inspector's daily schedule & stats. |
| **GET** | `/officer/inspection/my-assignments` | List assigned inspections (Filter: `status`, `date`). |
| **GET** | `/officer/inspection/:id/details` | Get details for specific inspection assignment. |
| **POST** | `/officer/inspection/:id/submit` | Submit Report (with Geolocation & Photos). |
| **GET** | `/officer/inspection/:id/report` | View submitted report (Read-only). |

### Submission Payload
```json
{
  "locationMatch": true,
  "landUseMatch": true,
  "existingSources": 2,
  "meterInstalled": true,
  "rainwaterHarvesting": "implemented",
  "remarks": "Site verified. All conditions met.",
  "recommendation": "RECOMMENDED", // or CONDITIONAL, NOT_RECOMMENDED
  "geoLocation": {
    "lat": 26.9124,
    "lng": 75.7873,
    "accuracy": 15
  },
  "photos": [ "file_id_1", "file_id_2" ] // IDs from document upload
}
```
