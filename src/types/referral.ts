/**
 * REFERRAL-CENTRIC MODEL
 * 
 * This app tracks REFERRALS through their intake workflow.
 * The EMR owns patient records - we just coordinate getting referrals into the EMR.
 */

import type { FieldProvenance, WithProvenance } from './field-provenance';

export type ReferralSource = "fax" | "web" | "call" | "walk-in";

export type ReferralStatus = 
  | "new"                    // Just received, not yet touched
  | "reviewing"              // Staff is looking at it
  | "contacting_patient"     // Trying to reach patient
  | "contacted"              // Successfully spoke with patient
  | "awaiting_documents"     // Waiting for prescription, forms, etc.
  | "verifying_insurance"    // Running E&B check
  | "verified"               // Insurance verified, ready to schedule
  | "ready_for_emr"          // All info gathered, ready to create in EMR
  | "in_emr"                 // Created in EMR, has MRN
  | "scheduled"              // Initial eval scheduled
  | "arrived"                // Patient showed up for appointment
  | "completed"              // Workflow complete
  | "declined"               // Patient declined services
  | "unable_to_reach"        // Can't contact patient after multiple attempts
  | "on_hold";               // Paused for some reason

export type ContactMethod = "call" | "text" | "email";
export type ContactOutcome = "reached" | "voicemail" | "no_answer" | "wrong_number" | "email_sent";

export interface ContactAttempt {
  id: string;
  date: string; // ISO datetime
  method: ContactMethod;
  outcome: ContactOutcome;
  notes: string;
  staffMember: string;
  duration?: number; // seconds, for calls
}

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  preferredContactMethod?: "phone" | "email" | "text";
}

export interface ClinicalInfo {
  primaryDiagnosis: string;
  diagnosisDescription?: string;
  icd10Codes?: string[];
  referringProvider: string;
  referringOrganization?: string;
  providerPhone?: string;
  providerFax?: string;
  orderText: string; // The actual prescription/referral text
  surgeryDate?: string; // If post-surgical
  urgencyNotes?: string;
}

export interface InsuranceInfo {
  primaryInsurance?: {
    company: string;
    memberId: string;
    groupNumber?: string;
    subscriberName?: string;
    subscriberRelationship?: "self" | "spouse" | "child" | "other";
  };
  secondaryInsurance?: {
    company: string;
    memberId: string;
    groupNumber?: string;
  };
  verificationStatus: "not_verified" | "pending" | "verified" | "failed" | "not_needed";
  verificationDate?: string;
  verificationMethod?: "quick" | "deep" | "manual";
  networkStatus?: "in-network" | "out-of-network" | "unknown";
  coverageNotes?: string;
  copayAmount?: number;
  deductible?: number;
  authRequired?: boolean;
  authNumber?: string;
  authExpiration?: string;
}

export interface EMRLink {
  // Link to EMR patient record
  patientMRN: string; // Medical Record Number from EMR
  patientId?: string; // EMR's internal patient ID
  episodeId?: string; // EMR's episode/case ID
  createdInEmrAt: string;
  createdInEmrBy: string;
  emrSystem?: "prompt" | "webpt" | "neo" | "other";
  emrUrl?: string; // Deep link to patient in EMR
}

export interface SourceDocuments {
  faxId?: string;
  faxUrl?: string;
  faxPages?: number;
  webLeadId?: string;
  webFormData?: Record<string, any>;
  callId?: string;
  callRecordingUrl?: string;
  callTranscript?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface WorkflowInfo {
  status: ReferralStatus;
  statusChangedAt: string;
  priority: "routine" | "urgent" | "emergency";
  assignedTo?: string; // User ID or name
  assignedAt?: string;
  contactAttempts: ContactAttempt[];
  lastContactDate?: string;
  nextFollowUpDate?: string;
  nextFollowUpReason?: string;
  internalNotes?: string; // Staff-only notes
  patientNotes?: string; // Can be shared with patient
}

export interface Referral {
  // Identification
  id: string;
  referralNumber: string; // Human-readable: RR-001, RR-002, etc.
  
  // Source
  source: ReferralSource;
  receivedAt: string; // ISO datetime
  
  // Patient Information (temporary - lives in EMR permanently)
  patientInfo: PatientInfo;
  
  // Clinical Information
  clinicalInfo: ClinicalInfo;
  
  // Insurance Information
  insuranceInfo: InsuranceInfo;
  
  // Workflow & Status
  workflow: WorkflowInfo;
  
  // EMR Link (once created in EMR)
  emrLink?: EMRLink;
  
  // Source Documents
  sourceDocuments: SourceDocuments;
  
  // Active Sequences (for automated follow-ups)
  activeSequences?: {
    sequenceId: string;
    sequenceName: string;
    status: "active" | "paused" | "completed";
    currentStep: number;
    totalSteps: number;
  }[];
  
  // Lifecycle tracking
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // When reached "scheduled" or "completed"
  archivedAt?: string; // Moved to archive after 30 days
  
  // Metadata
  createdBy: string;
  updatedBy: string;
}

/**
 * DTO for creating a referral from different sources
 */
export interface CreateReferralDTO {
  source: ReferralSource;
  
  // Minimum required patient info
  patientInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth?: string;
    email?: string;
  };
  
  // Minimum required clinical info
  clinicalInfo: {
    primaryDiagnosis: string;
    referringProvider: string;
    orderText: string;
  };
  
  // Optional insurance info
  insuranceInfo?: {
    primaryInsurance?: {
      company: string;
      memberId: string;
    };
  };
  
  // Priority
  priority?: "routine" | "urgent" | "emergency";
  
  // Source document references
  faxId?: string;
  webLeadId?: string;
  callId?: string;
}

/**
 * DTO for updating referral status
 */
export interface UpdateReferralStatusDTO {
  id: string;
  status: ReferralStatus;
  notes?: string;
  assignedTo?: string;
}

/**
 * DTO for adding contact attempt
 */
export interface AddContactAttemptDTO {
  referralId: string;
  method: ContactMethod;
  outcome: ContactOutcome;
  notes: string;
  duration?: number;
}

/**
 * DTO for linking to EMR
 */
export interface LinkToEMRDTO {
  referralId: string;
  patientMRN: string;
  episodeId?: string;
  emrSystem?: string;
}

/**
 * Referral summary for list views
 */
export interface ReferralSummary {
  id: string;
  referralNumber: string;
  patientName: string;
  diagnosis: string;
  source: ReferralSource;
  status: ReferralStatus;
  priority: "routine" | "urgent" | "emergency";
  assignedTo?: string;
  receivedAt: string;
  lastContactDate?: string;
  daysInSystem: number;
  hasUnreadMessages?: boolean;
}

/**
 * Dashboard statistics
 */
export interface ReferralStats {
  total: number;
  byStatus: Record<ReferralStatus, number>;
  urgent: number;
  unassigned: number;
  needingAction: number;
  completedToday: number;
  averageDaysToSchedule: number;
  conversionRate: number; // % that reach "scheduled"
}

/**
 * PROVENANCE-TRACKED VERSIONS
 * 
 * These types include field provenance tracking for AI-extracted data.
 * Used primarily in the create flows where we need to track data source.
 */

export type PatientInfoWithProvenance = WithProvenance<Omit<PatientInfo, 'address' | 'preferredContactMethod'>> & {
  address?: {
    street?: FieldProvenance<string>;
    city?: FieldProvenance<string>;
    state?: FieldProvenance<string>;
    zipCode?: FieldProvenance<string>;
  };
  preferredContactMethod?: FieldProvenance<"phone" | "email" | "text">;
};

export type ClinicalInfoWithProvenance = WithProvenance<Omit<ClinicalInfo, 'icd10Codes' | 'surgeryDate' | 'urgencyNotes'>> & {
  icd10Codes?: FieldProvenance<string[]>;
  surgeryDate?: FieldProvenance<string>;
  urgencyNotes?: FieldProvenance<string>;
};

export type InsuranceInfoWithProvenance = Omit<InsuranceInfo, 'primaryInsurance' | 'secondaryInsurance'> & {
  primaryInsurance?: {
    company: FieldProvenance<string>;
    memberId: FieldProvenance<string>;
    groupNumber?: FieldProvenance<string>;
    subscriberName?: FieldProvenance<string>;
    subscriberRelationship?: FieldProvenance<"self" | "spouse" | "child" | "other">;
  };
  secondaryInsurance?: {
    company: FieldProvenance<string>;
    memberId: FieldProvenance<string>;
    groupNumber?: FieldProvenance<string>;
  };
};

export interface ReferralWithProvenance extends Omit<Referral, 'patientInfo' | 'clinicalInfo' | 'insuranceInfo'> {
  patientInfo: PatientInfoWithProvenance;
  clinicalInfo: ClinicalInfoWithProvenance;
  insuranceInfo: InsuranceInfoWithProvenance;
}

