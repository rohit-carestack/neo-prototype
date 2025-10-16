# Patient & Case Creation Workflow Design

## Overview
This document outlines the architecture for creating patient records and cases/episodes of care in the system, with integration touchpoints for EMR systems (Prompt, NEO, etc.).

## Core Entities

### Patient Record (Persistent)
**Purpose**: Single source of truth for patient demographic and contact information

**Fields**:
- Patient ID / MRN (Medical Record Number)
- First Name, Last Name, Middle Initial
- Date of Birth
- Gender
- Phone (Primary, Secondary)
- Email
- Address (Street, City, State, ZIP)
- Emergency Contact (Name, Relationship, Phone)
- Primary Insurance (Company, Member ID, Group #, Subscriber Name, Relationship)
- Secondary Insurance (Same fields)
- Preferred Language
- Consent flags (HIPAA, Treatment, Communications)
- Created Date, Updated Date
- Status (Active, Inactive, Deceased)

### Case/Episode of Care (Treatment Instance)
**Purpose**: Represents a specific treatment episode for a condition

**Fields**:
- Case ID / Episode Number
- Patient ID (Foreign Key)
- Diagnosis/Condition
- ICD-10 Codes
- Referring Provider (Name, NPI, Organization, Phone, Fax)
- Referral/Prescription Details
- Order/Prescription Text
- Referral Source (Fax, Web, Call, Walk-in)
- Referral Date
- Authorization Status (Pending, Approved, Denied)
- Authorization Number
- Authorized Visits
- Auth Expiration Date
- Case Status (New, Active, On-Hold, Completed, Cancelled)
- Start Date, End Date
- Treatment Plan
- Assigned Therapist
- Assigned Location
- Network Status (In-Network, Out-of-Network)
- Priority (Routine, Urgent, Emergency)
- Created Date, Updated Date

---

## Entry Points & Workflows

### 1. From Fax Referral

**Scenario**: Referral fax comes in with patient and prescription information

**Workflow**:
```
Fax Received → View Fax Details → "Create Patient + Case" Button
                                            ↓
                            Patient Matching/Deduplication Check
                                    ↓               ↓
                            Found Match      No Match Found
                                ↓                   ↓
                        Review & Confirm    Create New Patient Form
                        Existing Patient         (pre-filled from fax)
                                ↓                   ↓
                                └─────→ Create Case Form ←─────┘
                                        (pre-filled from fax)
                                                ↓
                                    Review & Submit (Preview)
                                                ↓
                                    Created in System + EMR
                                                ↓
                                    Option: Add to Opportunity Board
                                        or Schedule Directly
```

**UI Components**:
- Fax viewer with extracted fields highlighted
- "Create Patient + Case" CTA button
- Patient search/match modal
- Patient creation form (can be separate step or combined)
- Case creation form
- Review & submit page with preview
- Success confirmation with next actions

### 2. From Web Lead

**Scenario**: Someone submits a web form requesting services

**Workflow**:
```
Web Lead → View Lead Details → "Convert to Patient" Button
                                        ↓
                        Patient Matching Check (by phone/email)
                                ↓               ↓
                        Found Match      No Match Found
                            ↓                   ↓
                    Link to Existing    Create New Patient
                    Patient                     ↓
                            └───────→ Create Case ←────────┘
                                        ↓
                                Add to Opportunity Board
```

**UI Components**:
- Web lead detail view
- "Convert to Patient" button
- Patient matching by email/phone
- Simplified patient form (web leads often have less info)
- Case form (may need to call patient for additional details)

### 3. From Phone Call

**Scenario**: Patient or provider calls requesting services

**Workflow**:
```
Call Received → Call IQ captures info → "Create from Call" Button
                                                ↓
                                    Patient Search (by phone)
                                        ↓               ↓
                                Found Match      No Match Found
                                    ↓                   ↓
                            Update if needed    Create New Patient
                                    └───────→ Create Case ←────────┘
                                                ↓
                                    Add to Opportunity Board or Schedule
```

**UI Components**:
- Call transcript/summary view
- Quick patient lookup by caller ID
- Patient creation form
- Case creation with call context

### 4. Manual Entry

**Scenario**: Front desk staff manually enters a walk-in or phone inquiry

**Workflow**:
```
"Add Patient" Button → Patient Form → Save → Create Case (optional)
                                                    ↓
                                        Add to Opportunity Board
```

---

## Critical UI Components Breakdown

### Component 1: Patient Search/Match Modal
**When**: Before creating any new patient
**Purpose**: Prevent duplicate patient records

**Features**:
- Search by: Name + DOB, Phone, Email, MRN
- Fuzzy matching for names (Sarah vs Sara, Smith vs Smyth)
- Display potential matches with:
  - Match confidence score
  - Patient details (DOB, phone, last visit)
  - "This is the patient" button
  - "Not a match" option
- "No matches found - Create new patient" state

**Code Location**: Create as `src/components/PatientSearchModal.tsx`

---

### Component 2: Patient Creation Form
**When**: Creating a new patient record
**Purpose**: Capture all required demographic and insurance information

**Features**:
- **Section 1: Demographics**
  - Name (First, Middle, Last)
  - DOB (with age calculation)
  - Gender
  - Address (with autocomplete)
  - Preferred language

- **Section 2: Contact**
  - Primary phone
  - Secondary phone
  - Email
  - Preferred contact method
  - Emergency contact

- **Section 3: Insurance**
  - Primary insurance (Company search/dropdown, Member ID, Group #, Subscriber info)
  - Secondary insurance (optional)
  - Insurance verification status
  - "Run E&B" button (integrated)

- **Section 4: Consent**
  - HIPAA consent checkbox
  - Treatment consent checkbox
  - Communication preferences

**Validation**:
- Required fields: Name, DOB, Phone, Primary Insurance
- DOB must be valid date in the past
- Phone format validation
- Email format validation
- Insurance member ID format per carrier

**Pre-fill Options**:
- From fax extracted data
- From web form submission
- From call transcript

**Code Location**: Create as `src/components/PatientForm.tsx`

---

### Component 3: Case/Episode Creation Form
**When**: After patient is created/selected
**Purpose**: Create a new treatment episode

**Features**:
- **Link to Patient**: Display patient name, DOB, MRN (read-only)

- **Section 1: Referral Information**
  - Referring provider (search or manual entry)
  - Referral date
  - Referral source (Fax, Web, Call, Walk-in)
  - Diagnosis/Condition (free text + search)
  - ICD-10 codes (search with autocomplete)
  - Order/Prescription text

- **Section 2: Authorization**
  - Auth status (Pending, Approved, Denied, Not Required)
  - Auth number (if approved)
  - Authorized visits
  - Auth expiration date
  - Network status (In/Out of network)

- **Section 3: Treatment Plan**
  - Treatment frequency (e.g., 3x/week)
  - Expected duration (e.g., 6 weeks)
  - Assigned therapist (dropdown)
  - Assigned location (dropdown)
  - Priority level

- **Section 4: Scheduling Preference** (optional at creation)
  - Preferred days
  - Preferred times
  - Schedule immediately checkbox

**Validation**:
- Required: Diagnosis, Referral source
- If Auth Approved: Must have auth number and dates
- Auth expiration must be future date

**Code Location**: Create as `src/components/CaseForm.tsx`

---

### Component 4: Combined "Create Patient + Case" Wizard
**When**: Quick creation from fax/lead/call
**Purpose**: Streamlined multi-step process

**Step Flow**:
1. **Patient Search** → Check for existing
2. **Patient Details** → Create/confirm patient
3. **Case Details** → Create episode
4. **Review** → Preview all info
5. **Submit** → Create in system + EMR
6. **Next Actions** → Route to board, schedule, or run E&B

**Features**:
- Step indicator (1 of 5, 2 of 5, etc.)
- Back/Next navigation
- Save as draft option
- Pre-filled from source (fax, lead, call)
- Side panel shows source document (fax PDF, web form, call transcript)

**Code Location**: Create as `src/components/CreatePatientCaseWizard.tsx`

---

### Component 5: Patient + Case Preview/Confirmation
**When**: Before final submission
**Purpose**: Review all entered information

**Features**:
- Two-column layout:
  - **Left**: Patient information card
  - **Right**: Case information card
- Edit buttons for each section
- Warning indicators for missing optional but important fields
- "Create in System" primary button
- "Create in System + EMR" secondary option
- "Save Draft" tertiary option

**Code Location**: Create as part of wizard or `src/components/PatientCasePreview.tsx`

---

## Where to Combine vs Separate

### ✅ COMBINE (Single Flow)

1. **Initial Creation from Source Documents** (Fax, Web Lead, Call)
   - Use the wizard approach
   - Patient + Case created together
   - Reason: These sources typically have all info needed for both

2. **Quick Actions Menu**
   - Single "Create Patient + Case" action
   - Reason: Most common workflow is to create both

3. **Review/Preview Step**
   - Show both patient and case info together
   - Reason: Need to see full picture before submitting

### ❌ SEPARATE (Individual Flows)

1. **Patient Directory → Add Patient**
   - Only create patient, no case
   - Use case: Adding family members, updating existing patients
   - Reason: Not every patient add needs a case immediately

2. **Existing Patient → Add New Case**
   - Patient already exists, just add new episode
   - Use case: Patient returns for different condition
   - Reason: Don't want to duplicate patient info

3. **Case Management Board**
   - Show cases, not patients
   - Reason: Focus on active treatment episodes

4. **Patient Search/Directory**
   - Search and view patients
   - Can see all their cases/episodes
   - Reason: Patient-centric view for demographics

---

## Integration Touchpoints with EMR

### Option 1: Real-time Sync (Recommended)
```
App creates Patient/Case → API call to EMR → Confirmation
```

**Implementation**:
- Patient creation triggers EMR API call
- Return MRN from EMR and save
- Case creation links to EMR patient
- Bidirectional sync for updates

### Option 2: Batch Export
```
App creates Patient/Case → Queue for export → Nightly batch to EMR
```

**Implementation**:
- Save with "Pending EMR Sync" status
- Batch job exports to EMR
- Update with MRN after sync

### Option 3: Manual Entry
```
App creates Patient/Case → Staff manually enters into EMR
```

**Implementation**:
- Print/export patient intake packet
- Staff uses as source to enter in EMR
- Checkbox for "Entered in EMR"

---

## Data Flow Architecture

```
┌─────────────────┐
│  Entry Points   │
│  - Fax          │
│  - Web Lead     │
│  - Call         │
│  - Manual       │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Patient Search/     │
│ Deduplication       │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│Found │  │Create │
│Match │  │New    │
└───┬──┘  └──┬────┘
    │        │
    │    ┌───▼──────────┐
    │    │Patient Record│
    │    │(Demographics,│
    │    │Insurance)    │
    │    └───┬──────────┘
    │        │
    └────┬───┘
         │
         ▼
┌─────────────────────┐
│  Case/Episode       │
│  (Diagnosis,        │
│   Referral, Auth)   │
└────────┬────────────┘
         │
    ┌────┴─────────────┐
    │                  │
┌───▼────────┐  ┌─────▼─────┐
│Opportunity │  │Schedule   │
│Board       │  │Directly   │
└────────────┘  └───────────┘
```

---

## Example User Stories

### Story 1: Front Desk Agent Creates Patient from Fax
1. Agent opens fax inbox, sees new referral fax
2. Clicks on fax to view details
3. AI has extracted: Patient name, DOB, diagnosis, insurance, referring provider
4. Agent clicks "Create Patient + Case" button
5. **Step 1**: System searches for existing patients
   - No match found
6. **Step 2**: Patient form pre-filled from fax
   - Agent reviews, adds missing phone number
7. **Step 3**: Case form pre-filled from fax
   - Agent confirms diagnosis, adds ICD-10 code
8. **Step 4**: Review page shows both patient and case
   - Agent clicks "Create in System + EMR"
9. **Step 5**: Success - Patient and case created
   - Agent chooses "Add to Opportunity Board"
   - Agent assigns to themselves
   - Agent clicks "Run E&B" to verify insurance

### Story 2: Agent Adds New Case for Existing Patient
1. Agent searches patient directory, finds existing patient
2. Clicks on patient profile
3. Sees existing cases (Completed: Shoulder rehab - 2023)
4. Clicks "Add New Case" button
5. Case form opens (patient info read-only at top)
6. Agent enters new diagnosis (Lower back pain), referral info
7. Clicks submit - New case created
8. Case appears in opportunity board

### Story 3: Converting Web Lead to Patient
1. Agent opens web leads
2. Sees new lead: "Sarah Johnson - Knee pain"
3. Clicks on lead to view details
4. Lead has: Name, email, phone, condition, insurance company
5. Agent clicks "Convert to Patient"
6. System searches by email/phone - no match
7. Agent fills out full patient form (web lead had partial info)
8. Creates case for knee pain
9. Patient added to opportunity board in "Assigned" stage
10. Agent calls patient to schedule

---

## Recommended Implementation Phases

### Phase 1: Core Components (Week 1-2)
- [ ] `PatientSearchModal.tsx` - Search and match existing patients
- [ ] `PatientForm.tsx` - Create/edit patient demographics
- [ ] `CaseForm.tsx` - Create/edit cases
- [ ] Patient and Case TypeScript interfaces
- [ ] Mock data for testing

### Phase 2: Wizard Flow (Week 3)
- [ ] `CreatePatientCaseWizard.tsx` - Multi-step wizard
- [ ] Integration with existing pages (Fax, Web Leads)
- [ ] Preview/Review step
- [ ] Success state and routing

### Phase 3: EMR Integration (Week 4-5)
- [ ] EMR API client setup
- [ ] Patient sync (create, update, fetch MRN)
- [ ] Case sync with EMR
- [ ] Error handling and retry logic

### Phase 4: Enhancement & Polish (Week 6)
- [ ] Duplicate detection refinement
- [ ] Form validation improvements
- [ ] Auto-save drafts
- [ ] Bulk import capability

---

## File Structure

```
src/
├── components/
│   ├── PatientSearchModal.tsx        # Search for existing patients
│   ├── PatientForm.tsx                # Patient demographic form
│   ├── CaseForm.tsx                   # Case/episode form
│   ├── CreatePatientCaseWizard.tsx   # Combined multi-step wizard
│   ├── PatientCasePreview.tsx        # Review before submit
│   └── PatientProfileSheet.tsx       # View patient + all cases
├── pages/
│   ├── FaxInbox.tsx                   # Enhanced with "Create Patient+Case"
│   ├── WebLeads.tsx                   # Enhanced with "Convert to Patient"
│   ├── Opportunities.tsx              # Enhanced to show cases
│   └── Patients.tsx                   # Patient directory (already exists)
├── types/
│   ├── patient.ts                     # Patient interface
│   ├── case.ts                        # Case/Episode interface
│   └── referral.ts                    # Referral-related types
├── services/
│   ├── patientService.ts              # Patient CRUD operations
│   ├── caseService.ts                 # Case CRUD operations
│   ├── emrIntegration.ts              # EMR API integration
│   └── duplicateDetection.ts          # Patient matching logic
└── contexts/
    └── PatientCaseContext.tsx         # State management
```

---

## Key Decisions to Make

### 1. Required vs Optional Fields
**Decision needed**: Which fields are absolutely required vs nice-to-have?
- Recommendation: Start strict, relax later
- Minimum: Name, DOB, Phone, Primary Insurance, Diagnosis

### 2. EMR Integration Approach
**Decision needed**: Real-time vs Batch vs Manual
- Recommendation: Start with manual/checkbox, build towards real-time

### 3. Duplicate Detection Sensitivity
**Decision needed**: How strict should patient matching be?
- Recommendation: Medium sensitivity - Show potential matches, let user decide

### 4. Case Status Management
**Decision needed**: Can cases be reopened? How are completed cases handled?
- Recommendation: Allow reopen within 30 days, archive after that

### 5. Patient Merge Capability
**Decision needed**: If duplicates are found later, can they be merged?
- Recommendation: Phase 2 feature - Merge patients with conflict resolution

---

## Success Metrics

Track these to measure workflow effectiveness:
- Time to create patient + case (target: < 2 minutes)
- Duplicate patient creation rate (target: < 2%)
- Fields completed on first entry (target: > 90%)
- EMR sync success rate (target: > 99%)
- User satisfaction with workflow (survey after 2 weeks)

---

## Questions to Answer Before Implementation

1. **What EMR system(s) are you integrating with?** (Prompt, NEO, other?)
2. **Do you have EMR API documentation?**
3. **Who assigns MRN - your system or the EMR?**
4. **Can patients have multiple active cases simultaneously?**
5. **How do you handle patients with multiple insurance plans?**
6. **What happens if EMR sync fails - do you queue for retry?**
7. **Should cases automatically close after X days of no activity?**
8. **Do you need to support minors (patients under 18)?**

---

## Next Steps

1. Review this design with your team
2. Answer the questions above
3. Decide on Phase 1 scope
4. Create TypeScript interfaces for Patient and Case
5. Build PatientForm component first (most reusable)
6. Test with mockd data before EMR integration
7. Iterate based on user feedback


