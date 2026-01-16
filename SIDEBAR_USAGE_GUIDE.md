# Sidebar Navigation - Usage Guide

## Overview
A modern, responsive side navigation component has been created for the NOC Portal. It includes:
- ✅ Collapsible sidebar (mobile-friendly)
- ✅ Smooth animations and transitions
- ✅ Organized sections with icons
- ✅ Active state highlighting
- ✅ Responsive design (auto-hide on mobile)
- ✅ Help card in footer
- ✅ RGWA theme integration

## Files Created

1. **`Sidebar.jsx`** - Main sidebar component
2. **`sidebar.css`** - Sidebar styles
3. **`LayoutWithSidebar.jsx`** - Reusable layout wrapper component

## Current Implementation

The sidebar is currently implemented in `NOCDashboard.jsx`. Users can:
- Click the hamburger button (☰) to toggle the sidebar
- Navigate to different sections of the portal
- See which page they're currently on (highlighted)

## How to Add Sidebar to Other Pages

### Method 1: Use LayoutWithSidebar Component (Recommended)

```jsx
import LayoutWithSidebar from './components/LayoutWithSidebar';

const YourPage = () => {
    return (
        <LayoutWithSidebar>
            <div className="dashboard-wrapper">
                <div className="container-xl">
                    {/* Your page content here */}
                    <h1>Your Page Title</h1>
                    <p>Page content...</p>
                </div>
            </div>
        </LayoutWithSidebar>
    );
};

export default YourPage;
```

### Method 2: Manual Integration (Like NOCDashboard)

```jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const YourPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            
            <button 
                className="sidebar-toggle-btn" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                ☰
            </button>

            <NOCHeader />

            <div className="dashboard-wrapper"
                style={{
                    marginLeft: window.innerWidth >= 1024 ? '280px' : '0',
                    transition: 'margin-left 0.3s'
                }}
            >
                {/* Your content here */}
            </div>

            <NOCFooter />
        </div>
    );
};
```

## Customization

### Adding New Navigation Items

Edit `Sidebar.jsx` and modify the `navigationItems` array:

```jsx
const navigationItems = [
    {
        section: 'Your Section Name',
        items: [
            {
                path: '/noc/your-route',
                icon: '🎯',
                label: 'Your Page',
                description: 'Short description'
            }
        ]
    }
];
```

### Changing Sidebar Width

In `sidebar.css`, change the width value:

```css
.sidebar {
    width: 280px; /* Change this value */
}
```

Also update the margin in your page components accordingly.

### Disabling Sidebar on Specific Pages

Use the `LayoutWithSidebar` component with `showSidebar={false}`:

```jsx
<LayoutWithSidebar showSidebar={false}>
    {/* Content for page without sidebar */}
</LayoutWithSidebar>
```

## Features

### 1. Responsive Behavior
- **Desktop (≥1024px)**: Sidebar always visible, content shifts right
- **Mobile (<1024px)**: Sidebar hidden by default, opens as overlay

### 2. Navigation Sections
- Dashboard
- NOC Applications
- Rig Operations
- Tools & Calculators
- Compliance
- Information

### 3. Active State
The sidebar automatically highlights the current page based on the URL path.

### 4. Help Card
A help card is displayed at the bottom of the sidebar with a "Get Support" link.

### 5. Smooth Animations
- Hover effects on navigation items
- Smooth transitions for opening/closing
- Icon scaling on active state

## Styling Guidelines

The sidebar follows the RGWA theme:
- Primary color: `var(--color-primary)` - #0c4a6e
- Secondary color: `var(--color-secondary)` - #f97316
- Border color: #e2e8f0
- Background: White
- Text: Slate shades

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ARIA labels for buttons
- Keyboard navigation support
- Focus states for interactive elements
- Proper semantic HTML

## Next Steps

1. Test the sidebar on all pages
2. Add notification badges if needed
3. Integrate with authentication state
4. Add user profile section in sidebar header
5. Connect "Get Support" link to actual support page

## Troubleshooting

**Sidebar not appearing?**
- Check if `sidebar.css` is imported in `noc-portal.css`
- Verify the `Sidebar` component is imported correctly
- Check console for any errors

**Content overlapping?**
- Ensure proper margin-left is applied to main content on desktop
- Check if `window.innerWidth >= 1024` condition is working

**Styling issues?**
- Clear browser cache
- Check CSS import order
- Verify CSS custom properties are defined
