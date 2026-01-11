# Farmer Complaint & Performance Feedback System

## Overview

The Farmer Complaint & Performance Feedback System is a post-usage product quality tracking module that allows farmers to report seed quality issues and enables government officers to detect widespread batch failures through crowd-sourced feedback.

**Core Philosophy**: "The Field is the Lab." While AI validates the packaging, this system validates the contents based on actual agricultural performance.

## Architecture

### Database Schema

#### `product_complaints` Table
Stores individual complaint reports from farmers.

- `id`: UUID, primary key
- `user_id`: UUID, references auth user
- `batch_number`: Batch identifier (VARCHAR 100)
- `brand_name`: Seed brand name
- `crop_type`: Type of crop (e.g., Paddy, Wheat)
- `district`: Geographic location of the farm
- `issue_type`: Type of complaint (ENUM):
  - `poor_germination`: Seeds fail to germinate
  - `stunted_growth`: Plants show slow growth
  - `no_yield`: No harvest or very low yield
  - `pest_susceptibility`: Plants easily affected by pests
  - `physical_impurity`: Physical impurities in seed packet
  - `other`: Other issues
- `description`: Detailed description of the issue
- `days_since_sowing`: Days elapsed when issue was noticed
- `severity_score`: 1-5 rating of issue severity
- `field_image_url`: Optional photo evidence
- `status`: `open`, `investigating`, or `resolved`
- `created_at`, `updated_at`: Timestamps

#### `batch_risk_registry` Table
Aggregated stats for quick officer dashboard queries.

- `batch_number`: Primary key
- `brand_name`: Batch brand
- `total_complaints`: Count of complaints
- `unique_districts`: Number of affected districts
- `risk_level`: `normal` (<3 complaints), `suspicious` (3-5 or 2+ districts), `high_risk` (>5)
- `last_complaint_at`: Most recent complaint timestamp
- `updated_at`: Last update time

**Automatic Update**: Trigger function updates `batch_risk_registry` whenever a complaint is inserted, implementing the **1-3-5 Risk Rule**.

### Risk Flagging Logic (1-3-5 Rule)

Complaints automatically trigger risk assessment:

| Complaints | Unique Districts | Risk Level |
|------------|------------------|-----------|
| < 3       | Any              | Normal    |
| 3-5       | Any              | Suspicious|
| > 5       | Any              | High Risk |
| Any       | > 1              | Suspicious|
| > 5       | Any              | High Risk |

## Features

### Farmer Interface

#### `/farmer/complaints/new` - Submit Complaint
- **Option A: Select from History** - Choose recently verified packets
- **Option B: Manual Entry** - Enter batch details manually
- **Form Fields**:
  - Batch Number (required)
  - Brand Name (required)
  - Crop Type (required)
  - District (required)
  - Issue Type dropdown (required)
  - Description textarea
  - Days Since Sowing
  - Severity Score (1-5)
- **Success State** - Confirmation message with batch number

#### `/farmer/complaints` - My Complaints List
- View all submitted complaints
- See complaint status (`open`, `investigating`, `resolved`)
- Card-based layout with issue details
- Stats showing open, investigating, and resolved counts

### Officer Interface

#### `/officer/complaints` - Governance Dashboard
**Top Metrics**:
- High Risk Batches Count
- Today's Complaint Count
- Worst Performing District

**Risk Tables**:
1. **Critical: High Risk Batches** (>5 complaints) - Red border
2. **Warning: Suspicious Batches** (3-5 or multi-district) - Orange border
3. **Normal: Compliant Batches** (<3 complaints) - Green border

**Features**:
- Sortable by risk level (High Risk first)
- One-click access to batch details
- Quick-view stats

#### `/officer/complaints/[batchId]` - Batch Detail View
**Header**:
- Batch number & brand
- Risk level badge
- Key metrics (total complaints, districts, avg severity, resolved count)

**Geographic Distribution**:
- Map or list showing complaints per district
- District-wise complaint counts

**Issue Analysis**:
- Breakdown by issue type (pie/bar chart)
- Percentage distribution

**Management Actions**:
- "Flag for Lab Testing" button
- "Suspend Batch" button
- "Generate Report" button

**Evidence Grid**:
- List of individual complaints
- Filterable by status/district

## Components

### `RiskLevelBadge`
- Props: `level` (normal, suspicious, high_risk), `size` (sm, md, lg)
- Colors:
  - Normal: Green (#10b981)
  - Suspicious: Orange (#f97316)
  - High Risk: Red (#ef4444)
- Square corners, no rounding

### `ComplaintCard`
- Displays individual complaint with:
  - Batch number & brand
  - Issue type badge
  - Severity score
  - Time since reported
  - Status badge
  - District information

### `ComplaintTrendChart`
- Recharts-based line/bar chart
- Shows complaint trends over time
- Breaks down by issue type
- Custom tooltip with issue details

## Server Actions

### `submitComplaint(data: ComplaintSubmission)`
- Inserts complaint
- Automatically updates `batch_risk_registry` via trigger
- Revalidates dashboard paths
- Returns success/error

### `getUserComplaints()`
- Fetches complaints for current user
- Returns array of `ProductComplaint`

### `getHighRiskBatches()`
- Fetches all batches from `batch_risk_registry`
- Sorted by complaint count descending
- Returns array of `BatchRiskRegistry`

### `getBatchComplaints(batchNumber: string)`
- Fetches all complaints for a specific batch
- Used in officer batch detail view

### `updateComplaintStatus(complaintId, status)`
- Officer-only action
- Updates complaint status (`open`, `investigating`, `resolved`)

### `getComplaintStats()`
- Returns dashboard metrics:
  - `highRiskBatchesCount`
  - `todayComplaintsCount`
  - `worstPerformingDistrict`

## Design System

### Colors
- Primary (Dark Green): `#0d4a2d`
- High Risk (Red): `#ef4444`
- Suspicious (Orange): `#f97316`
- Normal (Green): `#10b981`

### Components
- No rounded corners (`rounded-none`)
- Sharp borders and clean lines
- Professional, government-style appearance

### Icons (Lucide React)
- `MessageSquareWarning` - Complaint icon
- `AlertCircle` - Alert/warning
- `CheckCircle` - Resolved/success
- `MapPin` - Geographic location
- `TrendingUp` - Metrics
- `ChevronLeft` - Navigation

## Database Migration

Run the migration to set up the schema:

```bash
supabase db push
```

This migration:
1. Creates `complaint_issue_type` enum
2. Creates `product_complaints` table with RLS policies
3. Creates `batch_risk_registry` table
4. Creates indexes for fast querying
5. Creates trigger function for automatic risk calculation

## Integration Checklist

- [x] Database schema created
- [x] Server actions implemented
- [x] Farmer complaint submission page
- [x] Farmer complaints list page
- [x] Officer complaints dashboard
- [x] Officer batch detail page
- [x] Component library (badges, cards, charts)
- [ ] Email notifications for high-risk batches
- [ ] Lab testing workflow
- [ ] Batch suspension mechanism
- [ ] Admin approval workflow
- [ ] Performance metrics dashboard

## Usage Examples

### Submit a Complaint

```typescript
import { submitComplaint } from '@/app/actions/complaints';

const result = await submitComplaint({
  batchNumber: 'RICE-2024-001',
  brandName: 'GreenSeeds Ltd',
  cropType: 'Paddy',
  district: 'District A',
  issueType: 'poor_germination',
  description: 'Only 40% seeds germinated',
  daysSinceSowing: 14,
  severityScore: 4,
});
```

### Fetch High Risk Batches

```typescript
import { getHighRiskBatches } from '@/app/actions/complaints';

const batches = await getHighRiskBatches();
// Returns array of batches sorted by complaint count
```

### Get Batch Details

```typescript
import { getBatchComplaints } from '@/app/actions/complaints';

const complaints = await getBatchComplaints('RICE-2024-001');
// Returns all complaints for that batch
```

## Future Enhancements

1. **Notification System** - Alert officers when risk level increases
2. **Lab Testing Integration** - Link complaints to lab verification
3. **Batch Suspension** - Automatically prevent distribution of high-risk batches
4. **Geographic Heatmap** - Visual representation of complaint hotspots
5. **ML-based Pattern Detection** - Identify defective batches from early complaints
6. **Farmer Rewards** - Incentivize accurate reporting
7. **Supply Chain Traceability** - Link complaints back to seed suppliers

## Technical Notes

- All dates use TIMESTAMPTZ for timezone-aware storage
- RLS policies ensure farmers see only their complaints
- Officers have full read/write access
- Batch risk registry automatically updates via database trigger
- All timestamps in UTC for consistency
