# GitHub Copilot Custom Agent Instructions
## AI-Based Fake Seed & Fertilizer Detection System

You are an **expert full-stack engineer** building a production-ready **Next.js application** for agricultural product verification. Generate complete, working code that matches this specification exactly.

---

## Stack & Constraints

**Required Technologies:**
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS + shadcn/ui components (all UI elements)
- Lucide React for all icons
- Supabase (Auth, PostgreSQL, Storage)
- Recharts for visualizations
- Framer Motion for animations
- Server Actions for API logic

**Critical Rules:**
- Generate complete, production-ready code (no placeholders)
- Use actual domain terminology (never "lorem ipsum")
- Keep implementations hackathon-appropriate (no ML training, no complex GIS)
- Enforce type safety throughout
- Follow mobile-first responsive design

---

## User Roles & Permissions

### Farmer Role
Can: Upload images, view personal verification history, get seed recommendations, use AI chat assistant
Cannot: Access analytics or other users' data

### Government Officer Role
Can: View aggregated analytics, district trends, flagged products
Cannot: Upload images or access individual farmer data

**Implementation:** Use Supabase RLS policies and role-based UI rendering.

---

## Application Routes

### Authentication
- `/login` - Email/password login with role detection
- `/register` - New user signup with role selection
- `/` - Landing page with role-based redirect

### Farmer Interface (`/farmer/*`)

**`/farmer/dashboard`**
Display cards:
- Total verifications count
- Recent verification status
- Average confidence score
- Quick upload button

**`/farmer/verify`**
Multi-step verification flow:
1. Image upload with preview
2. Crop type selector (Rice, Wheat, Cotton, etc.)
3. District dropdown
4. Submit with loading state
5. Results display:
   - Status badge (Genuine/Suspicious/Fake)
   - Confidence meter (0-100%)
   - Extracted text from label
   - Risk explanation in simple language
   - Action recommendations

**`/farmer/recommendations`**
Seed advisory interface:
- Crop and district filters
- 2-3 recommendation cards showing:
  - Certified variety name
  - Issuing authority
  - Suitability explanation
  - Government certification badge

**`/farmer/chat`**
AI guidance chat:
- Message history
- Context-aware responses using verification data
- Clear, actionable farming advice
- No fabricated information

### Officer Interface (`/officer/*`)

**`/officer/dashboard`**
Analytics overview:
- Total verifications metric
- Genuine vs Fake pie chart
- Daily verification trend (line chart)
- Top 5 flagged brands table

**`/officer/analytics`**
Deep analytics:
- District-wise verification heatmap (grid-based)
- Date range and district filters
- High-risk products table with sorting
- Export data button

---

## Design System & UI Standards

### Color Palette (Dark Green Professional Theme)
```typescript
// Add to tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#0d4a2d', // Dark green
    50: '#e8f5ed',
    100: '#c7e6d3',
    200: '#a3d6b8',
    300: '#7ec69c',
    400: '#5fb986',
    500: '#40ad70',
    600: '#339d62',
    700: '#1f8850',
    800: '#0d4a2d', // Primary
    900: '#0a3821',
  },
  background: {
    DEFAULT: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e5e5e5',
  },
  text: {
    primary: '#0a0a0a',
    secondary: '#525252',
    tertiary: '#737373',
  },
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  border: '#e5e5e5',
}
```

### Typography
- Font: System font stack (Inter or Roboto fallback)
- Headings: font-semibold, tracking-tight
- Body: font-normal, leading-relaxed
- Use shadcn/ui typography utilities

### Design Principles (Material Design Inspired)

**NO Rounded Corners:**
- Set `rounded-none` on ALL components
- Override shadcn defaults: `className="rounded-none"`
- Cards, buttons, inputs, modals - all square edges

**NO Gradients:**
- Use solid colors only
- Flat, professional aesthetic
- Depth through elevation (shadows) not gradients

**Elevation System (Material-inspired):**
```css
/* Use these shadow classes */
.elevation-1: shadow-sm (1dp)
.elevation-2: shadow-md (2dp)
.elevation-4: shadow-lg (4dp)
.elevation-8: shadow-xl (8dp)
```

**Spacing System:**
- Use 8px grid: space-2, space-4, space-6, space-8, space-12, space-16
- Consistent padding: p-6 for cards, p-4 for smaller components
- Generous whitespace for professional look

### Component Specifications

**All components MUST use:**
- shadcn/ui components as base (Button, Card, Table, Dialog, etc.)
- Lucide React icons exclusively
- `rounded-none` override
- Framer Motion for animations

**Button Variants:**
```tsx
// Primary
<Button variant="default" className="rounded-none bg-primary-800 hover:bg-primary-900">

// Secondary  
<Button variant="outline" className="rounded-none border-2 border-primary-800">

// Ghost
<Button variant="ghost" className="rounded-none hover:bg-primary-50">

// Icon buttons
<Button variant="ghost" size="icon" className="rounded-none">
  <IconName className="h-5 w-5" />
</Button>
```

**Card Design:**
```tsx
<Card className="rounded-none shadow-md border-none">
  <CardHeader className="border-b border-border pb-4">
    <CardTitle className="text-xl font-semibold text-text-primary">
  </CardHeader>
  <CardContent className="pt-6">
</Card>
```

**Input Fields:**
```tsx
<Input 
  className="rounded-none border-2 focus:border-primary-800 focus:ring-0"
  placeholder="..."
/>
```

**Data Tables:**
- Use shadcn Table component
- Header: bg-background-secondary, font-semibold
- Rows: hover:bg-background-secondary transition
- Borders: border-b border-border
- No alternating row colors (keep clean)

### Animation Guidelines (Framer Motion)

**Subtle Animations Only:**
```tsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>

// Hover effects on cards
<motion.div
  whileHover={{ y: -2 }}
  transition={{ duration: 0.2 }}
>

// Button press
<motion.button
  whileTap={{ scale: 0.98 }}
>

// List items stagger
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.05 }}
>
```

**Animation Rules:**
- Duration: 0.2-0.3s maximum
- Easing: "easeOut" or "easeInOut"
- No bounce, no spring animations
- Use for: page entry, hover states, micro-interactions
- Avoid: excessive movement, distracting effects

### Icon Usage (Lucide React)

**Consistent Icon Sizing:**
- Small: `className="h-4 w-4"` (inline text)
- Medium: `className="h-5 w-5"` (buttons, cards)
- Large: `className="h-6 w-6"` (headers, important actions)
- XL: `className="h-8 w-8"` (empty states, features)

**Recommended Icons:**
- Upload: `<Upload />`
- Check/Success: `<CheckCircle2 />`
- Warning: `<AlertTriangle />`
- Error: `<XCircle />`
- Info: `<Info />`
- Search: `<Search />`
- Filter: `<Filter />`
- Menu: `<Menu />`
- User: `<User />`
- Dashboard: `<LayoutDashboard />`
- Charts: `<BarChart3 />`, `<PieChart />`, `<LineChart />`
- Settings: `<Settings />`
- Logout: `<LogOut />`
- Image: `<Image />`
- Download: `<Download />`
- Calendar: `<Calendar />`
- Map: `<MapPin />`

**Icon Color:**
- Primary actions: `className="text-primary-800"`
- Secondary: `className="text-text-secondary"`
- Success: `className="text-success"`
- Warning: `className="text-warning"`
- Error: `className="text-error"`

### Layout Structure (Material Dashboard Inspired)

**Dashboard Layout:**
```tsx
<div className="flex h-screen bg-background">
  {/* Sidebar */}
  <aside className="w-64 border-r border-border bg-white">
    {/* Navigation */}
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 overflow-y-auto">
    {/* Top Bar */}
    <header className="h-16 border-b border-border bg-white px-6 flex items-center justify-between">
    
    {/* Page Content */}
    <div className="p-6 space-y-6">
      {/* Content Grid */}
    </div>
  </main>
</div>
```

**Grid System:**
- Dashboard cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Content areas: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- Always use gap-6 for professional spacing

**Navigation Sidebar:**
- Fixed width: w-64
- White background
- Border right
- Nav items: hover:bg-background-secondary transition-colors
- Active state: bg-primary-50 border-l-4 border-primary-800
- Icons + labels always visible

**Top Bar:**
- Height: h-16
- Border bottom
- Contains: breadcrumbs, search, user menu
- Right-aligned actions

---

## Component Library (Build These)

### Core Components
- `<ImageUploader />` - Drag-drop image upload with preview (use shadcn/ui, Lucide Upload icon)
- `<ConfidenceMeter value={85} />` - Linear progress bar (shadcn Progress, no rounded)
- `<VerificationBadge status="genuine" />` - Badge component (shadcn Badge, rounded-none)
- `<SeedRecommendationCard />` - Card with shadcn Card component
- `<ChatInterface />` - Message list + Input (shadcn ScrollArea, Input, Button)
- `<StatCard title value icon />` - Dashboard metric card (Card + Lucide icon)
- `<DistrictHeatmap data />` - Grid-based visualization (custom grid with hover states)
- `<ProtectedRoute role />` - Role-based access wrapper
- `<DashboardLayout />` - Material-inspired layout with sidebar + top bar
- `<DataTable />` - shadcn Table with sorting, filtering
- `<EmptyState />` - Centered message with Lucide icon for empty data
- `<LoadingSpinner />` - Simple spinner (Lucide Loader2 with animate-spin)

### Component Implementation Standards

**All components must:**
- Import from shadcn/ui first
- Use Lucide React for icons
- Override with `className="rounded-none"` 
- Include Framer Motion for entry/hover animations
- Follow Material elevation system
- Use semantic color tokens (primary-800, text-primary, etc.)
- Be fully typed with TypeScript
- Include proper accessibility attributes

**Example Component Template:**
```tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-none shadow-md border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">{title}</p>
              <p className="text-3xl font-semibold text-text-primary">{value}</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center bg-primary-50 text-primary-800">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### Styling Guidelines
- Use green dark (#0d4a2d) for all primary actions, active states, success indicators
- Use solid colors only (no gradients anywhere)
- All elements: `rounded-none` (square corners everywhere)
- Shadows for elevation: shadow-sm, shadow-md, shadow-lg, shadow-xl
- Maintain high contrast for accessibility
- Agricultural theme with professional business aesthetic
- Clean, minimal, data-focused design

---

## Database Schema

```typescript
// Tables to implement against

users {
  id: uuid (primary key)
  email: string
  role: 'farmer' | 'officer'
  district: string
  created_at: timestamp
}

products {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  image_url: string
  brand_name: string
  detected_text: text
  verification_status: 'genuine' | 'suspicious' | 'fake'
  confidence: number (0-100)
  crop_type: string
  district: string
  created_at: timestamp
}

seed_registry {
  id: uuid (primary key)
  crop_type: string
  region: string
  variety_name: string
  issuing_authority: string
  description: text
}

verification_logs {
  id: uuid (primary key)
  product_id: uuid (foreign key)
  status: string
  risk_score: number
  district: string
  verified_at: timestamp
}

chat_messages {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  message: text
  response: text
  context: jsonb
  created_at: timestamp
}
```

---

## API Implementation

### Server Actions (in `app/actions/`)

**`uploadAndVerify(formData: FormData)`**
- Upload image to Supabase Storage
- Extract text via OCR (mock Google Vision API structure)
- Run verification rules (check brand against known fakes, text consistency)
- Calculate confidence score
- Store result in products table
- Return verification object

**`getSeedRecommendations(crop: string, district: string)`**
- Query seed_registry table
- Apply regional filtering
- Return 2-3 top matches
- Include certification info

**`getChatResponse(message: string, userId: string)`**
- Fetch user's recent verifications for context
- Generate response (mock LLM structure with agricultural knowledge)
- Store in chat_messages
- Return response text

**`getAnalytics(district?: string, dateRange?: DateRange)`**
- Aggregate verification_logs
- Calculate metrics (total, fake%, trends)
- Return structured data for charts

### Verification Logic
Implement rule-based checks:
- Brand name against blacklist
- Text extraction quality score
- Label format validation
- Confidence threshold: <60% = Fake, 60-80% = Suspicious, >80% = Genuine

---

## File Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── farmer/
│   ├── dashboard/
│   ├── verify/
│   ├── recommendations/
│   └── chat/
├── officer/
│   ├── dashboard/
│   └── analytics/
├── actions/
│   ├── verification.ts
│   ├── recommendations.ts
│   └── chat.ts
├── api/
│   └── webhooks/
components/
├── ui/ (shadcn components)
├── farmer/
└── officer/
lib/
├── supabase/
├── utils/
└── constants/
types/
└── index.ts
```

---

## Quality Standards

### Code Quality
- Every component must be fully typed
- Use React Server Components where possible
- Client components only when needed (interactivity, Framer Motion, hooks)
- Implement proper error boundaries
- Add loading states for async operations
- **Always use shadcn/ui components (Button, Card, Input, Table, Dialog, etc.)**
- **All icons must be from Lucide React**
- **All interactive elements must have Framer Motion animations**
- **Apply `rounded-none` to override any default rounded corners**

### UX Requirements
- Show clear feedback for all actions
- Disable buttons during processing
- Display error messages in user-friendly language
- Use skeleton loaders for content
- Implement optimistic updates where appropriate

### Security
- Never expose API keys in client code
- Validate all inputs server-side
- Use Supabase RLS for data access control
- Sanitize user-uploaded content
- Rate limit verification requests

---

## Mock Data Strategy

For hackathon/development without real APIs:

**OCR Response:**
```typescript
{ detected_text: "Brand: XYZ Seeds\nBatch: 2024-ABC\nMRP: ₹500", confidence: 0.85 }
```

**LLM Response:**
```typescript
{ response: "Based on your recent verification, this product shows genuine characteristics. The packaging matches official standards and the batch number is verifiable.", reasoning: "..." }
```

**Seed Recommendations:**
Use static seed_registry data for common crops (Rice: BPT-5204, Wheat: HD-2967, etc.)

---

## Testing Checklist

Before considering any page complete, verify:
- [ ] Page renders without errors
- [ ] All components use shadcn/ui as base
- [ ] All icons are from Lucide React
- [ ] No rounded corners anywhere (`rounded-none` applied)
- [ ] No gradients used (solid colors only)
- [ ] Framer Motion animations on interactive elements
- [ ] Dark green (#0d4a2d) used for primary theme
- [ ] Material Design elevation system followed
- [ ] Form submissions work end-to-end
- [ ] Role-based access is enforced
- [ ] Mobile layout is functional
- [ ] Loading and error states display properly
- [ ] Data persists to Supabase correctly
- [ ] TypeScript compiles without errors
- [ ] Professional business aesthetic maintained

---

## Output Expectations

When generating code:
1. Start with the data models and types
2. Build reusable components
3. Implement authentication flow
4. Create farmer pages (most critical)
5. Create officer pages
6. Add polish and error handling

Each generated file should be **complete and runnable**. No TODOs, no placeholder comments, no incomplete functions.

This is a **governance technology demo** that judges will evaluate on completeness, UX quality, and real-world applicability.

---

**Begin implementation systematically. Generate production-ready code that demonstrates technical competence and domain understanding.**