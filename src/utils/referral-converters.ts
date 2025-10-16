/**
 * Referral Converter Utilities
 * 
 * Helper functions to convert between different data formats and 
 * add field provenance tracking to extracted data.
 */

import { createProvenanceField } from '../types/field-provenance';
import type { Referral, ReferralWithProvenance } from '../types/referral';

/**
 * Convert fax data to referral with provenance tracking
 */
export function convertFaxToReferral(fax: any): ReferralWithProvenance {
  // Try extractedData first, fall back to direct properties
  const extractedData = fax.extractedData || fax;
  const confidence = fax.extractionConfidence || {};
  
  // Get patient name - try different possible field names
  const patientName = extractedData.patientName || fax.patientName || '';
  const nameParts = patientName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Get phone - try different possible field names
  const phone = extractedData.phone || extractedData.phonePrimary || fax.phone || fax.phonePrimary || '';
  
  // Get DOB - try different possible field names  
  const dob = extractedData.dateOfBirth || extractedData.dob || fax.dateOfBirth || fax.dob;

  return {
    id: fax.id,
    referralNumber: fax.referralNumber || `FAX-${fax.id}`,
    source: 'fax',
    receivedAt: fax.receivedAt || new Date().toISOString(),

    // Patient Info with provenance
    patientInfo: {
      firstName: createProvenanceField(
        firstName,
        'ai_extracted',
        { confidence: confidence.patientName || 0.95, extractedFrom: 'fax_page_1' }
      ),
      lastName: createProvenanceField(
        lastName,
        'ai_extracted',
        { confidence: confidence.patientName || 0.95, extractedFrom: 'fax_page_1' }
      ),
      dateOfBirth: dob ? createProvenanceField(
        dob,
        'ai_extracted',
        { confidence: confidence.dateOfBirth || 0.9, extractedFrom: 'fax_page_1' }
      ) : undefined,
      phone: createProvenanceField(
        phone,
        'ai_extracted',
        { confidence: confidence.phone || 0.9, extractedFrom: 'fax_page_1' }
      ),
      secondaryPhone: extractedData.secondaryPhone ? createProvenanceField(
        extractedData.secondaryPhone,
        'ai_extracted',
        { confidence: confidence.secondaryPhone, extractedFrom: 'fax_page_1' }
      ) : undefined,
      email: extractedData.email ? createProvenanceField(
        extractedData.email,
        'ai_extracted',
        { confidence: confidence.email, extractedFrom: 'fax_page_1' }
      ) : undefined,
      address: extractedData.address ? {
        street: extractedData.address.street ? createProvenanceField(
          extractedData.address.street,
          'ai_extracted',
          { confidence: confidence.address, extractedFrom: 'fax_page_1' }
        ) : undefined,
        city: extractedData.address.city ? createProvenanceField(
          extractedData.address.city,
          'ai_extracted',
          { confidence: confidence.address, extractedFrom: 'fax_page_1' }
        ) : undefined,
        state: extractedData.address.state ? createProvenanceField(
          extractedData.address.state,
          'ai_extracted',
          { confidence: confidence.address, extractedFrom: 'fax_page_1' }
        ) : undefined,
        zipCode: extractedData.address.zipCode ? createProvenanceField(
          extractedData.address.zipCode,
          'ai_extracted',
          { confidence: confidence.address, extractedFrom: 'fax_page_1' }
        ) : undefined,
      } : undefined,
    },

    // Clinical Info with provenance
    clinicalInfo: {
      primaryDiagnosis: createProvenanceField(
        extractedData.diagnosis || extractedData.primaryDiagnosis || fax.diagnosisDescriptions?.[0] || '',
        'ai_extracted',
        { confidence: confidence.diagnosis || 0.85, extractedFrom: 'fax_page_1' }
      ),
      diagnosisDescription: createProvenanceField(
        extractedData.diagnosisDescription || extractedData.summary || fax.summary || '',
        'ai_extracted',
        { confidence: confidence.diagnosisDescription || 0.8, extractedFrom: 'fax_page_1' }
      ),
      icd10Codes: (extractedData.icd10 || extractedData.diagnosisCodes || fax.diagnosisCodes) ? createProvenanceField(
        Array.isArray(extractedData.diagnosisCodes || fax.diagnosisCodes) 
          ? (extractedData.diagnosisCodes || fax.diagnosisCodes)
          : [extractedData.icd10],
        'ai_extracted',
        { confidence: confidence.icd10 || 0.9, extractedFrom: 'fax_page_1' }
      ) : undefined,
      referringProvider: createProvenanceField(
        extractedData.referringProvider || extractedData.providerName || fax.sender || fax.providerName || '',
        'ai_extracted',
        { confidence: confidence.referringProvider || 0.9, extractedFrom: 'fax_page_1' }
      ),
      referringOrganization: createProvenanceField(
        extractedData.referringOrganization || extractedData.providerOrg || fax.providerOrg || fax.sender || '',
        'ai_extracted',
        { confidence: confidence.referringOrganization || 0.85, extractedFrom: 'fax_page_1' }
      ),
      providerPhone: extractedData.providerPhone ? createProvenanceField(
        extractedData.providerPhone,
        'ai_extracted',
        { confidence: confidence.providerPhone || 0.9, extractedFrom: 'fax_page_1' }
      ) : undefined,
      providerFax: extractedData.providerFax ? createProvenanceField(
        extractedData.providerFax,
        'ai_extracted',
        { confidence: confidence.providerFax || 0.9, extractedFrom: 'fax_page_1' }
      ) : undefined,
      orderText: createProvenanceField(
        extractedData.orderText || fax.orderText || '',
        'ai_extracted',
        { confidence: confidence.orderText || 0.85, extractedFrom: 'fax_page_1' }
      ),
      surgeryDate: extractedData.surgeryDate ? createProvenanceField(
        extractedData.surgeryDate,
        'ai_extracted',
        { confidence: confidence.surgeryDate || 0.8, extractedFrom: 'fax_page_1' }
      ) : undefined,
    },

    // Insurance Info with provenance
    insuranceInfo: {
      primaryInsurance: (extractedData.primaryInsurance || fax.primaryInsurance) ? {
        company: createProvenanceField(
          extractedData.primaryInsurance?.company || fax.primaryInsurance?.company || extractedData.insurance || '',
          'ai_extracted',
          { confidence: confidence.insurance || 0.9, extractedFrom: 'fax_page_1' }
        ),
        memberId: createProvenanceField(
          extractedData.primaryInsurance?.memberId || fax.primaryInsurance?.memberId || extractedData.memberId || '',
          'ai_extracted',
          { confidence: confidence.memberId || 0.9, extractedFrom: 'fax_page_1' }
        ),
        groupNumber: createProvenanceField(
          extractedData.primaryInsurance?.groupNumber || fax.primaryInsurance?.groupNumber || extractedData.groupNumber || '',
          'ai_extracted',
          { confidence: confidence.groupNumber || 0.9, extractedFrom: 'fax_page_1' }
        ),
      } : undefined,
      verificationStatus: 'not_verified',
      networkStatus: fax.networkStatus,
    },

    // Other fields (non-provenance)
    workflow: {
      status: 'new',
      statusChangedAt: new Date().toISOString(),
      priority: fax.priority || 'routine',
      contactAttempts: [],
    },
    sourceDocuments: {
      faxId: fax.id,
      faxUrl: fax.url,
      faxPages: fax.pages,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  } as ReferralWithProvenance;
}

/**
 * Convert web lead to referral (usually without prescriptions)
 */
export function convertLeadToReferral(lead: any): Referral {
  return {
    id: lead.id,
    referralNumber: `WEB-${lead.id}`,
    source: 'web',
    receivedAt: lead.createdAt || new Date().toISOString(),

    patientInfo: {
      firstName: lead.patientName?.split(' ')[0] || '',
      lastName: lead.patientName?.split(' ').slice(1).join(' ') || '',
      phone: lead.phone || '',
      email: lead.email,
    },

    clinicalInfo: {
      primaryDiagnosis: lead.condition || '',
      referringProvider: lead.referrer || 'Self-Referral',
      orderText: lead.notes || '',
    },

    insuranceInfo: {
      primaryInsurance: lead.insurance ? {
        company: lead.insurance,
        memberId: '',
      } : undefined,
      verificationStatus: lead.verificationStatus || 'not_verified',
      networkStatus: lead.networkStatus,
    },

    workflow: {
      status: lead.stage === 'unassigned' ? 'new' : 'reviewing',
      statusChangedAt: lead.lastActivity || new Date().toISOString(),
      priority: lead.priority || 'routine',
      assignedTo: lead.assignedTo,
      contactAttempts: [],
    },

    sourceDocuments: {
      webLeadId: lead.id,
      webFormData: lead.webData,
    },

    createdAt: lead.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  };
}

/**
 * Convert opportunity/lead to referral for EMR creation
 */
export function convertOpportunityToReferral(opportunity: any): Referral {
  return {
    id: opportunity.id,
    referralNumber: opportunity.id,
    source: opportunity.source,
    receivedAt: opportunity.createdAt || new Date().toISOString(),

    patientInfo: {
      firstName: opportunity.patientName?.split(' ')[0] || '',
      lastName: opportunity.patientName?.split(' ').slice(1).join(' ') || '',
      phone: opportunity.phone || '',
      email: opportunity.email,
    },

    clinicalInfo: {
      primaryDiagnosis: opportunity.condition || '',
      referringProvider: opportunity.referrer || '',
      orderText: '',
    },

    insuranceInfo: {
      primaryInsurance: opportunity.insurance ? {
        company: opportunity.insurance,
        memberId: '',
      } : undefined,
      verificationStatus: opportunity.verificationStatus || 'not_verified',
      networkStatus: opportunity.networkStatus,
    },

    workflow: {
      status: 'reviewing',
      statusChangedAt: new Date().toISOString(),
      priority: opportunity.priority || 'routine',
      assignedTo: opportunity.assignedTo,
      contactAttempts: [],
    },

    sourceDocuments: {},

    createdAt: opportunity.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  };
}

