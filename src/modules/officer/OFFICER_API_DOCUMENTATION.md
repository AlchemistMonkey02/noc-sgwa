# Officer Portal API Documentation

## Overview
This document outlines the API endpoints for the Officer Portal in the SGWA Application.
- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.

## Shared Resources
Accessible by all officer roles (DGO, SGWA, ENFORCEMENT).

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Profile** | GET | `/officer/profile` | Get current officer details. |
| | PUT | `/officer/profile` | Update profile information. |
| **Notifications** | GET | `/officer/notifications` | List notifications with filters. |
| | PUT | `/officer/notifications/:id/read` | Mark a notification as read. |
| **Documents** | POST | `/officer/documents/upload` | Upload a document (Multipart). |
| | GET | `/officer/documents/:id/download` | Download a specific document. |
| | GET | `/officer/documents/:id/view` | View document content. |
| **Master Data** | GET | `/officer/master-data/districts` | Get list of districts. |
| | GET | `/officer/master-data/blocks` | Get blocks for a district. |

---

## DGO Module (District Ground Water Officer)
Responsible for initial review, site inspection, and technical recommendation.

### Dashboard
- **GET** `/officer/dgo/dashboard`
    - Returns statistics (pending, inspected, forwarded) and recent activity.

### Applications
- **GET** `/officer/dgo/applications`
    - Query Params: `status`, `district`, `block`, `search`.
- **GET** `/officer/dgo/applications/:id`
    - Returns full application details, documents, and timeline.

### Inspections
- **POST** `/officer/dgo/applications/:id/schedule-inspection`
    - Payload: `{ "inspectionDate": "YYYY-MM-DD", "officerId": "..." }`
- **POST** `/officer/dgo/applications/:id/inspection-report`
    - Payload: `{ "findings": "...", "coordinates": "...", "photos": [...] }`
- **GET** `/officer/dgo/inspections/:id/report`
    - Get filed inspection report.

### Actions
- **POST** `/officer/dgo/applications/:id/forward`
    - Forward to SGWA.
    - Payload: `{ "recommendation": "APPROVED/CONDITIONAL", "remarks": "..." }`
- **POST** `/officer/dgo/applications/:id/reject`
    - Reject at DGO level.
    - Payload: `{ "reason": "...", "remarks": "..." }`
- **POST** `/officer/dgo/applications/:id/query`
    - Raise query to applicant.
    - Payload: `{ "queryTitle": "...", "description": "..." }`

---

## SGWA Module (State Ground Water Authority)
Responsible for technical review, final recommendation, NOC issuance, and monitoring.

### Dashboard & Statistics
- **GET** `/officer/sgwa/dashboard`
  - **Description**: Returns state-level statistics (pending, approved, rejected) and a list of recent applications.
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "stats": { "totalApplications": 120, "pendingApproval": 15, ... },
        "recentApplications": [ ... ]
      }
    }
    ```

### Applications Management
- **GET** `/officer/sgwa/applications`
  - **Description**: Fetch all applications. Use filters to get specific views (e.g., Pending Review).
  - **Query Params**:
    - `status`: Filter by status (Use `APPROVED_DGO` for Pending Queue).
    - `district`: Filter by district.
  - **Response**: List of application summaries.

- **GET** `/officer/sgwa/applications/:id`
    - **Description**: Get full application details including SGWA specific Data (dgoRecommendation).
    - **Response**: Detailed Application Object.

- **GET** `/officer/sgwa/applications/technical-review`
    - **Description**: Fetch applications pending technical assessment (hydrogeological review).

### Actions & Workflow
- **POST** `/officer/sgwa/applications/:id/approve`
    - **Description**: Final Approval & Issue NOC.
    - **Payload**:
      ```json
      {
        "nocNumber": "RJ/SGWA/NOC/2026/001",
        "validityDate": "2029-01-20",
        "conditions": "Install flow meters...",
        "waterAllocation": 250.00,
        "remarks": "Approved based on technical report."
      }
      ```

- **POST** `/officer/sgwa/applications/:id/reject`
    - **Description**: Reject Application.
    - **Payload**:
      ```json
      {
        "reasonCode": "OVEREXPLOITED_AREA",
        "remarks": "Project located in critical zone."
      }
      ```

- **POST** `/officer/sgwa/applications/:id/query`
    - **Description**: Raise Query to Applicant.
    - **Payload**:
      ```json
      {
        "queryType": "TECHNICAL_INFORMATION",
        "queryTitle": "Clarification on Borewell Depth",
        "description": "Please provide details...",
        "responseDeadline": "2026-02-15"
      }
      ```

### Document Verification
- **POST** `/officer/sgwa/verify-documents-bulk`
    - **Description**: Verify multiple documents at once.
    - **Payload**:
      ```json
      {
        "documentIds": ["doc_123", "doc_456"],
        "status": "ACCEPTED",
        "remarks": "Verified by SGWA Officer"
      }
      ```

- **POST** `/officer/sgwa/applications/:id/assign`
    - **Description**: Assign application to specific technical officer.
    - **Payload**: `{ "officerId": "off_001", "remarks": "..." }`

---

## Enforcement Wing [NEW]
Responsible for final NOC issuance, compliance monitoring, and revocation.

### Dashboard
- **GET** `/officer/enforcement/dashboard`
    - Statistics on Issued NOCs, Compliance Rates, Pending Finals.

### Approval Queue
- **GET** `/officer/enforcement/approval-queue`
    - List applications with status `PENDING_FINAL_APPROVAL`.

### Final Actions
- **POST** `/officer/enforcement/applications/:id/issue-noc`
    - Generate and Issue Final NOC.
    - Payload: 
      ```json
      {
        "nocNumber": "RJ/SGWA/NOC/2026/...",
        "validityYears": 3,
        "waterAllocation": 150.5,
        "conditions": "Standard conditions apply...",
        "remarks": "..."
      }
      ```
- **POST** `/officer/enforcement/applications/:id/reject`
    - Final Rejection.
    - Payload: `{ "reason": "...", "remarks": "..." }`
- **POST** `/officer/enforcement/applications/:id/return`
    - Return to SGWA for clarification.
    - Payload: `{ "remarks": "Clarification needed on..." }`

### Compliance
- **GET** `/officer/enforcement/compliance/stats`
    - Get compliance overview data.
- **GET** `/officer/enforcement/nocs`
    - List of all issued NOCs (Approved List).
- **POST** `/officer/enforcement/nocs/:id/revoke`
    - Revoke an existing NOC.
