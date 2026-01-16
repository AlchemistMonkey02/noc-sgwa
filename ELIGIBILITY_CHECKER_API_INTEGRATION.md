# EligibilityChecker API Integration

## Overview
The `EligibilityChecker.jsx` component has been updated to work with the API response format you provided.

## API Response Format

The component now expects and handles responses in this structure:

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

## Response Status Types

### 1. ELIGIBLE
When the project is eligible for NOC application:
- **Status**: `ELIGIBLE`
- **Title**: `NOC Required`
- **Message**: Custom eligibility message
- **Details**: Array of key information points
- **BlockInfo**: Category and description

### 2. EXEMPT
When the project is exempted from NOC:
- **Status**: `EXEMPT`
- **Title**: `Exempted from NOC`
- **Message**: Exemption reason and confirmation
- **Details**: Sector, water requirement, exemption status
- **BlockInfo**: Block category details

### 3. BANNED
When the project is not eligible:
- **Status**: `BANNED`
- **Title**: Reason for ineligibility
- **Message**: Detailed explanation
- **Details**: Location, reason, status
- **BlockInfo**: Block category with error color

## Component Features

### Display Components

#### 1. **Status Icon & Title**
- 🎉 for ELIGIBLE
- ✅ for EXEMPT
- 🚫 for BANNED

#### 2. **Details Section**
Displays all items from the `details` array in styled cards:
```jsx
details: [
    "Block Category: Over-Exploited",
    "Validity: 2 Years",
    "Sector: Industry",
    "Daily Water Requirement: 50 m³/day"
]
```

#### 3. **Block Info Section**
Shows block category with color-coded visual indicator:
- 🟢 Safe
- 🟡 Semi-Critical
- 🟠 Critical
- 🔴 Over-Exploited

#### 4. **Action Buttons**
- **ELIGIBLE**: "🚀 Proceed to Apply for NOC" (redirects to application)
- **All Status**: "🔄 Check Another Location" (resets form)

## Usage Example

When a user fills the eligibility form and clicks "Check Eligibility", the component will:

1. Validate the form data
2. Check for wetland restrictions
3. Check for exemptions
4. Check block-specific rules
5. Set the result with the API response format
6. Display the formatted result with:
   - Status icon and title
   - Main message
   - Details list
   - Block category information
   - Appropriate action buttons

## Sample Result Display

For an ELIGIBLE response, the user will see:
1. Large emoji icon (🎉)
2. Bold title "NOC Required"
3. Message explaining eligibility
4. White card with application details
5. Color-coded block category section
6. Button to proceed to application

## Integration Notes

- The component uses `result?.data || result` to handle both old and new formats
- All status types (ELIGIBLE, EXEMPT, BANNED) now follow the same structure
- The `blockInfo` is optional and will only display if provided
- The `details` array is flexible and can contain any number of items
- Colors are automatically applied based on block category
