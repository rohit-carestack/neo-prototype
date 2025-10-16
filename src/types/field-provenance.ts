/**
 * Field Provenance System
 * 
 * Tracks the source and reliability of data fields,
 * enabling users to distinguish between AI-extracted,
 * user-verified, and manually-entered data.
 */

export type FieldSource = 
  | 'ai_extracted'    // Extracted by AI/OCR from fax, image, etc.
  | 'user_input'      // Manually entered or verified by user
  | 'api_verified'    // Verified through external API (e.g., insurance verification)
  | 'manual_entry';   // Manually entered by staff

export interface FieldProvenance<T = any> {
  value: T;
  source: FieldSource;
  confidence?: number;        // 0-1 for AI extractions
  extractedFrom?: string;     // e.g., "fax_page_1", "insurance_card", "web_form"
  verifiedBy?: string;        // User ID who verified/edited
  verifiedAt?: Date;          // When verified
  lastModifiedBy?: string;    // User ID of last modifier
  lastModifiedAt?: Date;      // When last modified
}

/**
 * Helper type: Convert an object to use field provenance
 * 
 * Example:
 * interface PatientInfo { firstName: string; lastName: string; }
 * type PatientInfoWithProvenance = WithProvenance<PatientInfo>
 * // { firstName: FieldProvenance<string>; lastName: FieldProvenance<string>; }
 */
export type WithProvenance<T> = {
  [K in keyof T]: FieldProvenance<T[K]>;
};

/**
 * Helper functions for working with provenance
 */

export function createProvenanceField<T>(
  value: T,
  source: FieldSource,
  options?: {
    confidence?: number;
    extractedFrom?: string;
    verifiedBy?: string;
  }
): FieldProvenance<T> {
  return {
    value,
    source,
    confidence: options?.confidence,
    extractedFrom: options?.extractedFrom,
    verifiedBy: options?.verifiedBy,
    verifiedAt: options?.verifiedBy ? new Date() : undefined,
  };
}

export function extractValue<T>(field: FieldProvenance<T>): T {
  return field.value;
}

export function isAIExtracted(field: FieldProvenance): boolean {
  return field.source === 'ai_extracted' && !field.verifiedBy;
}

export function isVerified(field: FieldProvenance): boolean {
  return field.source === 'user_input' || field.source === 'api_verified' || !!field.verifiedBy;
}

export function verifyField<T>(field: FieldProvenance<T>, userId: string): FieldProvenance<T> {
  return {
    ...field,
    source: 'user_input',
    verifiedBy: userId,
    verifiedAt: new Date(),
  };
}

export function updateField<T>(
  field: FieldProvenance<T>,
  newValue: T,
  userId: string
): FieldProvenance<T> {
  return {
    ...field,
    value: newValue,
    source: 'user_input',
    lastModifiedBy: userId,
    lastModifiedAt: new Date(),
    verifiedBy: userId,
    verifiedAt: new Date(),
  };
}

/**
 * Extract just the values from a provenance-tracked object
 */
export function extractValues<T>(obj: WithProvenance<T>): T {
  const result: any = {};
  for (const key in obj) {
    result[key] = obj[key].value;
  }
  return result as T;
}

