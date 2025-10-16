/**
 * Case/Episode of Care - Represents a specific treatment episode
 * Multiple cases can be linked to a single patient
 */

export interface ReferringProvider {
  name: string;
  npi?: string; // National Provider Identifier
  organization?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
}

export interface AuthorizationInfo {
  status: "not-required" | "pending" | "approved" | "denied" | "expired";
  authNumber?: string;
  authorizedVisits?: number;
  usedVisits?: number;
  remainingVisits?: number;
  startDate?: string; // ISO date
  expirationDate?: string; // ISO date
  requestedDate?: string;
  approvedDate?: string;
  deniedDate?: string;
  denialReason?: string;
  notes?: string;
}

export interface TreatmentPlan {
  frequency?: string; // e.g., "3x per week"
  expectedDuration?: string; // e.g., "6 weeks"
  estimatedVisits?: number;
  treatmentGoals?: string;
  precautions?: string;
  contraindications?: string;
}

export interface Case {
  // Identifiers
  id: string; // Internal case ID
  caseNumber?: string; // Human-readable case number
  patientId: string; // Foreign key to Patient
  externalCaseId?: string; // ID from EMR system
  
  // Patient Info (denormalized for quick access)
  patientName?: string;
  patientDOB?: string;
  patientMRN?: string;
  
  // Referral Information
  referralSource: "fax" | "web" | "call" | "walk-in" | "self-referral" | "other";
  referralDate: string; // ISO date
  referringProvider?: ReferringProvider;
  
  // Diagnosis
  primaryDiagnosis: string; // Human readable
  secondaryDiagnoses?: string[];
  icd10Codes: string[]; // Array of ICD-10 codes
  
  // Order/Prescription
  orderText?: string; // Free text of the referral/prescription
  prescriptionImageUrl?: string; // Link to uploaded prescription
  
  // Authorization & Insurance
  authorization?: AuthorizationInfo;
  networkStatus?: "in-network" | "out-of-network" | "unknown";
  insuranceVerificationStatus?: "not-verified" | "verified" | "expired" | "pending";
  lastVerificationDate?: string;
  
  // Treatment
  treatmentPlan?: TreatmentPlan;
  assignedTherapist?: string; // User ID or name
  assignedLocation?: string; // Location ID or name
  
  // Scheduling
  firstAppointmentDate?: string; // ISO datetime
  lastAppointmentDate?: string; // ISO datetime
  nextAppointmentDate?: string; // ISO datetime
  
  // Priority & Status
  priority: "routine" | "urgent" | "emergency";
  status: 
    | "new"              // Just created, not yet contacted
    | "contacted"        // Patient contacted, gathering info
    | "pending-auth"     // Waiting for authorization
    | "authorized"       // Auth approved, ready to schedule
    | "scheduled"        // Initial eval scheduled
    | "active"           // Currently in treatment
    | "on-hold"          // Treatment paused
    | "completed"        // Treatment completed
    | "cancelled"        // Case cancelled
    | "denied";          // Authorization denied
  
  // Dates
  startDate?: string; // ISO date - when treatment started
  endDate?: string; // ISO date - when treatment ended
  estimatedEndDate?: string; // ISO date - projected end
  
  // Opportunity Board Tracking
  opportunityStage?: 
    | "unassigned"
    | "assigned"
    | "contacted"
    | "ready_to_schedule"
    | "scheduled_eval"
    | "verified_benefits"
    | "financial_conversation"
    | "arrived";
  
  // Financial
  copayAmount?: number;
  deductibleAmount?: number;
  deductibleMet?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  coinsurancePercentage?: number;
  
  // Notes & Communication
  notes?: string;
  internalNotes?: string; // Staff-only notes
  
  // Metadata
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy: string; // User ID
  updatedBy: string; // User ID
  
  // EMR Sync
  emrSyncStatus?: "pending" | "synced" | "failed" | "manual";
  lastEmrSyncAt?: string;
  emrSyncError?: string;
  
  // Related Records
  faxId?: string; // If created from a fax
  webLeadId?: string; // If created from a web lead
  callId?: string; // If created from a call
}

/**
 * Case Creation DTO - For creating new cases
 */
export interface CreateCaseDTO {
  // Required
  patientId: string;
  primaryDiagnosis: string;
  icd10Codes: string[];
  referralSource: "fax" | "web" | "call" | "walk-in" | "self-referral" | "other";
  referralDate: string;
  priority: "routine" | "urgent" | "emergency";
  
  // Optional but recommended
  referringProvider?: ReferringProvider;
  orderText?: string;
  authorization?: Partial<AuthorizationInfo>;
  networkStatus?: "in-network" | "out-of-network" | "unknown";
  treatmentPlan?: TreatmentPlan;
  assignedTherapist?: string;
  assignedLocation?: string;
  
  // Optional
  secondaryDiagnoses?: string[];
  notes?: string;
  internalNotes?: string;
  
  // Source tracking
  faxId?: string;
  webLeadId?: string;
  callId?: string;
}

/**
 * Case Update DTO - For updating existing cases
 */
export interface UpdateCaseDTO extends Partial<CreateCaseDTO> {
  id: string;
  status?: Case["status"];
  opportunityStage?: Case["opportunityStage"];
}

/**
 * Case with Patient - Extended view including patient details
 */
export interface CaseWithPatient extends Case {
  patient: any; // Will use Patient type
}

/**
 * Case Summary - Lightweight version for lists
 */
export interface CaseSummary {
  id: string;
  caseNumber?: string;
  patientId: string;
  patientName: string;
  primaryDiagnosis: string;
  status: Case["status"];
  priority: Case["priority"];
  assignedTherapist?: string;
  createdAt: string;
  nextAppointmentDate?: string;
}

