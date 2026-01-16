# Compliance Report API Documentation

## Overview
This document describes the API endpoints required for the Self Compliance Report functionality. The compliance system allows NOC holders to submit annual compliance reports for their groundwater extraction permits.

---

## Table of Contents
1. [Search Application/NOC](#1-search-applicationnoc)
2. [Get NOC Details](#2-get-noc-details)
3. [Submit Compliance Report](#3-submit-compliance-report)
4. [Get Compliance History](#4-get-compliance-history)
5. [Update Compliance Report](#5-update-compliance-report)
6. [Delete Compliance Report](#6-delete-compliance-report)

---

## 1. Search Application/NOC

Search for an application or NOC by application number to retrieve basic details.

### Endpoint
```
GET /api/applications/noc/search
```

### Authentication
Required: Bearer Token

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationNumber | string | Yes | The application number (e.g., "21-4/3482/GJ/IND/2021") |

### Request Example
```bash
curl -X GET "http://localhost:3000/api/applications/noc/search?applicationNumber=21-4/3482/GJ/IND/2021" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "applicationId": "uuid-here",
        "applicationNumber": "21-4/3482/GJ/IND/2021",
        "nocNumber": "CGWA/NOC/IND/ORIG/2021/12345",
        "firmName": "Sunlight Industries Pvt Ltd",
        "projectName": "Industrial Water Supply Project",
        "address": "Plot No. 45, GIDC, Ahmedabad, Gujarat",
        "nocIssueDate": "2021-01-15T00:00:00.000Z",
        "nocExpiryDate": "2025-12-31T00:00:00.000Z",
        "status": "APPROVED",
        "category": "INDUSTRIAL",
        "extractionQuantity": 500,
        "complianceRequired": true
    }
}
```

### Error Responses

**404 Not Found**
```json
{
    "success": false,
    "error": {
        "code": "APPLICATION_NOT_FOUND",
        "message": "No application found with this number"
    }
}
```

**400 Bad Request**
```json
{
    "success": false,
    "error": {
        "code": "INVALID_APPLICATION_NUMBER",
        "message": "Application number format is invalid"
    }
}
```

---

## 2. Get NOC Details

Retrieve detailed information about a specific NOC including compliance requirements.

### Endpoint
```
GET /api/noc/:nocId/details
```

### Authentication
Required: Bearer Token

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nocId | string | Yes | NOC ID or Application ID |

### Request Example
```bash
curl -X GET "http://localhost:3000/api/noc/uuid-here/details" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "nocId": "uuid-here",
        "applicationNumber": "21-4/3482/GJ/IND/2021",
        "nocNumber": "CGWA/NOC/IND/ORIG/2021/12345",
        "applicantDetails": {
            "name": "Mr. Rajesh Kumar",
            "firmName": "Sunlight Industries Pvt Ltd",
            "address": "Plot No. 45, GIDC, Ahmedabad, Gujarat",
            "mobile": "9876543210",
            "email": "contact@sunlightind.com"
        },
        "nocDetails": {
            "issueDate": "2021-01-15T00:00:00.000Z",
            "expiryDate": "2025-12-31T00:00:00.000Z",
            "validityPeriod": "5 Years",
            "status": "ACTIVE"
        },
        "extractionDetails": {
            "approvedQuantity": 500,
            "unit": "m³/day",
            "purpose": "Industrial Use",
            "numberOfWells": 3
        },
        "complianceRequirements": {
            "annualReportRequired": true,
            "frequencyMonths": 12,
            "nextDueDate": "2026-01-15T00:00:00.000Z",
            "conditions": [
                "Install digital flow meters on all wells",
                "Submit quarterly extraction data",
                "Maintain rainwater harvesting structures",
                "Not exceed approved extraction limit"
            ]
        },
        "complianceHistory": [
            {
                "reportId": "uuid-report-1",
                "year": "2024-2025",
                "submittedDate": "2025-01-10T00:00:00.000Z",
                "status": "COMPLIANT",
                "remarks": "All conditions met"
            }
        ]
    }
}
```

---

## 3. Submit Compliance Report

Submit an annual compliance report for a NOC.

### Endpoint
```
POST /api/noc/compliance/submit
```

### Authentication
Required: Bearer Token

### Content Type
`multipart/form-data`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nocId | string | Yes | NOC/Application ID |
| reportingYear | string | Yes | Reporting year (e.g., "2025-2026") |
| complianceStatus | string | Yes | "COMPLIANT" or "NON_COMPLIANT" |
| isRebateClaimed | boolean | No | Whether rebate is claimed |
| remarks | string | No | Additional comments |
| reportFile | file | Yes | PDF file (max 5MB) |
| waterExtractionData | object | No | Quarterly extraction data |

### Request Example
```bash
curl -X POST "http://localhost:3000/api/noc/compliance/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "nocId=uuid-here" \
  -F "reportingYear=2025-2026" \
  -F "complianceStatus=COMPLIANT" \
  -F "isRebateClaimed=true" \
  -F "remarks=All NOC conditions fulfilled" \
  -F "reportFile=@compliance_report_2025.pdf" \
  -F 'waterExtractionData={"q1": 45000, "q2": 43000, "q3": 44500, "q4": 42000}'
```

### Request Body (JSON structure for reference)
```json
{
    "nocId": "uuid-here",
    "reportingYear": "2025-2026",
    "complianceStatus": "COMPLIANT",
    "isRebateClaimed": true,
    "remarks": "All NOC conditions fulfilled",
    "waterExtractionData": {
        "q1": 45000,
        "q2": 43000,
        "q3": 44500,
        "q4": 42000,
        "totalAnnual": 174500,
        "unit": "m³"
    }
}
```

### Success Response (201 Created)
```json
{
    "success": true,
    "data": {
        "reportId": "uuid-report-new",
        "nocId": "uuid-here",
        "reportingYear": "2025-2026",
        "submittedDate": "2026-01-11T13:30:00.000Z",
        "status": "SUBMITTED",
        "complianceStatus": "COMPLIANT",
        "reportFileUrl": "https://storage.example.com/compliance/uuid-report-new.pdf",
        "acknowledgmentNumber": "ACK/2026/00123",
        "nextDueDate": "2027-01-15T00:00:00.000Z"
    },
    "message": "Compliance report submitted successfully"
}
```

### Error Responses

**400 Bad Request - Missing Required Fields**
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Missing required fields",
        "details": {
            "reportingYear": "Reporting year is required",
            "reportFile": "Report file is required"
        }
    }
}
```

**400 Bad Request - Invalid File**
```json
{
    "success": false,
    "error": {
        "code": "INVALID_FILE",
        "message": "Report file must be PDF and under 5MB"
    }
}
```

**409 Conflict - Duplicate Report**
```json
{
    "success": false,
    "error": {
        "code": "DUPLICATE_REPORT",
        "message": "Compliance report for year 2025-2026 already exists"
    }
}
```

---

## 4. Get Compliance History

Retrieve all compliance reports for a specific NOC.

### Endpoint
```
GET /api/noc/:nocId/compliance/history
```

### Authentication
Required: Bearer Token

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nocId | string | Yes | NOC/Application ID |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| year | string | No | Filter by reporting year |

### Request Example
```bash
curl -X GET "http://localhost:3000/api/noc/uuid-here/compliance/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "reports": [
            {
                "reportId": "uuid-report-1",
                "nocId": "uuid-here",
                "reportingYear": "2024-2025",
                "submittedDate": "2025-01-10T00:00:00.000Z",
                "complianceStatus": "COMPLIANT",
                "isRebateClaimed": false,
                "remarks": "All conditions met",
                "reportFileUrl": "https://storage.example.com/compliance/uuid-report-1.pdf",
                "acknowledgmentNumber": "ACK/2025/00089",
                "reviewStatus": "APPROVED",
                "reviewedBy": "DGO Officer",
                "reviewDate": "2025-01-15T00:00:00.000Z",
                "reviewRemarks": "Report accepted"
            },
            {
                "reportId": "uuid-report-2",
                "nocId": "uuid-here",
                "reportingYear": "2023-2024",
                "submittedDate": "2024-01-12T00:00:00.000Z",
                "complianceStatus": "COMPLIANT",
                "isRebateClaimed": true,
                "remarks": "Rainwater harvesting implemented",
                "reportFileUrl": "https://storage.example.com/compliance/uuid-report-2.pdf",
                "acknowledgmentNumber": "ACK/2024/00156",
                "reviewStatus": "APPROVED",
                "reviewedBy": "DGO Officer",
                "reviewDate": "2024-01-20T00:00:00.000Z",
                "reviewRemarks": "Rebate approved"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalReports": 2,
            "limit": 10
        }
    }
}
```

---

## 5. Update Compliance Report

Update an existing compliance report (only allowed before review).

### Endpoint
```
PUT /api/noc/compliance/:reportId
```

### Authentication
Required: Bearer Token

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reportId | string | Yes | Compliance Report ID |

### Content Type
`multipart/form-data`

### Request Body
Same as Submit Compliance Report, but all fields are optional.

### Request Example
```bash
curl -X PUT "http://localhost:3000/api/noc/compliance/uuid-report-new" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "remarks=Updated remarks: Added quarterly data" \
  -F 'waterExtractionData={"q1": 45000, "q2": 43000, "q3": 44500, "q4": 42500}'
```

### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "reportId": "uuid-report-new",
        "nocId": "uuid-here",
        "reportingYear": "2025-2026",
        "submittedDate": "2026-01-11T13:30:00.000Z",
        "lastUpdatedDate": "2026-01-11T14:15:00.000Z",
        "status": "UPDATED",
        "complianceStatus": "COMPLIANT",
        "remarks": "Updated remarks: Added quarterly data"
    },
    "message": "Compliance report updated successfully"
}
```

### Error Responses

**403 Forbidden - Report Already Reviewed**
```json
{
    "success": false,
    "error": {
        "code": "REPORT_LOCKED",
        "message": "Cannot update report that has already been reviewed"
    }
}
```

---

## 6. Delete Compliance Report

Delete a compliance report (only allowed before review).

### Endpoint
```
DELETE /api/noc/compliance/:reportId
```

### Authentication
Required: Bearer Token

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reportId | string | Yes | Compliance Report ID |

### Request Example
```bash
curl -X DELETE "http://localhost:3000/api/noc/compliance/uuid-report-new" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Compliance report deleted successfully"
}
```

### Error Responses

**403 Forbidden - Report Already Reviewed**
```json
{
    "success": false,
    "error": {
        "code": "REPORT_LOCKED",
        "message": "Cannot delete report that has already been reviewed"
    }
}
```

**404 Not Found**
```json
{
    "success": false,
    "error": {
        "code": "REPORT_NOT_FOUND",
        "message": "Compliance report not found"
    }
}
```

---

## Data Models

### Compliance Report Schema
```javascript
{
    reportId: String (UUID),
    nocId: String (UUID),
    applicationNumber: String,
    nocNumber: String,
    reportingYear: String, // "YYYY-YYYY" format
    submittedDate: Date,
    lastUpdatedDate: Date,
    complianceStatus: Enum ['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL'],
    isRebateClaimed: Boolean,
    remarks: String,
    reportFileUrl: String,
    acknowledgmentNumber: String,
    waterExtractionData: {
        q1: Number, // Quarter 1 extraction (m³)
        q2: Number,
        q3: Number,
        q4: Number,
        totalAnnual: Number,
        unit: String
    },
    reviewStatus: Enum ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_NEEDED'],
    reviewedBy: String,
    reviewDate: Date,
    reviewRemarks: String,
    createdBy: String (User ID),
    status: Enum ['DRAFT', 'SUBMITTED', 'UPDATED', 'REVIEWED']
}
```

---

## Business Rules

### Reporting Requirements
1. Annual compliance reports must be submitted within 30 days of the reporting year end
2. Late submissions may incur penalties
3. Reports can only be edited before official review
4. PDF file size limit: 5MB
5. Accepted file format: PDF only

### Compliance Status
- **COMPLIANT**: All NOC conditions are met
- **NON_COMPLIANT**: One or more conditions violated
- **PARTIAL**: Some conditions met, clarification needed

### Rebate Claims
- Rebates may be available for implementing rainwater harvesting
- Rebates require proof documentation
- Rebate approval is subject to officer review

---

## PowerShell Testing Examples

### 1. Search Application
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/applications/noc/search?applicationNumber=21-4/3482/GJ/IND/2021" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

### 2. Get NOC Details
```powershell
$nocId = "uuid-here"
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/noc/$nocId/details" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

### 3. Submit Compliance Report
```powershell
$filePath = "C:\Reports\compliance_2025.pdf"
$uri = "http://localhost:3000/api/noc/compliance/submit"

$form = @{
    nocId = "uuid-here"
    reportingYear = "2025-2026"
    complianceStatus = "COMPLIANT"
    isRebateClaimed = "true"
    remarks = "All conditions fulfilled"
    reportFile = Get-Item -Path $filePath
    waterExtractionData = '{"q1": 45000, "q2": 43000, "q3": 44500, "q4": 42000}'
}

$response = Invoke-RestMethod -Uri $uri `
    -Method POST `
    -Headers $headers `
    -Form $form

$response | ConvertTo-Json -Depth 10
```

### 4. Get Compliance History
```powershell
$nocId = "uuid-here"
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/noc/$nocId/compliance/history?page=1&limit=10" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

### 5. Update Compliance Report
```powershell
$reportId = "uuid-report-new"
$uri = "http://localhost:3000/api/noc/compliance/$reportId"

$form = @{
    remarks = "Updated remarks: Added quarterly extraction data"
    waterExtractionData = '{"q1": 45000, "q2": 43000, "q3": 44500, "q4": 42500}'
}

$response = Invoke-RestMethod -Uri $uri `
    -Method PUT `
    -Headers $headers `
    -Form $form

$response | ConvertTo-Json -Depth 10
```

### 6. Delete Compliance Report
```powershell
$reportId = "uuid-report-new"
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/noc/compliance/$reportId" `
    -Method DELETE `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request completed |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Notes

1. All dates are in ISO 8601 format (UTC)
2. File uploads use multipart/form-data encoding
3. All endpoints require valid JWT authentication
4. Maximum file size for compliance reports: 5MB
5. Supported file format: PDF only
6. Rate limiting: 100 requests per minute per user

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-11 | Initial documentation |
