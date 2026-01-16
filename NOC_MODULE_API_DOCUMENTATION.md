# NOC Module API Documentation

## Overview
This document outlines the API endpoints for the Applicant (NOC) Module of the SGWA Application.
- **Base URL**: `/api`
- **Authentication**: Bearer Token in `Authorization` header.

## Authentication & Profile

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Login for Applicants. | No |
| **POST** | `/auth/refresh` | Refresh Access Token. | No |
| **GET** | `/auth/profile` | Get current user profile. | Yes |
| **POST** | `/auth/profile/contact/otp` | Request OTP for contact update. | Yes |
| **POST** | `/auth/profile/contact/verify` | Verify OTP and update contact. | Yes |

### Payloads
**Login:**
```json
{
  "username": "user123",
  "password": "password",
  "userType": "APPLICANT" // or service type
}
```

**Contact Update:**
```json
{
  "type": "EMAIL", // or "PHONE"
  "value": "newemail@example.com",
  "otp": "123456" // for verify step
}
```

---

## Company Management

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/companies/register` | Register a new company/entity. | Yes |
| **GET** | `/companies/profile` | Get logged-in company profile. | Yes |

---

## NOC Application Workflow

### Application Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/applications/noc` | Create a new application (Step 1). |
| **GET** | `/applications/noc` | List user's applications (params: `status`, `page`, `limit`). |
| **GET** | `/applications/noc/:id` | Get full application details. |
| **PUT** | `/applications/noc/:id` | Update General Details. |
| **POST** | `/applications/noc/:id/submit` | Final Submission of Application. |

### Application Sections (Step-wise Save)
| Step | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Step 2** | PUT | `/applications/noc/:id/section2` | Save Location Details. |
| **Step 3** | PUT | `/applications/noc/:id/section3` | Save Drinking/Domestic Use Data. |
| **Step 4** | PUT | `/applications/noc/:id/section4` | Save Water Requirement Breakup. |
| **Step 5** | PUT | `/applications/noc/:id/section5` | Save Groundwater Structures. |
| **Step 6** | PUT | `/applications/noc/:id/section6` | Save Document Links. |

### Tracking & Estimates
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/applications/noc/track/:id` | Track Application Status (Public/Private). |
| **GET** | `/applications/noc/processing-estimates` | Get estimated processing time. |
| **GET** | `/applications/noc/dashboard` | Get User Dashboard Stats. |

---

## Master Data (Public/Shared)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/master-data/application-types` | centralized list of app types. |
| **GET** | `/master-data/application-sub-types` | Sub-types based on selection. |
| **GET** | `/master-data/project-types` | Industrial, Infrastructure, Mining. |
| **GET** | `/master-data/utilization-purposes` | Purposes for water use. |
| **GET** | `/master/states` | List of States. |
| **GET** | `/master/districts` | List of Districts (param: `stateId`). |
| **GET** | `/master/tehsils` | List of Tehsils (param: `districtId`). |
| **GET** | `/master/blocks` | List of Blocks (param: `districtId`). |
| **GET** | `/master/assessment-units` | Assessment Units (param: `districtId`). |

---

## Tools & Calculators

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/tools/eligibility/block-category` | Get Block Category (Safe/Critical/etc.). |
| **POST** | `/tools/check-eligibility` | Check Application Eligibility. |
| **POST** | `/tools/fee-calculator` | Calculate detailed fee breakdown. |

### Eligibility Check Payload
```json
{
  "stateId": "Rajasthan",
  "districtId": "Jaipur",
  "blockId": "Sanganer",
  "SectorType": "Industrial",
  "projectType": "Textile",
  "waterRequirement": 100,
  "isMSME": true
}
```

---

## Query Management (Clarifications)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/queries/applications/:appId/queries` | Get queries for an application. |
| **GET** | `/queries/:id` | Get specific query details. |
| **POST** | `/queries/:id/reply` | Reply to a query (JSON or FormData). |

---

## Certificates

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/applications/noc/:id/certificate` | View Certificate Metadata. |
| **GET** | `/applications/noc/:id/certificate/download` | Download Certificate PDF. |

---

## Self-Compliance (AI-Assisted)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/self-compliance/start` | Start a new compliance session. |
| **POST** | `/self-compliance/:id/step` | Submit a compliance step. |
| **POST** | `/self-compliance/:id/upload` | Upload compliance proof. |
| **POST** | `/self-compliance/:id/submit` | Final Submission for AI Validation. |
| **GET** | `/self-compliance/:id/status` | Check AI validation status. |
