# DGO (District Ground Water Officer) Portal API Documentation

## Overview
This document provides a complete reference for all API endpoints required by the **District Ground Water Officer (DGO)**. The DGO is responsible for the initial verification, site inspection scheduling, and technical recommendation of NOC applications.

- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.
- **Role Requirement**: `DGO`

---

## 1. Dashboard & Statistics
**Goal**: provide a high-level overview of workload and pending tasks.

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Get Dashboard Stats** | `GET` | `/officer/dgo/dashboard` | Returns counts for Pending, Under Review, Queries Raised, and Inspection Pending. Also returns officer's assigned District. |

### Response Example
```json
{
  "success": true,
  "data": {
    "stats": {
      "assignedApplications": 45,
      "pendingInspection": 15,
      "underReview": 20,
      "queriesRaised": 5
    },
    "myDistrict": "Jaipur",
    "recentApplications": [ ... ]
  }
}
```

---

## 2. Application Management
**Goal**: View, filter, and manage assigned applications.

### 2.1 List Applications
- **Endpoint**: `/officer/dgo/applications`
- **Method**: `GET`
- **Query Parameters**:
    - `status`: Filter by status (e.g., `SUBMITTED`, `PENDING_VERIFICATION`).
    - `district`: Filter by district (usually pre-filled with officer's district).
    - `block`: Filter by block.
    - `search`: Search by Applicant Name or Application Number.
    - `page`: Page number for pagination.
    - `limit`: Items per page.

### 2.2 Get Application Details
- **Endpoint**: `/officer/dgo/applications/:id`
- **Method**: `GET`
- **Description**: Returns comprehensive details including Applicant Profile, Project Details, Water Requirement, **Document List**, and **Timeline**.

---

## 3. Workflow Actions
**Goal**: Process applications through the approval pipeline.

### 3.1 Verify Documents
- **Endpoint**: `/officer/dgo/applications/:id/verify-documents`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "documents": [
      { "documentId": "doc_123", "status": "ACCEPTED" },
      { "documentId": "doc_456", "status": "REJECTED", "remarks": "Blurry image" }
    ]
  }
  ```

### 3.2 Schedule Site Inspection
- **Endpoint**: `/officer/dgo/applications/:id/schedule-inspection`
- **Method**: `POST`
- **Description**: Assigns the application to an Inspection Officer (or self) for site verification.
- **Payload**:
  ```json
  {
    "inspectionDate": "2026-02-15",
    "officerId": "inspector_001", // Optional, defaults to auto-assign or self
    "instructions": "Verify flow meter installation specifically."
  }
  ```

### 3.3 Raise Query (Clarification)
- **Endpoint**: `/officer/dgo/applications/:id/query`
- **Method**: `POST`
- **Description**: Returns the application to the applicant for clarification. Status changes to `QUERY_RAISED`.
- **Payload**:
  ```json
  {
    "queryTitle": "Incorrect Land Document",
    "description": "The attached land deed does not match the survey number mentioned in the form. Please upload the correct deed.",
    "attachments": [] // Optional file attachments
  }
  ```

### 3.4 Forward to SGWA (Recommendation)
- **Endpoint**: `/officer/dgo/applications/:id/forward`
- **Method**: `POST`
- **Description**: Recommends the application for approval to the State Authority (SGWA). This is the final step for DGO.
- **Payload**:
  ```json
  {
    "recommendation": "APPROVED", // or "CONDITIONAL"
    "remarks": "Site inspection completed. All parameters found within limits. Recommended for NOC.",
    "conditions": ["Install telemetry system within 3 months"] // Optional
  }
  ```

### 3.5 Reject Application
- **Endpoint**: `/officer/dgo/applications/:id/reject`
- **Method**: `POST`
- **Description**: Permanently rejects the application at the district level.
- **Payload**:
  ```json
  {
    "reason": "Site location falls in Notified (Banned) Area.",
    "remarks": "As per mastery data, this block is critical/over-exploited."
  }
  ```

---

## 4. Query & Clarification Management
**Goal**: handle responses from applicants regarding raised queries.

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **List Queries** | `GET` | `/officer/dgo/queries` | List all queries raised by this officer. |
| **Get Query Details** | `GET` | `/officer/dgo/queries/:id` | View query, applicant's reply, and attachments. |
| **Accept Response** | `POST` | `/officer/dgo/queries/:id/accept` | Mark query as resolved. Application returns to queue. |
| **Reject Response** | `POST` | `/officer/dgo/queries/:id/reject` | Applicant must reply again. |

---

## 5. Reports & Analytics
**Goal**: Generate periodic reports for district administration.

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Compliance Report** | `GET` | `/officer/dgo/compliance-report` | List of units with compliance status (Compliant/Non-Compliant). |
| **Generate PDF Report** | `POST` | `/officer/dgo/reports/generate` | Generate a downloadable PDF summary of applications. |

---

## 6. Master Data (Helpers)
**Goal**: Populate dropdowns and validation lists.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/officer/master-data/districts` | List of all districts. |
| `GET` | `/officer/master-data/blocks` | List of blocks (requires `districtId`). |
| `GET` | `/officer/master-data/rejection-reasons` | Standard list of rejection reasons. |
| `GET` | `/officer/master-data/officers` | List of available Inspection Officers for assignment. |
