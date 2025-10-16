# Granular Workflow Analysis: Patient & Case Creation Trigger Points

## 🎯 The Core Question

**When exactly should we create a patient in the EMR?**
**When exactly should we create a case/episode in the EMR?**

Let me think through every single workflow, step-by-step, to find the optimal trigger points.

---

## 🔍 Thinking Out Loud: The Decision Points

### Key Considerations

**EMR Patient Creation should happen when:**
- ✅ We have verified the patient is real and interested
- ✅ We have enough demographic data
- ✅ Insurance is verified (or we know they're self-pay)
- ✅ Patient has committed to come in
- ✅ We're about to schedule them

**EMR Patient Creation should NOT happen when:**
- ❌ Just received a referral (might be duplicate, wrong number, not interested)
- ❌ Haven't contacted patient yet
- ❌ Patient hasn't confirmed interest
- ❌ Missing critical info (can't create incomplete record in EMR)

**Why this matters:**
- EMR is the legal medical record
- Don't want "zombie patients" (created but never came)
- Don't want duplicates (create, then find out they exist)
- Staff time to create in EMR is valuable

---

## 📋 Workflow 1: Fax Referral Arrives

### Detailed Step-by-Step Journey

```
TIME: Monday 8:00 AM
EVENT: Fax arrives from Dr. Anderson
CONTENT: John Smith, DOB 3/15/1985, Lower back pain, BCBS insurance

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: FAX RECEIVED & CAPTURED IN NEO                         │
├─────────────────────────────────────────────────────────────────┤
│ System Action:                                                  │
│ • Fax arrives via eFax/digital fax system                      │
│ • NEO AI OCR extracts text from fax                            │
│ • NEO AI parses and structures data                            │
│ • Creates Referral entity in NEO database                      │
│                                                                 │
│ Referral Created:                                               │
│ {                                                               │
│   id: "REF-001"                                                │
│   source: "fax"                                                │
│   status: "new"                                                │
│   patientInfo: {                                               │
│     firstName: "John",                                         │
│     lastName: "Smith",                                         │
│     dob: "1985-03-15",                                         │
│     phone: null // Not on fax!                                 │
│   },                                                           │
│   clinicalInfo: {                                              │
│     diagnosis: "Lower back pain",                             │
│     referringProvider: "Dr. Anderson"                         │
│   },                                                           │
│   insuranceInfo: {                                             │
│     company: "BCBS",                                           │
│     memberId: "ABC123456"                                      │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ UI State:                                                       │
│ • Appears in "New" column on Opportunities Board               │
│ • Badge: "Missing Phone Number"                                │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Don't even know if phone number is correct             │
│ ❌ NO - Haven't confirmed patient interest                     │
│ ❌ NO - Might be duplicate (search by name/DOB later)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: STAFF REVIEWS & ASSIGNS                                │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:05 AM                                                   │
│ ACTOR: Sarah (Front Desk)                                      │
│                                                                 │
│ Sarah's Actions:                                                │
│ 1. Opens NEO, sees "1 New Urgent Referral"                     │
│ 2. Clicks on John Smith referral                               │
│ 3. Reviews fax details                                          │
│ 4. Notices: No phone number on fax                             │
│ 5. Clicks "Research Patient"                                    │
│                                                                 │
│ NEO Actions:                                                    │
│ • Shows "Missing Info" form                                     │
│ • Sarah looks up on Google: "John Smith orthopedic Hartford"   │
│ • Finds phone: (555) 123-4567                                  │
│ • Sarah enters phone number                                     │
│ • Clicks "Assign to Me"                                         │
│                                                                 │
│ Referral Updated:                                               │
│ {                                                               │
│   status: "assigned" → "ready_to_contact"                      │
│   assignedTo: "Sarah Wilson"                                   │
│   patientInfo: {                                               │
│     phone: "(555) 123-4567" // Now have it!                    │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Still haven't talked to patient                        │
│ ❌ NO - Phone could be wrong                                   │
│ ❌ NO - Patient might not be interested                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: INITIAL PATIENT CONTACT                                │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:10 AM                                                   │
│                                                                 │
│ Sarah's Actions:                                                │
│ 1. Clicks "Call Patient" in NEO                                │
│ 2. NEO opens dialer with (555) 123-4567                       │
│ 3. Call rings...                                                │
│                                                                 │
│ SCENARIO A: Patient Answers                                    │
│ ─────────────────────────────────────                          │
│ Sarah: "Hi, is this John Smith?"                               │
│ John: "Yes, that's me"                                         │
│ Sarah: "I'm calling from Elite PT about your referral..."      │
│ John: "Oh yes! Dr. Anderson sent that over"                    │
│ Sarah: "Great! Let me confirm some info..."                    │
│                                                                 │
│ Sarah Confirms:                                                 │
│ • ✓ Name: John Smith                                           │
│ • ✓ DOB: March 15, 1985                                        │
│ • ✓ Insurance: Blue Cross Blue Shield                          │
│ • ✓ Diagnosis: Lower back pain                                 │
│ • ✓ Interest level: "Yes, I need help ASAP"                    │
│                                                                 │
│ Sarah Gathers Additional Info:                                 │
│ • Email: john.smith@email.com                                  │
│ • Preferred contact: Text                                       │
│ • Availability: "Mornings work best"                           │
│                                                                 │
│ NEO Updates:                                                    │
│ • Logs call (duration: 3:45)                                   │
│ • Transcribes conversation                                      │
│ • Updates referral status: "contacted"                         │
│ • Adds notes from Sarah                                         │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ 🤔 MAYBE - We've confirmed they're real and interested         │
│ 🤔 BUT - Haven't verified insurance yet                        │
│ 🤔 BUT - Haven't checked for existing patient in EMR           │
│ ❌ NO - Wait until insurance verified                          │
│                                                                 │
│ WHY WAIT?                                                       │
│ • If insurance doesn't verify → might not convert              │
│ • If they're out of network → might decline                    │
│ • Don't create EMR patient until we know it's viable           │
│                                                                 │
│ SCENARIO B: No Answer / Voicemail                             │
│ ─────────────────────────────────────                          │
│ • NEO logs: "No answer - left voicemail"                       │
│ • Sets reminder: "Call back in 2 hours"                        │
│ • Status stays: "contacting_patient"                           │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ DEFINITELY NO - Haven't even talked to them                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: INSURANCE VERIFICATION                                 │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:15 AM                                                   │
│                                                                 │
│ Sarah's Actions:                                                │
│ 1. Patient confirmed interest, now verify insurance            │
│ 2. Clicks "Run E&B Check" in NEO                               │
│ 3. NEO shows E&B modal                                          │
│ 4. Confirms insurance details:                                  │
│    - Company: Blue Cross Blue Shield                           │
│    - Member ID: ABC123456                                       │
│    - DOB: 03/15/1985                                           │
│    - Service Type: Physical Therapy                            │
│ 5. Clicks "Run Verification"                                    │
│                                                                 │
│ NEO System Actions:                                             │
│ • Calls clearinghouse API (Availity, Change Healthcare, etc.)  │
│ • Sends E&B 270 transaction                                    │
│ • Waits for 271 response                                        │
│ • Status: "verifying_insurance"                                │
│                                                                 │
│ E&B Results Returned (30 seconds later):                        │
│ ✓ Active Coverage: Yes                                         │
│ ✓ Network Status: In-Network                                   │
│ ✓ Copay: $20                                                    │
│ ✓ Deductible: $1,500 (Met: $1,200, Remaining: $300)           │
│ ✓ Coinsurance: 20% after deductible                           │
│ ✓ Auth Required: No                                            │
│ ✓ Visits Remaining: 30 per year (Used: 0)                     │
│                                                                 │
│ NEO Updates:                                                    │
│ • Status: "insurance_verified"                                 │
│ • Stores E&B results                                            │
│ • Calculates estimated patient cost                            │
│ • Shows green checkmark: "✓ Verified In-Network"              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ 🟢 YES! This is the trigger point!                             │
│                                                                 │
│ WHY NOW?                                                        │
│ ✅ Patient is real (spoke to them)                             │
│ ✅ Patient is interested (confirmed)                           │
│ ✅ Insurance is active (verified)                              │
│ ✅ In-network (will likely convert)                            │
│ ✅ Have all required data                                       │
│ ✅ Ready to schedule                                            │
│                                                                 │
│ BUT FIRST: Check for Existing Patient in EMR!                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: CHECK FOR EXISTING PATIENT (Critical!)                 │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:16 AM                                                   │
│                                                                 │
│ Sarah's Actions:                                                │
│ 1. NEO shows: "✓ Insurance Verified - Ready to Create in EMR" │
│ 2. Sarah clicks "Create Patient in EMR"                        │
│ 3. NEO shows modal: "First, let's check for existing patient" │
│                                                                 │
│ NEO Auto-Search Actions:                                        │
│ • Searches EMR by:                                              │
│   - Name: "John Smith"                                         │
│   - DOB: "03/15/1985"                                          │
│   - Phone: "(555) 123-4567"                                    │
│                                                                 │
│ SCENARIO A: No Match Found                                     │
│ ─────────────────────────────                                  │
│ NEO: "No existing patient found. Create new?"                  │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ 🟢 YES! Proceed to Step 6                                      │
│                                                                 │
│ SCENARIO B: Match Found!                                       │
│ ─────────────────────────────                                  │
│ NEO: "Found existing patient in EMR:"                          │
│                                                                 │
│ ┌──────────────────────────────────┐                           │
│ │ John Smith                       │                           │
│ │ MRN: MRN-00458                   │                           │
│ │ DOB: 03/15/1985                  │                           │
│ │ Last Visit: 08/15/2023           │                           │
│ │ Previous Episode: Shoulder rehab │                           │
│ │ Status: Discharged               │                           │
│ └──────────────────────────────────┘                           │
│                                                                 │
│ NEO Shows Options:                                              │
│ [ This is the same patient - Add new episode ]                │
│ [ Not the same - Create new patient ]                         │
│                                                                 │
│ If Sarah clicks "Same patient":                                │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Patient already exists!                                │
│ ✅ YES - CREATE NEW EPISODE/CASE (go to Step 7)               │
│                                                                 │
│ If Sarah clicks "Not the same":                                │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ 🟢 YES! Proceed to Step 6                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: CREATE NEW PATIENT IN EMR                              │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:17 AM                                                   │
│ TRIGGER: Insurance verified + No existing patient found        │
│                                                                 │
│ 🎯 THIS IS THE TRIGGER POINT FOR PATIENT CREATION              │
│                                                                 │
│ NEO Shows Helper Screen:                                        │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Create Patient in EMR                                     │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                           │  │
│ │ Patient Information Ready:                                │  │
│ │                                                           │  │
│ │ Demographics:                                             │  │
│ │ • Name: John Smith                                        │  │
│ │ • DOB: 03/15/1985 (Age: 38)                              │  │
│ │ • Gender: Male                                            │  │
│ │ • Phone: (555) 123-4567                                   │  │
│ │ • Email: john.smith@email.com                             │  │
│ │                                                           │  │
│ │ Insurance (Verified ✓):                                   │  │
│ │ • Primary: Blue Cross Blue Shield                         │  │
│ │ • Member ID: ABC123456                                    │  │
│ │ • Group: GRP001                                           │  │
│ │ • Network: In-Network ✓                                   │  │
│ │ • Copay: $20                                              │  │
│ │                                                           │  │
│ │ [Copy All Info]  [Copy Demographics]  [Copy Insurance]    │  │
│ │                                                           │  │
│ │ Choose Creation Method:                                   │  │
│ │ ┌─────────────────────────────────────────────────────┐   │  │
│ │ │ Option 1: Manual Entry (Works with any EMR)         │   │  │
│ │ │ • Click "Open EMR" below                            │   │  │
│ │ │ • Create patient in EMR manually                    │   │  │
│ │ │ • Copy/paste info from above                        │   │  │
│ │ │ • Enter MRN when done                               │   │  │
│ │ │                                                     │   │  │
│ │ │ [Open EMR in New Tab]                               │   │  │
│ │ └─────────────────────────────────────────────────────┘   │  │
│ │                                                           │  │
│ │ ┌─────────────────────────────────────────────────────┐   │  │
│ │ │ Option 2: API Integration (If configured)          │   │  │
│ │ │ • NEO sends data to Prompt EMR                      │   │  │
│ │ │ • Patient created automatically                     │   │  │
│ │ │ • MRN returned to NEO                               │   │  │
│ │ │                                                     │   │  │
│ │ │ [Create in Prompt via API] (Recommended)            │   │  │
│ │ └─────────────────────────────────────────────────────┘   │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ OPTION 1 (Manual): Sarah's Workflow                            │
│ ──────────────────────────────────────                         │
│ 1. Clicks "Open EMR in New Tab"                                │
│ 2. Prompt EMR opens side-by-side                               │
│ 3. Sarah goes to "New Patient" in Prompt                       │
│ 4. Clicks "Copy Demographics" in NEO                           │
│ 5. Pastes into Prompt fields                                   │
│ 6. Clicks "Copy Insurance" in NEO                              │
│ 7. Pastes into Prompt insurance section                        │
│ 8. Reviews and submits in Prompt                               │
│ 9. Prompt assigns MRN: MRN-12345                               │
│ 10. Sarah returns to NEO                                        │
│ 11. NEO asks: "Enter the MRN from Prompt"                      │
│ 12. Sarah enters: MRN-12345                                     │
│ 13. Clicks "Link Patient"                                       │
│                                                                 │
│ OPTION 2 (API): Automated Flow                                 │
│ ──────────────────────────────                                 │
│ 1. Sarah clicks "Create in Prompt via API"                     │
│ 2. NEO sends API request to Prompt:                            │
│    POST /api/patients                                          │
│    {                                                           │
│      firstName: "John",                                        │
│      lastName: "Smith",                                        │
│      dob: "1985-03-15",                                        │
│      phone: "(555) 123-4567",                                  │
│      email: "john.smith@email.com",                            │
│      insurance: { ... }                                        │
│    }                                                           │
│ 3. Prompt creates patient                                      │
│ 4. Prompt returns: { patientId: "PT-789", mrn: "MRN-12345" }  │
│ 5. NEO automatically stores MRN                                │
│ 6. NEO shows: "✓ Patient created in Prompt (MRN-12345)"       │
│                                                                 │
│ NEO Updates Referral:                                           │
│ {                                                               │
│   status: "patient_created_in_emr"                            │
│   emrLink: {                                                   │
│     system: "prompt",                                          │
│     patientMRN: "MRN-12345",                                   │
│     patientId: "PT-789",                                       │
│     createdAt: "2024-01-15T08:17:23Z",                        │
│     createdBy: "Sarah Wilson"                                  │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ ✅ PATIENT CREATED IN EMR!                                     │
│                                                                 │
│ Next: Need to create Episode/Case for this condition           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: CREATE EPISODE/CASE IN EMR                             │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:18 AM                                                   │
│ TRIGGER: Patient exists in EMR (new or existing)               │
│                                                                 │
│ 🎯 THIS IS THE TRIGGER POINT FOR CASE/EPISODE CREATION         │
│                                                                 │
│ NEO Shows:                                                      │
│ "✓ Patient created (MRN-12345). Now create episode for this   │
│  referral."                                                    │
│                                                                 │
│ NEO Episode Helper Screen:                                      │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Create Episode in EMR                                     │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                           │  │
│ │ Patient: John Smith (MRN-12345)                           │  │
│ │                                                           │  │
│ │ Episode/Case Information:                                 │  │
│ │                                                           │  │
│ │ Clinical Details:                                         │  │
│ │ • Diagnosis: Lower back pain                              │  │
│ │ • ICD-10: M54.5                                           │  │
│ │ • Referring Provider: Dr. Anderson                        │  │
│ │   Organization: Orthopedic Associates                     │  │
│ │   Phone: (555) 999-0001                                   │  │
│ │ • Referral Date: 01/15/2024                               │  │
│ │ • Order: "PT eval & treatment for LBP, 3x/week, 6 weeks" │  │
│ │                                                           │  │
│ │ Authorization:                                            │  │
│ │ • Status: Not Required (per E&B)                          │  │
│ │ • Network: In-Network                                     │  │
│ │                                                           │  │
│ │ Treatment Plan:                                           │  │
│ │ • Frequency: 3x per week                                  │  │
│ │ • Expected Duration: 6 weeks                              │  │
│ │ • Estimated Visits: 18                                    │  │
│ │                                                           │  │
│ │ [Copy All Info]  [Copy Clinical]  [Copy Order]            │  │
│ │                                                           │  │
│ │ ┌─────────────────────────────────────────────────────┐   │  │
│ │ │ Option 1: Manual Entry                              │   │  │
│ │ │ • Open EMR to patient MRN-12345                     │   │  │
│ │ │ • Click "New Episode/Case"                          │   │  │
│ │ │ • Copy/paste info from above                        │   │  │
│ │ │ • Enter Episode ID when done                        │   │  │
│ │ │                                                     │   │  │
│ │ │ [Open Patient in EMR]                               │   │  │
│ │ └─────────────────────────────────────────────────────┘   │  │
│ │                                                           │  │
│ │ ┌─────────────────────────────────────────────────────┐   │  │
│ │ │ Option 2: API Integration                           │   │  │
│ │ │ • NEO creates episode in Prompt                     │   │  │
│ │ │ • Episode ID returned to NEO                        │   │  │
│ │ │                                                     │   │  │
│ │ │ [Create Episode via API]                            │   │  │
│ │ └─────────────────────────────────────────────────────┘   │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Sarah creates episode in Prompt (manually or via API)          │
│ Prompt assigns Episode ID: EP-456                              │
│ Sarah enters EP-456 in NEO                                      │
│                                                                 │
│ NEO Updates Referral:                                           │
│ {                                                               │
│   status: "episode_created_in_emr"                            │
│   emrLink: {                                                   │
│     patientMRN: "MRN-12345",                                   │
│     episodeId: "EP-456", // Now have this too!                │
│     episodeCreatedAt: "2024-01-15T08:18:45Z"                  │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ ✅ EPISODE/CASE CREATED IN EMR!                                │
│                                                                 │
│ Next: Schedule initial evaluation                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: SCHEDULE INITIAL EVALUATION                            │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 8:20 AM                                                   │
│                                                                 │
│ NEO Shows:                                                      │
│ "✓ Patient & Episode created in EMR. Ready to schedule."      │
│                                                                 │
│ Sarah's Actions:                                                │
│ 1. Calls patient: "Great news, insurance is verified!"         │
│ 2. Patient preference: "Mornings work best, Tuesday?"          │
│ 3. Sarah checks Prompt EMR schedule                            │
│ 4. Finds opening: Tuesday 9:00 AM with Dr. Wilson             │
│ 5. Books appointment in Prompt                                  │
│ 6. Prompt confirmation: Apt ID: APT-789                        │
│ 7. Sarah returns to NEO                                         │
│ 8. Clicks "Mark as Scheduled"                                   │
│ 9. NEO asks: "When is the appointment?"                        │
│ 10. Sarah enters: Tuesday, Jan 17, 2024 at 9:00 AM             │
│                                                                 │
│ NEO Updates Referral:                                           │
│ {                                                               │
│   status: "scheduled",                                         │
│   scheduledAppointment: {                                      │
│     date: "2024-01-17",                                        │
│     time: "09:00",                                             │
│     provider: "Dr. Wilson",                                    │
│     appointmentId: "APT-789"                                   │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ NEO Automated Actions:                                          │
│ • Enrolls patient in "Appointment Reminder" sequence           │
│ • Schedules AI reminder call for Monday 5:00 PM                │
│ • Sends confirmation text to patient                           │
│ • Moves referral to "Scheduled" column                         │
│ • Marks referral as "Completed" (can archive after 30 days)   │
│                                                                 │
│ ✅ WORKFLOW COMPLETE!                                           │
│                                                                 │
│ Total time from fax to scheduled: 20 minutes                   │
│ Patient created in EMR: Yes (at optimal trigger point)         │
│ Episode created in EMR: Yes (immediately after patient)        │
│ Ready for initial eval: Yes                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Workflow 2: Web Lead Submission

### Detailed Step-by-Step

```
TIME: Monday 2:00 PM
EVENT: Patient fills out web form requesting appointment

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: WEB FORM SUBMITTED                                     │
├─────────────────────────────────────────────────────────────────┤
│ Patient (Jennifer) fills out form on clinic website:           │
│ • Name: Jennifer Martinez                                       │
│ • Phone: (555) 789-0123                                        │
│ • Email: jen.martinez@email.com                                │
│ • Condition: "Chronic hip pain"                                │
│ • Insurance: "Kaiser Permanente"                               │
│ • Preferred time: "Mornings"                                   │
│ • How did you hear about us: "Google search"                   │
│ • Additional notes: "Pain for 6 months, getting worse"         │
│                                                                 │
│ Form submission triggers webhook to NEO                         │
│                                                                 │
│ NEO Creates Referral:                                           │
│ {                                                               │
│   id: "REF-002"                                                │
│   source: "web"                                                │
│   status: "new"                                                │
│   patientInfo: {                                               │
│     firstName: "Jennifer",                                     │
│     lastName: "Martinez",                                      │
│     phone: "(555) 789-0123",                                   │
│     email: "jen.martinez@email.com"                           │
│   },                                                           │
│   clinicalInfo: {                                              │
│     diagnosis: "Chronic hip pain",                            │
│     selfReported: true,                                        │
│     notes: "Pain for 6 months, getting worse"                 │
│   },                                                           │
│   insuranceInfo: {                                             │
│     company: "Kaiser Permanente" // Self-reported             │
│   },                                                           │
│   leadSource: "Google search"                                  │
│ }                                                              │
│                                                                 │
│ NEO Automated Actions:                                          │
│ • Sends auto-reply email: "Thanks! We'll call you soon"       │
│ • Assigns to: "Next available agent" (rotation)               │
│ • Creates task: "Call within 1 hour" (SLA)                    │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - This is just a web form                                │
│ ❌ NO - Haven't verified this is a real person                 │
│ ❌ NO - Don't even know if they have a prescription yet        │
│ ❌ NO - Could be spam/bot submission                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: AUTOMATED AI OUTREACH (Optional NEO Feature)           │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 2:05 PM (5 minutes later)                                │
│                                                                 │
│ NEO AI Agent Actions:                                           │
│ • AI calls (555) 789-0123                                      │
│ • Jennifer answers                                              │
│                                                                 │
│ AI Conversation:                                                │
│ AI: "Hi Jennifer, this is the assistant from Elite Physical    │
│      Therapy. I see you submitted a form about hip pain?"      │
│ Jennifer: "Yes! I really need help"                            │
│ AI: "I'd love to help. Do you have a referral from a doctor?"  │
│ Jennifer: "Yes, Dr. Smith at Hartford Orthopedics"             │
│ AI: "Great! Did they fax the prescription to us?"              │
│ Jennifer: "They said they would"                               │
│ AI: "Perfect. Let me verify your insurance - is it Kaiser?"    │
│ Jennifer: "Yes, Kaiser Permanente"                             │
│ AI: "Can you confirm your member ID?"                          │
│ Jennifer: "It's KP123456"                                      │
│ AI: "Got it. And your date of birth?"                          │
│ Jennifer: "July 10, 1988"                                      │
│ AI: "Thanks! A team member will call you back within the hour  │
│      to schedule. Is (555) 789-0123 the best number?"          │
│ Jennifer: "Yes, perfect"                                       │
│                                                                 │
│ NEO Updates Referral:                                           │
│ {                                                               │
│   status: "ai_contacted",                                      │
│   patientInfo: {                                               │
│     dob: "1988-07-10",                                         │
│     verified: true                                             │
│   },                                                           │
│   clinicalInfo: {                                              │
│     referringProvider: "Dr. Smith",                           │
│     referringOrg: "Hartford Orthopedics",                     │
│     prescriptionStatus: "pending_fax"                         │
│   },                                                           │
│   insuranceInfo: {                                             │
│     memberId: "KP123456",                                      │
│     verified: false // AI collected it, but not verified yet  │
│   },                                                           │
│   aiConversation: { transcript, sentiment: "positive" }       │
│ }                                                              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Still waiting for prescription fax                     │
│ ❌ NO - Insurance not verified yet                             │
│ 🤔 BUT - We know this is a real, interested person             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: STAFF FOLLOW-UP & PRESCRIPTION RECEIVED                │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 3:00 PM                                                   │
│                                                                 │
│ Tom (Front Desk) sees NEO alert:                               │
│ "Jennifer Martinez - AI contacted, waiting for prescription"   │
│                                                                 │
│ Meanwhile, prescription fax arrives from Dr. Smith              │
│ NEO AI recognizes: "This fax is for Jennifer Martinez"         │
│ NEO auto-links fax to REF-002                                  │
│                                                                 │
│ Tom reviews and sees:                                           │
│ • ✓ Patient interested (AI confirmed)                          │
│ • ✓ Prescription received (just arrived)                       │
│ • ⚠️ Insurance not verified yet                                │
│                                                                 │
│ Tom clicks "Run E&B Check"                                      │
│ Verifies Kaiser Permanente #KP123456                           │
│                                                                 │
│ E&B Results:                                                    │
│ ⚠️ OUT OF NETWORK!                                             │
│ • Kaiser patients must go to Kaiser facilities                │
│ • Our clinic not in Kaiser network                             │
│                                                                 │
│ NEO Updates:                                                    │
│ {                                                               │
│   insuranceInfo: {                                             │
│     networkStatus: "out-of-network",                          │
│     verificationStatus: "verified"                            │
│   },                                                           │
│   status: "insurance_issue"                                    │
│ }                                                              │
│                                                                 │
│ Tom calls Jennifer:                                             │
│ "Unfortunately, we're out of network for Kaiser..."            │
│                                                                 │
│ Jennifer: "Oh no! Can I pay cash?"                             │
│ Tom: "Yes, our cash rate is $150/visit"                        │
│ Jennifer: "That's too expensive for me"                        │
│ Tom: "I understand. Let me refer you to Kaiser PT..."          │
│                                                                 │
│ NEO Updates:                                                    │
│ {                                                               │
│   status: "declined_out_of_network",                          │
│   closedAt: "2024-01-15T15:15:00Z",                          │
│   closedReason: "Out of network, patient declined self-pay"   │
│ }                                                              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ DEFINITELY NO - Patient won't be coming                     │
│ ❌ NO - Would create "zombie patient" record                   │
│                                                                 │
│ ✅ CORRECT DECISION: Did not create patient in EMR             │
│                                                                 │
│ This shows why we wait for insurance verification!             │
│ If we had created patient after AI call, we'd have wasted time │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ALTERNATE: If Insurance HAD Been In-Network                    │
├─────────────────────────────────────────────────────────────────┤
│ If E&B returned: "In-Network" instead:                         │
│                                                                 │
│ Tom sees:                                                       │
│ • ✓ Patient interested                                         │
│ • ✓ Prescription received                                      │
│ • ✓ Insurance verified IN-NETWORK                              │
│                                                                 │
│ 🎯 TRIGGER POINT: CREATE PATIENT IN EMR                        │
│                                                                 │
│ Same flow as Fax Workflow Step 6:                              │
│ 1. Check for existing patient                                  │
│ 2. If none found, create new patient                           │
│ 3. Create episode for hip pain                                 │
│ 4. Schedule initial eval                                       │
│ 5. Mark as scheduled                                           │
│                                                                 │
│ ✅ Patient created at optimal time                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Workflow 3: Inbound Phone Call

### Detailed Step-by-Step

```
TIME: Monday 10:00 AM
EVENT: Patient calls clinic directly

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: CALL RECEIVED                                          │
├─────────────────────────────────────────────────────────────────┤
│ Phone rings: (555) 555-1234 calling                           │
│                                                                 │
│ OPTION A: Answered by Staff                                    │
│ ─────────────────────────────                                  │
│ Sarah answers: "Elite Physical Therapy, this is Sarah"         │
│ Caller: "Hi, I need to schedule physical therapy"              │
│                                                                 │
│ Sarah asks:                                                     │
│ • "What's your name?" → "Maria Garcia"                         │
│ • "Do you have a referral?" → "Yes, from Dr. Lopez"           │
│ • "Has the prescription been faxed?" → "I think so"            │
│                                                                 │
│ Sarah checks NEO:                                               │
│ • Searches fax inbox for "Maria Garcia"                        │
│ • NOT FOUND                                                     │
│                                                                 │
│ Sarah: "I don't see a fax yet. Let me create a note..."        │
│                                                                 │
│ OPTION B: Answered by NEO AI (After Hours / Overflow)          │
│ ─────────────────────────────────────────────────────────      │
│ NEO AI: "Elite Physical Therapy. How can I help you?"          │
│ Caller: "I need to schedule physical therapy"                  │
│ NEO AI: [Asks questions, gathers info, transcribes]            │
│                                                                 │
│ NEO Creates Referral:                                           │
│ {                                                               │
│   id: "REF-003"                                                │
│   source: "call"                                               │
│   status: "new"                                                │
│   patientInfo: {                                               │
│     firstName: "Maria",                                        │
│     lastName: "Garcia",                                        │
│     phone: "(555) 555-1234" // Caller ID                      │
│   },                                                           │
│   clinicalInfo: {                                              │
│     diagnosis: "Unknown - patient calling",                   │
│     referringProvider: "Dr. Lopez",                           │
│     prescriptionStatus: "unknown"                             │
│   },                                                           │
│   callData: {                                                  │
│     callId: "CALL-123",                                        │
│     duration: "2:15",                                          │
│     transcript: "[full conversation]",                        │
│     recordingUrl: "..."                                        │
│   }                                                            │
│ }                                                              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Just received call                                     │
│ ❌ NO - Don't have prescription yet                            │
│ ❌ NO - Don't know insurance                                   │
│ ❌ NO - Don't even know diagnosis yet                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: GATHER MISSING INFORMATION                             │
├─────────────────────────────────────────────────────────────────┤
│ Sarah (or AI) asks:                                             │
│ • "What's your date of birth?" → "05/22/1975"                  │
│ • "What's your email?" → "maria.g@email.com"                   │
│ • "What insurance do you have?" → "Aetna"                      │
│ • "Member ID?" → "AET987654"                                   │
│ • "What's the injury?" → "Rotator cuff surgery recovery"       │
│ • "When was surgery?" → "December 15th"                        │
│ • "Who's your doctor?" → "Dr. Lopez at Sports Med Center"      │
│                                                                 │
│ Sarah: "Let me check if we have your prescription..."          │
│ • Searches NEO fax inbox by patient name                       │
│ • NOT FOUND                                                     │
│                                                                 │
│ Sarah: "I don't see it yet. Can you ask Dr. Lopez's office     │
│         to fax it to (555) 999-0001?"                          │
│ Maria: "Sure, I'll call them right now"                        │
│ Sarah: "Great! I'll call you back once we receive it"          │
│                                                                 │
│ NEO Updates:                                                    │
│ {                                                               │
│   status: "awaiting_prescription",                            │
│   patientInfo: { /* all new details */ },                     │
│   insuranceInfo: {                                             │
│     company: "Aetna",                                          │
│     memberId: "AET987654"                                      │
│   },                                                           │
│   clinicalInfo: {                                              │
│     diagnosis: "Rotator cuff surgery recovery",               │
│     surgeryDate: "2023-12-15",                                │
│     referringProvider: "Dr. Lopez",                           │
│     referringOrg: "Sports Med Center"                         │
│   },                                                           │
│   nextAction: "Wait for prescription fax",                     │
│   followUpDate: "2024-01-16" // Call back tomorrow if no fax  │
│ }                                                              │
│                                                                 │
│ ❓ CREATE PATIENT IN EMR NOW?                                  │
│ ❌ NO - Still waiting for prescription                         │
│ ❌ NO - Can't schedule without prescription                    │
│ ❌ NO - Haven't verified insurance yet                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: PRESCRIPTION ARRIVES                                   │
├─────────────────────────────────────────────────────────────────┤
│ TIME: 2:00 PM (same day)                                       │
│                                                                 │
│ Fax arrives from Dr. Lopez                                     │
│ NEO AI extracts: "Maria Garcia, rotator cuff rehab"            │
│ NEO auto-links to REF-003                                      │
│                                                                 │
│ NEO alerts Sarah: "Prescription received for Maria Garcia"     │
│                                                                 │
│ Sarah reviews:                                                  │
│ • ✓ Patient info complete                                      │
│ • ✓ Prescription received                                      │
│ • ⚠️ Insurance not verified                                    │
│                                                                 │
│ Sarah clicks "Run E&B"                                          │
│ Verifies Aetna #AET987654                                      │
│                                                                 │
│ Results: ✓ IN-NETWORK, copay $25, no auth required            │
│                                                                 │
│ NEO Updates:                                                    │
│ {                                                               │
│   status: "insurance_verified",                               │
│   insuranceInfo: {                                             │
│     networkStatus: "in-network",                              │
│     verificationStatus: "verified",                           │
│     copay: 25                                                  │
│   },                                                           │
│   prescriptionReceived: true                                   │
│ }                                                              │
│                                                                 │
│ 🎯 TRIGGER POINT: CREATE PATIENT IN EMR                        │
│                                                                 │
│ Why now?                                                        │
│ • ✅ Patient is real (spoke to them)                           │
│ • ✅ Prescription received                                      │
│ • ✅ Insurance verified in-network                             │
│ • ✅ Have all required data                                     │
│ • ✅ Ready to schedule                                          │
│                                                                 │
│ Sarah follows same flow as before:                             │
│ 1. Check for existing patient in EMR                           │
│ 2. None found → Create new patient                             │
│ 3. EMR assigns MRN-12346                                       │
│ 4. Create episode for rotator cuff rehab                       │
│ 5. EMR assigns EP-457                                          │
│ 6. Call Maria to schedule                                       │
│ 7. Book Tuesday 2:00 PM                                        │
│ 8. Mark as scheduled in NEO                                     │
│                                                                 │
│ ✅ Patient created at optimal time                             │
│ ✅ Episode created immediately after                            │
│ ✅ Scheduled and confirmed                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary: The Trigger Points

### When to CREATE PATIENT in EMR

```
TRIGGER CONDITIONS (ALL must be true):
✅ 1. Patient identity verified (spoke to them or AI confirmed)
✅ 2. Patient expressed interest (not declined)
✅ 3. Have required demographic data (name, DOB, phone)
✅ 4. Have prescription/referral (unless self-pay)
✅ 5. Insurance verified (if applicable)
✅ 6. Insurance is in-network OR patient willing to self-pay
✅ 7. No existing patient found in EMR (duplicate check)
✅ 8. Ready to schedule (or about to)

TRIGGER MOMENT: Right BEFORE scheduling

DON'T CREATE IF:
❌ Just received referral (unverified)
❌ Haven't contacted patient yet
❌ Patient hasn't confirmed interest
❌ Insurance is out-of-network and patient won't self-pay
❌ Missing critical info (prescription, insurance details)
❌ Patient is duplicate of existing record
```

### When to CREATE EPISODE/CASE in EMR

```
TRIGGER CONDITIONS:
✅ 1. Patient exists in EMR (either new or existing)
✅ 2. Have clinical information (diagnosis, order)
✅ 3. Have referring provider info
✅ 4. Ready to associate appointments with episode

TRIGGER MOMENT: Immediately AFTER patient creation (or linking)

WHY SEPARATE FROM PATIENT:
• Patient is persistent entity (created once)
• Episode is per condition/treatment period
• Existing patients can have new episodes
• Each episode has its own auth, visits, etc.
```

---

## 🔄 The Workflow State Machine

### NEO Referral States → EMR Actions

```
NEO Status                  →  EMR Action
─────────────────────────────  ──────────────────────────
"new"                          None (just received)
"assigned"                     None (staff claimed it)
"contacting_patient"           None (trying to reach)
"contacted"                    None (gathering info)
"awaiting_documents"           None (waiting for Rx)
"verifying_insurance"          None (E&B in progress)
"insurance_verified"           🎯 CHECK FOR EXISTING PATIENT
  + all data complete          🎯 CREATE PATIENT (if new)
                               🎯 CREATE EPISODE
"patient_created_in_emr"       Link MRN in NEO
"episode_created_in_emr"       Link Episode ID in NEO
"ready_to_schedule"            Schedule in EMR calendar
"scheduled"                    Confirm appointment
"arrived"                      Check-in (EMR handles)
"in_treatment"                 Treatment docs (EMR handles)
"completed"                    Discharge (EMR handles)
"archived"                     Keep in NEO for analytics
```

---

## 💡 Critical Insights

### 1. The "Verification Barrier"

**Don't create in EMR until patient is VERIFIED and QUALIFIED**

```
Unqualified Lead         Qualified Lead
(Don't create)          (Create in EMR)
─────────────────────────────────────────
Just submitted form  →  Spoke with them ✓
No prescription     →  Prescription received ✓
Insurance unknown   →  Insurance verified ✓
Might be spam       →  Real person ✓
Out of network      →  In network ✓
Not interested      →  Wants to come in ✓
```

### 2. The "Duplicate Prevention" Step

**ALWAYS search EMR before creating**

```
Scenario: Fax for "John Smith" comes in

NEO Workflow:
1. Create referral in NEO ← Always do this
2. Contact patient
3. Verify insurance
4. BEFORE creating in EMR:
   → Search EMR for:
     - Name: "John Smith"
     - DOB: "03/15/1985"
     - Phone: "(555) 123-4567"
   → Found match?
     YES → Link to existing MRN-00123
           Create NEW episode only
     NO  → Create new patient
           Get new MRN
           Create new episode

Why this matters:
• Patient might have come before
• Prevents duplicate records
• EMR data integrity
```

### 3. The "Just-in-Time" Principle

**Create in EMR as late as possible, but before scheduling**

```
TOO EARLY:
❌ Create patient when fax arrives
   Problem: Might not convert, wasted time

❌ Create patient after first call
   Problem: Insurance might not verify

JUST RIGHT:
✓ Create patient after insurance verified
  AND before scheduling
  Reason: High confidence they'll show up

TOO LATE:
❌ Create patient after they show up
   Problem: Can't schedule without patient record
```

### 4. The "Two-Step Creation"

**Patient first, Episode second - ALWAYS**

```
CORRECT ORDER:
1. Create Patient (or find existing)
2. Get MRN from EMR
3. Store MRN in NEO
4. Create Episode for this condition
5. Get Episode ID from EMR
6. Store Episode ID in NEO
7. Link appointments to Episode

WRONG ORDER:
❌ Try to create Episode without Patient
❌ Try to create Patient and Episode in one call
   (Some EMRs do this, but it's problematic)

WHY?
• Patient is persistent (lives forever)
• Episode is temporary (one treatment period)
• Patient can have multiple episodes
• Each needs separate ID for tracking
```

---

## 🎨 UI Design for Trigger Points

### The "Ready to Create" Badge

```
NEO Referral Card should show visual cues:

┌────────────────────────────────────────┐
│ John Smith                             │
│ Lower back pain                        │
│                                        │
│ Status:                                │
│ ✓ Patient contacted                   │
│ ✓ Prescription received                │
│ ✓ Insurance verified (In-Network)     │
│                                        │
│ ┌────────────────────────────────────┐│
│ │  🎯 READY TO CREATE IN EMR        ││
│ │                                    ││
│ │  [Check for Existing Patient]     ││
│ └────────────────────────────────────┘│
│                                        │
│ Or if already created:                 │
│ ┌────────────────────────────────────┐│
│ │  ✅ IN EMR (MRN-12345)            ││
│ │  ✅ Episode Created (EP-456)      ││
│ │                                    ││
│ │  [Schedule Appointment]            ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

### The Step-by-Step Wizard

```
When staff clicks "Create in EMR":

Step 1: Duplicate Check
┌────────────────────────────────────────┐
│ Checking for existing patient...      │
│                                        │
│ Searching by:                          │
│ • Name: John Smith                     │
│ • DOB: 03/15/1985                      │
│ • Phone: (555) 123-4567                │
│                                        │
│ [Searching...] ⏳                       │
└────────────────────────────────────────┘

Step 2a: No Match Found
┌────────────────────────────────────────┐
│ ✓ No existing patient found           │
│                                        │
│ Ready to create new patient record     │
│                                        │
│ [Create New Patient in EMR]            │
└────────────────────────────────────────┘

Step 2b: Match Found
┌────────────────────────────────────────┐
│ ⚠️ Possible match found:               │
│                                        │
│ John Smith (MRN-00789)                 │
│ DOB: 03/15/1985                        │
│ Last visit: 8 months ago               │
│ Previous: Shoulder rehab               │
│                                        │
│ Is this the same patient?              │
│                                        │
│ [Yes, Same Patient - Add Episode]     │
│ [No, Different - Create New]           │
└────────────────────────────────────────┘

Step 3: Create Patient (if new)
┌────────────────────────────────────────┐
│ Creating patient in Prompt EMR...      │
│                                        │
│ ✓ Demographics sent                    │
│ ✓ Insurance info sent                  │
│ ✓ Patient created                      │
│ ✓ MRN received: MRN-12345              │
│                                        │
│ [Continue to Episode Creation]         │
└────────────────────────────────────────┘

Step 4: Create Episode
┌────────────────────────────────────────┐
│ Creating episode for MRN-12345...      │
│                                        │
│ ✓ Diagnosis: Lower back pain           │
│ ✓ Provider: Dr. Anderson               │
│ ✓ Episode created                      │
│ ✓ Episode ID: EP-456                   │
│                                        │
│ [Continue to Scheduling]               │
└────────────────────────────────────────┘

Step 5: Ready to Schedule
┌────────────────────────────────────────┐
│ ✅ Patient created in EMR              │
│    MRN: MRN-12345                      │
│                                        │
│ ✅ Episode created                     │
│    Episode ID: EP-456                  │
│                                        │
│ Ready to schedule initial evaluation   │
│                                        │
│ [Open EMR Calendar]                    │
│ [Call Patient to Schedule]             │
└────────────────────────────────────────┘
```

---

## 📊 Decision Tree Diagram

```
                    Referral Received
                           │
                           ▼
                    Contact Patient
                           │
                  ┌────────┴────────┐
                  │                 │
              Reached          Not Reached
                  │                 │
                  ▼                 ▼
          Patient Interested    Set Follow-up
                  │             (try again)
                  ▼
          Have Prescription?
                  │
            ┌─────┴─────┐
            │           │
          YES          NO
            │           │
            ▼           ▼
     Run E&B Check   Wait for Rx
            │
            ▼
     Insurance Status?
            │
    ┌───────┴────────┐
    │                │
In-Network    Out-of-Network
    │                │
    ▼                ▼
Ready to      Patient Willing
Create        to Self-Pay?
    │            │
    │        ┌───┴───┐
    │        │       │
    │       YES     NO
    │        │       │
    │        └───┬───┘
    │            │
    └─────┬──────┘
          │
          ▼
    Check for Existing
    Patient in EMR
          │
    ┌─────┴─────┐
    │           │
 Found      Not Found
    │           │
    ▼           ▼
Link to    Create New
Existing   Patient
MRN            │
    │          ▼
    │      Get MRN
    │          │
    └────┬─────┘
         │
         ▼
   Create Episode
         │
         ▼
     Get Episode ID
         │
         ▼
    Schedule Appt
         │
         ▼
   Mark Scheduled
         │
         ▼
      COMPLETE
```

---

## 🎯 Final Recommendations

### 1. NEO Should Track These States

```typescript
type ReferralStatus = 
  | "new"                      // Just received
  | "assigned"                 // Staff claimed
  | "contacting_patient"       // Trying to reach
  | "contacted"                // Spoke with patient
  | "awaiting_prescription"    // Need Rx fax
  | "prescription_received"    // Have Rx
  | "verifying_insurance"      // E&B in progress
  | "insurance_verified"       // ✅ Ready to create
  | "checking_duplicates"      // Searching EMR
  | "creating_patient"         // API call in progress
  | "patient_in_emr"           // Have MRN
  | "creating_episode"         // API call in progress
  | "episode_in_emr"           // Have Episode ID
  | "ready_to_schedule"        // Ready for calendar
  | "scheduling"               // Booking appointment
  | "scheduled"                // Appointment booked
  | "arrived"                  // Patient showed up
  | "in_treatment"             // Active care
  | "completed"                // Discharged
  | "declined"                 // Patient said no
  | "archived";                // Historical record
```

### 2. Automated vs Manual Creation

```typescript
interface CreatePatientConfig {
  method: "manual" | "api";
  
  manual: {
    // Show helper screen
    // Copy buttons for data
    // Open EMR link
    // Input field for MRN
  },
  
  api: {
    emrSystem: "prompt" | "webpt" | "other";
    endpoint: string;
    // Auto-create, receive MRN
  }
}
```

### 3. The Perfect Button States

```tsx
// Conditional button based on referral status

{status === "insurance_verified" && (
  <Button onClick={handleCreateInEMR}>
    🎯 Create in EMR - Ready!
  </Button>
)}

{status === "patient_in_emr" && (
  <Button onClick={handleCreateEpisode}>
    ✓ Patient in EMR (MRN-{mrn})
    Create Episode →
  </Button>
)}

{status === "episode_in_emr" && (
  <Button onClick={handleSchedule}>
    ✓ Patient & Episode in EMR
    Schedule Appointment →
  </Button>
)}

{status === "scheduled" && (
  <Badge>
    ✅ Scheduled for {appointmentDate}
  </Badge>
)}
```

---

## ✅ Conclusion

### The Golden Rule:

**Create patient in EMR when:**
- ✅ You've verified they're real
- ✅ You've verified they want to come
- ✅ You've verified their insurance works
- ✅ You're about to schedule them

**Not before, not after - just right.**

This prevents:
- ❌ Zombie patients (created but never came)
- ❌ Duplicate records
- ❌ Wasted staff time
- ❌ Messy EMR data

And enables:
- ✅ Clean, accurate EMR
- ✅ High conversion rate tracking
- ✅ Efficient staff workflow
- ✅ Better patient experience

