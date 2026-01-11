# Navigation Integration Guide

## Adding Complaint Links to Navigation

### For Farmer Dashboard
Add the following link to the farmer navigation menu:

```tsx
<Link href="/farmer/complaints" className="text-gray-700 hover:text-green-600">
  <MessageSquareWarning className="w-5 h-5 mr-2" />
  My Complaints
</Link>
```

### For Officer Dashboard
Add the following link to the officer navigation menu:

```tsx
<Link href="/officer/complaints" className="text-gray-700 hover:text-green-600">
  <AlertTriangle className="w-5 h-5 mr-2" />
  Complaint Dashboard
</Link>
```

## Route Structure

```
/farmer
  /complaints
    /new          - Submit new complaint
    /page.tsx     - View all complaints
    
/officer
  /complaints     - Governance dashboard
  /complaints/[batchId]  - Batch detail view
```

## Sidebar Menu Items

### Farmer Sidebar
- Dashboard
- Verify Seeds
- **My Complaints** ← NEW
- Recommendations
- History
- Chat Support

### Officer Sidebar
- Dashboard
- Analytics
- Fake Registry
- **Complaint Governance** ← NEW
- Settings

## Button Placement

### Farmer Dashboard
Add a "Report Issue" card or button linking to `/farmer/complaints/new` with the `MessageSquareWarning` icon.

### Officer Dashboard
Add a "Complaints" card in the main metrics section linking to `/officer/complaints`.

## Navigation Component Update Example

```tsx
import { MessageSquareWarning, AlertTriangle } from 'lucide-react';

// Farmer sidebar
{user?.role === 'farmer' && (
  <>
    {/* ...existing items... */}
    <SidebarItem 
      label="My Complaints"
      href="/farmer/complaints"
      icon={MessageSquareWarning}
    />
  </>
)}

// Officer sidebar
{user?.role === 'officer' && (
  <>
    {/* ...existing items... */}
    <SidebarItem 
      label="Complaint Dashboard"
      href="/officer/complaints"
      icon={AlertTriangle}
    />
  </>
)}
```

## Quick Action Buttons

### On Farmer Verification Result Page
After successful verification, add:

```tsx
<Button 
  variant="outline" 
  className="rounded-none"
  onClick={() => router.push('/farmer/complaints/new')}
>
  <MessageSquareWarning className="w-4 h-4 mr-2" />
  Report Issue Later
</Button>
```

### On Officer Dashboard
In the metrics card section:

```tsx
<MetricCard 
  title="Pending Complaints"
  value={stats.todayComplaintsCount}
  href="/officer/complaints"
  icon={AlertTriangle}
  color="orange"
/>
```
