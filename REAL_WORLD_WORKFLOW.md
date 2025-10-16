# Real-World Front Desk Workflow Analysis

## The Reality Check

### What Front Desk Actually Does Today (Without This App)

```
Morning at the clinic:
├─ 8:00 AM - Check fax machine, find 5 new referrals
├─ 8:15 AM - For each fax:
│   ├─ Look at patient name
│   ├─ Search EMR to see if patient exists
│   ├─ If new:
│   │   ├─ Create patient in EMR (EMR assigns MRN)
│   │   ├─ Enter demographics, insurance info
│   │   └─ Create episode/case for this referral
│   ├─ If existing:
│   │   └─ Create new episode/case for returning patient
│   ├─ Call patient to schedule
│   ├─ Run insurance verification
│   └─ File paperwork
└─ Repeat for web leads, phone calls, walk-ins
```

### The Core Problem This App Should Solve

**Front desk is juggling multiple systems:**
1. **EMR** (Prompt, WebPT, NEO) - Source of truth for patient records
2. **Fax machine** - Paper referrals coming in
3. **Phone** - Patient calls, insurance verification calls
4. **Paper forms** - Intake paperwork
5. **Sticky notes** - Tracking who to call back
6. **Excel/notebook** - "Did I call this patient yet?"

**Pain points:**
- ❌ Referrals get lost in piles of faxes
- ❌ No visibility into "who hasn't been contacted yet"
- ❌ Can't track "where is this patient in the intake process"
- ❌ Don't know if insurance was verified
- ❌ Multiple people working on same lead
- ❌ Can't prioritize urgent referrals

---

## What This App Should ACTUALLY Be

### ❌ NOT: A Patient Database
The EMR is the patient database. Don't duplicate it.

### ✅ YES: A Workflow Management Hub

**Purpose:** 
Track referrals from "received" to "patient scheduled in EMR"

**The handoff:**
```
NEO App                                    EMR
┌─────────────────────┐                   ┌─────────────────────┐
│ Referral tracking   │                   │ Patient records     │
│ Lead management     │ ─────────────────>│ Episode management  │
│ Task orchestration  │   "Hand off when  │ Scheduling         │
│ Communication       │    ready"         │ Treatment notes    │
└─────────────────────┘                   └─────────────────────┘
```

---

## Revised Mental Model

### Before: Wrong Assumption
"This app creates and stores patient records"
- Duplicate patient data in two places
- Sync issues between app and EMR
- More data entry for staff

### After: Correct Model
"This app is a referral intake workflow manager"
- Temporary holding area for referrals
- Track status: received → contacted → verified → scheduled
- Once scheduled in EMR, referral is "complete"
- May keep historical record for reporting

---

## Revised Entities

### 1. Referral (not "Lead", not "Patient")

```typescript
interface Referral {
  // Identity
  id: string;
  referralNumber: string; // RR-001, RR-002, etc.
  
  // Source
  source: "fax" | "web" | "call" | "walk-in";
  receivedDate: string;
  faxId?: string;
  webLeadId?: string;
  callId?: string;
  
  // Patient Info (temporary, until in EMR)
  patientFirstName: string;
  patientLastName: string;
  patientDOB?: string;
  patientPhone: string;
  patientEmail?: string;
  
  // Referral Details
  diagnosis: string;
  referringProvider: string;
  orderDetails: string;
  
  // Insurance (temporary)
  insuranceCompany?: string;
  insuranceMemberId?: string;
  
  // Workflow Status
  status: 
    | "new"                    // Just received
    | "reviewing"              // Staff looking at it
    | "contacting_patient"     // Trying to reach patient
    | "contacted"              // Spoke with patient
    | "verifying_insurance"    // Running E&B
    | "verified"               // Insurance confirmed
    | "ready_to_schedule"      // Ready for EMR entry
    | "in_emr"                 // Created in EMR
    | "scheduled"              // Initial eval scheduled
    | "arrived"                // Patient showed up
    | "declined"               // Patient not interested
    | "unable_to_reach";       // Can't contact patient
  
  // EMR Link (once created)
  emrPatientId?: string;      // MRN from EMR
  emrEpisodeId?: string;      // Episode ID from EMR
  createdInEmrAt?: string;
  createdInEmrBy?: string;
  
  // Assignment
  assignedTo?: string;
  assignedAt?: string;
  
  // Communication Log
  contactAttempts: ContactAttempt[];
  lastContactDate?: string;
  
  // Priority
  priority: "routine" | "urgent";
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // When reached "scheduled" status
}

interface ContactAttempt {
  date: string;
  method: "call" | "text" | "email";
  outcome: "reached" | "voicemail" | "no_answer" | "wrong_number";
  notes: string;
  staffMember: string;
}
```

### 2. The Workflow Stages (Kanban Board)

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│    NEW     │  │ CONTACTING │  │  VERIFIED  │  │  IN EMR    │  │ SCHEDULED  │
│            │  │  PATIENT   │  │ INSURANCE  │  │            │  │            │
├────────────┤  ├────────────┤  ├────────────┤  ├────────────┤  ├────────────┤
│ Faxes and  │  │ Calling    │  │ E&B check  │  │ Created in │  │ Apt booked │
│ leads just │  │ patient to │  │ running or │  │ EMR with   │  │ Patient    │
│ received   │  │ gather     │  │ completed  │  │ MRN        │  │ confirmed  │
│            │  │ info       │  │            │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## Real-World User Stories

### Story 1: Morning Fax Processing

**Actor:** Sarah (Front Desk)

**Scenario:** 5 new referral faxes arrived overnight

**Current painful process:**
1. Print all faxes (or leave on fax machine)
2. Manually look through each one
3. Write patient names on sticky notes
4. Put in order of priority (post-it notes all over desk)
5. Start calling patients
6. Forget which ones she already called
7. Co-worker picks up same fax, calls same patient twice 😬

**With NEO app:**
1. Opens NEO app, sees "5 New Referrals" notification
2. Clicks "Fax Inbox"
3. Sees all 5 faxes with AI-extracted info:
   ```
   NEW REFERRALS
   ├─ John Smith - Lower back pain - URGENT (BCBS)
   ├─ Mary Jones - Shoulder rehab - Routine (Medicare)
   ├─ Tom Wilson - Knee pain - Routine (Aetna)
   ├─ Lisa Chen - Post-op hip - URGENT (UnitedHealth)
   └─ Bob Davis - Ankle sprain - Routine (BCBS)
   ```
4. Clicks on John Smith (urgent), sees full fax
5. Clicks "Start Working on This" → Moves to "Contacting Patient" column, assigns to Sarah
6. Calls John, reaches him
7. Marks call outcome: "Reached - Interested, confirmed info"
8. Clicks "Run E&B Check" → Insurance verification job starts
9. While E&B runs, moves to next referral
10. Later, E&B completes → Card shows "✓ Verified - In Network"
11. Sarah clicks "Create in EMR" → Opens EMR side-by-side
12. Creates patient in EMR (EMR assigns MRN: MRN-12345)
13. Creates episode in EMR
14. Returns to NEO app, enters MRN: MRN-12345
15. Clicks "Mark as In EMR"
16. Schedules initial eval in EMR
17. Returns to NEO app, clicks "Mark as Scheduled"
18. Card moves to "Scheduled" column - DONE! ✅

**Time saved:** 60% less time, no duplicate work, no lost referrals

---

### Story 2: Web Lead Comes In

**Actor:** Tom (Front Desk)

**Scenario:** Patient fills out web form requesting appointment

**With NEO app:**
1. NEO app shows notification: "New Web Lead"
2. Tom clicks, sees:
   ```
   NEW WEB LEAD
   Name: Jennifer Martinez
   Phone: (555) 789-0123
   Email: jen.martinez@email.com
   Condition: Chronic hip pain
   Insurance: Kaiser Permanente
   Preferred: Morning appointments
   Submitted: 10 minutes ago
   ```
3. Tom clicks "Call Patient"
   - NEO opens dialer with patient's number
   - Call connects, conversation happens
   - Call IQ records and transcribes
4. Patient says: "Yes, I'm interested. My doctor is Dr. Smith at Orthopedic Associates"
5. Tom adds note: "Patient confirmed, referred by Dr. Smith, needs prescription faxed"
6. Tom moves card to "Waiting for Prescription"
7. Later, prescription fax arrives
8. Tom links the fax to this web lead
9. Now has complete package: patient info + prescription
10. Moves to "Ready for EMR"
11. Creates in EMR, schedules appointment
12. Marks as complete

---

### Story 3: Existing Patient Returns

**Actor:** Lisa (Front Desk)

**Scenario:** Patient who came for shoulder rehab last year now has knee pain

**With NEO app:**
1. Referral fax comes in for "John Smith - Knee pain"
2. Lisa opens referral in NEO
3. Lisa searches EMR by name: "John Smith"
4. Finds existing patient (MRN-00789)
5. In NEO app: Clicks "Link to Existing EMR Patient"
6. Enters MRN: MRN-00789
7. In EMR: Creates new episode for knee (not new patient)
8. Returns to NEO: Marks as "In EMR"
9. Schedules appointment
10. Marks as complete

**Key insight:** NEO doesn't need to know patient's full history, just needs to track THIS referral workflow

---

## Revised Architecture: Workflow-First

### What NEO App Stores

```typescript
// Temporary referral tracking (working memory)
Referrals Table
├─ Received but not yet in EMR
├─ In progress of verification
├─ Recently completed (for reporting)
└─ Archived after 30 days

// NOT stored in NEO:
❌ Complete patient medical records
❌ Treatment notes
❌ Appointment schedules
❌ Billing information
```

### What EMR Stores

```typescript
// Permanent patient records (source of truth)
Patients Table
├─ All demographic data
├─ Complete medical history
├─ All episodes of care
├─ Appointments
├─ Treatment notes
└─ Billing
```

### The Handoff Point

```
NEO App Lifecycle:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Referral Received                                          │
│       │                                                     │
│       ├─ Track in NEO                                       │
│       ├─ Manage workflow                                    │
│       ├─ Run verifications                                  │
│       ├─ Communicate with patient                           │
│       ├─ Coordinate staff                                   │
│       │                                                     │
│       ▼                                                     │
│  Ready to Schedule                                          │
│       │                                                     │
│       ├─ Staff creates in EMR ◄─────────────────────────┐   │
│       ├─ MRN assigned by EMR                           │   │
│       ├─ Episode created in EMR                         │   │
│       │                                                 │   │
│       ▼                                                 │   │
│  Link MRN back to NEO ─────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  Mark as Complete in NEO                                    │
│       │                                                     │
│       ▼                                                     │
│  Archive after 30 days                                      │
│  (Keep for reporting only)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

From this point forward:
All activity happens in EMR →
```

---

## Revised UI Components

### 1. Referral Card (Not "Patient Card")

```tsx
┌─────────────────────────────────────────────────┐
│ 🚨 URGENT                      FAX              │
│                                                 │
│ John Smith                                      │
│ DOB: 03/15/1985                                │
│                                                 │
│ Lower back pain                                │
│ Referred by: Dr. Anderson                      │
│                                                 │
│ 📞 (555) 123-4567                              │
│ 🏥 Blue Cross Blue Shield #ABC123              │
│                                                 │
│ ✓ Insurance Verified (In-Network)              │
│ ⏱️ Last called: 2 hours ago (No answer)        │
│                                                 │
│ Assigned to: Sarah Wilson                       │
│ Status: Contacting Patient                      │
│                                                 │
│ [Call Patient] [Run E&B] [View Fax]            │
│ [Create in EMR] [Mark Complete]                 │
└─────────────────────────────────────────────────┘
```

### 2. Quick Actions (Context-Aware)

Status determines available actions:

```typescript
Status: "new" 
  Actions: [Assign to Me] [Call Patient] [View Details]

Status: "contacting_patient"
  Actions: [Call Again] [Send Text] [Mark as Contacted]
  
Status: "contacted"
  Actions: [Run E&B] [Request Prescription] [Schedule Call Back]
  
Status: "verified"
  Actions: [Create in EMR] [Send Forms] [Schedule Eval]
  
Status: "ready_to_schedule"
  Actions: [Open EMR] [Link MRN] [Mark as Scheduled]
```

### 3. Create in EMR Flow (Simplified)

**NOT:** Full patient form in NEO app
**YES:** Assistance and tracking

```
┌───────────────────────────────────────────────┐
│ Ready to Create in EMR                        │
├───────────────────────────────────────────────┤
│                                               │
│ Patient: John Smith                           │
│ DOB: 03/15/1985                              │
│ Phone: (555) 123-4567                        │
│ Insurance: BCBS #ABC123456 ✓ Verified        │
│                                               │
│ Diagnosis: Lower back pain                    │
│ Referring Provider: Dr. Anderson              │
│                                               │
│ [ View All Details ]                          │
│                                               │
│ ─────────────────────────────────────────────│
│                                               │
│ Next Steps:                                   │
│                                               │
│ 1. Click "Open EMR" to open side-by-side     │
│    [Open EMR in New Tab]                      │
│                                               │
│ 2. Create patient in your EMR                 │
│    (Copy info from above)                     │
│                                               │
│ 3. Once created, enter MRN here:              │
│    MRN: [____________]  [Save]                │
│                                               │
│ 4. Create episode/case in EMR                 │
│                                               │
│ 5. Schedule initial evaluation                │
│                                               │
│ 6. Return here and mark complete:             │
│    [✓ Mark as Scheduled]                      │
│                                               │
└───────────────────────────────────────────────┘
```

**Why this is better:**
- ✅ Acknowledges EMR is the source of truth
- ✅ Doesn't duplicate data entry
- ✅ Just coordinates the workflow
- ✅ Tracks completion
- ✅ Links for reporting

---

## Advanced: EMR Integration (Future)

### Level 1: Manual (MVP)
- Staff creates in EMR manually
- Enters MRN back in NEO
- Simple, works with any EMR

### Level 2: Copy Helper
- NEO provides copyable text snippets
- "Copy Patient Info" button
- Paste into EMR fields
- Reduces typing errors

### Level 3: API Integration (Nice to Have)
- NEO sends data to EMR API
- EMR creates patient
- Returns MRN to NEO
- Fully automated

**BUT:** Most PT EMRs don't have great APIs, so start with Manual/Copy Helper

---

## Revised Data Model

### Core Entity: Referral (Not Patient)

```typescript
// What we're really tracking is REFERRALS
interface Referral {
  // Referral identification
  id: string;
  referralNumber: string;
  source: "fax" | "web" | "call" | "walk-in";
  receivedAt: string;
  
  // Patient info (minimal, temporary)
  patientInfo: {
    firstName: string;
    lastName: string;
    dob?: string;
    phone: string;
    email?: string;
  };
  
  // Clinical info (from referral)
  clinicalInfo: {
    diagnosis: string;
    icd10Codes?: string[];
    referringProvider: string;
    orderDetails: string;
  };
  
  // Insurance info (for verification)
  insuranceInfo?: {
    company: string;
    memberId: string;
    groupNumber?: string;
    verificationStatus: "not_verified" | "pending" | "verified" | "failed";
    verificationDate?: string;
    networkStatus?: "in" | "out" | "unknown";
  };
  
  // Workflow tracking
  workflow: {
    status: ReferralStatus;
    assignedTo?: string;
    priority: "routine" | "urgent";
    contactAttempts: ContactAttempt[];
    lastContactDate?: string;
  };
  
  // EMR link (once created)
  emrLink?: {
    patientMRN: string;
    episodeId?: string;
    createdAt: string;
    createdBy: string;
  };
  
  // Source documents
  sourceDocuments: {
    faxUrl?: string;
    webFormData?: any;
    callRecordingUrl?: string;
  };
  
  // Lifecycle
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
}
```

---

## Front Desk Mental Model

### The Question They Ask:
"What referrals do I need to work on today?"

### NOT:
"What patients exist in my system?"
(That's the EMR's job)

### Dashboard Should Show:

```
TODAY'S REFERRALS
┌─────────────────────────────────────────────┐
│ URGENT (2)                                  │
│ ├─ John Smith - Lower back pain (New)      │
│ └─ Lisa Chen - Post-op hip (Calling)        │
│                                             │
│ PENDING MY ACTION (5)                       │
│ ├─ Mary Jones - Need to call back          │
│ ├─ Tom Wilson - Waiting for E&B results    │
│ ├─ Bob Davis - Need prescription fax       │
│ ├─ Sarah Kim - Ready to create in EMR      │
│ └─ Mike Brown - Schedule initial eval      │
│                                             │
│ COMPLETED TODAY (3)                         │
│ ├─ Jennifer Lee - Scheduled for Tuesday    │
│ ├─ David Park - Scheduled for Thursday     │
│ └─ Amy Chen - Scheduled for Monday          │
└─────────────────────────────────────────────┘

TEAM STATUS
├─ Sarah Wilson: Working on 3 referrals
├─ Tom Rogers: Working on 2 referrals
└─ Lisa Chen: Working on 4 referrals
```

---

## Summary: The Paradigm Shift

### Old Thinking (Wrong)
"This app is a patient database that syncs with EMR"
- Leads to data duplication
- Complex sync logic
- Conflicts between systems
- More work for staff

### New Thinking (Right)
"This app is a referral intake workflow manager"
- Temporary holding area
- Process orchestration
- Communication hub
- Hands off to EMR when ready
- Archives for reporting

### The Mantra
**"Track referrals, not patients. The EMR owns patients."**

---

## Action Items: What Needs to Change

### In Your Current Design:

1. ❌ Remove: "Patient" as a stored entity
   ✅ Replace with: "Referral" with embedded patient info

2. ❌ Remove: "Create Patient" form that stores in app database
   ✅ Replace with: "Create in EMR" helper that opens EMR and tracks MRN

3. ❌ Remove: Complex patient/case dual entity model
   ✅ Replace with: Single "Referral" entity with workflow states

4. ❌ Remove: Assumption that app is source of truth
   ✅ Replace with: EMR is source of truth, app is workflow coordinator

### What to Keep:

✅ Fax inbox with AI extraction
✅ Web leads capture
✅ Call logging
✅ E&B verification
✅ Communication tracking
✅ Assignment and routing
✅ Kanban board for status
✅ Reporting and analytics

### New Focus:

✅ Make it dead simple to move referral through stages
✅ Prevent referrals from falling through cracks
✅ Track "who needs to be called"
✅ Show "what's my priority today"
✅ Coordinate team work
✅ Measure conversion: referral → scheduled

This is a **workflow tool**, not a **database replacement**.

