# Eligibility Checker API Documentation

## Overview
This document describes all the APIs required for the Eligibility Checker functionality at `http://localhost:5173/noc/check-eligibility`.

## Base URL
```
http://localhost:3000/api
```

## APIs Required

### 1. Get States
**Endpoint:** `GET /master/states`

**Description:** Fetches the list of states

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "state-uuid",
      "name": "Rajasthan",
      "code": "RJ"
    }
  ]
}
```

---

### 2. Get Districts
**Endpoint:** `GET /master/districts?stateId={stateId}`

**Description:** Fetches districts for a specific state

**Parameters:**
- `stateId` (query, required): ID of the state

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "district-uuid",
      "districtId": "district-uuid",
      "name": "Jaipur",
      "districtName": "Jaipur",
      "code": "JP"
    }
  ]
}
```

---

### 3. Get Blocks
**Endpoint:** `GET /master/blocks?districtId={districtId}`

**Description:** Fetches blocks/assessment units for a specific district

**Parameters:**
- `districtId` (query, required): ID of the district

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "block-uuid",
      "blockId": "block-uuid",
      "name": "Amer",
      "blockName": "Amer",
      "code": "AMR"
    }
  ]
}
```

---

### 4. Get Block Category
**Endpoint:** `GET /tools/eligibility/block-category?districtId={districtId}&blockId={blockId}`

**Description:** Fetches the groundwater category/classification for a specific block

**Parameters:**
- `districtId` (query, required): ID of the district
- `blockId` (query, required): ID of the block

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Over-Exploited",
    "category": "Over-Exploited",
    "description": "Groundwater development exceeds 100% of potential",
    "color": "#dc3545",
    "validityYears": 2,
    "restrictions": [
      "No new industries allowed",
      "Only essential domestic use permitted"
    ]
  }
}
```

**Category Types:**
- **Safe** (🟢): `color: "#10b981"`, validity: 5 years
- **Semi-Critical** (🟡): `color: "#f59e0b"`, validity: 3 years
- **Critical** (🟠): `color: "#f97316"`, validity: 2 years
- **Over-Exploited** (🔴): `color: "#dc3545"`, validity: 1-2 years

---

### 5. Get Utilization Sectors/Purposes
**Endpoint:** `GET /master-data/utilization-purposes`

**Description:** Fetches the list of water utilization sectors

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sector-uuid",
      "name": "Industry",
      "purpose": "Industry",
      "label": "Industry",
      "code": "IND"
    },
    {
      "id": "sector-uuid-2",
      "name": "Agriculture",
      "code": "AGR"
    },
    {
      "id": "sector-uuid-3",
      "name": "Domestic",
      "code": "DOM"
    },
    {
      "id": "sector-uuid-4",
      "name": "Mining",
      "code": "MIN"
    }
  ]
}
```

---

### 6. Get Industry Types
**Endpoint:** `GET /master/industry-types`

**Description:** Fetches the list of industry types

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "industry-uuid",
      "name": "Textile",
      "type": "Textile",
      "label": "Textile",
      "code": "TEX"
    },
    {
      "id": "industry-uuid-2",
      "name": "Chemical",
      "code": "CHM"
    },
    {
      "id": "industry-uuid-3",
      "name": "Food Processing",
      "code": "FDP"
    }
  ]
}
```

---

### 7. Check Eligibility (Main API)
**Endpoint:** `POST /tools/check-eligibility`

**Description:** Checks if a project is eligible for NOC application

**Request Body:**
```json
{
  "stateId": "Rajasthan",
  "districtId": "Jaipur",
  "blockId": "Sanganer",
  "SectorType": "Industry",
  "projectType": "New Project",
  "waterRequirement": 50,
  "industryType": "Textile",
  "isMSME": true,
  "msmeType": "Small",
  "isWetland": false
}
```

**Field Descriptions:**
- `stateId`: **State NAME** (not the actual UUID) - e.g., "Rajasthan"
- `districtId`: **District NAME** (not the actual UUID) - e.g., "Jaipur"
- `blockId`: **Block NAME** (not the actual UUID) - e.g., "Sanganer"
- `SectorType`: Water utilization sector (Note: Capital 'S') - e.g., "Industry", "Domestic Use", "Agriculture"
- `projectType`: "New Project", "Existing Project", or "Expansion"
- `waterRequirement`: Daily water requirement in cubic meters (number)
- `industryType`: Type of industry (optional, required if SectorType is "Industry")
- `isMSME`: Boolean - is the applicant an MSME?
- `msmeType`: "Micro", "Small", or "Medium" (optional, required if isMSME is true)
- `isWetland`: Boolean - is the project in a notified wetland area?

> **Important Note:** Despite the field names `stateId`, `districtId`, and `blockId`, the backend expects the **NAMES** (strings) of these locations, not their database UUIDs. The frontend automatically maps this correctly.

**Response - ELIGIBLE:**
```json
{
  "success": true,
  "data": {
    "status": "ELIGIBLE",
    "title": "NOC Required",
    "message": "You are eligible to apply for NOC.",
    "details": [
      "Block Category: Over-Exploited",
      "Validity: 2 Years",
      "Sector: Industry",
      "Daily Water Requirement: 50 m³/day"
    ],
    "blockInfo": {
      "category": "Over-Exploited",
      "description": "Groundwater development exceeds 100% of potential",
      "color": "#dc3545"
    }
  }
}
```

**Response - EXEMPT:**
```json
{
  "success": true,
  "data": {
    "status": "EXEMPT",
    "title": "Exempted from NOC",
    "message": "As per CGWA guidelines, your project is exempted from NOC requirement. Domestic water usage below 10 m³/day does not require NOC.",
    "details": [
      "Sector: Domestic",
      "Daily Water Requirement: 5 m³/day",
      "Exemption Status: Approved",
      "NOC Requirement: Not Required"
    ],
    "blockInfo": {
      "category": "Safe",
      "description": "Groundwater development is within safe limits",
      "color": "#10b981"
    }
  }
}
```

**Response - BANNED:**
```json
{
  "success": false,
  "data": {
    "status": "BANNED",
    "title": "Not Eligible - Wetland Area",
    "message": "Projects located in Notified Wetland Areas are strictly prohibited from groundwater extraction as per environmental protection guidelines.",
    "details": [
      "Location: Notified Wetland Area",
      "Reason: Environmental Protection",
      "Status: Strictly Prohibited"
    ],
    "blockInfo": {
      "category": "Over-Exploited",
      "description": "Groundwater development exceeds 100% of potential",
      "color": "#dc2626"
    }
  }
}
```

**Response - NOT_ELIGIBLE (Data Not Found):**
```json
{
  "success": true,
  "data": {
    "status": "NOT_ELIGIBLE",
    "title": "Not Eligible",
    "message": "Block not found in classification database",
    "details": [],
    "blockInfo": null
  }
}
```
> **Note:** Use this when the block doesn't exist in your groundwater classification database. The frontend will show a helpful warning message to the user explaining the issue.

**Response - ERROR:**
```json
{
  "success": false,
  "message": "Invalid block ID provided"
}
```

---

## Eligibility Logic (Backend)

The backend should implement the following eligibility checks in order:

### 1. Wetland Check (Highest Priority)
```javascript
if (isWetland === true) {
  return {
    status: "BANNED",
    title: "Not Eligible - Wetland Area",
    message: "Projects in wetland areas are prohibited",
    // ...
  };
}
```

### 2. Exemption Check
```javascript
// Domestic use < 10 m³/day
if (sector === "Domestic" && groundWaterRequirement < 10) {
  return { status: "EXEMPT", ... };
}

// MSME Micro in Safe/Semi-Critical < 15 m³/day
if (isMSME && msmeType === "Micro" && blockCategory in ["Safe", "Semi-Critical"] && groundWaterRequirement < 15) {
  return { status: "EXEMPT", ... };
}

// Add more exemption rules based on CGWA guidelines
```

### 3. Block-Specific Restrictions
```javascript
// Over-Exploited blocks: No new industries
if (blockCategory === "Over-Exploited" && projectType === "New Project" && sector === "Industry") {
  return { status: "BANNED", title: "Not Eligible in Over-Exploited Block", ... };
}

// Critical blocks: Limit based on requirement
if (blockCategory === "Critical" && groundWaterRequirement > 100) {
  return { status: "BANNED", title: "Water Requirement Exceeds Block Limit", ... };
}
```

### 4. Default - Eligible
```javascript
return {
  status: "ELIGIBLE",
  title: "NOC Required",
  message: "You are eligible to apply for NOC.",
  // Include all details
};
```

---

## Frontend Integration

### Component Location
`/src/modules/noc/EligibilityChecker.jsx`

### Route
`/noc/check-eligibility`

### Service Methods Used
```javascript
import { nocApplicationService } from './services/nocApplicationService';

// Fetch dropdown data
await nocApplicationService.getStates();
await nocApplicationService.getDistricts(stateId);
await nocApplicationService.getBlocks(districtId);
await nocApplicationService.getUtilizationSectors();
await nocApplicationService.getIndustryTypes();

// Fetch block info
await nocApplicationService.getBlockCategory(districtId, blockId);

// Check eligibility
await nocApplicationService.checkEligibility(eligibilityData);
```

---

## Error Handling

All APIs should return appropriate HTTP status codes:
- **200**: Success
- **400**: Bad Request (validation errors)
- **404**: Not Found (district/block not found)
- **500**: Internal Server Error

Error Response Format:
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

## Testing

### PowerShell Examples

#### 1. Get States
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/master/states" -Method GET
```

#### 2. Get Districts
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/master/districts?stateId=state-uuid" -Method GET
```

#### 3. Check Eligibility
```powershell
$body = @{
    stateId = "Rajasthan"
    districtId = "Jaipur"
    blockId = "Sanganer"
    SectorType = "Industry"
    projectType = "New Project"
    waterRequirement = 50
    industryType = "Textile"
    isMSME = $true
    msmeType = "Small"
    isWetland = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tools/check-eligibility" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

> **Note:** The field names `stateId`, `districtId`, `blockId` should contain the location **NAMES** (e.g., "Rajasthan", "Jaipur", "Sanganer"), not the database UUIDs.

---

## Notes

1. All dropdown data is fetched dynamically from APIs
2. Block category is fetched automatically when both district and block are selected
3. The eligibility check happens via API call to the backend
4. The frontend displays the result with color-coded UI based on status
5. All IDs (state, district, block) are tracked for API calls
6. The component shows loading states during API calls
7. Error handling is implemented for all API failures
