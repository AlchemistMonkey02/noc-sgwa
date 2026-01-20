# Enforcement Wing API Documentation

## Overview
This document outlines the API endpoints specifically designed for the **Enforcement Wing**. 
The Enforcement Wing is responsible for the final verification of NOCs, issuing certificates, and monitoring post-NOC compliance.

- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.
- **Role Requirement**: `ENFORCEMENT`

---

## 1. Dashboard
**Goal**: Overview of final approvals, NOC issuance, and compliance stats.

### 1.1 Get Enforcement Dashboard
- **Endpoint**: `/officer/enforcement/dashboard`
- **Method**: `GET`
- **Description**: Returns key statistics for the enforcement officer's dashboard.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalDecisions": 120,
      "pendingFinalApproval": 8, // Applications recommended by SGWA awaiting final NOC
      "approved": 102,
      "rejected": 10,
      "nocIssued": 100
    },
    // Optional: Recent activity or alerts could go here
    "alerts": [] 
  }
}
```

---

## 2. Approval Queue
**Goal**: List applications that have passed DGO and SGWA stages and are waiting for final NOC issuance (or final rejection).

### 2.1 Get Approval Queue
- **Endpoint**: `/officer/enforcement/approval-queue`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Pagination (default 1)
  - `limit`: Items per page (default 10)
  - `search`: Search by application number or name.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "app_123",
        "applicationNumber": "RJ/CGWA/NOC/2026/001234",
        "applicantName": "Rajesh Kumar Sharma",
        "projectName": "ABC Textile Unit",
        "district": "Jaipur",
        "waterRequirement": 150.25,
        "dgoRecommendation": "RECOMMENDED",
        "sgwaRecommendation": "RECOMMENDED_WITH_CONDITIONS",
        "status": "AWAITING_FINAL_APPROVAL",
        "daysInQueue": 2
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

---

## 3. Application Actions
**Goal**: Take final action on an application.

### 3.1 Get Application Details (Enforcement View)
- **Endpoint**: `/officer/enforcement/applications/:id`
- **Method**: `GET`
- **Description**: Returns full application data plus the trail of recommendations (DGO & SGWA).

### 3.2 Issue Final NOC (Approve)
- **Endpoint**: `/officer/enforcement/applications/:id/approve`
- **Method**: `POST`
- **Description**: Finalizes the application and triggers the creation of the Digital NOC Certificate.
- **Payload**:
  ```json
  {
    "remarks": "Final verification done. NOC fees verified.",
    "validityDate": "2029-01-17", // Optional override
    "generateCertificate": true
  }
  ```

### 3.3 Reject Application
- **Endpoint**: `/officer/enforcement/applications/:id/reject`
- **Method**: `POST`
- **Description**: Rejects the application at the final stage (rare, usually for compliance failure or legal issues).
- **Payload**:
  ```json
  {
    "reason": "Fees not paid",
    "remarks": "Applicant failed to deposit NOC issuance charges."
  }
  ```

---

## 4. Compliance Monitoring
**Goal**: Track active NOCs for violations and telemetry data.

### 4.1 Get Compliance List
- **Endpoint**: `/officer/enforcement/compliance`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: `COMPLIANT`, `NON_COMPLIANT`, `NOTICE_ISSUED`
  - `district`: Filter by district.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "nocNumber": "RJ/CGWA/NOC/2025/001101",
        "companyName": "Maruti Textiles",
        "district": "Bhilwara",
        "telemetryInstalled": true,
        "lastTelemetryData": "2026-01-17T10:00:00Z",
        "complianceStatus": "COMPLIANT"
      }
    ]
  }
}
```

### 4.2 Issue Violation Notice
- **Endpoint**: `/officer/enforcement/compliance/:nocId/issue-notice`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "violationType": "OVER_EXTRACTION",
    "description": "Exceeded daily limit by 20% for 3 consecutive days.",
    "deadlineDate": "2026-02-01"
  }
  ```
