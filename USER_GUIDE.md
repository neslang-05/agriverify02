# AgriVerify — Complete User Guide

AgriVerify is an AI-powered platform for detecting fake and counterfeit agricultural inputs (seeds, fertilizers, pesticides). This guide covers every page and feature for all three user roles: **Farmer**, **Officer**, and **Admin**.

---

## Getting Started

### Register (`/register`)

New users can sign up from the registration page.

**Fields to fill in:**
- **Full Name** — your complete name
- **Email** — a valid email address used to log in
- **Password** — minimum 6 characters
- **Role** — choose **Farmer** (for end users buying seeds) or **Government Officer** (for inspection staff)

After submitting, you will be redirected to your role-specific dashboard automatically.

> Note: Admin accounts cannot be self-registered. They are provisioned by an existing administrator.

### Login (`/login`)

Enter your registered email and password to sign in. The system will route you to the correct portal based on your role. Farmers go to `/farmer/dashboard`, officers to `/officer/dashboard`, and admins to `/admin/dashboard`.

---

## Farmer Portal

Farmers access all features from a sidebar with the following navigation:

| Nav Item | Page |
|---|---|
| Dashboard | `/farmer/dashboard` |
| Quality Check | `/farmer/quality` |
| Verify Product | `/farmer/verify` |
| Recommendations | `/farmer/recommendations` |
| My Complaints | `/farmer/complaints` |
| AI Assistant | `/farmer/chat` |
| My Profile | `/farmer/profile` |

A language translation widget (Google Translate) is available in the top-right header of every page.

---

### 1. Dashboard (`/farmer/dashboard`)

Your home page after login. It provides a snapshot of all your verification activity.

**What you see:**
- **Stats bar** — Total verifications, Genuine count, Suspicious count, Fake count
- **Recent Verification** card — Status of your last scan (Genuine / Suspicious / Fake) and the date it was done
- **Average Confidence** card — The average AI confidence score across all your scans, shown as a percentage with a visual meter
- **Quick Actions** — Three shortcut tiles: *Verify Product*, *Get Recommendations*, and *Ask AI Assistant*

**How to use:**
- Click **Verify Product** or the "Start New Verification" button to start scanning a new item.
- Use the Quick Actions to navigate to the most common tasks instantly.

---

### 2. Quality Check (`/farmer/quality`)

Checks the physical quality of loose seeds (e.g., purity, impurities) using AI image analysis.

**How to use:**
1. Click **Select Image** or drag and drop a photo of the seeds (PNG / JPG, up to 10 MB).
2. Once the preview appears, click **Analyze Quality**.
3. Wait a few seconds while the AI classifies the image.
4. The result panel on the right shows:
   - **Status** — Pure Quality, Negative Quality, or Suspicious
   - **Confidence score** — how certain the AI is
   - **Seed variety** (if detected)
   - **Risk factors** and **AI classification** tag
5. Click **Reset** to clear and start again.
6. Use the **View History** button (top-right) to see all past quality checks.

**Result indicators:**
- **Pure Quality** (green) — seeds meet quality standards and are genuine
- **Negative Quality** (red) — seeds fail quality checks or may be counterfeit
- **Suspicious** (yellow) — inconclusive result; recommend physical inspection

---

### 3. Verify Product (`/farmer/verify`)

The primary anti-counterfeit tool. It checks a sealed seed or fertilizer packet for authenticity.

**How to use:**
1. Upload a photo of the **front** of the packet (step 1).
2. Upload a photo of the **back** of the packet (step 2).
3. Click **Verify Product**.
4. The system first runs a fast **on-device AI check** (using the local seed-verifier model) to confirm the image actually shows a seed packet. If it does not, you will see an error toast and the process stops immediately — no cloud API call is made.
5. If valid, the image is sent to the cloud for deeper analysis (label text, batch number, certification markers, known fake databases).
6. The result screen shows:
   - **Status badge** — Genuine, Suspicious, or Fake
   - **Confidence %** — overall AI confidence
   - **Risk explanation** — why the product was rated as it was
   - **Recommendations** — clear action steps (e.g., "Do not use this product", "Verify with local officer")
7. Click **Verify Another Product** to scan a new item.

**Tips for best results:**
- Ensure good lighting and no glare or shadows
- Capture the **entire** front and back of the packet
- Both images are required before the button is enabled

---

### 4. Verification History (`/farmer/history`)

A full log of all seed quality checks (from the Quality Check page).

**What you see:**
- A card grid of all past scans, each showing: thumbnail image, status badge, date/time, quality score, and seed variety (if detected)
- Total number of records shown at the top

**How to use:**
- Click any card to open a **detail dialog** with the full image, status, AI classification tag, quality score, and recommendation text.
- Click the **trash icon** on a card to delete that record (requires confirmation in a dialog).
- Use the **Export History** button to download the list (feature is present in the UI).
- Click **← Back** arrow to return to the Quality Check page.

---

### 5. Seed Recommendations (`/farmer/recommendations`)

Suggests government-certified seed varieties that are approved for your crop type and district.

**How to use:**
1. Use the **Crop Type** dropdown to select your crop (e.g., Rice, Wheat, Cotton).
2. Use the **District** dropdown to select your location.
3. The recommendation cards update automatically based on your selections.
4. Each card shows the seed variety name, crop type, and certification status.

If no recommendations are found for a combination, a message prompts you to try different filters.

---

### 6. My Complaints (`/farmer/complaints`)

View and track all product quality complaints you have submitted.

**Stats shown at top:**
- Total complaints
- Open (awaiting review)
- Investigating (officer is looking into it)
- Resolved (case closed)

**How to use:**
- Browse your complaints list. Each card shows the batch number, brand, issue type, district, and current status.
- Click **New Complaint** (top-right) to file a new complaint.

#### Filing a New Complaint (`/farmer/complaints/new`)

Fill out the complaint form with:
- **Select a previous scan** — optionally link to a verification scan from your history
- **Batch number** of the product
- **Brand name**
- **Issue type** (e.g., poor germination, stunted growth, counterfeit label)
- **Description** — a written account of the problem
- **District** where the product was purchased

After submission, the complaint appears in your list and is visible to officers in your district.

---

### 7. AI Assistant (`/farmer/chat`)

An AI-powered chatbot for farming guidance and anti-counterfeit advice.

**Example questions to ask:**
- "How do I identify fake fertilizer?"
- "What are the best rice seeds for sandy soil?"
- "Which certified wheat varieties are available?"
- "How do I check if my seeds are genuine?"

**Tips (shown on the page):**
- Ask about specific crops like "rice" or "wheat"
- Inquire about how to identify fake products
- Get fertilizer application recommendations
- Learn about certified seed varieties

---

### 8. My Profile (`/farmer/profile`)

Manage your personal account details including your name, contact information, district, and the crops you primarily grow.

---

## Officer Portal

Officers access their tools from a sidebar with:

| Nav Item | Page |
|---|---|
| Dashboard | `/officer/dashboard` |
| Analytics | `/officer/analytics` |
| Complaints | `/officer/complaints` |
| All Complaints | `/officer/complaints/list` |

A language translation widget is available in every page header.

---

### 1. Dashboard (`/officer/dashboard`)

The officer's main overview page with system-wide verification metrics.

**What you see:**
- **Stats bar** — Total verifications, Genuine, Suspicious, and Fake counts across all farmers
- **Verification Distribution** — A donut pie chart showing the ratio of Genuine / Suspicious / Fake
- **Daily Verification Trend** — A line chart showing the last 7 days of verification activity
- **Top Flagged Brands** — A table listing the brands most frequently detected as fake, with their fake count and last detected date

**How to use:**
- Click **View Detailed Analytics** (top-right) to go to the full analytics page.

---

### 2. Complaint Governance Dashboard (`/officer/complaints`)

The primary tool for monitoring high-risk product batches based on farmer complaint volume.

**Key metrics at the top:**
- **High Risk Batches** — batches with more than 5 complaints (red)
- **Today's Complaints** — number of new complaints received today (orange)
- **Critical District** — the district with the most complaints (yellow)

**Batch tables:**
- **Critical: High Risk Batches** — more than 5 complaints; immediate action required. Has a **Review** button for each batch.
- **Warning: Suspicious Batches** — 3–5 complaints or complaints from multiple districts
- **Normal: Compliant Batches** — fewer than 3 complaints

**How to use:**
- Scan the high-risk batch table daily for batches that need field investigation.
- Click **Review** on any batch to open the detailed complaint view (`/officer/complaints/[batchId]`), where you can see all individual complaints, farmer details, images, and AI evidence for that batch.

---

### 3. All Complaints (`/officer/complaints/list`)

A flat list view of all submitted complaints across all batches and districts, for detailed review and filtering.

---

### 4. Deep Analytics (`/officer/analytics`)

Detailed data visualisation for decision-making and resource allocation.

**Features:**
- **District filter** — select a specific district or view all districts
- **Export Data** button — downloads the district-level data as a CSV file
- **District-wise Verification Heatmap** — a colour-coded grid showing risk levels per district (Green = Low, Yellow = Medium, Red = High)
- **Monthly Comparison bar chart** — shows Genuine / Suspicious / Fake counts for the last 14 days by date
- **High Risk Districts table** — lists districts rated as high-risk with their fake count and fake percentage
- **All Districts Overview table** — complete breakdown for every district: Total, Genuine, Suspicious, Fake, and Risk Level

**How to use:**
- Change the district dropdown to zoom into a specific area.
- Use **Export Data** to download the CSV and share it in official reports or presentations.
- Use the heatmap to identify geographically concentrated counterfeit activity and plan field visits.

---

### 5. Fake Product Registry (`/officer/fake-registry`)

A curated registry of confirmed counterfeit products that officers have identified through verification data or field reports.

**Stats shown:**
- Registered Fakes (total)
- High Risk entries
- Total Detections across all registered products
- Average detections per product

**How to use:**

**Browsing the registry:**
- Use the **Search** bar to filter by product name, brand, or certificate number.
- Use the **Risk Level** dropdown to filter by High / Medium / Low risk.
- The table shows: Product, Brand, Certificate Number, Risk Level badge, Reported date, Detection count, and a delete button.

**Adding a new fake product:**
1. Click **Add Product**.
2. Fill in: Product Name, Brand Name, Fake Certificate Number, Batch Number, Risk Level, and Reason for Registration.
3. Click **Register Product**. It appears at the top of the table immediately.

**Removing a product:**
- Click the red trash icon in the Actions column. The entry is removed from the registry.

> Registry entries with "High Risk" automatically trigger alerts during farmer verification attempts.

---

## Admin Portal

Admins access their tools from a sidebar with:

| Nav Item | Page |
|---|---|
| Dashboard | `/admin/dashboard` |
| User Management | `/admin/users` |
| Audit Logs | `/admin/audit-logs` |

---

### 1. Admin Dashboard (`/admin/dashboard`)

A high-level system health summary.

**Stats shown:**
- **Total Users** — with a breakdown of farmer count vs. officer count
- **High-Risk Batches** — number of product batches currently flagged
- **Today's Complaints** — complaints submitted today across all districts
- **Worst District** — the district with the most complaint volume

**Quick Actions panel:**
- Manage Users
- Create Officer Account
- View Audit Logs

**System Links panel:**
- Navigate directly to the Officer Dashboard
- Navigate to the Batch Risk Registry

---

### 2. User Management (`/admin/users`)

View and manage every registered account in the system.

**The user table shows:**
- Full Name
- Email address
- Role badge (Farmer = green, Officer = blue, Admin = indigo)
- District
- Date joined

**Actions available per user (non-admin users only):**
- **Make Officer / Make Farmer** — toggle a user's role between Farmer and Officer
- **Delete** — permanently removes the user from the system

#### Create Officer Account (`/admin/users/create-officer`)

Administrators are the only users who can provision dedicated Officer accounts. Use this page to set up new government inspection staff with the Officer role.

---

### 3. Audit Logs (`/admin/audit-logs`)

A tamper-evident, chronological log of all sensitive system actions (up to the last 100 entries).

**Columns shown:**
- **Timestamp** — exact date and time of the action
- **Actor** — the user's name or email who performed the action
- **Role** — the actor's role at the time
- **Action** — what was done (e.g., role change, complaint update)
- **Target** — the type and ID of the object that was affected
- **Details** — any additional data recorded with the action (shown as JSON)

**How to use:**
- Review this log regularly to ensure no unauthorised role changes, deletions, or privilege escalations have occurred.
- Use it for accountability during official investigations or audits.

---

## Summary of All Pages

| Role | Page | URL |
|---|---|---|
| All | Login | `/login` |
| All | Register | `/register` |
| Farmer | Dashboard | `/farmer/dashboard` |
| Farmer | Quality Check | `/farmer/quality` |
| Farmer | Verify Product | `/farmer/verify` |
| Farmer | Verification History | `/farmer/history` |
| Farmer | Seed Recommendations | `/farmer/recommendations` |
| Farmer | My Complaints | `/farmer/complaints` |
| Farmer | File New Complaint | `/farmer/complaints/new` |
| Farmer | AI Assistant | `/farmer/chat` |
| Farmer | My Profile | `/farmer/profile` |
| Officer | Dashboard | `/officer/dashboard` |
| Officer | Complaint Governance | `/officer/complaints` |
| Officer | Complaint Detail | `/officer/complaints/[batchId]` |
| Officer | All Complaints | `/officer/complaints/list` |
| Officer | Deep Analytics | `/officer/analytics` |
| Officer | Fake Registry | `/officer/fake-registry` |
| Admin | Dashboard | `/admin/dashboard` |
| Admin | User Management | `/admin/users` |
| Admin | Create Officer | `/admin/users/create-officer` |
| Admin | Audit Logs | `/admin/audit-logs` |
