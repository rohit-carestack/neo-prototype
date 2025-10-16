# Final Implementation Plan: Create in EMR + AI-Extracted Fields

## 🎯 Core Principles

1. **AI-extracted fields are suggestions, not facts** - Always show provenance, always allow editing
2. **One smart button, not multiple choices** - System decides the flow based on context
3. **Preview before committing** - Whether creating in EMR or adding to board
4. **Practice-specific customization** - Dynamic fields based on practice config
5. **Manual fallbacks for everything** - EMRs and AI fail; users need escape hatches

---

## 📋 FINAL CHANGES TO IMPLEMENT

### **Phase 1: MVP - Must Have (4-6 weeks)**

#### 1. AI-Extracted Field System (Foundation)

**Problem:** Users don't know which fields came from AI/OCR vs manual entry. They can't trust the data.

**Solution: Field Provenance System**

```typescript
// New type: Track where data came from
interface FieldProvenance {
  value: any;
  source: 'ai_extracted' | 'user_input' | 'api_verified' | 'manual_entry';
  confidence?: number; // 0-1 for AI extractions
  extractedFrom?: string; // "fax_page_1" | "insurance_card" | "web_form"
  verifiedBy?: string; // User ID who verified/edited
  verifiedAt?: Date;
}

interface ReferralData {
  firstName: FieldProvenance;
  lastName: FieldProvenance;
  dob: FieldProvenance;
  phone: FieldProvenance;
  // ... all fields
}

// Example:
{
  firstName: {
    value: "John",
    source: "ai_extracted",
    confidence: 0.95,
    extractedFrom: "fax_page_1",
    verifiedBy: null, // Not yet verified
  },
  phone: {
    value: "(555) 123-4567",
    source: "user_input",
    verifiedBy: "user_123",
    verifiedAt: "2024-01-15T10:30:00Z"
  }
}
```

**Visual Indicators:**

```tsx
// AI-extracted field (not verified)
<Input
  label="First Name"
  value="John"
  provenance={{
    source: "ai_extracted",
    confidence: 0.95,
    extractedFrom: "fax_page_1"
  }}
  onVerify={(value) => markAsVerified(value)}
/>

// Renders as:
┌─────────────────────────────────────┐
│ First Name                          │
│ ┌─────────────────────────────────┐ │
│ │ John                        [🤖]│ │ ← AI badge
│ └─────────────────────────────────┘ │
│ AI extracted • 95% confident        │ ← Subtitle
│ From: Fax page 1                    │
│ [✓ Verify] [Edit]                   │ ← Actions
└─────────────────────────────────────┘

// After user clicks "Verify":
┌─────────────────────────────────────┐
│ First Name                          │
│ ┌─────────────────────────────────┐ │
│ │ John                        [✓] │ │ ← Verified badge
│ └─────────────────────────────────┘ │
│ Verified by Sarah W.                │
└─────────────────────────────────────┘
```

**CSS/Component:**

```tsx
function ProvenanceInput({ label, value, provenance, onChange, onVerify }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  
  const getBadge = () => {
    switch (provenance.source) {
      case 'ai_extracted':
        return (
          <Badge variant="outline" className="ai-extracted">
            🤖 AI {provenance.confidence && `${Math.round(provenance.confidence * 100)}%`}
          </Badge>
        );
      case 'user_input':
        return <Badge variant="success">✓ Verified</Badge>;
      case 'api_verified':
        return <Badge variant="success">✓ API Verified</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="field-with-provenance">
      <Label>{label}</Label>
      <div className="input-with-badge">
        <Input 
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          className={provenance.source === 'ai_extracted' ? 'ai-extracted-bg' : ''}
        />
        {getBadge()}
      </div>
      
      {provenance.source === 'ai_extracted' && !provenance.verifiedBy && (
        <div className="field-actions">
          <Button size="sm" variant="ghost" onClick={() => onVerify(value)}>
            ✓ Looks Good
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )}
      
      {provenance.extractedFrom && (
        <p className="text-xs text-muted-foreground">
          Source: {provenance.extractedFrom}
        </p>
      )}
    </div>
  );
}
```

**Styling:**

```css
.ai-extracted-bg {
  background-color: #fef3c7; /* Light amber - "take with grain of salt" */
  border-left: 3px solid #f59e0b; /* Amber accent */
}

.field-with-provenance .ai-extracted {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.field-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
```

**Changes to make:**
- [ ] Add `FieldProvenance` type to `src/types/referral.ts`
- [ ] Update all referral data structures to use provenance
- [ ] Create `ProvenanceInput` component in `src/components/ui/`
- [ ] Update fax OCR processing to set `source: 'ai_extracted'`
- [ ] Add verify/edit actions to all AI-extracted fields

---

#### 2. Opportunity Card Preview & Edit (Like Task Creation)

**Problem:** When adding fax to board, user can't verify/edit the AI-extracted data before creating the opportunity card.

**Solution: Preview modal (similar to task creation flow)**

**Current flow (problematic):**
```
Fax Inbox → Click "Add to Board" → Immediately creates card
→ User has to edit card after creation (annoying)
```

**New flow:**
```
Fax Inbox → Click "Add to Board" → Preview Modal → User verifies/edits → Creates card
```

**Preview Modal:**

```tsx
function AddToBoardModal({ fax, onClose, onConfirm }: Props) {
  const [opportunityData, setOpportunityData] = useState(() => 
    extractOpportunityFromFax(fax) // AI-extracted initial data
  );
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add to Opportunities Board</DialogTitle>
          <DialogDescription>
            Review the information extracted from the fax. You can edit any field.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview of the card as it will appear */}
          <div className="p-4 border rounded bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Card Preview:</h4>
            <OpportunityCardPreview data={opportunityData} />
          </div>
          
          {/* Editable fields */}
          <div className="space-y-3">
            <ProvenanceInput
              label="Patient Name"
              value={opportunityData.patientName}
              provenance={opportunityData._provenance.patientName}
              onChange={(v) => updateField('patientName', v)}
              onVerify={(v) => verifyField('patientName', v)}
            />
            
            <ProvenanceInput
              label="Phone"
              value={opportunityData.phone}
              provenance={opportunityData._provenance.phone}
              onChange={(v) => updateField('phone', v)}
              onVerify={(v) => verifyField('phone', v)}
            />
            
            <ProvenanceInput
              label="Diagnosis"
              value={opportunityData.diagnosis}
              provenance={opportunityData._provenance.diagnosis}
              onChange={(v) => updateField('diagnosis', v)}
              onVerify={(v) => verifyField('diagnosis', v)}
            />
            
            {/* Insurance status */}
            <div>
              <Label>Insurance Status</Label>
              <Select
                value={opportunityData.insuranceStatus}
                onValueChange={(v) => updateField('insuranceStatus', v)}
              >
                <SelectItem value="not_verified">Not Verified</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in_network">In Network</SelectItem>
                <SelectItem value="out_of_network">Out of Network</SelectItem>
              </Select>
            </div>
            
            {/* Assign to */}
            <div>
              <Label>Assign To</Label>
              <Select
                value={opportunityData.assignedTo}
                onValueChange={(v) => updateField('assignedTo', v)}
              >
                <SelectItem value="">Unassigned</SelectItem>
                <SelectItem value="sarah">Sarah Wilson</SelectItem>
                <SelectItem value="mike">Mike Chen</SelectItem>
              </Select>
            </div>
            
            {/* Board column */}
            <div>
              <Label>Add to Column</Label>
              <Select
                value={opportunityData.status}
                onValueChange={(v) => updateField('status', v)}
              >
                <SelectItem value="new">New Referrals</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="insurance_verified">Insurance Verified</SelectItem>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(opportunityData)}>
            Add to Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**OpportunityCardPreview:**

```tsx
function OpportunityCardPreview({ data }: Props) {
  return (
    <Card className="w-full opacity-80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{data.patientName}</CardTitle>
            <p className="text-xs text-muted-foreground">{data.diagnosis}</p>
          </div>
          {data.priority && (
            <Badge variant={data.priority === 'high' ? 'destructive' : 'secondary'}>
              {data.priority}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{data.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            <span>From fax referral</span>
          </div>
          {data.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Assigned to {data.assignedTo}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Changes to make:**
- [ ] Create `AddToBoardModal` component
- [ ] Create `OpportunityCardPreview` component
- [ ] Update `FaxInbox.tsx` - replace direct "Add to Board" with modal
- [ ] Add field verification tracking to opportunity data

---

#### 3. Editable Opportunity Cards

**Problem:** Once card is on the board, AI-extracted fields are locked. User can't edit without opening full detail view.

**Solution: Inline editing + Quick edit drawer**

**Approach 1: Inline editing (simple fields)**

```tsx
function OpportunityCard({ opportunity }: Props) {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <EditableField
          value={opportunity.patientName}
          provenance={opportunity._provenance.patientName}
          onSave={(value) => updateOpportunity({ patientName: value })}
        />
      </CardHeader>
      <CardContent>
        {/* Phone - click to edit */}
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          {isEditingPhone ? (
            <Input
              value={opportunity.phone}
              autoFocus
              onBlur={() => setIsEditingPhone(false)}
              onChange={(e) => updateOpportunity({ phone: e.target.value })}
              className="h-6 text-xs"
            />
          ) : (
            <button
              onClick={() => setIsEditingPhone(true)}
              className="text-xs hover:underline flex items-center gap-1"
            >
              {opportunity.phone}
              {opportunity._provenance.phone.source === 'ai_extracted' && (
                <span className="text-amber-600">🤖</span>
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Approach 2: Quick edit drawer (better for multiple fields)**

```tsx
function OpportunityCard({ opportunity }: Props) {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-1">
                {opportunity.patientName}
                {opportunity._provenance.patientName.source === 'ai_extracted' && (
                  <Badge variant="outline" className="text-xs">🤖</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{opportunity.diagnosis}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowQuickEdit(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Quick Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Patient
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create in EMR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* Card content */}
        </CardContent>
      </Card>
      
      {/* Quick edit drawer */}
      <Sheet open={showQuickEdit} onOpenChange={setShowQuickEdit}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Opportunity</SheetTitle>
            <SheetDescription>
              Update any AI-extracted or incorrect information
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 mt-4">
            <ProvenanceInput
              label="Patient Name"
              value={opportunity.patientName}
              provenance={opportunity._provenance.patientName}
              onChange={(v) => updateField('patientName', v)}
              onVerify={(v) => verifyField('patientName', v)}
            />
            
            <ProvenanceInput
              label="Phone"
              value={opportunity.phone}
              provenance={opportunity._provenance.phone}
              onChange={(v) => updateField('phone', v)}
              onVerify={(v) => verifyField('phone', v)}
            />
            
            {/* ... other fields */}
          </div>
          
          <SheetFooter className="mt-4">
            <Button onClick={() => setShowQuickEdit(false)}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Changes to make:**
- [ ] Add `EditableField` component for inline editing
- [ ] Add Quick Edit option to opportunity card dropdown menu
- [ ] Create `QuickEditSheet` component
- [ ] Show AI badges on all AI-extracted fields in cards
- [ ] Update `Opportunities.tsx` to support inline/quick editing

---

#### 4. Single "Create in EMR" Button with Smart Branching

**Problem:** Multiple buttons confuse users. They don't know which to click.

**Solution: One button, system decides the flow**

```tsx
// In FaxInbox.tsx, WebLeads.tsx, Opportunities.tsx

function CreateInEMRButton({ referral }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [flow, setFlow] = useState<'patient-and-episode' | 'patient-only' | 'episode-only' | 'choice'>(null);
  
  const handleClick = async () => {
    // 1. Check if patient exists in EMR
    const existingPatient = await searchEMRPatient({
      firstName: referral.patientInfo.firstName,
      lastName: referral.patientInfo.lastName,
      dob: referral.patientInfo.dob,
    });
    
    if (existingPatient) {
      // Patient exists → Create episode only
      setFlow('episode-only');
      setShowModal(true);
    } else {
      // Patient doesn't exist → Check if we have prescription
      const hasPrescription = referral.clinicalInfo.diagnosis && 
                              referral.clinicalInfo.referringProvider;
      
      if (hasPrescription) {
        // Fax with prescription → Create both
        setFlow('patient-and-episode');
        setShowModal(true);
      } else if (referral.source === 'web') {
        // Web lead without prescription → Ask user
        setFlow('choice');
        setShowModal(true);
      } else {
        // Default: Create both but let user edit
        setFlow('patient-and-episode');
        setShowModal(true);
      }
    }
  };
  
  return (
    <>
      <Button onClick={handleClick}>
        <Building2 className="mr-2 h-4 w-4" />
        Create in EMR
      </Button>
      
      <CreateInEMRModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        referral={referral}
        flow={flow}
        existingPatient={existingPatient}
      />
    </>
  );
}
```

**CreateInEMRModal - Smart routing:**

```tsx
function CreateInEMRModal({ flow, referral, existingPatient }: Props) {
  switch (flow) {
    case 'patient-and-episode':
      return <CreatePatientAndEpisodeFlow referral={referral} />;
    
    case 'patient-only':
      return <CreatePatientOnlyFlow referral={referral} />;
    
    case 'episode-only':
      return <CreateEpisodeOnlyFlow referral={referral} existingPatient={existingPatient} />;
    
    case 'choice':
      return <ChooseCreationModeScreen onSelect={setFlow} referral={referral} />;
    
    default:
      return null;
  }
}
```

**Changes to make:**
- [ ] Create `CreateInEMRButton` component
- [ ] Create `CreateInEMRModal` with flow routing
- [ ] Implement `CreatePatientAndEpisodeFlow` component
- [ ] Implement `CreatePatientOnlyFlow` component
- [ ] Implement `CreateEpisodeOnlyFlow` component
- [ ] Implement `ChooseCreationModeScreen` component
- [ ] Replace all "Create in EMR" buttons with new component

---

#### 5. Pre-filled Field Indicators (Visual System)

**Three states:**
1. ✅ **AI-extracted** → Amber background, AI badge, needs verification
2. ✅ **Verified by user** → Green checkmark, normal background
3. ⚠️ **Missing required** → Yellow background, warning icon

```tsx
function CreatePatientForm({ referral }: Props) {
  return (
    <Form>
      <div className="space-y-4">
        {/* Legend at top */}
        <Alert>
          <AlertDescription className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>AI extracted - please verify</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span>Required</span>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* AI-extracted field */}
        <ProvenanceInput
          label="First Name"
          value={referral.patientInfo.firstName.value}
          provenance={referral.patientInfo.firstName}
          required
        />
        
        {/* Missing required field */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Phone <span className="text-red-500">*</span>
            <AlertCircle className="w-3 h-3 text-yellow-600" />
          </Label>
          <Input
            className="missing-required"
            placeholder="Required field"
          />
          <p className="text-xs text-yellow-700">
            This field is required but was not found in the fax
          </p>
        </div>
        
        {/* Optional, not filled */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input placeholder="Optional" />
        </div>
      </div>
    </Form>
  );
}
```

**CSS:**

```css
/* AI-extracted fields */
.ai-extracted-bg {
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
}

/* Missing required */
.missing-required {
  background-color: #fef9c3;
  border-left: 3px solid #eab308;
  animation: subtle-pulse 2s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

/* Verified fields */
.verified-field {
  border-left: 3px solid #22c55e;
}
```

**Changes to make:**
- [ ] Update all form components to use provenance indicators
- [ ] Add legend/key at top of forms
- [ ] Implement missing-required state
- [ ] Add CSS animations for attention

---

#### 6. Practice Custom Fields - Dynamic Form System

**Config structure:**

```typescript
// src/types/practice-config.ts
interface PracticeConfig {
  practiceId: string;
  practiceName: string;
  emrSystem: 'WebPT' | 'Prompt' | 'Clinicient';
  
  customPatientFields: CustomFieldDefinition[];
  customEpisodeFields: CustomFieldDefinition[];
  
  // Field mappings from referral → EMR
  patientFieldMappings: Record<string, string>;
  episodeFieldMappings: Record<string, string>;
}

interface CustomFieldDefinition {
  fieldName: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'boolean' | 'textarea' | 'number';
  required: boolean;
  options?: string[]; // For select/multiselect
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  
  // Grouping
  group?: string; // "Demographics" | "Insurance" | "Custom"
  order?: number;
  
  // Conditional display
  showWhen?: {
    field: string;
    equals?: any;
    notEquals?: any;
    contains?: any;
  };
  
  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
  
  // Auto-population
  autoPopulateFrom?: string; // Path in referral object, e.g., "source"
  autoPopulateTransform?: Record<string, any>; // Map values
}
```

**Example config:**

```typescript
const ACME_PT_CONFIG: PracticeConfig = {
  practiceId: 'acme-pt',
  practiceName: 'Acme Physical Therapy',
  emrSystem: 'WebPT',
  
  customPatientFields: [
    {
      fieldName: 'marketing_source',
      label: 'How did you hear about us?',
      type: 'select',
      required: true,
      options: [
        'Physician Referral',
        'Google Search',
        'Facebook Ad',
        'Friend/Family Referral',
        'Insurance Directory',
        'Other'
      ],
      group: 'Marketing',
      order: 1,
      autoPopulateFrom: 'source',
      autoPopulateTransform: {
        'fax': 'Physician Referral',
        'web': 'Google Search',
        'phone': 'Phone Inquiry',
      }
    },
    {
      fieldName: 'preferred_contact',
      label: 'Preferred Contact Method',
      type: 'select',
      required: false,
      options: ['Phone', 'Email', 'Text', 'Patient Portal'],
      defaultValue: 'Phone',
      group: 'Communication',
      order: 2,
    },
    {
      fieldName: 'interpreter_needed',
      label: 'Interpreter Needed?',
      type: 'boolean',
      required: false,
      defaultValue: false,
      group: 'Communication',
      order: 3,
    },
    {
      fieldName: 'primary_language',
      label: 'Primary Language',
      type: 'select',
      options: ['English', 'Spanish', 'Mandarin', 'Cantonese', 'Other'],
      required: false,
      defaultValue: 'English',
      group: 'Communication',
      order: 4,
      showWhen: {
        field: 'interpreter_needed',
        equals: true,
      }
    },
  ],
  
  customEpisodeFields: [
    {
      fieldName: 'injury_mechanism',
      label: 'How did the injury occur?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe the mechanism of injury',
      group: 'Clinical',
      order: 1,
    },
    {
      fieldName: 'sport_activity',
      label: 'Sport/Activity (if applicable)',
      type: 'text',
      required: false,
      group: 'Clinical',
      order: 2,
    },
  ],
  
  patientFieldMappings: {
    'patientInfo.firstName': 'first_name',
    'patientInfo.lastName': 'last_name',
    'patientInfo.dob': 'date_of_birth',
  },
  
  episodeFieldMappings: {
    'clinicalInfo.diagnosis': 'primary_diagnosis',
    'clinicalInfo.icd10': 'icd_10_code',
  }
};
```

**Dynamic Form Renderer:**

```tsx
function DynamicCustomFields({ config, data, onChange }: Props) {
  const [fieldValues, setFieldValues] = useState(data);
  
  // Group fields
  const fieldsByGroup = groupBy(config.customPatientFields, 'group');
  
  // Check conditional display
  const shouldShowField = (field: CustomFieldDefinition) => {
    if (!field.showWhen) return true;
    
    const dependentValue = fieldValues[field.showWhen.field];
    if (field.showWhen.equals !== undefined) {
      return dependentValue === field.showWhen.equals;
    }
    if (field.showWhen.notEquals !== undefined) {
      return dependentValue !== field.showWhen.notEquals;
    }
    return true;
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(fieldsByGroup).map(([group, fields]) => (
        <div key={group}>
          <h3 className="text-sm font-medium mb-3">{group}</h3>
          <div className="space-y-3">
            {fields
              .filter(shouldShowField)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(field => (
                <DynamicField
                  key={field.fieldName}
                  definition={field}
                  value={fieldValues[field.fieldName]}
                  onChange={(value) => {
                    setFieldValues(prev => ({ ...prev, [field.fieldName]: value }));
                    onChange({ ...fieldValues, [field.fieldName]: value });
                  }}
                />
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
}

function DynamicField({ definition, value, onChange }: Props) {
  switch (definition.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>
            {definition.label}
            {definition.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={definition.placeholder}
            required={definition.required}
          />
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );
    
    case 'select':
      return (
        <div className="space-y-2">
          <Label>
            {definition.label}
            {definition.required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={definition.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {definition.options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value || false}
            onCheckedChange={onChange}
            id={definition.fieldName}
          />
          <Label htmlFor={definition.fieldName}>
            {definition.label}
          </Label>
        </div>
      );
    
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>
            {definition.label}
            {definition.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={definition.placeholder}
            required={definition.required}
          />
        </div>
      );
    
    case 'date':
      return (
        <div className="space-y-2">
          <Label>
            {definition.label}
            {definition.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={definition.required}
          />
        </div>
      );
    
    default:
      return null;
  }
}
```

**Changes to make:**
- [ ] Create `src/types/practice-config.ts`
- [ ] Create `DynamicCustomFields` component
- [ ] Create `DynamicField` component
- [ ] Add practice config loader (from API or local config)
- [ ] Integrate dynamic fields into Create Patient/Episode forms
- [ ] Add admin UI for configuring custom fields (Phase 2)

---

#### 7. Contact Info Update Flow (When Patient Exists)

**When existing patient found with different contact info:**

```tsx
function PatientMatchConfirmation({ emrPatient, referralPatient, onConfirm }: Props) {
  const [updateFields, setUpdateFields] = useState({
    phone: false,
    email: false,
    address: false,
  });
  
  const diff = comparePatients(emrPatient, referralPatient);
  
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Patient Found with Different Contact Info</AlertTitle>
        <AlertDescription>
          We found a matching patient, but some contact information differs.
        </AlertDescription>
      </Alert>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>EMR Record</TableHead>
            <TableHead>New Referral</TableHead>
            <TableHead>Update?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diff.phone && (
            <TableRow>
              <TableCell className="font-medium">Phone</TableCell>
              <TableCell>{emrPatient.phone}</TableCell>
              <TableCell className="text-amber-600">
                {referralPatient.phone}
                <Badge className="ml-2">🤖 AI</Badge>
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={updateFields.phone}
                  onCheckedChange={(checked) => 
                    setUpdateFields(prev => ({ ...prev, phone: checked }))
                  }
                />
              </TableCell>
            </TableRow>
          )}
          
          {diff.email && (
            <TableRow>
              <TableCell className="font-medium">Email</TableCell>
              <TableCell>{emrPatient.email || '(none)'}</TableCell>
              <TableCell className="text-amber-600">{referralPatient.email}</TableCell>
              <TableCell>
                <Checkbox
                  checked={updateFields.email}
                  onCheckedChange={(checked) => 
                    setUpdateFields(prev => ({ ...prev, email: checked }))
                  }
                />
              </TableCell>
            </TableRow>
          )}
          
          {/* Same for address, insurance, etc. */}
        </TableBody>
      </Table>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onConfirm({ ...emrPatient }, false)} // Keep EMR data
          variant="outline"
        >
          Keep EMR Data
        </Button>
        <Button
          onClick={() => {
            const updatedPatient = { ...emrPatient };
            if (updateFields.phone) updatedPatient.phone = referralPatient.phone;
            if (updateFields.email) updatedPatient.email = referralPatient.email;
            if (updateFields.address) updatedPatient.address = referralPatient.address;
            onConfirm(updatedPatient, true);
          }}
        >
          Update Selected & Continue
        </Button>
      </div>
    </div>
  );
}
```

**Changes to make:**
- [ ] Create `PatientMatchConfirmation` component
- [ ] Create `comparePatients` utility function
- [ ] Integrate into "Patient Exists" flow in CreateInEMRModal
- [ ] Show AI badges for fields from referral

---

### **Phase 2: Nice to Have (6-8 weeks after MVP)**

#### 8. Split-Screen Fax Preview (Optional Power User Mode)

```tsx
function CreatePatientForm({ referral, faxDocument }: Props) {
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  
  if (splitScreenMode) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left: Fax preview */}
        <div className="border rounded p-4 overflow-auto">
          <div className="sticky top-0 bg-background pb-2 flex justify-between items-center">
            <h3 className="font-medium">Fax Source</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSplitScreenMode(false)}
            >
              Hide Preview
            </Button>
          </div>
          <FaxPDFViewer document={faxDocument} />
        </div>
        
        {/* Right: Form */}
        <div className="overflow-auto">
          <PatientFormFields referral={referral} />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSplitScreenMode(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Show Fax Side-by-Side
        </Button>
      </div>
      <PatientFormFields referral={referral} />
    </div>
  );
}
```

**Changes to make:**
- [ ] Add split-screen toggle to forms
- [ ] Create side-by-side layout component
- [ ] Embed fax PDF viewer in left pane

---

#### 9. Insurance Card OCR (Semi-Manual)

```tsx
function InsuranceCardUpload({ patientMRN, existingInsurances }: Props) {
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  
  const handleCardUpload = async (file: File) => {
    const result = await ocrInsuranceCard(file);
    setOcrResult(result);
  };
  
  if (ocrResult) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insurance Card Extracted</AlertTitle>
          <AlertDescription>
            We extracted the following information. Please verify and choose what to do with it.
          </AlertDescription>
        </Alert>
        
        {/* Extracted info preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Extracted Information
              <Badge variant="outline">🤖 AI - {ocrResult.confidence}% confident</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Insurance:</strong> {ocrResult.insuranceName}</div>
            <div><strong>Member ID:</strong> {ocrResult.memberId}</div>
            <div><strong>Group:</strong> {ocrResult.groupNumber}</div>
            <div><strong>Effective Date:</strong> {ocrResult.effectiveDate}</div>
          </CardContent>
        </Card>
        
        {/* Current insurances */}
        {existingInsurances.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Patient currently has:</h4>
            {existingInsurances.map((ins, idx) => (
              <Card key={idx} className="mb-2">
                <CardContent className="py-2 text-sm">
                  <strong>{idx === 0 ? 'Primary' : 'Secondary'}:</strong> {ins.name} #{ins.memberId}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Action selection */}
        <div className="space-y-2">
          <Label>What would you like to do?</Label>
          <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="replace-primary" id="r1" />
              <Label htmlFor="r1">Replace Primary Insurance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="add-secondary" id="r2" />
              <Label htmlFor="r2">Add as Secondary Insurance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="update-existing" id="r3" />
              <Label htmlFor="r3">Update Existing Insurance (same company, new card)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="copy-for-review" id="r4" />
              <Label htmlFor="r4">Copy Info for Me to Review</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button onClick={handleApplyInsurance} disabled={!selectedAction}>
          Apply Changes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm">Upload Insurance Card Image</p>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => handleCardUpload(e.target.files[0])}
        className="mt-4"
      />
    </div>
  );
}
```

**Changes to make:**
- [ ] Build insurance card OCR endpoint
- [ ] Create `InsuranceCardUpload` component
- [ ] Add manual action selection UI
- [ ] Integrate with EMR insurance update API
- [ ] Add to patient detail view / Create in EMR flow

---

## 📊 Summary: Complete Change List

### **Components to Create:**

1. ✅ `ProvenanceInput` - Shows AI badge, verification actions, edit capability
2. ✅ `AddToBoardModal` - Preview + edit opportunity before adding to board
3. ✅ `OpportunityCardPreview` - Shows what card will look like
4. ✅ `QuickEditSheet` - Side drawer for editing opportunity cards
5. ✅ `EditableField` - Inline editing for card fields
6. ✅ `CreateInEMRButton` - Smart button that auto-detects flow
7. ✅ `CreateInEMRModal` - Main modal with flow routing
8. ✅ `CreatePatientAndEpisodeFlow` - Combined creation flow
9. ✅ `CreatePatientOnlyFlow` - Patient-only flow
10. ✅ `CreateEpisodeOnlyFlow` - Episode-only for existing patients
11. ✅ `ChooseCreationModeScreen` - When ambiguous (web leads)
12. ✅ `DynamicCustomFields` - Renders practice-specific fields
13. ✅ `DynamicField` - Individual dynamic field renderer
14. ✅ `PatientMatchConfirmation` - Shows diff, allows selective updates
15. ⚠️ `InsuranceCardUpload` - OCR + manual action selection (Phase 2)
16. ⚠️ Split-screen form layout (Phase 2)

### **Type Updates:**

1. ✅ Add `FieldProvenance` interface
2. ✅ Update `Referral` type to use provenance for all fields
3. ✅ Create `PracticeConfig` interface
4. ✅ Create `CustomFieldDefinition` interface
5. ✅ Add provenance to Opportunity card data

### **Page Updates:**

1. ✅ `FaxInbox.tsx` - Replace "Add to Board" with preview modal
2. ✅ `FaxInbox.tsx` - Update "Create in EMR" to use new button
3. ✅ `WebLeads.tsx` - Update "Create in EMR" to use new button
4. ✅ `Opportunities.tsx` - Add Quick Edit to card dropdown
5. ✅ `Opportunities.tsx` - Show AI badges on cards
6. ✅ `Opportunities.tsx` - Enable inline editing

### **New Files:**

1. ✅ `src/types/field-provenance.ts`
2. ✅ `src/types/practice-config.ts`
3. ✅ `src/components/ProvenanceInput.tsx`
4. ✅ `src/components/AddToBoardModal.tsx`
5. ✅ `src/components/CreateInEMRButton.tsx`
6. ✅ `src/components/CreateInEMRModal.tsx`
7. ✅ `src/components/DynamicCustomFields.tsx`
8. ✅ `src/utils/comparePatients.ts`
9. ✅ `src/utils/autoPopulateFields.ts`
10. ✅ `src/config/practice-config.ts` - Practice configurations

### **API/Backend:**

1. ✅ Add `source` field to all extracted data responses
2. ✅ Add `confidence` to AI extraction responses
3. ✅ Create endpoint: `POST /api/emr/search-patient`
4. ✅ Create endpoint: `POST /api/emr/create-patient`
5. ✅ Create endpoint: `POST /api/emr/create-episode`
6. ✅ Create endpoint: `PATCH /api/emr/update-patient`
7. ✅ Add field verification tracking to database
8. ⚠️ Create endpoint: `POST /api/ocr/insurance-card` (Phase 2)

---

## 🎯 Implementation Order

### Week 1-2: Field Provenance Foundation
1. Create `FieldProvenance` types
2. Update fax OCR to include provenance
3. Create `ProvenanceInput` component
4. Add CSS for AI/verified/missing states

### Week 3-4: Opportunity Preview & Edit
1. Create `AddToBoardModal` with preview
2. Update `FaxInbox` to use preview modal
3. Add Quick Edit to opportunity cards
4. Enable inline editing on cards

### Week 5-6: Create in EMR Flows
1. Create `CreateInEMRButton` with smart detection
2. Build Patient+Episode flow
3. Build Patient-only flow
4. Build Episode-only flow
5. Implement patient match confirmation
6. Add contact info update UI

### Week 7-8: Practice Custom Fields
1. Create practice config structure
2. Build `DynamicCustomFields` renderer
3. Add custom fields to create forms
4. Add auto-population logic
5. Test with multiple practice configs

### Week 9-10: Polish & Testing
1. Add split-screen mode (optional)
2. Comprehensive testing
3. Bug fixes
4. User acceptance testing
5. Documentation

---

## 🚦 Go/No-Go Decision Points

### ✅ Must Have (Block release if missing):
- Field provenance tracking (AI badges)
- Opportunity preview before adding to board
- Single smart "Create in EMR" button
- Patient duplicate detection
- Contact info update flow
- Pre-filled field indicators

### ⚠️ Should Have (Can defer 1 sprint):
- Practice custom fields (if only 1 practice initially)
- Quick edit on cards (can use full edit initially)
- Split-screen fax view

### ❌ Can Wait:
- Insurance card OCR
- Advanced field validation
- Admin UI for custom fields

---

## 💡 Key Principles

1. **Trust but verify** - AI extracts, humans verify
2. **Show, don't hide** - Always indicate data source
3. **Editable everywhere** - Never lock users out
4. **Preview before commit** - Let users review before creating
5. **Smart defaults, manual overrides** - System guesses, user decides
6. **Fail gracefully** - Always provide manual path

**This is the complete, final plan. Ready to implement.**

