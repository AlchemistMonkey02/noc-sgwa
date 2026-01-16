# Eligibility Checker - Quick API Reference

## ✅ Corrected API Endpoints

### Base URL
```
http://localhost:3000/api
```

---

## 📋 All APIs Required

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `/master/states` | Get states list |
| 2 | GET | `/master/districts?stateId={id}` | Get districts for a state |
| 3 | GET | `/master/blocks?districtId={id}` | Get blocks for a district |
| 4 | GET | `/tools/eligibility/block-category?districtId={id}&blockId={id}` | Get block category info |
| 5 | GET | `/master-data/utilization-purposes` | Get water use sectors |
| 6 | GET | `/master/industry-types` | Get industry types |
| 7 | **POST** | **`/tools/check-eligibility`** ⭐ | **Main eligibility check** |

---

## 🔧 Quick Test Commands

### Test Eligibility Check
```bash
curl -X POST http://localhost:3000/api/tools/check-eligibility \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
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
  }'
```

> **Note:** The fields `stateId`, `districtId`, and `blockId` should contain location **NAMES**, not UUIDs. The frontend automatically handles this mapping.

### PowerShell Version
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN"
}

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
  -Headers $headers `
  -Body $body
```

---

## 📊 Expected Response Format

### Success - Eligible
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

### Success - Exempt
```json
{
  "success": true,
  "data": {
    "status": "EXEMPT",
    "title": "Exempted from NOC",
    "message": "Your project is exempted from NOC requirement.",
    "details": [...],
    "blockInfo": {...}
  }
}
```

### Not Eligible - Data Not Found
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
> This response is returned when the backend can't find the block in the groundwater classification database. The frontend displays a helpful warning with suggestions.

### Error - Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route POST /api/tools/check-eligibility not found"
  }
}
```

---

## 🔍 Troubleshooting

### Issue: 404 Not Found
**Problem:** API endpoint doesn't exist on backend  
**Solution:** Ensure backend has route registered:
```javascript
router.post('/tools/check-eligibility', eligibilityController.checkEligibility);
```

### Issue: CORS Error
**Problem:** Frontend can't access backend  
**Solution:** Check CORS settings in backend allow `http://localhost:5173`

### Issue: 401 Unauthorized
**Problem:** Missing or invalid authentication token  
**Solution:** Check that Bearer token is included in Authorization header

### Issue: 400 Bad Request
**Problem:** Invalid request body  
**Solution:** Verify all required fields are present and properly formatted

---

## 🎯 Frontend Integration Status

✅ **Service Method:** `nocApplicationService.checkEligibility()`  
✅ **Component:** `EligibilityChecker.jsx`  
✅ **Route:** `/noc/check-eligibility`  
✅ **Endpoint:** `/tools/check-eligibility` (CORRECTED)  

---

## 📝 Request Body Requirements

### Required Fields
- `stateId` (string): **State name** (e.g., "Rajasthan") - NOT the UUID
- `districtId` (string): **District name** (e.g., "Jaipur") - NOT the UUID
- `blockId` (string): **Block/assessment unit name** (e.g., "Sanganer") - NOT the UUID
- `SectorType` (string): Water utilization sector (Note: Capital 'S')
- `projectType` (string): "New Project", "Existing Project", or "Expansion"
- `waterRequirement` (number): Daily water requirement in m³

### Conditional Fields
- `industryType` (string): Required if SectorType is "Industry"
- `isMSME` (boolean): Is the applicant MSME?
- `msmeType` (string): Required if isMSME is true ("Micro", "Small", "Medium")
- `isWetland` (boolean): Is project in wetland area?

### Frontend to Backend Mapping
The frontend automatically transforms field names:
```javascript
Frontend              →  Backend
-----------------------------------------
state                →  stateId (name)
district             →  districtId (name)
block                →  blockId (name)
sector               →  SectorType
groundWaterRequirement → waterRequirement
```

---

## 🚀 Next Steps

1. **Verify Backend Route:** Ensure `/tools/check-eligibility` exists
2. **Test with Postman/cURL:** Validate API works standalone
3. **Check Authentication:** Ensure token is valid
4. **Test Frontend:** Try the form at `http://localhost:5173/noc/check-eligibility`
5. **Monitor Network Tab:** Check request/response in browser DevTools

---

## 💡 Tips

- Frontend automatically includes auth token from localStorage
- All dropdown data loads dynamically from APIs
- Block category fetches automatically when block is selected
- Loading states show during API calls
- Error messages display if APIs fail
- Form validates required fields before submission
