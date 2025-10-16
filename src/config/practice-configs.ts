/**
 * Practice-Specific Configurations
 * 
 * Define custom fields and EMR mappings for each practice.
 * Add new practice configs here as needed.
 */

import type { PracticeConfig } from '../types/practice-config';
import { DEFAULT_PRACTICE_CONFIG } from '../types/practice-config';

/**
 * Example practice with comprehensive custom fields
 */
export const DEMO_PRACTICE_CONFIG: PracticeConfig = {
  practiceId: 'demo-pt',
  practiceName: 'Demo Physical Therapy',
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
        'Instagram Ad',
        'Friend/Family Referral',
        'Insurance Directory',
        'Returning Patient',
        'Other'
      ],
      group: 'Marketing',
      order: 1,
      autoPopulateFrom: 'source',
      autoPopulateTransform: {
        'fax': 'Physician Referral',
        'web': 'Google Search',
        'phone': 'Phone Inquiry',
        'walk-in': 'Walk-in',
      },
      helpText: 'This helps us understand our most effective marketing channels'
    },
    {
      fieldName: 'preferred_contact',
      label: 'Preferred Contact Method',
      type: 'select',
      required: false,
      options: ['Phone Call', 'Text Message', 'Email', 'Patient Portal'],
      defaultValue: 'Phone Call',
      group: 'Communication',
      order: 2,
    },
    {
      fieldName: 'best_time_to_call',
      label: 'Best Time to Call',
      type: 'select',
      required: false,
      options: ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'],
      defaultValue: 'Anytime',
      group: 'Communication',
      order: 3,
      showWhen: {
        field: 'preferred_contact',
        equals: 'Phone Call',
      }
    },
    {
      fieldName: 'interpreter_needed',
      label: 'Interpreter Needed?',
      type: 'boolean',
      required: false,
      defaultValue: false,
      group: 'Communication',
      order: 4,
    },
    {
      fieldName: 'primary_language',
      label: 'Primary Language',
      type: 'select',
      options: ['English', 'Spanish', 'Mandarin', 'Cantonese', 'Vietnamese', 'Other'],
      required: false,
      defaultValue: 'English',
      group: 'Communication',
      order: 5,
    },
    {
      fieldName: 'emergency_contact_name',
      label: 'Emergency Contact Name',
      type: 'text',
      required: false,
      group: 'Emergency Contact',
      order: 6,
    },
    {
      fieldName: 'emergency_contact_phone',
      label: 'Emergency Contact Phone',
      type: 'phone',
      required: false,
      group: 'Emergency Contact',
      order: 7,
    },
    {
      fieldName: 'emergency_contact_relationship',
      label: 'Relationship',
      type: 'select',
      options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'],
      required: false,
      group: 'Emergency Contact',
      order: 8,
    },
  ],
  
  customEpisodeFields: [
    {
      fieldName: 'injury_mechanism',
      label: 'How did the injury occur?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe the mechanism of injury (e.g., fall, motor vehicle accident, sports injury)',
      group: 'Clinical Details',
      order: 1,
    },
    {
      fieldName: 'symptom_duration',
      label: 'How long have you had symptoms?',
      type: 'select',
      options: ['Less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', 'More than 6 months'],
      required: false,
      group: 'Clinical Details',
      order: 2,
    },
    {
      fieldName: 'prior_treatment',
      label: 'Previous Treatment',
      type: 'textarea',
      required: false,
      placeholder: 'Has the patient had PT or other treatment for this condition before?',
      group: 'Clinical Details',
      order: 3,
    },
    {
      fieldName: 'functional_goals',
      label: 'Patient Functional Goals',
      type: 'textarea',
      required: false,
      placeholder: 'What does the patient want to be able to do? (e.g., return to running, play with grandkids)',
      group: 'Clinical Details',
      order: 4,
    },
  ],
  
  patientFieldMappings: {
    'patientInfo.firstName': 'first_name',
    'patientInfo.lastName': 'last_name',
    'patientInfo.dateOfBirth': 'date_of_birth',
    'patientInfo.phone': 'primary_phone',
    'patientInfo.email': 'email_address',
    'patientInfo.address.street': 'street_address',
    'patientInfo.address.city': 'city',
    'patientInfo.address.state': 'state',
    'patientInfo.address.zipCode': 'zip_code',
  },
  
  episodeFieldMappings: {
    'clinicalInfo.primaryDiagnosis': 'primary_diagnosis_text',
    'clinicalInfo.icd10Codes': 'icd_10_codes',
    'clinicalInfo.referringProvider': 'referring_physician_name',
    'clinicalInfo.referringOrganization': 'referring_physician_practice',
    'clinicalInfo.orderText': 'prescription_text',
  },
  
  features: {
    requireInsuranceVerification: true,
    enableAutoScheduling: false,
    requirePrescription: true,
  },
};

/**
 * Practice configuration registry
 */
const PRACTICE_CONFIGS: Record<string, PracticeConfig> = {
  'demo-pt': DEMO_PRACTICE_CONFIG,
  'default': DEFAULT_PRACTICE_CONFIG,
};

/**
 * Get practice configuration by ID
 */
export function getPracticeConfig(practiceId: string): PracticeConfig {
  return PRACTICE_CONFIGS[practiceId] || DEFAULT_PRACTICE_CONFIG;
}

/**
 * Get current practice configuration
 * In a real app, this would look up the user's practice from auth context
 */
export function getCurrentPracticeConfig(): PracticeConfig {
  // TODO: Get from user auth context
  // For now, return demo config
  return DEMO_PRACTICE_CONFIG;
}

