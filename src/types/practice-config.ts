/**
 * Practice Configuration System
 * 
 * Defines practice-specific custom fields and EMR integration settings.
 * Each practice can have unique fields for patient and episode creation.
 */

export type FieldType = 
  | 'text' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'boolean' 
  | 'textarea' 
  | 'number'
  | 'phone'
  | 'email';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
  custom?: (value: any) => boolean | string;
}

export interface ConditionalDisplay {
  field: string;
  equals?: any;
  notEquals?: any;
  contains?: any;
}

export interface CustomFieldDefinition {
  fieldName: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];              // For select/multiselect
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  
  // Grouping
  group?: string;                  // e.g., "Demographics", "Insurance", "Clinical"
  order?: number;
  
  // Conditional display
  showWhen?: ConditionalDisplay;
  
  // Validation
  validation?: FieldValidation;
  
  // Auto-population
  autoPopulateFrom?: string;       // Path in referral object
  autoPopulateTransform?: Record<string, any>;  // Map values
}

export interface PracticeConfig {
  practiceId: string;
  practiceName: string;
  emrSystem: 'WebPT' | 'Prompt' | 'Clinicient' | 'Other';
  
  // Custom fields
  customPatientFields: CustomFieldDefinition[];
  customEpisodeFields: CustomFieldDefinition[];
  
  // Field mappings (referral data → EMR field names)
  patientFieldMappings: Record<string, string>;
  episodeFieldMappings: Record<string, string>;
  
  // Feature flags
  features?: {
    requireInsuranceVerification?: boolean;
    enableAutoScheduling?: boolean;
    requirePrescription?: boolean;
  };
}

/**
 * Default practice configuration
 * Used as fallback when practice-specific config not found
 */
export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  practiceId: 'default',
  practiceName: 'Default Practice',
  emrSystem: 'Other',
  customPatientFields: [],
  customEpisodeFields: [],
  patientFieldMappings: {
    'patientInfo.firstName': 'first_name',
    'patientInfo.lastName': 'last_name',
    'patientInfo.dob': 'date_of_birth',
    'patientInfo.phone': 'phone',
    'patientInfo.email': 'email',
  },
  episodeFieldMappings: {
    'clinicalInfo.diagnosis': 'primary_diagnosis',
    'clinicalInfo.icd10': 'icd_10_code',
    'clinicalInfo.referringProvider': 'referring_physician',
  },
};

