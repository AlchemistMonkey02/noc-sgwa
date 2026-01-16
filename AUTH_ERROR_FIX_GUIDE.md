# Authentication Error - Quick Fix Guide

## The Problem
You're seeing 401 (Unauthorized) errors because:
1. Your stored auth tokens reference a user that no longer exists in the database
2. The database was likely reset, removing all previous users
3. Old tokens in browser localStorage are now invalid

## Quick Fix - Clear Browser Storage

### Option 1: Browser Console (Easiest)
1. Open your browser DevTools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Paste this command and press Enter:
```javascript
localStorage.clear(); location.reload();
```

This will clear all stored data and reload the page, allowing you to log in fresh.

### Option 2: Manual Clear
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. In left sidebar, expand **Local Storage**
4. Click on `http://localhost:5173`
5. Click "Clear All" button or delete individual items:
   - `nocUser`
   - `authToken`
   - `refreshToken`
   - `user`
   - `userType`
6. Reload the page (F5)

### Option 3: Incognito/Private Window
1. Open a new Incognito/Private window
2. Navigate to `http://localhost:5173`
3. Login with fresh credentials

---

## What Was Fixed

The code has been updated with automatic error handling:

### 1. **Auto Token Cleanup**
When you get a 401 error with `USER_NOT_FOUND`, the app now automatically:
- Clears invalid tokens from localStorage
- Redirects you to the login page
- Shows a clear error message

### 2. **Better Error Messages**
Login errors now show specific messages:
- "Invalid credentials. Please check your username and password."
- "Network error. Please check your connection and try again."
- "Your session has expired or your account no longer exists."

### 3. **Graceful Degradation**
Instead of getting stuck in a loop, the app will:
- Detect invalid sessions
- Clean up automatically
- Redirect to login page
- Allow you to login fresh

---

## After Clearing Storage

1. **Register a new account** at `/noc/register`
   - Or use the test account (if it exists in your database)

2. **Login** at `/noc/login` or the public landing page

3. **Everything should work** - your dashboard will load properly with the new valid tokens

---

## Prevention

To avoid this issue in the future:
- Don't reset the backend database while logged in
- Or, after resetting the database, always clear browser storage
- The new auto-cleanup will help prevent infinite loops

---

## Still Having Issues?

If you still see errors after clearing storage:

### Check Backend Server
```bash
# Make sure your backend is running
# Navigate to your backend directory and run:
npm start
# or
node server.js
```

### Check Database
```bash
# Make sure MongoDB is running
# Check if you can connect to your database
```

### Check Network
- Open DevTools → Network tab
- Try logging in
- Look for the `/api/auth/login` request
- Check if it's reaching the server
- Check the response status and body

---

## Test After Fix

1. Clear localStorage using Option 1 above
2. Navigate to `http://localhost:5173`
3. Register a new account
4. Login with that account
5. Dashboard should load successfully with your data

**Note:** The automatic token cleanup is now active, so future expired sessions will be handled gracefully!
