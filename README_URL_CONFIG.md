# URL Configuration Usage Guide

## Overview
The global URL configuration is now set up in `src/config/constants.jsx`. This allows you to manage all external URLs in one central location.

## How to Use

### 1. Import the URLs in any component:

```javascript
import { EXTERNAL_URLS, LOGIN_URL, REGISTER_URL } from '../config/constants';
```

### 2. Use the URLs:

**Option A: Using the EXTERNAL_URLS object**
```javascript
const handleLogin = () => {
  window.location.href = EXTERNAL_URLS.LOGIN_URL;
};
```

**Option B: Using individual exports**
```javascript
const handleLogin = () => {
  window.location.href = LOGIN_URL;
};
```

### 3. Example: Using in a Link
```javascript
<a href={EXTERNAL_URLS.LOGIN_URL} target="_blank" rel="noopener noreferrer">
  Login Here
</a>
```

### 4. Example: Using with React Router Navigate
```javascript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const handleRedirect = () => {
    window.location.href = EXTERNAL_URLS.LOGIN_URL;
  };
  
  return <button onClick={handleRedirect}>Go to Login</button>;
};
```

## Changing URLs

To change the URLs in the future, simply edit `src/config/constants.jsx`:

```javascript
export const EXTERNAL_URLS = {
  LOGIN_URL: 'https://new-url.com/login',  // Change here
  REGISTER_URL: 'https://new-url.com/register',  // Change here
};
```

All components using these URLs will automatically use the updated values!

## Current Setup

- **Home Page**: `src/components/HomePage.jsx` - Shows login and register buttons
- **Configuration**: `src/config/constants.jsx` - Stores all external URLs
- **App Router**: `src/App.jsx` - Routes the root path to HomePage

When users click Login or Register on the home page, they will be redirected to:
- Login: https://rgwcma.geoplanetsolution.in/login
- Register: https://rgwcma.geoplanetsolution.in/register
