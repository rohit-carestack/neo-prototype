/**
 * Patient Record - Persistent entity representing a person
 * This is created once and updated over time
 */

export interface PatientInsurance {
  company: string;
  memberId: string;
  groupNumber?: string;
  subscriberName?: string;
  subscriberRelationship?: "self" | "spouse" | "child" | "other";
  subscriberDOB?: string;
  effectiveDate?: string;
  terminationDate?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface Patient {
  // Identifiers
  id: string; // Internal system ID
  mrn?: string; // Medical Record Number from EMR
  externalId?: string; // ID from EMR system
  
  // Demographics
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: "male" | "female" | "other" | "prefer-not-to-say";
  ssn?: string; // Optional, sensitive
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: PatientAddress;
  preferredContactMethod?: "phone" | "email" | "text" | "mail";
  preferredLanguage?: string;
  
  // Emergency Contact
  emergencyContact?: EmergencyContact;
  
  // Insurance
  primaryInsurance?: PatientInsurance;
  secondaryInsurance?: PatientInsurance;
  
  // Consent & Privacy
  hipaaConsentSigned: boolean;
  hipaaConsentDate?: string;
  treatmentConsentSigned: boolean;
  treatmentConsentDate?: string;
  communicationConsent: {
    phone: boolean;
    email: boolean;
    text: boolean;
  };
  
  // Status & Metadata
  status: "active" | "inactive" | "deceased";
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy: string; // User ID
  updatedBy: string; // User ID
  
  // EMR Sync
  emrSyncStatus?: "pending" | "synced" | "failed" | "manual";
  lastEmrSyncAt?: string;
  emrSyncError?: string;
  
  // Notes
  notes?: string;
  
  // Referral tracking
  referralSource?: "fax" | "web" | "call" | "walk-in" | "other";
  initialReferralDate?: string;
}

/**
 * Patient Creation DTO - Data Transfer Object for creating new patients
 * Contains required fields for creation
 */
export interface CreatePatientDTO {
  // Required Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer-not-to-say";
  
  // Required Contact
  primaryPhone: string;
  
  // Optional Demographics
  middleName?: string;
  ssn?: string;
  
  // Optional Contact
  secondaryPhone?: string;
  email?: string;
  address?: PatientAddress;
  preferredContactMethod?: "phone" | "email" | "text" | "mail";
  preferredLanguage?: string;
  
  // Optional Emergency Contact
  emergencyContact?: EmergencyContact;
  
  // Insurance (at least primary recommended)
  primaryInsurance?: PatientInsurance;
  secondaryInsurance?: PatientInsurance;
  
  // Consent (should be collected at creation)
  hipaaConsentSigned?: boolean;
  treatmentConsentSigned?: boolean;
  communicationConsent?: {
    phone: boolean;
    email: boolean;
    text: boolean;
  };
  
  // Metadata
  referralSource?: "fax" | "web" | "call" | "walk-in" | "other";
  notes?: string;
}

/**
 * Patient Update DTO - For updating existing patient records
 */
export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {
  id: string;
}

/**
 * Patient Search Criteria - For finding existing patients
 */
export interface PatientSearchCriteria {
  // Search by identifiers
  id?: string;
  mrn?: string;
  
  // Search by demographics
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  
  // Search by contact
  phone?: string;
  email?: string;
  
  // Fuzzy matching
  fuzzyName?: string; // Will search both first and last name
  
  // Status filter
  status?: "active" | "inactive" | "deceased" | "all";
}

/**
 * Patient Match Result - When searching for duplicates
 */
export interface PatientMatchResult {
  patient: Patient;
  matchScore: number; // 0-100, higher is better match
  matchReasons: string[]; // e.g., ["Same phone", "Similar name"]
}

/**
 * Patient with Cases - Extended view including all episodes
 */
export interface PatientWithCases extends Patient {
  cases: any[]; // Will use Case type once defined
  totalCases: number;
  activeCases: number;
  completedCases: number;
}

