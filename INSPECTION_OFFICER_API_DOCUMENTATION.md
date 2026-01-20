# Inspection Officer API Documentation

## Overview
This document outlines the API endpoints specifically designed for **Inspection Officers** defined in the SGWA system.
The Inspection Officer is responsible for visiting sites, verifying details against the application, and submitting digital inspection reports with photographic evidence.

- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.
- **Role Requirement**: `INSPECTION_OFFICER` (or `DGO` performing inspection)

---

## 1. Dashboard & Assignments
**Goal**: View assigned site visits and upcoming schedule.

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Get Inspection Dashboard** | `GET` | `/officer/inspection/dashboard` | Returns statistics: Pending Inspections, Completed (This Month), Overdue. |
| **Get Assigned Inspections** | `GET` | `/officer/inspection/my-inspections` | List of applications assigned for inspection. Supports filtering by `status` (SCHEDULED, COMPLETED), `date`. |

### Response Example (Dashboard)
```json
{
  "success": true,
  "data": {
    "stats": {
      "todayCount": 3,
      "pendingCount": 12,
      "completedMonth": 8,
      "overdueCount": 1
    },
    "urgentTasks": [
      {
        "inspectionId": "insp-001",
        "applicationNumber": "RJ/CGWA/NOC/2026/001234",
        "applicantName": "Rajesh Kumar Sharma",
        "location": "Sanganer, Jaipur",
        "scheduledDate": "2026-01-16T10:00:00"
      }
    ]
  }
}
```

---

## 2. Inspection Management

### 2.1 Get Inspection Details
- **Endpoint**: `/officer/inspection/:inspectionId/details`
- **Method**: `GET`
- **Description**: Returns details needed for the site visit: Application Data, Coordinates, Scheduled Date, and specific instructions from DGO.

### 2.2 Start/Check-In Inspection (Optional)
- **Endpoint**: `/officer/inspection/:inspectionId/start`
- **Method**: `POST`
- **Description**: Marks the inspection as "In Progress" and logs the officer's geolocation.
- **Payload**:
  ```json
  {
    "latitude": 26.9124,
    "longitude": 75.7873,
    "timestamp": "2026-01-20T10:00:00Z"
  }
  ```

### 2.3 Upload Site Photographs
- **Endpoint**: `/officer/inspection/:inspectionId/upload-photo`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Description**: Upload evidentiary photos (Site surroundings, well location, existing machinery).
- **Payload**: `file` (Image), `description` (String), `tag` (e.g., "WELL_SITE", "BOUNDARY")

---

## 3. Submitting Reports

### 3.1 Submit Final Inspection Report
- **Endpoint**: `/officer/inspection/:inspectionId/submit`
- **Method**: `POST`
- **Description**: Submits the final digital questionnaire and verification result.
- **Payload**:
  ```json
  {
    "locationMatch": true, // Boolean or "yes"/"no"
    "landUseMatch": true,
    "existingSources": 2, // Number
    "meterInstalled": true,
    "rainwaterHarvesting": "implemented", // implemented, under_construction, not_started
    "plantationStatus": "started",
    "remarks": "Site matches the description. 2 Borewells found as declared.",
    "recommendation": "RECOMMENDED", // RECOMMENDED, CONDITIONAL, NOT_RECOMMENDED
    "geoLocation": {
      "lat": 26.9124,
      "lng": 75.7873,
      "accuracy": 15
    },
    "photos": ["img_id_1", "img_id_2"] // Or file objects if multipart
  }
  ```

### 3.2 Save Draft Report
- **Endpoint**: `/officer/inspection/:inspectionId/save-draft`
- **Method**: `POST`
- **Description**: Autosave functionality for long forms.

---

## 4. History
- **Endpoint**: `/officer/inspection/history`
- **Method**: `GET`
- **Description**: View past inspections completed by this officer.
