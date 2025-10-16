# Unified "Create in EMR" Feature: Design & Edge Cases

## 🎯 The Goal

Create a **single, reusable component** that handles:
1. Checking if patient exists in EMR
2. Creating patient (if doesn't exist)
3. Creating case/episode (always)
4. Linking MRN and Episode ID back to NEO referral

This component should work across:
- Fax Inbox page
- Web Leads page
- Opportunities Board page

---

## 🤔 Thinking Out Loud: The Core Flow

### The User's Journey (What Sarah sees)

```
Sarah opens a referral that's ready to create in EMR:

┌────────────────────────────────────────────────────────┐
│ Referral: John Smith - Lower Back Pain                │
│ Status: ✓ Insurance Verified - Ready for EMR          │
│                                                        │
│ [Create in EMR] ← Sarah clicks this                   │
└────────────────────────────────────────────────────────┘

                     ↓

┌────────────────────────────────────────────────────────┐
│ MODAL OPENS: "Create in EMR"                          │
│                                                        │
│ Step 1: Checking for existing patient...              │
│ Searching: John Smith, DOB: 03/15/1985                │
│ [Loading...] ⏳                                        │
└────────────────────────────────────────────────────────┘

                     ↓
              
         ┌───────────┴───────────┐
         │                       │
    SCENARIO A              SCENARIO B
   Patient Exists         Patient Doesn't Exist
         │                       │
         ↓                       ↓
```

### Scenario A: Patient Exists in EMR

```
┌────────────────────────────────────────────────────────┐
│ ✓ Found Existing Patient                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ John Smith                                             │
│ MRN: MRN-00789                                         │
│ DOB: 03/15/1985                                        │
│ Phone: (555) 123-4567                                  │
│                                                        │
│ Last Visit: 8 months ago                               │
│ Previous Episodes:                                      │
│ • Shoulder rehab (Completed 8/2023)                    │
│ • Knee pain (Completed 2/2023)                         │
│                                                        │
│ Current Referral: Lower Back Pain                      │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│                                                        │
│ Is this the same patient?                              │
│                                                        │
│ [Yes, Same Patient] [No, Different Person]            │
└────────────────────────────────────────────────────────┘

If "Yes, Same Patient":
    ↓
┌────────────────────────────────────────────────────────┐
│ Using Existing Patient: John Smith (MRN-00789)        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Now creating NEW EPISODE for:                         │
│ • Diagnosis: Lower Back Pain                           │
│ • Referring Provider: Dr. Anderson                     │
│ • Referral Date: 01/15/2024                            │
│                                                        │
│ Episode Details:                                       │
│ [Auto-filled from referral]                            │
│                                                        │
│ Diagnosis: Lower Back Pain                             │
│ ICD-10: M54.5                                          │
│ Order: PT eval & treatment, 3x/week, 6 weeks          │
│                                                        │
│ [< Back] [Create Episode Only]                        │
└────────────────────────────────────────────────────────┘

If "No, Different Person":
    ↓
┌────────────────────────────────────────────────────────┐
│ Creating NEW patient record                            │
│ (even though similar one exists)                       │
│                                                        │
│ → Goes to Scenario B flow                             │
└────────────────────────────────────────────────────────┘
```

### Scenario B: Patient Doesn't Exist

```
┌────────────────────────────────────────────────────────┐
│ No Existing Patient Found                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ✓ No matching records in EMR                          │
│                                                        │
│ Ready to create:                                       │
│ 1. New Patient Record                                  │
│ 2. New Episode for this referral                       │
│                                                        │
│ [Continue to Create Patient + Episode]                │
└────────────────────────────────────────────────────────┘

                     ↓

┌────────────────────────────────────────────────────────┐
│ Create Patient + Episode                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│ PATIENT INFORMATION                                    │
│ ─────────────────────────────────────────────────────  │
│ First Name: John                                       │
│ Last Name: Smith                                       │
│ DOB: 03/15/1985                                        │
│ Gender: Male                                           │
│ Phone: (555) 123-4567                                  │
│ Email: john.smith@email.com                            │
│                                                        │
│ Insurance: Blue Cross Blue Shield                      │
│ Member ID: ABC123456                                   │
│ Group: GRP001                                          │
│ ✓ Verified In-Network                                 │
│                                                        │
│ EPISODE INFORMATION                                    │
│ ─────────────────────────────────────────────────────  │
│ Diagnosis: Lower Back Pain                             │
│ ICD-10: M54.5                                          │
│ Referring Provider: Dr. Anderson                       │
│   Organization: Orthopedic Associates                  │
│ Referral Date: 01/15/2024                              │
│ Order: PT eval & treatment, 3x/week, 6 weeks          │
│                                                        │
│ [< Back] [Review & Create in EMR]                     │
└────────────────────────────────────────────────────────┘

                     ↓

┌────────────────────────────────────────────────────────┐
│ Review Before Creating                                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│ You're about to create in EMR:                         │
│                                                        │
│ NEW PATIENT:                                           │
│ • John Smith (DOB: 03/15/1985)                         │
│ • BCBS #ABC123456 (In-Network ✓)                      │
│                                                        │
│ NEW EPISODE:                                           │
│ • Lower Back Pain (M54.5)                              │
│ • Referred by Dr. Anderson                             │
│                                                        │
│ [Cancel] [Create Patient + Episode]                   │
└────────────────────────────────────────────────────────┘

                     ↓

┌────────────────────────────────────────────────────────┐
│ Creating in EMR...                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ⏳ Step 1: Creating patient record...                  │
│ ✓ Step 1: Patient created (MRN-12345)                 │
│                                                        │
│ ⏳ Step 2: Creating episode...                         │
│ ✓ Step 2: Episode created (EP-456)                    │
│                                                        │
│ ⏳ Step 3: Linking to NEO referral...                  │
│ ✓ Step 3: Complete!                                   │
│                                                        │
└────────────────────────────────────────────────────────┘

                     ↓

┌────────────────────────────────────────────────────────┐
│ ✓ Successfully Created in EMR                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Patient: John Smith                                    │
│ MRN: MRN-12345                                         │
│                                                        │
│ Episode: Lower Back Pain                               │
│ Episode ID: EP-456                                     │
│                                                        │
│ Next Steps:                                            │
│ • Schedule initial evaluation                          │
│ • Send patient intake forms                            │
│ • Set appointment reminder                             │
│                                                        │
│ [Close] [Schedule Appointment]                        │
└────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Architecture

### The Main Component: `CreateInEMRModal`

```typescript
interface CreateInEMRModalProps {
  isOpen: boolean;
  onClose: () => void;
  referral: Referral; // Contains all the data we need
  onSuccess: (result: EMRCreationResult) => void;
}

interface EMRCreationResult {
  patientMRN: string;
  patientId?: string;
  episodeId?: string;
  isNewPatient: boolean; // true if we created, false if linked to existing
}

// Usage in different pages:
// Fax Inbox, Web Leads, Opportunities Board all use the same component
<CreateInEMRModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  referral={selectedReferral}
  onSuccess={handleEMRCreationSuccess}
/>
```

### The Sub-Components

```typescript
// 1. Patient Search Step
<PatientSearchStep
  referral={referral}
  onFound={(patient) => handleExistingPatient(patient)}
  onNotFound={() => handleNewPatient()}
/>

// 2. Existing Patient Confirmation
<ExistingPatientConfirmation
  patient={foundPatient}
  referral={referral}
  onConfirm={() => createEpisodeOnly()}
  onReject={() => handleNewPatient()}
/>

// 3. Patient + Episode Form (for new patients)
<PatientEpisodeForm
  initialData={referralData}
  onSubmit={handleCreateBoth}
/>

// 4. Episode Only Form (for existing patients)
<EpisodeOnlyForm
  patient={existingPatient}
  referralData={referralData}
  onSubmit={handleCreateEpisode}
/>

// 5. Review Step
<ReviewStep
  patientData={patientData}
  episodeData={episodeData}
  isNewPatient={isNewPatient}
  onConfirm={submitToEMR}
/>

// 6. Progress/Loading Step
<CreationProgressStep
  status={creationStatus}
/>

// 7. Success Step
<SuccessStep
  result={emrResult}
  onSchedule={handleSchedule}
/>
```

---

## 🔍 Integration Points: Where This Appears

### 1. Fax Inbox Page

**Trigger:** Referral is ready (insurance verified, prescription received)

```tsx
// In FaxInbox.tsx

const [selectedFax, setSelectedFax] = useState<FaxDocument | null>(null);
const [showCreateInEMR, setShowCreateInEMR] = useState(false);

// In the fax detail panel (side panel when viewing a fax)
{selectedFax && selectedFax.insuranceVerificationStatus === 'verified' && (
  <Button 
    onClick={() => setShowCreateInEMR(true)}
    className="w-full"
  >
    <Building2 className="mr-2 h-4 w-4" />
    Create in EMR
  </Button>
)}

<CreateInEMRModal
  isOpen={showCreateInEMR}
  onClose={() => setShowCreateInEMR(false)}
  referral={convertFaxToReferral(selectedFax)}
  onSuccess={(result) => {
    // Update fax with EMR link
    updateFaxWithEMRLink(selectedFax.id, result);
    toast.success(`Created in EMR: MRN-${result.patientMRN}`);
    setShowCreateInEMR(false);
  }}
/>
```

**Context in UI:**
```
Fax Detail Side Panel:
┌────────────────────────────────┐
│ John Smith                     │
│ Lower Back Pain                │
│                                │
│ ✓ Insurance Verified           │
│ ✓ Prescription Received        │
│                                │
│ [Create in EMR] ← Here         │
│ [Run E&B Check]                │
│ [Call Patient]                 │
└────────────────────────────────┘
```

### 2. Web Leads Page

**Trigger:** Lead is qualified and ready

```tsx
// In WebLeads.tsx

const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
const [showCreateInEMR, setShowCreateInEMR] = useState(false);

// In lead detail modal/drawer
{selectedLead && selectedLead.status === 'qualified' && (
  <Button 
    onClick={() => setShowCreateInEMR(true)}
  >
    <UserPlus className="mr-2 h-4 w-4" />
    Convert to Patient in EMR
  </Button>
)}

<CreateInEMRModal
  isOpen={showCreateInEMR}
  onClose={() => setShowCreateInEMR(false)}
  referral={convertLeadToReferral(selectedLead)}
  onSuccess={(result) => {
    updateLeadWithEMRLink(selectedLead.id, result);
    // Move to "Scheduled" status
    updateLeadStatus(selectedLead.id, 'in_emr');
    toast.success('Lead converted to patient!');
    setShowCreateInEMR(false);
  }}
/>
```

**Context in UI:**
```
Lead Detail Modal:
┌────────────────────────────────┐
│ Jennifer Martinez              │
│ Chronic Hip Pain               │
│                                │
│ ✓ Contacted                    │
│ ✓ Insurance Verified           │
│ ✓ Prescription Received        │
│                                │
│ [Convert to Patient] ← Here    │
└────────────────────────────────┘
```

### 3. Opportunities Board

**Trigger:** Referral card in "Ready to Schedule" column

```tsx
// In Opportunities.tsx (using your existing board)

const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
const [showCreateInEMR, setShowCreateInEMR] = useState(false);

// Option A: Quick action on card
<ReferralCard>
  {referral.status === 'insurance_verified' && !referral.emrLink && (
    <Button 
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedReferral(referral);
        setShowCreateInEMR(true);
      }}
    >
      Create in EMR
    </Button>
  )}
</ReferralCard>

// Option B: In detail drawer when card is clicked
<Drawer open={isDrawerOpen}>
  <DrawerContent>
    {selectedReferral && !selectedReferral.emrLink && (
      <Button onClick={() => setShowCreateInEMR(true)}>
        <Building2 className="mr-2 h-4 w-4" />
        Create in EMR
      </Button>
    )}
  </DrawerContent>
</Drawer>

<CreateInEMRModal
  isOpen={showCreateInEMR}
  onClose={() => setShowCreateInEMR(false)}
  referral={selectedReferral}
  onSuccess={(result) => {
    updateReferralWithEMRLink(selectedReferral.id, result);
    // Move card to next stage
    updateReferralStatus(selectedReferral.id, 'in_emr');
    setShowCreateInEMR(false);
  }}
/>
```

**Context in UI:**
```
Opportunities Board:
┌─────────────────────────────────────────────┐
│ Ready to Schedule Column                    │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ John Smith                              │ │
│ │ Lower Back Pain                         │ │
│ │ ✓ Verified                              │ │
│ │                                         │ │
│ │ [Create in EMR] ← Quick action          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🚨 Edge Cases & Failure Modes

### Edge Case 1: Duplicate Detection False Positive

**Scenario:** Search finds "John Smith" but it's a different person with same name

```
Problem:
- John Smith (our patient) DOB: 03/15/1985
- John Smith (in EMR) DOB: 03/15/1986 (one year off)
- Names match, DOBs close but not exact

Solution:
┌────────────────────────────────────────────────────────┐
│ Possible Match Found                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ John Smith (MRN-00789)                                 │
│ DOB: 03/15/1986 ⚠️ Close but not exact match          │
│ Phone: (555) 999-9999 ⚠️ Different                     │
│                                                        │
│ Your referral:                                         │
│ John Smith                                             │
│ DOB: 03/15/1985                                        │
│ Phone: (555) 123-4567                                  │
│                                                        │
│ These don't match exactly. What would you like to do?  │
│                                                        │
│ [Same Person - DOB Typo]                              │
│ [Different Person - Create New]                       │
│ [Search Again]                                         │
└────────────────────────────────────────────────────────┘
```

**Mitigation:**
- Show detailed comparison side-by-side
- Highlight differences in red
- Let staff make final decision
- Add "confidence score" to matches (90% = same name + DOB, 60% = same name only)

---

### Edge Case 2: EMR API Timeout

**Scenario:** Creating patient in EMR, but API call times out

```
Timeline:
1. User clicks "Create Patient + Episode"
2. NEO sends API request to Prompt EMR
3. Request times out after 30 seconds
4. User sees error
5. BUT: Patient might have been created in EMR!

Problem: Uncertain state
- Did patient get created or not?
- If we retry, will we create duplicate?

Solution: Idempotency + Retry Logic

┌────────────────────────────────────────────────────────┐
│ ⚠️ Creation Timed Out                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ The EMR didn't respond in time.                        │
│ The patient might have been created.                   │
│                                                        │
│ What would you like to do?                             │
│                                                        │
│ [Check EMR Manually]                                  │
│   → Opens EMR, you check if patient exists            │
│   → If exists, enter MRN manually                     │
│   → If not, retry creation                            │
│                                                        │
│ [Retry Creation]                                       │
│   → We'll check first if patient exists               │
│   → Then create only if needed                        │
│                                                        │
│ [Enter MRN Manually]                                   │
│   → You created it manually, enter MRN here           │
└────────────────────────────────────────────────────────┘
```

**Technical Implementation:**
```typescript
async function createPatientInEMR(data: PatientData): Promise<EMRResult> {
  try {
    // Add idempotency key (unique per referral)
    const idempotencyKey = `referral-${referralId}-patient-creation`;
    
    const response = await fetch('/api/emr/patients', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    return response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      // Check if patient was actually created
      const existingPatient = await searchEMRPatient({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
      });
      
      if (existingPatient) {
        // It was created! Return that
        return { patientMRN: existingPatient.mrn };
      } else {
        // Not created, safe to retry
        throw new TimeoutError('EMR did not respond');
      }
    }
    throw error;
  }
}
```

---

### Edge Case 3: Partial Failure (Patient Created, Episode Failed)

**Scenario:** Patient created successfully, but episode creation fails

```
Timeline:
1. Create patient → Success (MRN-12345)
2. Create episode → FAIL (EMR error)
3. Now what?

Problem:
- Patient exists in EMR
- But no episode
- NEO referral is in limbo state

Solution: Resume from failure point

┌────────────────────────────────────────────────────────┐
│ ⚠️ Partial Success                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ✓ Patient Created: MRN-12345                          │
│ ✗ Episode Creation Failed                             │
│                                                        │
│ Error: "Invalid ICD-10 code format"                   │
│                                                        │
│ The patient exists in EMR, but the episode wasn't     │
│ created. You can:                                      │
│                                                        │
│ [Fix & Retry Episode Creation]                        │
│   → We'll try to create just the episode              │
│   → Patient already exists, won't duplicate           │
│                                                        │
│ [Create Episode Manually in EMR]                       │
│   → Open EMR to MRN-12345                             │
│   → Create episode manually                            │
│   → Enter Episode ID when done                        │
│                                                        │
│ [Save MRN & Skip Episode]                             │
│   → Link MRN to referral                              │
│   → Create episode later                              │
└────────────────────────────────────────────────────────┘
```

**Technical Implementation:**
```typescript
// Save state at each step
interface EMRCreationState {
  step: 'patient' | 'episode' | 'complete';
  patientMRN?: string;
  episodeId?: string;
  error?: string;
}

async function createInEMR(referral: Referral) {
  const state: EMRCreationState = { step: 'patient' };
  
  try {
    // Step 1: Create patient
    const patientResult = await createPatient(referral.patientInfo);
    state.patientMRN = patientResult.mrn;
    state.step = 'episode';
    
    // Save progress to DB
    await saveEMRCreationState(referral.id, state);
    
    // Step 2: Create episode
    const episodeResult = await createEpisode({
      patientMRN: patientResult.mrn,
      ...referral.clinicalInfo
    });
    state.episodeId = episodeResult.id;
    state.step = 'complete';
    
    return state;
  } catch (error) {
    // Save error state
    state.error = error.message;
    await saveEMRCreationState(referral.id, state);
    throw error;
  }
}

// Resume from saved state
async function resumeEMRCreation(referral: Referral) {
  const savedState = await getEMRCreationState(referral.id);
  
  if (savedState.step === 'patient') {
    // Patient creation failed, retry full flow
    return createInEMR(referral);
  } else if (savedState.step === 'episode') {
    // Patient exists, just create episode
    return createEpisodeOnly(savedState.patientMRN, referral);
  }
}
```

---

### Edge Case 4: User Closes Modal Mid-Creation

**Scenario:** User clicks "Create in EMR", it starts, they close the modal before it finishes

```
Problem:
- API call in progress
- User navigates away
- Uncertain state

Solution: Prevent closing during critical operations

┌────────────────────────────────────────────────────────┐
│ Creating in EMR...                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ✓ Patient created (MRN-12345)                         │
│ ⏳ Creating episode...                                 │
│                                                        │
│ [X] ← Close button DISABLED during creation           │
│                                                        │
│ Please wait while we complete the creation...          │
└────────────────────────────────────────────────────────┘

// If user forces close (closes tab):
// - Background process continues
// - State saved to DB
// - Next time they open referral, show resume prompt
```

**Technical Implementation:**
```typescript
function CreateInEMRModal({ isOpen, onClose, referral }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleClose = () => {
    if (isCreating) {
      // Warn user
      const confirmed = confirm(
        'Creation is in progress. Closing now may leave the record incomplete. Are you sure?'
      );
      if (!confirmed) return;
    }
    onClose();
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
      // Prevent ESC key close during creation
      onEscapeKeyDown={(e) => {
        if (isCreating) e.preventDefault();
      }}
    >
      {/* Modal content */}
    </Dialog>
  );
}
```

---

### Edge Case 5: Conflicting Updates

**Scenario:** Two staff members try to create same referral at same time

```
Timeline:
- Sarah opens referral REF-001, clicks "Create in EMR"
- Tom opens same referral REF-001, clicks "Create in EMR"
- Both create patient at same time
- Result: Duplicate patients in EMR!

Solution: Optimistic locking + Real-time status

┌────────────────────────────────────────────────────────┐
│ ⚠️ Referral Being Processed                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Sarah Wilson is currently creating this referral      │
│ in the EMR.                                            │
│                                                        │
│ Started: 2 minutes ago                                 │
│ Status: Creating episode...                            │
│                                                        │
│ [Wait for Sarah to Finish]                            │
│ [Take Over Creation]                                   │
│   ⚠️ This may cause issues if Sarah is still working  │
└────────────────────────────────────────────────────────┘
```

**Technical Implementation:**
```typescript
// Lock referral when creation starts
async function startEMRCreation(referralId: string, userId: string) {
  // Try to acquire lock
  const lock = await db.referrals.update({
    where: { id: referralId },
    data: {
      emrCreationInProgress: true,
      emrCreationBy: userId,
      emrCreationStartedAt: new Date(),
    },
    // Optimistic locking: only update if not already locked
    where: {
      id: referralId,
      emrCreationInProgress: false, // Only if not locked
    }
  });
  
  if (!lock) {
    throw new Error('Referral is being processed by another user');
  }
  
  return lock;
}

// Release lock when done or on error
async function finishEMRCreation(referralId: string) {
  await db.referrals.update({
    where: { id: referralId },
    data: {
      emrCreationInProgress: false,
      emrCreationBy: null,
    }
  });
}

// Show real-time status using WebSocket or polling
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await checkReferralStatus(referralId);
    if (status.emrCreationInProgress) {
      setIsLockedBy(status.emrCreationBy);
    }
  }, 5000); // Check every 5 seconds
  
  return () => clearInterval(interval);
}, [referralId]);
```

---

### Edge Case 6: Missing/Invalid Data

**Scenario:** Referral is missing required fields for EMR

```
Problem:
- EMR requires: First Name, Last Name, DOB, Gender
- Referral only has: First Name, Last Name, Phone
- Missing: DOB, Gender

Solution: Validation before opening modal

// Pre-check before showing modal
function canCreateInEMR(referral: Referral): ValidationResult {
  const errors: string[] = [];
  
  if (!referral.patientInfo.firstName) errors.push('First name required');
  if (!referral.patientInfo.lastName) errors.push('Last name required');
  if (!referral.patientInfo.dateOfBirth) errors.push('Date of birth required');
  if (!referral.patientInfo.gender) errors.push('Gender required');
  if (!referral.clinicalInfo.diagnosis) errors.push('Diagnosis required');
  
  return {
    canCreate: errors.length === 0,
    errors,
  };
}

// In UI:
const handleCreateClick = () => {
  const validation = canCreateInEMR(selectedReferral);
  
  if (!validation.canCreate) {
    toast.error(
      <div>
        Cannot create in EMR. Missing required fields:
        <ul>
          {validation.errors.map(err => <li key={err}>{err}</li>)}
        </ul>
      </div>
    );
    
    // Show form to collect missing data
    setShowCollectDataForm(true);
    return;
  }
  
  setShowCreateInEMR(true);
};
```

**UI for Missing Data:**
```
┌────────────────────────────────────────────────────────┐
│ Missing Required Information                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Before creating in EMR, we need:                       │
│                                                        │
│ Date of Birth: [__/__/____]                           │
│ Gender: [Select ▼]                                     │
│                                                        │
│ You can also:                                          │
│ [Call Patient to Confirm]                             │
│ [Check Original Fax]                                   │
│                                                        │
│ [Save & Continue to Create]                           │
└────────────────────────────────────────────────────────┘
```

---

### Edge Case 7: EMR System Down

**Scenario:** EMR system is offline or unreachable

```
Problem:
- User tries to create patient
- EMR API returns 503 Service Unavailable
- Can't complete workflow

Solution: Graceful degradation + Manual fallback

┌────────────────────────────────────────────────────────┐
│ ⚠️ EMR System Unavailable                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Unable to connect to Prompt EMR.                       │
│ The system may be down for maintenance.                │
│                                                        │
│ You can:                                               │
│                                                        │
│ [Try Again]                                            │
│   We'll retry the connection                           │
│                                                        │
│ [Create Manually in EMR]                              │
│   1. Open EMR directly                                 │
│   2. Create patient manually                           │
│   3. Enter MRN here:                                   │
│      MRN: [_____________]                              │
│      [Save MRN]                                        │
│                                                        │
│ [Save for Later]                                       │
│   Mark this referral as "Pending EMR Creation"        │
│   Try again when EMR is back online                   │
└────────────────────────────────────────────────────────┘
```

**Technical Implementation:**
```typescript
// Health check before attempting creation
async function checkEMRHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/emr/health', {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Before showing modal
const handleCreateClick = async () => {
  const isEMRHealthy = await checkEMRHealth();
  
  if (!isEMRHealthy) {
    setShowEMRDownAlert(true);
    return;
  }
  
  setShowCreateInEMR(true);
};

// Retry with exponential backoff
async function createWithRetry(data: PatientData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createPatientInEMR(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying: 2s, 4s, 8s
      await sleep(Math.pow(2, i) * 2000);
    }
  }
}
```

---

### Edge Case 8: Browser Refresh/Crash During Creation

**Scenario:** User's browser crashes while creating in EMR

```
Problem:
- Creation in progress
- Browser crashes
- User reopens, uncertain state

Solution: Persistent state + Recovery

// On page load, check for incomplete operations
useEffect(() => {
  const checkIncompleteOperations = async () => {
    const incomplete = await getIncompleteEMRCreations(userId);
    
    if (incomplete.length > 0) {
      setShowRecoveryPrompt(true);
      setIncompleteOperations(incomplete);
    }
  };
  
  checkIncompleteOperations();
}, []);

// Recovery prompt
┌────────────────────────────────────────────────────────┐
│ Resume Incomplete Operations?                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ You have 1 incomplete EMR creation:                    │
│                                                        │
│ • John Smith (Lower Back Pain)                         │
│   Started: 5 minutes ago                               │
│   Status: Patient created, episode pending             │
│                                                        │
│ [Resume Creation]                                      │
│ [Cancel & Discard]                                     │
└────────────────────────────────────────────────────────┘
```

---

### Edge Case 9: Patient Data Changed (Phone Number, Address, etc.)

**Scenario:** Patient exists in EMR, but contact info has changed

```
Problem:
- EMR has: John Smith, Phone: (555) 111-1111
- New referral has: John Smith, Phone: (555) 222-2222
- Same person, but phone changed
- Or different person?

Solution: Show diff + Update option

┌────────────────────────────────────────────────────────┐
│ ⚠️ Patient Information Mismatch                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Found matching patient, but some details differ:       │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Field        │ EMR Record    │ New Referral     │   │
│ ├──────────────────────────────────────────────────┤   │
│ │ Name         │ John Smith    │ John Smith       │   │
│ │ DOB          │ 03/15/1985    │ 03/15/1985       │   │
│ │ Phone        │ (555) 111-1111│ (555) 222-2222 ⚠️│   │
│ │ Address      │ 123 Oak St    │ 456 Maple Ave  ⚠️│   │
│ │ Email        │ john@old.com  │ john@new.com   ⚠️│   │
│ │ Insurance    │ BCBS #ABC123  │ BCBS #ABC123     │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Is this the same patient with updated information?     │
│                                                        │
│ [Yes - Update EMR & Create Episode]                   │
│   → Updates patient record with new contact info      │
│   → Creates new episode                                │
│                                                        │
│ [Yes - Keep EMR Data & Create Episode]                │
│   → Uses existing EMR contact info                     │
│   → Creates episode only (ignores new contact info)   │
│                                                        │
│ [No - Different Patient]                              │
│   → Creates new patient record                         │
│                                                        │
│ [Call Patient to Verify]                              │
│   → Pause creation, call patient to confirm           │
└────────────────────────────────────────────────────────┘
```

**When to update vs. keep:**

```typescript
// Define which fields can be auto-updated vs. require confirmation
const CRITICAL_FIELDS = ['firstName', 'lastName', 'dateOfBirth', 'ssn'];
const UPDATEABLE_FIELDS = ['phone', 'email', 'address', 'emergencyContact'];

function analyzePatientDiff(emrPatient, referralData) {
  const criticalDiffs = [];
  const updateableDiffs = [];
  
  CRITICAL_FIELDS.forEach(field => {
    if (emrPatient[field] !== referralData[field]) {
      criticalDiffs.push(field);
    }
  });
  
  UPDATEABLE_FIELDS.forEach(field => {
    if (emrPatient[field] !== referralData[field]) {
      updateableDiffs.push(field);
    }
  });
  
  return {
    hasCriticalDiffs: criticalDiffs.length > 0,
    hasUpdateableDiffs: updateableDiffs.length > 0,
    criticalDiffs,
    updateableDiffs,
  };
}

// Auto-update logic
if (diff.hasUpdateableDiffs && !diff.hasCriticalDiffs) {
  // Safe to auto-update contact info
  await updateEMRPatient(emrPatient.mrn, {
    ...emrPatient,
    ...pick(referralData, UPDATEABLE_FIELDS),
    updatedAt: new Date(),
    updatedBy: userId,
    updateReason: 'New referral with updated contact info',
  });
} else if (diff.hasCriticalDiffs) {
  // STOP! Might be different person
  showDifferentPersonWarning();
}
```

**Smart auto-update strategy:**

```
Rules for automatic updates (no user prompt):
1. ✓ Phone number changed → Auto-update (people change numbers)
2. ✓ Email changed → Auto-update (people change emails)
3. ✓ Address changed → Auto-update (people move)
4. ✓ Emergency contact changed → Auto-update
5. ✓ Insurance details changed → Auto-update (people change jobs)

Rules that REQUIRE user confirmation:
1. ❌ DOB different → STOP (probably different person)
2. ❌ Name spelling different → STOP (typo vs different person?)
3. ❌ Gender different → STOP (data error or different person)
4. ⚠️ Phone + Email + Address ALL different → Warn (suspicious)

Confidence levels:
- High confidence same person: Name+DOB match, only contact info differs
- Medium confidence: Name+DOB match, but many fields differ
- Low confidence: Name matches but DOB slightly off
```

---

### Edge Case 10: Practice-Specific Custom Fields

**Scenario:** EMR has custom fields that vary by practice

```
Problem:
- Practice A uses "Marketing Source" dropdown
- Practice B uses "Referral Channel" with different options
- Practice C has custom "Patient Type" field
- Generic form won't work for all practices

Solution: Dynamic form configuration + Field mapping

// Define custom fields per practice
interface CustomFieldDefinition {
  fieldName: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  mappingSource?: string; // Where to pre-fill from
}

// Practice-specific configuration
const PRACTICE_CUSTOM_FIELDS: Record<string, CustomFieldDefinition[]> = {
  'practice-123': [
    {
      fieldName: 'marketingSource',
      label: 'How did you hear about us?',
      type: 'select',
      required: true,
      options: ['Physician Referral', 'Google Search', 'Facebook Ad', 'Friend/Family', 'Other'],
      mappingSource: 'referral.source', // Auto-map from referral source
    },
    {
      fieldName: 'preferredCommunication',
      label: 'Preferred Contact Method',
      type: 'select',
      required: false,
      options: ['Phone', 'Email', 'Text', 'Portal'],
      defaultValue: 'Phone',
    },
    {
      fieldName: 'interpreter_needed',
      label: 'Interpreter Needed?',
      type: 'boolean',
      required: false,
      defaultValue: false,
    },
    {
      fieldName: 'primaryLanguage',
      label: 'Primary Language',
      type: 'select',
      required: false,
      options: ['English', 'Spanish', 'Mandarin', 'Other'],
      defaultValue: 'English',
    },
  ],
  'practice-456': [
    {
      fieldName: 'patient_category',
      label: 'Patient Category',
      type: 'select',
      required: true,
      options: ['Auto Injury', 'Workers Comp', 'General PT', 'Sports Injury'],
    },
    {
      fieldName: 'attorney_name',
      label: 'Attorney Name (if applicable)',
      type: 'text',
      required: false,
    },
  ],
};

// Load custom fields for current practice
const customFields = PRACTICE_CUSTOM_FIELDS[practiceId] || [];
```

**UI with custom fields:**

```
┌────────────────────────────────────────────────────────┐
│ Create Patient + Episode                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│ PATIENT INFORMATION                                    │
│ ─────────────────────────────────────────────────────  │
│ First Name: John                                       │
│ Last Name: Smith                                       │
│ DOB: 03/15/1985                                        │
│ Gender: Male                                           │
│ Phone: (555) 123-4567                                  │
│ Email: john.smith@email.com                            │
│                                                        │
│ PRACTICE-SPECIFIC FIELDS                               │
│ ─────────────────────────────────────────────────────  │
│ How did you hear about us? * [Physician Referral ▼]   │
│ Preferred Contact Method: [Phone ▼]                   │
│ Interpreter Needed? [ ] Yes                            │
│ Primary Language: [English ▼]                          │
│                                                        │
│ INSURANCE INFORMATION                                  │
│ ─────────────────────────────────────────────────────  │
│ Insurance: Blue Cross Blue Shield                      │
│ Member ID: ABC123456                                   │
│                                                        │
│ EPISODE INFORMATION                                    │
│ ─────────────────────────────────────────────────────  │
│ Diagnosis: Lower Back Pain                             │
│ ICD-10: M54.5                                          │
│                                                        │
│ [< Back] [Review & Create]                            │
└────────────────────────────────────────────────────────┘
```

**Smart auto-mapping:**

```typescript
// Auto-populate custom fields from referral data
function autoPopulateCustomFields(referral: Referral, customFieldDefs: CustomFieldDefinition[]) {
  const values = {};
  
  customFieldDefs.forEach(field => {
    if (field.mappingSource) {
      // Map from referral data
      const value = get(referral, field.mappingSource);
      if (value) {
        values[field.fieldName] = mapValue(value, field);
      }
    } else if (field.defaultValue) {
      // Use default
      values[field.fieldName] = field.defaultValue;
    }
  });
  
  return values;
}

// Example mapping rules
function mapValue(value: any, field: CustomFieldDefinition) {
  // Map referral source to marketing source
  if (field.fieldName === 'marketingSource') {
    const sourceMap = {
      'fax': 'Physician Referral',
      'web': 'Google Search',
      'phone': 'Phone Inquiry',
      'facebook': 'Facebook Ad',
    };
    return sourceMap[value] || 'Other';
  }
  
  return value;
}
```

---

## 🎭 Source-Specific Behavior: Fax vs Web Lead vs Phone Call

### Key Question: When to create Patient vs. Patient + Episode?

**The Decision Framework:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Does the lead have ALL of these?                              │
│  ✓ Diagnosis                                                    │
│  ✓ Prescription/Order from provider                            │
│  ✓ Insurance verified (or confirmed self-pay)                  │
│  ✓ Patient is ready/interested in scheduling                   │
│                                                                 │
│         YES ────────────→ Create PATIENT + EPISODE              │
│                                                                 │
│         NO ─────────────→ Options:                              │
│                           • Keep as referral (wait for info)   │
│                           • Create PATIENT ONLY (no episode)   │
│                           • Don't create anything yet          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Source 1: Fax Referral

**Typical Fax Contents:**
- ✅ Patient demographics
- ✅ Diagnosis
- ✅ Prescription/order
- ✅ Referring provider details
- ✅ Insurance info (often)

**Decision: Almost always create PATIENT + EPISODE**

```
Fax Inbox → Create in EMR Button

┌────────────────────────────────────────────────────────┐
│ What to Create?                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ This fax contains a complete referral with:            │
│ ✓ Prescription from Dr. Anderson                       │
│ ✓ Diagnosis: Lower Back Pain (M54.5)                   │
│ ✓ Patient demographics                                 │
│ ✓ Insurance: BCBS                                      │
│                                                        │
│ Recommended: Create Patient + Episode                  │
│                                                        │
│ [Create Patient + Episode] ← Default                  │
│ [Create Patient Only]                                  │
│   Use if: Prescription unclear, need to verify first   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**When to create Patient Only from Fax:**
- ❌ Prescription is unclear or incomplete
- ❌ Need to call referring provider to clarify
- ❌ Insurance not verified yet
- ❌ Waiting for auth approval

---

### Source 2: Web Lead

**Typical Web Lead Contents:**
- ✅ Patient demographics
- ✅ Self-reported condition/pain area
- ❌ Usually NO formal diagnosis
- ❌ Usually NO prescription
- ❌ Insurance might be provided, but not verified

**Decision: Usually create PATIENT ONLY (wait on episode)**

```
Web Lead → Convert to Patient Button

┌────────────────────────────────────────────────────────┐
│ What to Create?                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ This web lead has:                                     │
│ ✓ Patient: Jennifer Martinez                          │
│ ✓ Chief Complaint: "Chronic hip pain"                 │
│ ✓ Insurance: Aetna                                     │
│ ⚠️ No prescription yet                                 │
│ ⚠️ No formal diagnosis                                 │
│                                                        │
│ Recommended: Create Patient Only                       │
│                                                        │
│ [Create Patient Only] ← Default                       │
│   Then: Get prescription → Create episode later        │
│                                                        │
│ [Create Patient + Episode]                            │
│   Use if: Patient already has prescription/referral    │
│   You'll need to enter:                                │
│   • Referring provider                                 │
│   • Diagnosis code                                     │
│   • Treatment order                                    │
│                                                        │
│ [Keep as Lead]                                         │
│   Wait until prescription received                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Web Lead Workflow:**

```
Step 1: Web lead comes in
  ↓
Step 2: Staff calls patient
  ↓
Step 3a: Patient has prescription → Create Patient + Episode
Step 3b: Patient needs prescription → Create Patient Only
  ↓ (if 3b)
Step 4: Patient gets prescription from their doctor
  ↓
Step 5: Patient uploads/faxes prescription
  ↓
Step 6: NOW create Episode for existing patient
```

**Implementation: Two-stage creation for Web Leads**

```tsx
// If web lead, show different flow
{referral.source === 'web' && !referral.hasPrescription && (
  <Alert>
    <InfoIcon className="h-4 w-4" />
    <AlertTitle>Web Lead - No Prescription Yet</AlertTitle>
    <AlertDescription>
      This patient submitted a web form but doesn't have a prescription yet.
      You can:
      <ul className="mt-2 list-disc list-inside">
        <li>Create patient record now, add episode later when prescription arrives</li>
        <li>Wait until prescription is received to create anything</li>
      </ul>
    </AlertDescription>
  </Alert>
)}

<div className="flex gap-2">
  <Button onClick={createPatientOnly}>
    Create Patient Only
  </Button>
  <Button onClick={createPatientAndEpisode} variant="outline">
    Create Patient + Episode
    <span className="text-xs text-muted-foreground ml-2">
      (if prescription available)
    </span>
  </Button>
</div>
```

---

### Source 3: Phone Call / Voice Lead

**Typical Phone Call Outcomes:**

**Scenario A: Call with prescription in hand**
- ✅ Patient already has prescription
- ✅ Has diagnosis
- ✅ Ready to schedule
- **Decision: Create PATIENT + EPISODE**

**Scenario B: Inquiry call (no prescription yet)**
- ✅ Patient interested in PT
- ❌ Hasn't seen doctor yet
- ❌ No prescription
- **Decision: Keep as LEAD or create PATIENT ONLY**

**Scenario C: Workers comp / Auto injury**
- ✅ Has injury
- ⚠️ Waiting for case acceptance
- ⚠️ Waiting for auth
- **Decision: Create PATIENT ONLY, add episode when approved**

```
Phone Lead → After Call → Create in EMR

┌────────────────────────────────────────────────────────┐
│ Call Outcome: What was the result of this call?        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [●] Patient has prescription & ready to schedule       │
│     → Create Patient + Episode                         │
│                                                        │
│ [ ] Patient interested but no prescription yet         │
│     → Create Patient Only                              │
│     → Follow up for prescription                       │
│                                                        │
│ [ ] Patient wants to think about it                    │
│     → Keep as Lead                                     │
│     → Follow up in X days                              │
│                                                        │
│ [ ] Wrong number / Not interested                      │
│     → Mark as Dead Lead                                │
│                                                        │
│ [Continue]                                             │
└────────────────────────────────────────────────────────┘
```

---

### Summary Matrix: What to Create by Source

```
┌──────────────┬─────────────────┬──────────────────────┬─────────────────┐
│ Source       │ Typical State   │ Default Action       │ When Different? │
├──────────────┼─────────────────┼──────────────────────┼─────────────────┤
│ Fax          │ Has Rx + Dx     │ Patient + Episode    │ Rx unclear:     │
│ Referral     │                 │                      │ Patient Only    │
├──────────────┼─────────────────┼──────────────────────┼─────────────────┤
│ Web          │ No Rx, no Dx    │ Patient Only         │ Has Rx already: │
│ Lead         │                 │ (or keep as lead)    │ Patient + Ep    │
├──────────────┼─────────────────┼──────────────────────┼─────────────────┤
│ Phone        │ Varies          │ Depends on outcome:  │ Ask user to     │
│ Call         │                 │ - Has Rx: Pat + Ep   │ select based on │
│              │                 │ - No Rx: Pat Only    │ call outcome    │
├──────────────┼─────────────────┼──────────────────────┼─────────────────┤
│ Walk-in      │ Usually has Rx  │ Patient + Episode    │ No Rx:          │
│              │                 │                      │ Schedule consult│
└──────────────┴─────────────────┴──────────────────────┴─────────────────┘

Legend:
Rx = Prescription/Order
Dx = Formal diagnosis
Pat = Patient
Ep = Episode
```

---

### Adaptive UI Based on Source

```typescript
interface CreateInEMRConfig {
  source: 'fax' | 'web' | 'phone' | 'walk-in';
  defaultMode: 'patient-only' | 'patient-and-episode' | 'ask-user';
  showModeSelector: boolean;
  recommendedAction: string;
}

function getConfigForSource(referral: Referral): CreateInEMRConfig {
  switch (referral.source) {
    case 'fax':
      return {
        source: 'fax',
        defaultMode: 'patient-and-episode',
        showModeSelector: true,
        recommendedAction: 'Fax referrals typically include prescription and diagnosis. Creating both patient and episode is recommended.',
      };
    
    case 'web':
      return {
        source: 'web',
        defaultMode: 'patient-only',
        showModeSelector: true,
        recommendedAction: 'Web leads often lack prescriptions. Consider creating patient only and adding episode when prescription is received.',
      };
    
    case 'phone':
      return {
        source: 'phone',
        defaultMode: 'ask-user',
        showModeSelector: true,
        recommendedAction: 'Select based on call outcome: If patient has prescription, create both. Otherwise, create patient only.',
      };
    
    default:
      return {
        source: 'web',
        defaultMode: 'patient-and-episode',
        showModeSelector: true,
        recommendedAction: '',
      };
  }
}
```

**Adaptive Modal:**

```tsx
function CreateInEMRModal({ referral }: Props) {
  const config = getConfigForSource(referral);
  const [mode, setMode] = useState<'patient-only' | 'patient-and-episode'>(
    config.defaultMode === 'ask-user' ? null : config.defaultMode
  );
  
  // First screen: Choose mode (if needed)
  if (config.defaultMode === 'ask-user' && !mode) {
    return (
      <ModeSelectionScreen
        source={config.source}
        onSelect={setMode}
        recommendation={config.recommendedAction}
      />
    );
  }
  
  // Then proceed with selected mode
  return mode === 'patient-only' 
    ? <CreatePatientOnlyFlow />
    : <CreatePatientAndEpisodeFlow />;
}
```

---

## 🎨 Component State Machine

```typescript
type CreationStep = 
  | 'search'           // Searching for existing patient
  | 'found_confirm'    // Found match, awaiting confirmation
  | 'collect_data'     // Collecting/confirming patient data
  | 'review'           // Review before submitting
  | 'creating_patient' // API call in progress
  | 'creating_episode' // Episode API call in progress
  | 'linking'          // Linking IDs back to NEO
  | 'success'          // Complete!
  | 'error';           // Something failed

interface CreationState {
  step: CreationStep;
  foundPatient?: EMRPatient;
  patientData?: PatientData;
  episodeData?: EpisodeData;
  result?: EMRCreationResult;
  error?: Error;
  isNewPatient: boolean;
}

// State transitions:
'search' → 'found_confirm' (if match found)
'search' → 'collect_data' (if no match)
'found_confirm' → 'collect_data' (if user says "different person")
'found_confirm' → 'review' (if user confirms same person)
'collect_data' → 'review'
'review' → 'creating_patient' (if new patient)
'review' → 'creating_episode' (if existing patient)
'creating_patient' → 'creating_episode'
'creating_episode' → 'linking'
'linking' → 'success'
'*' → 'error' (on any failure)
```

---

## 📋 Implementation Checklist

### Phase 1: Core Component (Week 1)
- [ ] Create `CreateInEMRModal` base component
- [ ] Implement patient search step
- [ ] Implement existing patient confirmation
- [ ] Implement patient + episode form
- [ ] Implement review step
- [ ] Implement progress indicators
- [ ] Implement success state

### Phase 2: EMR Integration (Week 2)
- [ ] Build EMR API client
- [ ] Implement patient creation endpoint
- [ ] Implement episode creation endpoint
- [ ] Implement patient search endpoint
- [ ] Add idempotency handling
- [ ] Add retry logic
- [ ] Add timeout handling

### Phase 3: Edge Case Handling (Week 3)
- [ ] Implement optimistic locking
- [ ] Add state persistence
- [ ] Add recovery mechanism
- [ ] Handle partial failures
- [ ] Add validation before creation
- [ ] Add health checks
- [ ] Implement manual MRN entry fallback

### Phase 4: Integration into Pages (Week 4)
- [ ] Add to Fax Inbox
- [ ] Add to Web Leads
- [ ] Add to Opportunities Board
- [ ] Add to any other relevant pages
- [ ] Update referral status after creation
- [ ] Add success notifications
- [ ] Add error notifications

### Phase 5: Testing & Polish (Week 5)
- [ ] Test happy path
- [ ] Test all edge cases
- [ ] Test concurrent access
- [ ] Test offline scenarios
- [ ] Test with real EMR
- [ ] User acceptance testing
- [ ] Performance optimization

---

## 🎯 Success Criteria

**The feature is successful if:**

1. ✅ Staff can create patients in EMR from any page (Fax, Web Leads, Opportunities)
2. ✅ Duplicate detection works 95%+ of the time
3. ✅ Creates patient + episode in under 10 seconds
4. ✅ Handles failures gracefully with recovery options
5. ✅ Prevents duplicate patient creation
6. ✅ Works with EMR API or manual fallback
7. ✅ Clear visual feedback at every step
8. ✅ Staff can resume interrupted operations
9. ✅ No data loss even if browser crashes
10. ✅ 99%+ success rate for valid data

---

## 🚀 Rollout Strategy

### Week 1-2: Internal Testing
- Test with mock EMR
- Test all edge cases
- Fix major bugs

### Week 3: Pilot with 2-3 Staff
- Select power users
- Monitor closely
- Gather feedback

### Week 4: Rollout to All Staff
- Training session
- Documentation
- Support available

### Week 5: Monitor & Optimize
- Track success rate
- Track time to create
- Fix issues
- Optimize UX

---

## 💡 Final Thoughts

This unified component approach is **much better** than separate patient/case flows because:

✅ **DRY (Don't Repeat Yourself)** - One component, many uses
✅ **Consistent UX** - Same experience everywhere
✅ **Easier to maintain** - Fix bugs once
✅ **Handles edge cases** - Centralized error handling
✅ **Flexible** - Works with or without EMR API

The key insight is: **Patient and Episode creation are related but distinct operations**. Patient might already exist (returning patient), but Episode is always new. By checking first and branching, we handle both scenarios elegantly.

Most important: **Fail gracefully**. Always provide a manual fallback. EMRs are notoriously unreliable, so staff need a way to proceed even when APIs fail.

---

## 📊 Summary: All Cases Covered

### ✅ Case 1: Patient Already Exists in EMR
**Covered in:** Edge Case 9, Scenario A

When patient exists:
1. Search finds match by name + DOB
2. Show patient details + previous episodes
3. Compare contact info (phone, address, email)
4. If contact info differs → Ask user to update or keep
5. User confirms it's the same person
6. Create **Episode Only** (patient already exists)
7. Link episode to existing MRN

**Auto-update strategy:**
- ✅ Phone, email, address changes → Auto-update (with user confirmation)
- ❌ DOB, name, gender differences → Flag as different person

---

### ✅ Case 2: Creating New Case/Episode for Existing Patient
**Covered in:** Scenario A (Patient Exists flow), Source-Specific Behavior section

**Three scenarios:**

**A. Returning patient with new injury (Fax referral):**
```
1. Fax arrives for John Smith (shoulder pain)
2. Search finds John Smith MRN-123 in EMR
3. Last episode: Knee rehab (completed 6 months ago)
4. Staff confirms: Same patient, new injury
5. Create NEW episode for shoulder
6. Link to existing MRN-123
```

**B. Web lead converts, patient already in system:**
```
1. Jennifer calls: "I submitted web form for hip pain"
2. Search finds Jennifer MRN-456 (had back PT last year)
3. She now has prescription for hip
4. Create NEW episode for hip
5. Link to existing MRN-456
```

**C. Patient created earlier (patient-only), now adding episode:**
```
1. Two weeks ago: Created patient record (no prescription yet)
2. Now: Patient brings in prescription
3. Search finds patient MRN-789
4. Now create FIRST episode for that patient
5. This is the "two-stage" web lead workflow
```

**Key insight:** Episode creation is decoupled from patient creation. You can create episodes at any time for any existing patient.

---

### ✅ Case 3: Practice-Specific Custom Fields
**Covered in:** Edge Case 10

**Solution:** Dynamic form system with practice configuration

**Examples of custom fields:**
- Marketing source (dropdown)
- Preferred communication method
- Language preference / Interpreter needed
- Patient category (Auto Injury, Workers Comp, etc.)
- Attorney name (for legal cases)
- How did you hear about us?

**Implementation:**
```typescript
// Load from practice config
const customFields = PRACTICE_CUSTOM_FIELDS[practiceId];

// Auto-populate where possible
const fieldValues = autoPopulateCustomFields(referral, customFields);

// Render dynamically in form
{customFields.map(field => (
  <DynamicField 
    key={field.fieldName}
    definition={field}
    value={fieldValues[field.fieldName]}
    onChange={handleFieldChange}
  />
))}
```

**Smart features:**
- Auto-map referral source to marketing source
- Default values for common fields
- Required vs optional validation
- Supports: text, select, multiselect, date, boolean

---

### ✅ Case 4: Phone Number Changes (or Any Contact Info Changes)
**Covered in:** Edge Case 9

**The Problem:**
```
EMR Patient:           New Referral:
John Smith             John Smith
Phone: (555) 111-1111  Phone: (555) 222-2222
Email: old@email.com   Email: new@email.com
```

Is this the same person with updated info, or a different John Smith?

**The Solution:**

**Step 1: Detect differences**
```typescript
const diff = analyzePatientDiff(emrPatient, referralData);

if (diff.hasUpdateableDiffs && !diff.hasCriticalDiffs) {
  // Safe to update: only contact info changed
  showUpdateConfirmation();
} else if (diff.hasCriticalDiffs) {
  // DANGER: DOB, name, or gender differs
  showDifferentPersonWarning();
}
```

**Step 2: Show side-by-side comparison**
```
Field       EMR Record      New Referral
─────────────────────────────────────────
Name        John Smith      John Smith
DOB         03/15/1985      03/15/1985
Phone       (555) 111-1111  (555) 222-2222 ⚠️
Address     123 Oak St      456 Maple Ave  ⚠️
Email       john@old.com    john@new.com   ⚠️
```

**Step 3: User chooses:**
1. **"Yes - Update EMR & Create Episode"** → Update patient record + create episode
2. **"Yes - Keep EMR Data"** → Ignore new contact info, create episode with old data
3. **"No - Different Patient"** → Create new patient record
4. **"Call to Verify"** → Pause creation, call patient

**Auto-update rules:**
- ✅ **Auto-update** (with confirmation): Phone, email, address, insurance
- ❌ **Stop and warn**: DOB, name, gender
- ⚠️ **Flag as suspicious**: All contact fields different

**Why this matters:**
- People change phone numbers frequently
- People move (address changes)
- People change jobs (insurance changes)
- But DOB/name shouldn't change → probably different person

---

### ✅ Case 5: Fax vs Web Lead vs Phone Call - Different Creation Modes
**Covered in:** Source-Specific Behavior section

**The Core Question:** When to create Patient vs Patient+Episode?

**Answer:** Depends on whether you have a **complete referral** (prescription + diagnosis)

---

#### **FAX REFERRAL → Almost always Patient + Episode**

**Why?**
- Faxes typically include full prescription from referring provider
- Has formal diagnosis code
- Has treatment order
- It's a complete referral

**Default action:** Create Patient + Episode together

**Exception:** Only create Patient if:
- Prescription unclear (need to call referring provider)
- Insurance not verified yet (waiting for auth)
- Missing critical info

**UI:**
```
┌────────────────────────────────────┐
│ Fax contains complete referral:   │
│ ✓ Prescription from Dr. Anderson   │
│ ✓ Diagnosis: M54.5                 │
│                                    │
│ [Create Patient + Episode] ← Default
│ [Create Patient Only] (if needed)  │
└────────────────────────────────────┘
```

---

#### **WEB LEAD → Usually Patient Only (two-stage)**

**Why?**
- Web leads rarely have prescriptions
- Patient self-reports condition ("hip pain")
- No formal diagnosis yet
- Might not even have seen doctor

**Default action:** Create Patient Only

**Workflow:**
```
Week 1: Web lead submits form
  ↓
Week 1: Staff calls patient
  ↓
Week 1: Create PATIENT ONLY in EMR (MRN-123 assigned)
  ↓
Week 2: Patient sees their doctor
  ↓
Week 2: Doctor faxes prescription
  ↓
Week 2: Staff creates EPISODE for existing patient MRN-123
  ↓
Week 2: Schedule appointment
```

**Exception:** Create Patient + Episode if:
- Patient mentions they already have prescription
- They're calling about an existing referral
- They upload prescription with web form

**UI:**
```
┌────────────────────────────────────┐
│ Web lead (no prescription):        │
│ ✓ Patient: Jennifer Martinez       │
│ ⚠️ No prescription yet              │
│                                    │
│ [Create Patient Only] ← Default    │
│ [Create Patient + Episode]         │
│   (if prescription available)      │
│ [Keep as Lead] (wait for Rx)       │
└────────────────────────────────────┘
```

**Why two-stage for web leads?**
- Don't want to clutter EMR with incomplete episodes
- Episode requires diagnosis code, order, referring provider
- Web leads often don't convert (shopping around)
- Better to wait until prescription confirmed

---

#### **PHONE CALL → Ask user based on call outcome**

**Why?**
- Phone calls vary wildly
- Some patients call with prescription in hand
- Others are just inquiring
- Staff knows from the call

**Default action:** Prompt user to choose

**UI:**
```
┌────────────────────────────────────┐
│ Call Outcome?                      │
│                                    │
│ ○ Has prescription & ready         │
│   → Create Patient + Episode       │
│                                    │
│ ○ Interested, no prescription      │
│   → Create Patient Only            │
│                                    │
│ ○ Just browsing / thinking         │
│   → Keep as Lead                   │
│                                    │
│ ○ Not interested                   │
│   → Mark as Dead Lead              │
└────────────────────────────────────┘
```

**Call scenarios:**

**A. Patient with prescription:**
```
Staff: "How can I help you?"
Patient: "My doctor sent a referral for shoulder PT. I'd like to schedule."
Staff: "Great! Let me get your info..."
→ CREATE PATIENT + EPISODE
```

**B. Inquiry call:**
```
Staff: "How can I help you?"
Patient: "I'm having knee pain. Do you take my insurance?"
Staff: "Let me check... Yes! Have you seen a doctor?"
Patient: "Not yet, I wanted to check first."
→ CREATE PATIENT ONLY (or keep as lead)
→ Follow up when they get prescription
```

**C. Workers Comp:**
```
Patient: "I got injured at work. The adjuster said to call."
Staff: "OK, let me get your info..."
→ CREATE PATIENT ONLY
→ Wait for case acceptance
→ Create episode when approved
```

---

### 📋 Decision Matrix: Quick Reference

```
┌────────────────┬─────────────────────┬─────────────────────────────────┐
│ Source         │ Has Prescription?   │ Action                          │
├────────────────┼─────────────────────┼─────────────────────────────────┤
│ Fax            │ ✅ Yes (usually)    │ Patient + Episode (default)     │
│                │ ❌ No (rare)        │ Patient Only (exception)        │
├────────────────┼─────────────────────┼─────────────────────────────────┤
│ Web Lead       │ ❌ No (usually)     │ Patient Only (default)          │
│                │                     │ OR Keep as Lead (wait for Rx)   │
│                │ ✅ Yes (rare)       │ Patient + Episode (exception)   │
├────────────────┼─────────────────────┼─────────────────────────────────┤
│ Phone Call     │ ✅ Yes              │ Patient + Episode               │
│                │ ❌ No               │ Patient Only OR Keep as Lead    │
│                │ ⚠️ Pending auth     │ Patient Only (add episode later)│
├────────────────┼─────────────────────┼─────────────────────────────────┤
│ Walk-in        │ ✅ Yes (usually)    │ Patient + Episode               │
│                │ ❌ No               │ Schedule consult first          │
└────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

### 🚨 Where This Feature Might Fail (And How to Prevent It)

#### **Technical Failures:**

1. **EMR API down** → Manual MRN entry fallback
2. **Timeout during creation** → Idempotency keys + resume capability
3. **Partial failure** (patient created, episode failed) → State machine with recovery
4. **Browser crash** → Persist state to DB, resume on reload
5. **Network errors** → Retry with exponential backoff

#### **Data Failures:**

1. **Missing required fields** → Pre-validation before opening modal
2. **Invalid ICD-10 code** → Validate against code database, suggest corrections
3. **Duplicate detection miss** → Manual search option, show similar matches
4. **Contact info mismatch** → Side-by-side diff, let user decide

#### **User Errors:**

1. **Creating wrong patient** → Confirmation screen with review step
2. **Not checking for duplicates** → Force search before creation
3. **Choosing wrong mode** (Patient vs Patient+Episode) → Smart defaults by source, clear recommendations
4. **Updating wrong patient record** → Show diff, require explicit confirmation

#### **Workflow Failures:**

1. **Two users creating same referral** → Optimistic locking, real-time status
2. **Creating in wrong EMR** (multi-location practices) → Practice selector, confirm before creation
3. **Missing custom fields** → Mark required, validate before submit
4. **Creating episode without prescription** → Warn user, allow override for special cases

#### **Prevention Strategy:**

✅ **Validate early** → Check all required fields before modal opens
✅ **Confirm often** → Show review screen before submitting
✅ **Save everything** → Persist state at each step
✅ **Fail gracefully** → Always provide manual fallback
✅ **Lock resources** → Prevent concurrent modifications
✅ **Log everything** → Audit trail for troubleshooting

---

## 🎯 Key Takeaways

1. **One component, multiple modes**: Patient-only OR Patient+Episode, chosen dynamically
2. **Source-aware defaults**: Fax → Both, Web → Patient only, Phone → Ask user
3. **Smart duplicate detection**: Match on name+DOB, compare contact info, let user decide
4. **Auto-update contact info**: Phone/email/address can change, DOB/name cannot
5. **Practice-specific fields**: Dynamic form system, auto-populate where possible
6. **Fail gracefully**: EMR down? Manual fallback. Browser crash? Resume later.
7. **Two-stage for web leads**: Create patient first, add episode when prescription arrives
8. **Episode = new treatment**: Always create new episode, even for existing patients

**The guiding principle:** Make it easy to do the right thing, hard to do the wrong thing, and always provide a way forward even when systems fail.

