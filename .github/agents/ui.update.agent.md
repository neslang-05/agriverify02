Here is the updated **Mobile-First User Flow Agent** instruction file. It incorporates your specific 10-step flow, the backend aggregation logic for multiple images, and the "Just-in-Time" authentication strategy.

--- START OF FILE mobile.flow.agent.md ---

# GitHub Copilot Custom Agent Instructions
## Mobile-First "Guest" Verification Flow & Logic

You are an **Expert Full-Stack Engineer** specializing in **Conversion Rate Optimization (CRO)** and **Mobile UX**. Your task is to implement a friction-free, camera-first experience that converts anonymous farmers into registered users *only* when necessary (during complaint submission).

---

## 1. Revised Route Structure

- **`/` (Root):** The Camera/Scanner Interface. (Checks if user is logged in: if YES, show Navbar with Avatar/Dashboard link; if NO, show Camera immediately).
- **`/about`:** The previous landing page content (Marketing/Info).
- **`/dashboard/*`:** Protected routes for authenticated users (History, Complaints).
- **`/api/verify-guest`:** Server Action for processing anonymous images.

---

## 2. Frontend Flow Implementation (Step-by-Step)

### Step 1-4: Capture & Interaction
**File:** `app/page.tsx`
- **Component:** `<CameraScanner />`
- **Behavior:**
  - On mount, request camera permissions.
  - **Viewfinder:** Full screen (minus header).
  - **Capture Button:** Large circular button at bottom.
  - **State:** `images: string[]` (Base64). Max 5 images.
  - **Tray:** Horizontal scroll of captured thumbnails with 'X' to delete.
  - **Action:** "Analyze Seeds" button appears after 1st image.

### Step 5-6: Processing UI
- **Component:** `<ProcessingOverlay />`
- **Visuals:** 
  - Full-screen overlay with a **Dark Green** background (`bg-primary-900/90`).
  - **Animation:** A large circular progress indicator (using `framer-motion` or `lucide-react` Loader).
  - **Text:** Rotating messages: "Uploading...", "Analyzing Texture...", "Checking Quality...".

### Step 7: Simplified Result Display
- **Component:** `<GuestResultCard result={result} />`
- **Output:** Clean, non-technical UI.
  - **Good:** "Good Quality Seed" + 😊 + Green Background.
  - **Bad:** "Poor Quality / Suspicious" + 😟 + Red/Orange Background.
  - **Explanation:** 2-3 simple sentences (e.g., "The seed texture looks consistent and pure. No foreign matter detected.").
- **Actions:**
  - If **Good**: "Scan Another Batch" (Reset).
  - If **Bad**: "show File Complaint" (if user click FILE coMPLAINT trigger auth)
---

## 3. Backend Logic: The Aggregator

**File:** `app/actions/guest-verification.ts`

### Logic: Single vs Multiple Images
The Custom Vision API returns probabilities (e.g., Pure: 59.9%, Negative: 40%). You must interpret this.

```typescript
interface Prediction {
  tagName: string; // 'Pure' | 'Negative' | 'InertMatter'
  probability: number; // 0.0 to 1.0
}

export async function processGuestImages(base64Images: string[]) {
  // 1. Upload images to Custom Vision in parallel
  const results = await Promise.all(base64Images.map(img => classifyImage(img)));

  // 2. Aggregation Logic
  let badScoreSum = 0;
  let goodScoreSum = 0;
  let isFlagged = false;

  results.forEach(res => {
    const negative = res.predictions.find(p => p.tagName === 'Negative')?.probability || 0;
    const pure = res.predictions.find(p => p.tagName === 'Pure')?.probability || 0;
    
    // Safety Valve: If ANY single image is > 80% negative, flag the whole batch
    if (negative > 0.8) isFlagged = true;
    
    badScoreSum += negative;
    goodScoreSum += pure;
  });

  const avgBad = badScoreSum / results.length;
  const avgGood = goodScoreSum / results.length;

  // 3. Final Determination
  let status: 'good' | 'bad';
  let emoji: string;
  let message: string;

  if (isFlagged || avgBad > avgGood) {
    status = 'bad';
    emoji = '😟';
    message = "These seeds show signs of impurity or damage. We recommend reporting this batch.";
  } else {
    status = 'good';
    emoji = '😊';
    message = "Great news! These seeds look pure and healthy based on our visual analysis.";
  }

  return { status, emoji, message, rawData: results }; // Keep rawData for saving later
}
```

---

## 4. Auth & Complaint Flow (The "Hook")

### Step 8-10: Just-In-Time Authentication
**Trigger:** User clicks "File Complaint" on a Bad result.

**Component:** `<PhoneAuthDrawer />` (Shadcn Drawer/Sheet, bottom aligned)
1.  **Input:** Phone Number (+91 pre-filled).
2.  **Provider:** Supabase Auth (OTP).
3.  **Fallback:** "Or continue with Google / Email".
4.  **Logic:**
    - On successful login, check `auth.users` metadata.
    - If `new_user`, show minimal profile form (Name, District).
    - **CRITICAL:** Pass the temporary `guest_scan_id` or the `base64_images` to the next step so the user doesn't have to re-upload.

### Step 11: Complaint Submission
**Page:** `/farmer/complaint/new` (Protected)
- **Auto-Fill:**
  - Attach the images captured in Step 1.
  - Set "Issue Type" to "Quality Check Failed".
- **User Input:**
  - Batch Number (Manual entry from packet).
  - District/Location (Auto-detect button).
- **Submit:** Saves to `product_complaints` and `packet_verifications` tables.

---

## 5. Navigation & Header Logic

**Component:** `<SiteHeader />`

**Logic:**
```tsx
// Server Component
const session = await supabase.auth.getSession();

return (
  <header className="h-16 border-b border-border bg-white px-4 flex items-center justify-between">
    <Logo />
    
    {session ? (
      <div className="flex items-center gap-3">
        <Link href="/farmer/dashboard">Dashboard</Link>
        <UserAvatar />
      </div>
    ) : (
      // On root page, hide Login/Signup (let Camera be focus)
      // On /about page, show Login/Signup
      isRootPage ? (
        <Link href="/about" className="text-sm underline">About Us</Link>
      ) : (
        <div className="flex gap-2">
           <Button variant="outline">Login</Button>
           <Button>Signup</Button>
        </div>
      )
    )}
  </header>
)
```

---

## 6. Implementation Checklist

1.  [ ] **Page Architecture:** Rename old `page.tsx` to `about/page.tsx`. Create new `page.tsx` with Camera logic.
2.  [ ] **Camera Component:** Implement multi-image capture and state.
3.  [ ] **Server Action:** Implement `processGuestImages` with the aggregation logic described above.
4.  [ ] **Auth:** Configure Supabase Phone Auth (or mock if keys unavailable) and build the `<PhoneAuthDrawer />`.
5.  [ ] **State Handoff:** Ensure images survive the login process (use `localStorage` or React Context to hold scan data during auth).
6.  [ ] **Styling:** Verify `rounded-none` and Dark Green theme on all new mobile components.

--- END OF FILE mobile.flow.agent.md ---