# Quick Test Guide - Phase 1 Implementation

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Open browser: `http://localhost:5173` (or the port shown in terminal)
   - You'll be redirected to `/noc/login`

3. **Login (simple test login):**
   - Enter any username and password
   - Enter any captcha
   - Click Login

4. **Go to Application Form:**
   - From dashboard, click "New Application"
   - Or directly navigate to: `http://localhost:5173/noc/application`

---

## ⚡ Quick 5-Minute Test

### Test 1: Exemption Engine (2 minutes)

**Step 1:** Fill the form with exempt data:
- **Application Type:** Fresh NOC
- **Project Type:** New Project
- **Ground Water Utilization For:** Agriculture (or "Drinking/Domestic")
- **Daily Water Requirement:** 5 (if Drinking/Domestic)

**✅ Expected Result:** 
- Green banner appears saying "EXEMPT from NOC requirement"
- You should see exemption message

---

### Test 2: Block Classification (2 minutes)

**Step 2:** Location Details:
- **State:** (any state)
- **District:** Select "Kamrup Metropolitan" 
- **Block:** Select "Guwahati"

**✅ Expected Result:**
- Red banner appears (Over-Exploited block)
- Shows: "Block Category: Over-Exploited"
- Shows: "NOC Validity: 2 years"
- Shows restrictions list

**Try another block:**
- **Block:** Select "Boko" (Kamrup district)
- **✅ Expected:** Green banner (Safe block), 5 years validity

---

### Test 3: Industry Classification (1 minute)

Still in Step 2:
- **Ground Water Utilization For:** Select "Industry"
- **Industry Type:** Dropdown appears with categories
- Select "Pharmaceuticals" (polluting industry)

**✅ Expected Result:**
- Yellow warning banner: "Polluting Industry: Additional compliance requirements..."

**Try packaged water:**
- **Industry Type:** Select "Packaged Drinking Water"
- **Block:** Make sure you have Over-Exploited block selected

**✅ Expected Result:**
- Red warning: "New packaged drinking water/mineral water industry not permitted in over-exploited blocks"

---

### Test 4: Enhanced Charge Calculation (1 minute)

**Fill complete form and go to Step 8 (Payment):**

Test Scenario 1:
- **Daily Water Requirement:** 50 m³/day
- **Block:** Guwahati (Over-Exploited)
- **Ground Water Utilization For:** Industry
- Go to Payment step

**✅ Expected Result:**
- Detailed charge breakdown table
- Shows: Application Fee (₹5,000)
- Shows: Groundwater Charges (Annual) - calculated based on rate × quantity × 365
- Shows: GST (18%)
- Shows: Total Amount
- Charges should be HIGHER due to Over-Exploited block

Test Scenario 2:
- **Daily Water Requirement:** 50 m³/day
- **Block:** Boko (Safe)
- **Ground Water Utilization For:** Industry
- Go to Payment step

**✅ Expected Result:**
- Lower charges compared to Over-Exploited block
- Same detailed breakdown structure

---

## 🎯 Visual Checklist

When testing, look for:

### ✅ In Step 1:
- [ ] Exemption banner appears (if applicable)
- [ ] Banner is color-coded (green for exempt)

### ✅ In Step 2:
- [ ] Block category banner appears after selecting block
- [ ] Banner color matches category (Green/Yellow/Orange/Red)
- [ ] Shows validity period (2 or 5 years)
- [ ] Shows restrictions list
- [ ] Industry dropdown appears when "Industry" is selected
- [ ] Industry types are grouped by categories
- [ ] Polluting industry warning appears
- [ ] Packaged water warning appears for over-exploited blocks

### ✅ In Step 8 (Payment):
- [ ] Detailed charge breakdown table
- [ ] Shows Application Fee
- [ ] Shows Groundwater Charges (Annual)
- [ ] Shows GST
- [ ] Shows Total Amount
- [ ] Charges vary by block category

---

## 🔍 Code Files to Verify

Quick check - these files should exist:

1. ✅ `src/modules/noc/utils/exemptionRules.js`
2. ✅ `src/modules/noc/utils/blockClassification.js`
3. ✅ `src/modules/noc/utils/industryClassification.js`
4. ✅ `src/modules/noc/utils/advancedChargeCalculation.js` (NEW - Phase 1)
5. ✅ `src/modules/noc/components/PaymentModule.jsx` (should import advancedChargeCalculation)

---

## 📝 Test Data Summary

**For Quick Testing:**

| Test | Field | Value | Expected |
|------|-------|-------|----------|
| Exemption | Ground Water Utilization | Agriculture | Green exempt banner |
| Block Category | District | Kamrup Metropolitan | - |
| Block Category | Block | Guwahati | Red (Over-Exploited) |
| Block Category | Block | Boko | Green (Safe) |
| Industry | Utilization | Industry | Industry dropdown appears |
| Industry | Industry Type | Pharmaceuticals | Yellow warning |
| Charges | Daily Requirement | 50 m³/day | Detailed breakdown |
| Charges | Block | Over-Exploited | Higher charges |

---

## ❌ Common Issues

**If exemption banner doesn't appear:**
- Check browser console (F12) for errors
- Verify form data is being saved
- Check if exemptionRules.js exists

**If block category doesn't show:**
- Make sure district and block are selected
- Check if block exists in blockClassification.js
- Check browser console for errors

**If charges don't calculate:**
- Make sure all fields are filled (district, block, daily requirement)
- Check browser console for errors
- Verify advancedChargeCalculation.js exists

**If nothing works:**
- Check if `npm run dev` is running
- Check browser console (F12) for any errors
- Verify all files are saved

---

## ✅ Success Criteria

Phase 1 is implemented if:

1. ✅ Exemption banner appears for exempt scenarios
2. ✅ Block category banner appears with correct color
3. ✅ Industry dropdown shows with categories
4. ✅ Polluting industry warning appears
5. ✅ Enhanced charge calculation shows detailed breakdown
6. ✅ Charges vary based on block category
7. ✅ No console errors

---

**If all tests pass → Phase 1 is FULLY IMPLEMENTED! ✅**


