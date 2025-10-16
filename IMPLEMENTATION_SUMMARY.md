# Patient & Case Creation - Implementation Summary

## What I've Created For You

I've designed a comprehensive patient and case management workflow with starter components. Here's what you now have:

### 📄 Documents Created
1. **PATIENT_CASE_WORKFLOW_DESIGN.md** - Complete architectural design
2. **src/types/patient.ts** - Patient TypeScript interfaces
3. **src/types/case.ts** - Case/Episode TypeScript interfaces
4. **src/components/PatientForm.tsx** - Full patient creation form
5. **src/components/PatientSearchModal.tsx** - Duplicate detection modal
6. **This file** - Quick implementation guide

---

## Key Concepts Explained

### Patient vs Case: What's the Difference?

```
┌─────────────────────────┐
│       PATIENT           │  ← Created ONCE per person
│  (Persistent Record)    │
│                         │
│  • Demographics         │
│  • Contact Info         │
│  • Insurance            │
│  • Consent Forms        │
└────────┬────────────────┘
         │
         │ has many
         │
         ▼
┌─────────────────────────┐
│         CASE            │  ← Created for EACH treatment episode
│  (Episode of Care)      │     (Can have multiple per patient)
│                         │
│  • Diagnosis            │
│  • Referral Info        │
│  • Authorization        │
│  • Treatment Plan       │
│  • Appointments         │
└─────────────────────────┘
```

**Example:**
- **Patient**: Sarah Johnson (demographics, insurance, contact info)
- **Case 1**: Shoulder rehab after surgery (Jan-Mar 2024) - COMPLETED
- **Case 2**: Lower back pain (Current) - ACTIVE
- **Case 3**: Knee pain (Future) - NEW

---

## Where to Integrate This Into Your Current App

### 1. From Fax Inbox
**File to modify**: `src/pages/FaxInbox.tsx`

**Add button to fax detail view:**
```tsx
<Button 
  onClick={() => handleCreatePatientFromFax(selectedFax)}
  className="w-full"
>
  <User className="h-4 w-4 mr-2" />
  Create Patient + Case from Fax
</Button>
```

**Flow:**
```
Fax Details → "Create Patient + Case" → Search Modal → Patient Form → Case Form → Success
```

### 2. From Web Leads
**File to modify**: `src/pages/WebLeads.tsx`

**Add button to lead detail:**
```tsx
<Button 
  onClick={() => handleConvertToPatient(lead)}
>
  Convert to Patient
</Button>
```

**Flow:**
```
Web Lead → "Convert to Patient" → Search Modal → Patient Form → Add to Opportunities
```

### 3. From Opportunities Board
**File to modify**: `src/pages/Opportunities.tsx`

**Change:** Currently shows "leads" → Change to show "cases"

**Add action:**
```tsx
<Button onClick={() => handleCreateCase(existingPatient)}>
  Add New Case
</Button>
```

### 4. From Patients Directory
**File to modify**: `src/pages/Patients.tsx`

**Add button:**
```tsx
<Button onClick={() => setCreatePatientModalOpen(true)}>
  <Plus className="h-4 w-4 mr-2" />
  Add Patient
</Button>
```

---

## Recommended Integration Order

### Phase 1: Basic Patient Creation (Week 1)
1. Add `PatientSearchModal` and `PatientForm` to Fax Inbox
2. Test with mock data
3. Wire up to state management

### Phase 2: Case Creation (Week 2)
4. Create `CaseForm.tsx` (similar structure to PatientForm)
5. Link cases to patients
6. Update Opportunities board to show cases instead of leads

### Phase 3: Multi-Entry Point Support (Week 3)
7. Add patient/case creation from Web Leads
8. Add patient/case creation from Calls
9. Add manual entry from Patients page

### Phase 4: EMR Integration (Week 4)
10. Set up API client for EMR
11. Implement real-time or batch sync
12. Handle MRN assignment

---

## How to Use the Components

### Example 1: Create Patient from Fax

```tsx
import { PatientSearchModal } from "@/components/PatientSearchModal";
import { PatientForm } from "@/components/PatientForm";
import { Patient, CreatePatientDTO } from "@/types/patient";

function FaxInbox() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<CreatePatientDTO>>({});

  const handleCreatePatientFromFax = (fax: FaxDocument) => {
    // Pre-fill form from fax data
    setPrefillData({
      firstName: fax.patientName?.split(' ')[0],
      lastName: fax.patientName?.split(' ')[1],
      dateOfBirth: fax.dob,
      primaryPhone: fax.phonePrimary,
      primaryInsurance: fax.primaryInsurance,
      referralSource: "fax",
    });
    
    // Show search modal first
    setShowSearchModal(true);
  };

  const handlePatientSearchComplete = (patient?: Patient) => {
    if (patient) {
      // Existing patient found
      setSelectedPatient(patient);
      // Go directly to case creation
      // ... create case for existing patient
    } else {
      // No patient found, show form
      setShowSearchModal(false);
      setShowPatientForm(true);
    }
  };

  const handlePatientSubmit = async (data: CreatePatientDTO) => {
    try {
      // 1. Create patient in your system
      const newPatient = await createPatient(data);
      
      // 2. (Optional) Sync to EMR
      await syncPatientToEMR(newPatient);
      
      // 3. Show success
      toast.success("Patient created successfully!");
      
      // 4. Next step: Create case or add to board
      setShowPatientForm(false);
      // ... proceed to case creation
    } catch (error) {
      toast.error("Failed to create patient");
    }
  };

  return (
    <>
      {/* Your existing fax inbox UI */}
      
      <PatientSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectPatient={(patient) => handlePatientSearchComplete(patient)}
        onCreateNew={() => handlePatientSearchComplete()}
        searchCriteria={{
          name: prefillData.firstName + " " + prefillData.lastName,
          phone: prefillData.primaryPhone,
        }}
      />

      <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            initialData={prefillData}
            onSubmit={handlePatientSubmit}
            onCancel={() => setShowPatientForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Example 2: Add Case to Existing Patient

```tsx
import { CaseForm } from "@/components/CaseForm"; // You'll create this
import { CreateCaseDTO } from "@/types/case";

function PatientProfile({ patient }: { patient: Patient }) {
  const [showCaseForm, setShowCaseForm] = useState(false);

  const handleCreateCase = async (data: CreateCaseDTO) => {
    try {
      const newCase = await createCase({
        ...data,
        patientId: patient.id,
      });
      
      toast.success("Case created successfully!");
      setShowCaseForm(false);
    } catch (error) {
      toast.error("Failed to create case");
    }
  };

  return (
    <div>
      <h2>{patient.firstName} {patient.lastName}</h2>
      
      {/* List of existing cases */}
      <div className="space-y-2">
        {patient.cases?.map(case => (
          <CaseCard key={case.id} case={case} />
        ))}
      </div>

      {/* Add new case button */}
      <Button onClick={() => setShowCaseForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Case
      </Button>

      {/* Case creation dialog */}
      <Dialog open={showCaseForm} onOpenChange={setShowCaseForm}>
        <DialogContent>
          <CaseForm
            patientId={patient.id}
            onSubmit={handleCreateCase}
            onCancel={() => setShowCaseForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Data Flow Examples

### Scenario 1: New Referral Fax Arrives

```
1. Fax received with patient info extracted by AI
   ↓
2. User clicks "Create Patient + Case"
   ↓
3. PatientSearchModal opens, auto-searches by phone
   ↓
4. No match found
   ↓
5. PatientForm opens with pre-filled data from fax
   ↓
6. User reviews/completes form, submits
   ↓
7. Patient created in DB (+ EMR if integrated)
   ↓
8. CaseForm opens, pre-filled from fax referral info
   ↓
9. User completes case details, submits
   ↓
10. Case created, linked to patient
   ↓
11. Case appears on Opportunities board in "Unassigned" stage
```

### Scenario 2: Existing Patient Returns

```
1. Web lead submitted
   ↓
2. User clicks "Convert to Patient"
   ↓
3. PatientSearchModal searches by email/phone
   ↓
4. Match found! (95% confidence)
   ↓
5. User clicks "This is the patient"
   ↓
6. Skip patient creation, go to CaseForm
   ↓
7. New case created for existing patient
   ↓
8. Case added to Opportunities board
```

---

## State Management Recommendations

### Option 1: React Context (Simpler)
```tsx
// src/contexts/PatientCaseContext.tsx
export const PatientCaseContext = createContext({
  patients: [],
  cases: [],
  createPatient: async (data) => {},
  createCase: async (data) => {},
  searchPatients: async (criteria) => {},
});
```

### Option 2: Zustand (Recommended)
```tsx
// src/stores/patientCaseStore.ts
import { create } from 'zustand';

export const usePatientCaseStore = create((set, get) => ({
  patients: [],
  cases: [],
  
  createPatient: async (data) => {
    const patient = await api.createPatient(data);
    set(state => ({ 
      patients: [...state.patients, patient] 
    }));
    return patient;
  },
  
  createCase: async (data) => {
    const case = await api.createCase(data);
    set(state => ({ 
      cases: [...state.cases, case] 
    }));
    return case;
  },
}));
```

---

## API Service Structure

```tsx
// src/services/patientService.ts
export const patientService = {
  // Create new patient
  create: async (data: CreatePatientDTO): Promise<Patient> => {
    const response = await fetch('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Search for patients
  search: async (criteria: PatientSearchCriteria): Promise<PatientMatchResult[]> => {
    const response = await fetch('/api/patients/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
    return response.json();
  },

  // Get patient by ID
  getById: async (id: string): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`);
    return response.json();
  },

  // Update patient
  update: async (id: string, data: UpdatePatientDTO): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

## Next Steps Checklist

- [ ] Read the full design doc (PATIENT_CASE_WORKFLOW_DESIGN.md)
- [ ] Review the TypeScript interfaces (patient.ts, case.ts)
- [ ] Test PatientForm with mock data
- [ ] Test PatientSearchModal with mock data
- [ ] Create CaseForm component (similar to PatientForm)
- [ ] Integrate into Fax Inbox first (easiest entry point)
- [ ] Set up API endpoints (or mock them)
- [ ] Add state management (Context or Zustand)
- [ ] Wire up to Opportunities board
- [ ] Plan EMR integration strategy
- [ ] User testing with real data

---

## Questions to Answer Before Implementation

1. **EMR Choice**: Are you using Prompt, NEO, or another system?
2. **MRN Assignment**: Who assigns the MRN - your app or the EMR?
3. **Real-time vs Batch**: How should EMR sync work?
4. **Patient Merge**: Do you need to merge duplicate patients later?
5. **Multi-location**: Do you have multiple clinic locations?
6. **Consent Storage**: Where are actual signed consent forms stored?
7. **Patient Portal**: Will patients have online access to their data?

---

## Tips for Success

1. **Start Small**: Implement patient creation from fax first
2. **Mock Everything**: Use mock data until you're happy with the UX
3. **Test Duplicates**: Try creating the same patient twice to test search
4. **Think Mobile**: Make sure forms work on tablets (front desk may use iPads)
5. **Validation First**: Good validation prevents bad data
6. **Error Handling**: Plan for EMR API failures
7. **Audit Trail**: Log who created/modified records

---

## Support Components You May Need

These components from your current codebase will be useful:

- ✅ `Dialog` - Already used for modals
- ✅ `Input` - Form fields
- ✅ `Select` - Dropdowns
- ✅ `Card` - Section containers
- ✅ `Tabs` - Multi-section forms
- ✅ `Badge` - Status indicators
- ✅ `Button` - Actions
- ⚠️ `DatePicker` - You may want to add this for better date input
- ⚠️ `PhoneInput` - Formatted phone number input
- ⚠️ `AutoComplete` - For insurance company search

---

## Example: Complete Create Patient Flow

Here's pseudocode for the complete flow:

```tsx
async function handleCreatePatientAndCaseFromFax(fax: FaxDocument) {
  // 1. Extract data from fax
  const faxData = {
    patientName: fax.patientName,
    dob: fax.dob,
    phone: fax.phonePrimary,
    insurance: fax.primaryInsurance,
    diagnosis: fax.orderText,
    referringProvider: fax.providerName,
  };

  // 2. Search for existing patient
  const searchResults = await patientService.search({
    phone: faxData.phone,
    name: faxData.patientName,
  });

  let patient: Patient;

  if (searchResults.length > 0) {
    // 3a. Show match modal, let user select or create new
    patient = await showPatientMatchModal(searchResults);
  } else {
    // 3b. No matches, create new patient
    const patientData: CreatePatientDTO = {
      firstName: faxData.patientName.split(' ')[0],
      lastName: faxData.patientName.split(' ')[1],
      dateOfBirth: faxData.dob,
      primaryPhone: faxData.phone,
      primaryInsurance: faxData.insurance,
      referralSource: "fax",
    };

    patient = await patientService.create(patientData);
  }

  // 4. Create case for this patient
  const caseData: CreateCaseDTO = {
    patientId: patient.id,
    primaryDiagnosis: faxData.diagnosis,
    icd10Codes: extractICD10(faxData.diagnosis),
    referralSource: "fax",
    referralDate: new Date().toISOString(),
    referringProvider: {
      name: faxData.referringProvider,
    },
    priority: determinePriority(fax),
    faxId: fax.id,
  };

  const newCase = await caseService.create(caseData);

  // 5. Add case to opportunity board
  await opportunityService.addToBoard(newCase);

  // 6. Success!
  toast.success(`Patient and case created for ${patient.firstName} ${patient.lastName}`);
  navigate(`/opportunities?id=${newCase.id}`);
}
```

---

## Visual Workflow

```
┌──────────────┐
│  Entry Point │  (Fax, Web Lead, Call, Manual)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Patient Search   │  ← Check for duplicates
│ (by phone/email) │
└──────┬───────────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼────────┐
│Found│  │No matches│
└──┬──┘  └─┬────────┘
   │        │
   │     ┌──▼────────────┐
   │     │ Patient Form  │
   │     │ (pre-filled)  │
   │     └──┬────────────┘
   │        │
   │     ┌──▼──────────┐
   │     │ Save Patient│
   │     └──┬──────────┘
   │        │
   └────┬───┘
        │
     ┌──▼──────────┐
     │  Case Form  │
     │(for patient)│
     └──┬──────────┘
        │
     ┌──▼──────────┐
     │  Save Case  │
     └──┬──────────┘
        │
     ┌──▼────────────────┐
     │ Add to Opportunity│
     │      Board        │
     └───────────────────┘
```

---

## Common Pitfalls to Avoid

1. ❌ **Creating duplicate patients** → ✅ Always search first
2. ❌ **Missing required fields** → ✅ Validate before submit
3. ❌ **No EMR error handling** → ✅ Retry logic + manual fallback
4. ❌ **Mixing patient and case data** → ✅ Keep them separate
5. ❌ **No audit trail** → ✅ Log all creates/updates
6. ❌ **Hard-coded insurance companies** → ✅ Use searchable dropdown
7. ❌ **No consent tracking** → ✅ Store consent date + signature

---

## Summary

You now have:
- ✅ Complete architectural design
- ✅ TypeScript interfaces for Patient and Case
- ✅ Working PatientForm component
- ✅ Working PatientSearchModal component
- ✅ Implementation examples
- ✅ Integration guidance

**Next Action**: Start by integrating PatientSearchModal and PatientForm into your Fax Inbox page. Test with the mock data, then build out the CaseForm component following the same pattern.

Good luck! 🚀

