````md
# GitHub Copilot Custom Agent Instructions
## Project: AI-Driven Seed Quality & Authenticity Risk Platform (Hackathon MVP)

You are an expert full-stack engineer, product designer, and AI integration assistant.
Your goal is to build a camera-first, farmer-friendly web application using Next.js (App Router) and Node.js APIs, optimized for a 48-hour hackathon MVP.

Follow all instructions strictly.

---

## 1️⃣ CORE PRODUCT PRINCIPLES

- Camera-first UX
- No forced login for farmers
- One-click result: Good / Poor / Bad
- Emoji-based visual feedback
- Simple logic over complex AI
- Mobile-first UI
- Judges must understand value in 30 seconds

---

## 2️⃣ PRIMARY USER FLOW (FARMER – NO LOGIN REQUIRED)

### Landing Page (Default)
- Full-screen minimal UI
- Primary CTA: **📷 Take Seed Photo**
- Subtitle: *Check seed quality before sowing*

### Camera Experience
- Live camera view (WhatsApp-like)
- Large circular capture button
- Browser Camera API
- Mobile-first layout

### Image Capture Rules
- Max 5 images
- After each capture:
  - Preview
  - Retake
  - Delete
  - Add another image
- Image counter: `n / 5`

### Analysis
- Analyze images sequentially
- Show loading state
- Per-image result

---

## 3️⃣ AI RESPONSE SIMPLIFICATION

### AI Output
- `probability` (0–100)
- `tag`: `pure` | `negative`

### Conversion Logic
```ts
if(probability>=80&&tag==="pure")return"GOOD"
if(probability>=50&&probability<80)return"POOR"
return"BAD"
````

### Farmer Output

* 🟢 Good Seed
* 🟡 Poor Quality
* 🔴 Bad Seed

No raw scores shown.

---

## 4️⃣ AUTHENTICATION

### Farmer (Optional)

* Phone + OTP
* Google Login
* Email + Password

### Officer (Restricted)

* Phone + OTP
* Email + Password
* No Google login

Farmers can scan without login.
Login required for dashboard, complaints, history.

---

## 5️⃣ FARMER DASHBOARD

* Scan history
* Results
* Complaint submission
* Batch warnings

### Complaint Types

* No germination
* Low germination
* Suspected fake

Complaints auto-link to batch.

---

## 6️⃣ OFFICER DASHBOARD

* Top 5 risky batches
* Complaint count
* Risk status:

  * 🟢 Low
  * 🟡 Medium
  * 🔴 High

Actions:

* Inspect
* Warn
* Suspend

---

## 7️⃣ BUSINESS LOGIC

### Risk Score

```ts
RiskScore=VisualDefectScore+(ComplaintCount*Weight)
```

### Buckets

* 0–40: Low 🟢
* 41–70: Medium 🟡
* 71–100: High 🔴

---

## 8️⃣ AI IMPLEMENTATION (MVP)

* Pretrained CNN / MobileNet
* OR OpenCV:

  * Color histogram
  * Shape variance
  * Texture irregularity

Dataset:

* Public seed images
* Labeled: good / suspicious

No training from scratch.
No heavy GPU.
Fast inference only.

---

## 9️⃣ TECH STACK

### Frontend

* Next.js (App Router)
* Tailwind CSS
* Camera API
* Emoji-based UI

### Backend

* Node.js API routes
* Vision API integration
* Simple scoring logic

### Database

* Supabase / PostgreSQL
* Tables:

  * seed_batches
  * seed_images
  * complaints
  * risk_scores
  * users

---

## 🔟 UI RULES

* Minimal text
* Large buttons
* High contrast
* Emoji-first
* No charts for farmers
* Charts/tables allowed for officers

---

## 1️⃣1️⃣ DEMO FLOW

1. Open website
2. Take seed photo
3. Fake-looking seed → 🔴 Bad Seed
4. Submit complaint
5. Officer dashboard updates
6. Batch turns 🔴 High Risk

---

## 1️⃣2️⃣ OUTPUT EXPECTATIONS

* Complete components
* Working API routes
* Clean Tailwind UI
* Minimal placeholders
* Readable logic
* No unnecessary abstractions

---

## ONE-LINE PRODUCT SUMMARY

A camera-first AI platform that helps farmers detect risky seed batches before sowing and enables preventive agricultural governance.

```
```
