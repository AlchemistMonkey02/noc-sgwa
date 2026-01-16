# Public Module API Documentation

## Overview
This document outlines the API endpoints accessible to the public (unauthenticated users) in the SGWA Application.
- **Base URL**: `/api`
- **Authentication**: None required for these endpoints.

## Authentication & Access

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/login` | Public Login Endpoint. |
| **POST** | `/auth/register` | User Registration. |
| **POST** | `/auth/forgot-password` | Initiate password reset. |
| **POST** | `/auth/reset-password` | Complete password reset. |

---

## Application Tracking

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/applications/track/:id` | Public Application Status Tracker. |
| **GET** | `/applications/verify-certificate/:id` | Verify validity of an issued NOC/Certificate. |

### Tracking Response Example
```json
{
  "applicationId": "RJ/CGWA/NOC/2026/12399",
  "applicantName": "Hidden for Privacy",
  "status": "UNDER_PROCESS",
  "currentStage": "DGO_INSPECTION",
  "receivedDate": "2026-01-10",
  "expectedCompletion": "2026-02-15"
}
```

---

## Public Information Services

### Master Data (Dropdowns & Forms)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/master/states` | List of States. |
| **GET** | `/master/districts` | List of Districts. |
| **GET** | `/master/tehsils` | List of Tehsils. |
| **GET** | `/master/blocks` | List of Blocks. |
| **GET** | `/master/villages` | List of Villages. |

### Guidelines & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/public/notifications` | List active public notifications/alerts. |
| **GET** | `/public/guidelines` | List downloadable guideline documents. |
| **GET** | `/public/fee-structure` | Get current fee structure details. |

---

## GIS & Open Data

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/public/gis/block-status` | Get safe/critical status for a block. |
| **GET** | `/public/gis/water-level` | Get average water level for a region. |

---

## Know Your EC (Environmental Compensation)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/tools/calculate-ec` | Calculate estimated EC for violations. |

### EC Calculation Payload
```json
{
  "abstractionRate": 500, // m3/day
  "days of violation": 30,
  "areaType": "CRITICAL",
  "projectType": "INDUSTRIAL"
}
```
