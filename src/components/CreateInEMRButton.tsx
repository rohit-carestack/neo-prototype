/**
 * CreateInEMRButton Component
 * 
 * Smart button that handles the "Create in EMR" workflow.
 * - Searches for existing patient in EMR
 * - Determines appropriate creation flow (patient only, episode only, or both)
 * - Opens the CreateInEMRModal with the right flow
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateInEMRModal } from './CreateInEMRModal';
import type { Referral, ReferralWithProvenance } from '../types/referral';

export type CreationFlow = 'choose' | 'patient-only' | 'episode-only' | 'patient-and-episode';

export interface ExistingPatient {
  mrn: string;
  name: string;
  dob: string;
  phone?: string;
}

export interface EMRCreationResult {
  patientMRN: string;
  episodeId?: string;
  patientCreated: boolean;
  episodeCreated: boolean;
}

export interface CreateInEMRButtonProps {
  referral: Referral | ReferralWithProvenance;
  onSuccess: (result: EMRCreationResult) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Helper to safely extract a value from a field that might have provenance
 */
function getFieldValue<T>(field: T | { value: T }): T {
  if (field && typeof field === 'object' && 'value' in field) {
    return (field as { value: T }).value;
  }
  return field as T;
}

/**
 * Mock function to search for patient in EMR
 * In production, this would call your actual EMR API
 */
async function searchPatientInEMR(
  firstName: string,
  lastName: string,
  dob: string
): Promise<ExistingPatient | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock: Return null (patient not found)
  // In production, this would query your EMR system
  return null;
}

export function CreateInEMRButton({
  referral,
  onSuccess,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'default',
}: CreateInEMRButtonProps) {
  
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [flow, setFlow] = useState<CreationFlow>('choose');
  const [existingPatient, setExistingPatient] = useState<ExistingPatient | null>(null);
  const { toast } = useToast();

  const handleClick = async () => {
    console.log('CreateInEMRButton clicked, referral:', referral);
    setIsSearching(true);

    try {
      // Extract patient info from referral
      const firstName = getFieldValue(referral.patientInfo.firstName);
      const lastName = getFieldValue(referral.patientInfo.lastName);
      const dob = getFieldValue(referral.patientInfo.dateOfBirth);

      console.log('Searching for patient:', { firstName, lastName, dob });

      if (!firstName || !lastName || !dob) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Patient name and date of birth are required to create in EMR.',
        });
        setIsSearching(false);
        return;
      }

      // Search for existing patient in EMR
      const foundPatient = await searchPatientInEMR(firstName, lastName, dob);
      
      console.log('EMR search result:', foundPatient);

      if (foundPatient) {
        // Patient exists → Create episode only
        console.log('Patient found in EMR, opening episode-only flow');
        setExistingPatient(foundPatient);
        setFlow('episode-only');
        setShowModal(true);
      } else {
        // Patient doesn't exist → Check if we have prescription
        const diagnosis = getFieldValue(referral.clinicalInfo?.primaryDiagnosis);
        const provider = getFieldValue(referral.clinicalInfo?.referringProvider);
        const order = getFieldValue(referral.clinicalInfo?.orderText);
        
        const hasPrescription = !!(diagnosis && provider && order);
        console.log('Patient not found. Has prescription:', hasPrescription, { diagnosis, provider, order });

        if (hasPrescription) {
          // Has prescription → Create both
          console.log('Opening patient-and-episode flow');
          setFlow('patient-and-episode');
          setShowModal(true);
        } else if (referral.source === 'web') {
          // Web lead without prescription → Ask user
          console.log('Web lead without prescription, opening choose flow');
          setFlow('choose');
          setShowModal(true);
        } else {
          // Default: Create both (but let user edit)
          console.log('Default: opening patient-and-episode flow');
          setFlow('patient-and-episode');
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to search for patient in EMR. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuccess = (result: EMRCreationResult) => {
    console.log('EMR creation successful:', result);
    setShowModal(false);
    setExistingPatient(null);
    onSuccess(result);
  };

  const handleClose = () => {
    console.log('CreateInEMRModal closed');
    setShowModal(false);
    setExistingPatient(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isSearching}
        className={className}
        variant={variant}
        size={size}
      >
        <Building2 className="h-4 w-4 mr-2" />
        {isSearching ? 'Searching...' : 'Create in EMR'}
      </Button>

      <CreateInEMRModal
        isOpen={showModal}
        onClose={handleClose}
        referral={referral}
        flow={flow}
        existingPatient={existingPatient}
        onSuccess={handleSuccess}
      />
    </>
  );
}

