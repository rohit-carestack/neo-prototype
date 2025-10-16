/**
 * CreateInEMRModal Component
 * 
 * Main modal that routes to different creation flows based on context.
 * Acts as a state machine for the EMR creation workflow.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { CreatePatientAndEpisodeFlow } from './CreatePatientAndEpisodeFlow';
import { CreatePatientOnlyFlow } from './CreatePatientOnlyFlow';
import { CreateEpisodeOnlyFlow } from './CreateEpisodeOnlyFlow';
import { ChooseCreationModeScreen } from './ChooseCreationModeScreen';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { CreationFlow, EMRCreationResult, ExistingPatient } from './CreateInEMRButton';

export interface CreateInEMRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: EMRCreationResult) => void;
  referral: Referral | ReferralWithProvenance;
  flow: CreationFlow;
  existingPatient?: ExistingPatient;
}

export function CreateInEMRModal({
  isOpen,
  onClose,
  onSuccess,
  referral,
  flow: initialFlow,
  existingPatient,
}: CreateInEMRModalProps) {
  const [currentFlow, setCurrentFlow] = useState<CreationFlow>(initialFlow);

  const renderFlow = () => {
    switch (currentFlow) {
      case 'patient-and-episode':
        return (
          <CreatePatientAndEpisodeFlow
            referral={referral}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        );

      case 'patient-only':
        return (
          <CreatePatientOnlyFlow
            referral={referral}
            onSuccess={(result) => {
              // Patient created, can create episode later
              onSuccess(result);
            }}
            onCancel={onClose}
          />
        );

      case 'episode-only':
        if (!existingPatient) {
          console.error('Episode-only flow requires existingPatient');
          onClose();
          return null;
        }
        return (
          <CreateEpisodeOnlyFlow
            referral={referral}
            existingPatient={existingPatient}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        );

      case 'choose':
        return (
          <ChooseCreationModeScreen
            referral={referral}
            onSelect={(selectedFlow) => setCurrentFlow(selectedFlow)}
            onCancel={onClose}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {renderFlow()}
      </DialogContent>
    </Dialog>
  );
}

