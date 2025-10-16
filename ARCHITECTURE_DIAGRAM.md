# Patient & Case Management Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Fax    │  │   Web    │  │   Call   │  │  Manual  │            │
│  │  Inbox   │  │  Leads   │  │   Logs   │  │  Entry   │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │             │             │             │                    │
│       └─────────────┴─────────────┴─────────────┘                    │
│                          │                                           │
│                          ▼                                           │
│              ┌────────────────────────┐                              │
│              │ Create Patient + Case  │                              │
│              │     Wizard/Modal       │                              │
│              └───────────┬────────────┘                              │
│                          │                                           │
│       ┌──────────────────┼──────────────────┐                        │
│       │                  │                  │                        │
│       ▼                  ▼                  ▼                        │
│  ┌─────────┐    ┌──────────────┐    ┌──────────┐                   │
│  │ Patient │    │   Patient    │    │  Patient │                   │
│  │ Search  │    │     Form     │    │ Profile  │                   │
│  │  Modal  │    │  (Tabbed)    │    │  Sheet   │                   │
│  └─────────┘    └──────────────┘    └──────────┘                   │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │ Patient Service  │         │  Case Service    │                  │
│  ├──────────────────┤         ├──────────────────┤                  │
│  │ • create()       │         │ • create()       │                  │
│  │ • search()       │         │ • update()       │                  │
│  │ • update()       │         │ • getByPatient() │                  │
│  │ • getById()      │         │ • getById()      │                  │
│  │ • checkDupes()   │         │ • close()        │                  │
│  └────────┬─────────┘         └────────┬─────────┘                  │
│           │                            │                             │
│           └──────────┬─────────────────┘                             │
│                      │                                               │
│                      ▼                                               │
│         ┌─────────────────────────┐                                 │
│         │   Duplicate Detection   │                                 │
│         │   • Fuzzy name match    │                                 │
│         │   • Phone number match  │                                 │
│         │   • DOB + name match    │                                 │
│         │   • Email match         │                                 │
│         └─────────────────────────┘                                 │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │  Patient Table   │         │   Case Table     │                  │
│  ├──────────────────┤         ├──────────────────┤                  │
│  │ • id (PK)        │         │ • id (PK)        │                  │
│  │ • mrn            │◄────┐   │ • patient_id (FK)├─────┐            │
│  │ • firstName      │     │   │ • diagnosis      │     │            │
│  │ • lastName       │     └───┤ • referral_info  │     │            │
│  │ • dob            │         │ • auth_status    │     │            │
│  │ • phone          │         │ • status         │     │            │
│  │ • email          │         │ • created_at     │     │            │
│  │ • insurance      │         └──────────────────┘     │            │
│  │ • created_at     │                                  │            │
│  └──────────────────┘                                  │            │
│           │                                            │            │
│           └────────────────┬───────────────────────────┘            │
│                            │                                         │
│                            ▼                                         │
│                  ┌───────────────────┐                               │
│                  │  Activity Log     │                               │
│                  ├───────────────────┤                               │
│                  │ • patient_id (FK) │                               │
│                  │ • case_id (FK)    │                               │
│                  │ • type            │                               │
│                  │ • description     │                               │
│                  │ • timestamp       │                               │
│                  └───────────────────┘                               │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │   EMR System     │         │  Clearinghouse   │                  │
│  │  (Prompt/NEO)    │         │  (E&B Checks)    │                  │
│  ├──────────────────┤         ├──────────────────┤                  │
│  │ • Create Patient │         │ • Verify Eligib. │                  │
│  │ • Create Episode │         │ • Check Benefits │                  │
│  │ • Get MRN        │         │ • Get Auth Info  │                  │
│  │ • Sync Updates   │         └──────────────────┘                  │
│  └──────────────────┘                                                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Relationships

```
┌─────────────────────────────────────────┐
│              PATIENT                    │
│  ┌───────────────────────────────────┐  │
│  │ ID: PAT-001                       │  │
│  │ Name: John Smith                  │  │
│  │ DOB: 1985-03-15                   │  │
│  │ Phone: (555) 123-4567             │  │
│  │ Insurance: BCBS #ABC123456        │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               │ has many
               │
    ┌──────────┴──────────┬───────────────┐
    │                     │               │
    ▼                     ▼               ▼
┌─────────┐         ┌─────────┐     ┌─────────┐
│ CASE 1  │         │ CASE 2  │     │ CASE 3  │
├─────────┤         ├─────────┤     ├─────────┤
│ Shoulder│         │ Back    │     │ Knee    │
│ Rehab   │         │ Pain    │     │ Injury  │
│         │         │         │     │         │
│ Status: │         │ Status: │     │ Status: │
│Completed│         │ Active  │     │  New    │
│         │         │         │     │         │
│ Jan-Mar │         │ Current │     │ Future  │
│  2024   │         │         │     │         │
└─────────┘         └─────────┘     └─────────┘
```

---

## Workflow: Creating Patient from Fax

```
┌──────────────────────────────────────────────────────────────────────┐
│                      FAX ARRIVES                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ From: Dr. Anderson (Orthopedic Associates)                 │     │
│  │ Patient: John Smith, DOB: 03/15/1985                       │     │
│  │ Diagnosis: Lower back pain                                 │     │
│  │ Insurance: BCBS #ABC123456                                 │     │
│  │ Order: PT eval & treatment, 3x/week for 6 weeks            │     │
│  └────────────────────────────────────────────────────────────┘     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                  User clicks "Create Patient + Case"
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   STEP 1: PATIENT SEARCH                             │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ Searching for:                                             │     │
│  │  • Name: John Smith                                        │     │
│  │  • Phone: (555) 123-4567                                   │     │
│  │  • DOB: 03/15/1985                                         │     │
│  │                                                            │     │
│  │ Results: No matches found ✓                               │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  [No Match Found - Create New Patient] ◄─ User clicks                │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│               STEP 2: PATIENT FORM (PRE-FILLED)                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Demographics Tab:                                        │       │
│  │  First Name: [John] ✓                                   │       │
│  │  Last Name: [Smith] ✓                                   │       │
│  │  DOB: [03/15/1985] ✓                                    │       │
│  │  Gender: [Male] ← User fills                            │       │
│  │                                                          │       │
│  │ Contact Tab:                                             │       │
│  │  Primary Phone: [(555) 123-4567] ✓                      │       │
│  │  Email: [ ] ← User fills                                │       │
│  │  Address: [ ] ← User fills                              │       │
│  │                                                          │       │
│  │ Insurance Tab:                                           │       │
│  │  Company: [Blue Cross Blue Shield] ✓                    │       │
│  │  Member ID: [ABC123456] ✓                               │       │
│  │  Group #: [ ] ← User fills                              │       │
│  │                                                          │       │
│  │ Consent Tab:                                             │       │
│  │  ☑ HIPAA Consent                                        │       │
│  │  ☑ Treatment Consent                                    │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  [Cancel]  [Create Patient] ◄─ User clicks                           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                   Patient created in DB
                   MRN assigned: MRN-12345
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│               STEP 3: CASE FORM (PRE-FILLED)                         │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Patient: John Smith (MRN-12345) ← Read-only              │       │
│  │                                                          │       │
│  │ Referral Info:                                           │       │
│  │  Referring Provider: [Dr. Anderson] ✓                   │       │
│  │  Organization: [Orthopedic Associates] ✓                │       │
│  │  Referral Date: [01/15/2024] ✓                          │       │
│  │  Source: [Fax] ✓                                        │       │
│  │                                                          │       │
│  │ Diagnosis:                                               │       │
│  │  Primary: [Lower back pain] ✓                           │       │
│  │  ICD-10: [M54.5] ← User adds                            │       │
│  │  Order: [PT eval & treatment, 3x/week for 6 weeks] ✓   │       │
│  │                                                          │       │
│  │ Authorization:                                           │       │
│  │  Status: [Pending] ← User selects                       │       │
│  │  Network: [In-Network] ← User confirms                  │       │
│  │                                                          │       │
│  │ Treatment Plan:                                          │       │
│  │  Frequency: [3x per week] ✓                             │       │
│  │  Duration: [6 weeks] ✓                                  │       │
│  │  Assigned Therapist: [Sarah Wilson] ← User assigns      │       │
│  │  Location: [ETS Hartford] ← User selects                │       │
│  │  Priority: [High] ← User sets                           │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  [Back]  [Create Case] ◄─ User clicks                                │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                   Case created & linked to patient
                   Case ID: CASE-001
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   STEP 4: SUCCESS & NEXT ACTIONS                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ ✓ Patient Created: John Smith (MRN-12345)                 │     │
│  │ ✓ Case Created: Lower back pain (CASE-001)                │     │
│  │                                                            │     │
│  │ What would you like to do next?                           │     │
│  │                                                            │     │
│  │ [Add to Opportunity Board]  ← Most common                 │     │
│  │ [Schedule Evaluation]                                      │     │
│  │ [Run E&B Check]                                           │     │
│  │ [View Patient Profile]                                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  User selects "Add to Opportunity Board"                             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    OPPORTUNITIES BOARD                               │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ Unassigned │  │  Assigned  │  │ Contacted  │  │  Ready to  │   │
│  │            │  │            │  │            │  │  Schedule  │   │
│  ├────────────┤  ├────────────┤  ├────────────┤  ├────────────┤   │
│  │            │  │            │  │            │  │            │   │
│  │ ┌────────┐ │  │            │  │            │  │            │   │
│  │ │ John   │◄┼──┼ NEW!       │  │            │  │            │   │
│  │ │ Smith  │ │  │            │  │            │  │            │   │
│  │ │        │ │  │            │  │            │  │            │   │
│  │ │ Lower  │ │  │            │  │            │  │            │   │
│  │ │ back   │ │  │            │  │            │  │            │   │
│  │ │ pain   │ │  │            │  │            │  │            │   │
│  │ │        │ │  │            │  │            │  │            │   │
│  │ │ High   │ │  │            │  │            │  │            │   │
│  │ │Priority│ │  │            │  │            │  │            │   │
│  │ └────────┘ │  │            │  │            │  │            │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                      │
│  Agent can now work on this case ✓                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Structure

```
src/
├── components/
│   │
│   ├── PatientSearchModal.tsx ◄────┐
│   │   ├─ Input fields            │
│   │   ├─ Search logic             │
│   │   └─ Match display            │
│   │                               │
│   ├── PatientForm.tsx ◄───────────┤
│   │   ├─ Tab: Demographics        │
│   │   ├─ Tab: Contact             │
│   │   ├─ Tab: Insurance           │
│   │   ├─ Tab: Consent             │
│   │   └─ Validation logic         │
│   │                               │
│   ├── CaseForm.tsx (To Create) ◄──┤
│   │   ├─ Referral info            │
│   │   ├─ Diagnosis                │
│   │   ├─ Authorization            │
│   │   └─ Treatment plan           │
│   │                               │
│   └── CreatePatientCaseWizard.tsx │
│       ├─ Step 1: Search ──────────┤
│       ├─ Step 2: Patient Form ────┤
│       ├─ Step 3: Case Form ───────┤
│       ├─ Step 4: Review           │
│       └─ Step 5: Success          │
│
├── types/
│   ├── patient.ts
│   │   ├─ Patient interface
│   │   ├─ CreatePatientDTO
│   │   ├─ UpdatePatientDTO
│   │   └─ PatientSearchCriteria
│   │
│   └── case.ts
│       ├─ Case interface
│       ├─ CreateCaseDTO
│       ├─ UpdateCaseDTO
│       └─ CaseWithPatient
│
├── services/
│   ├── patientService.ts
│   │   ├─ create()
│   │   ├─ search()
│   │   ├─ update()
│   │   └─ getById()
│   │
│   ├── caseService.ts
│   │   ├─ create()
│   │   ├─ update()
│   │   ├─ getByPatient()
│   │   └─ close()
│   │
│   └── emrIntegration.ts
│       ├─ syncPatient()
│       ├─ syncCase()
│       └─ getMRN()
│
└── pages/
    ├── FaxInbox.tsx
    │   └─ ➕ "Create Patient + Case" button
    │
    ├── WebLeads.tsx
    │   └─ ➕ "Convert to Patient" button
    │
    ├── Opportunities.tsx
    │   └─ 🔄 Show Cases instead of Leads
    │
    └── Patients.tsx
        └─ ➕ "Add Patient" button
```

---

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  patients: Patient[]                                        │
│  cases: Case[]                                              │
│  selectedPatient: Patient | null                            │
│  selectedCase: Case | null                                  │
│                                                             │
│  Actions:                                                   │
│  ├─ createPatient(data) → Patient                          │
│  ├─ updatePatient(id, data) → Patient                      │
│  ├─ searchPatients(criteria) → PatientMatchResult[]        │
│  ├─ createCase(data) → Case                                │
│  ├─ updateCase(id, data) → Case                            │
│  └─ getCasesByPatient(patientId) → Case[]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

           │
           │ subscribes to
           │
           ▼

┌─────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FaxInbox                                                   │
│  ├─ usePatientCaseStore()                                   │
│  └─ createPatient() when "Create" clicked                   │
│                                                             │
│  PatientForm                                                │
│  ├─ Local state for form fields                            │
│  └─ Calls onSubmit(data) when form submitted               │
│                                                             │
│  OpportunitiesBoard                                         │
│  ├─ usePatientCaseStore()                                   │
│  └─ Displays cases.filter(c => c.status === 'active')      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Tree: When to Create Patient vs Case

```
                    Start
                      │
                      ▼
        ┌─────────────────────────┐
        │  Do you have patient    │
        │  demographics?          │
        └────────┬────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
       YES               NO
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│ Search for   │   │  Gather info │
│ existing     │   │  first       │
│ patient      │   │              │
└───┬──────────┘   └──────────────┘
    │
    ▼
┌─────────────┐
│ Found?      │
└───┬─────────┘
    │
┌───┴────┐
│        │
YES      NO
│        │
│        ▼
│   ┌────────────────┐
│   │ Create Patient │
│   └────────┬───────┘
│            │
└────────┬───┘
         │
         ▼
┌──────────────────────┐
│ Does patient need    │
│ treatment for a      │
│ NEW condition?       │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Create  │ │ Update       │
│ New     │ │ Existing     │
│ Case    │ │ Case         │
└─────────┘ └──────────────┘
```

---

## Integration Points Summary

| Entry Point | Patient Action | Case Action | Next Step |
|------------|----------------|-------------|-----------|
| **Fax Referral** | Create or Link | Create New | Opportunity Board |
| **Web Lead** | Create or Link | Create New | Opportunity Board |
| **Phone Call** | Create or Link | Create New | Opportunity Board |
| **Manual Entry** | Create Only | Optional | Patient Directory |
| **Patient Profile** | N/A | Create New | Schedule or Board |

---

## File Dependencies

```
PatientForm.tsx
    ├── requires: @/types/patient (CreatePatientDTO)
    ├── requires: @/components/ui/* (shadcn components)
    └── used by: FaxInbox, WebLeads, Patients

PatientSearchModal.tsx
    ├── requires: @/types/patient (Patient, PatientMatchResult)
    ├── requires: @/components/ui/*
    └── used by: FaxInbox, WebLeads, CreatePatientCaseWizard

CaseForm.tsx (to be created)
    ├── requires: @/types/case (CreateCaseDTO)
    ├── requires: @/types/patient (Patient)
    ├── requires: @/components/ui/*
    └── used by: FaxInbox, PatientProfile, Opportunities

patient.ts
    └── imported by: PatientForm, PatientSearchModal, patientService

case.ts
    └── imported by: CaseForm, caseService, Opportunities

patientService.ts
    ├── requires: @/types/patient
    └── used by: PatientForm, PatientSearchModal

caseService.ts
    ├── requires: @/types/case
    └── used by: CaseForm, Opportunities
```

This visual guide should help you understand how all the pieces fit together! 🎨

