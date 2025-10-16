/**
 * ChooseCreationModeScreen Component
 * 
 * Shown when it's ambiguous whether to create patient only or patient + episode.
 * Typically for web leads without prescriptions.
 */

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Info, FileText, User, Calendar } from 'lucide-react';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { CreationFlow } from './CreateInEMRButton';

export interface ChooseCreationModeScreenProps {
  referral: Referral | ReferralWithProvenance;
  onSelect: (flow: CreationFlow) => void;
  onCancel: () => void;
}

export function ChooseCreationModeScreen({
  referral,
  onSelect,
  onCancel,
}: ChooseCreationModeScreenProps) {
  const hasPrescription = !!(
    referral.clinicalInfo.primaryDiagnosis &&
    referral.clinicalInfo.referringProvider
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>What would you like to create?</DialogTitle>
        <DialogDescription>
          Choose based on whether the patient has a prescription/referral ready.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {referral.source === 'web' && (
              <span>
                Web leads often don't have prescriptions yet. You can create the patient record now
                and add the episode later when the prescription arrives.
              </span>
            )}
            {referral.source !== 'web' && (
              <span>
                Choose whether to create just the patient record or both patient and episode.
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Patient + Episode */}
          <Card 
            className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${
              hasPrescription ? 'border-primary border-2' : ''
            }`}
            onClick={() => onSelect('patient-and-episode')}
          >
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Create Patient + Episode
              </CardTitle>
              {hasPrescription && (
                <div className="text-xs text-primary font-medium">Recommended</div>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm space-y-2">
                <p>Use this when:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Patient has a prescription/referral</li>
                  <li>You have a diagnosis</li>
                  <li>Insurance is verified (or confirmed self-pay)</li>
                  <li>Patient is ready to schedule</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  Creates both patient record and episode for this condition.
                </p>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Patient Only */}
          <Card 
            className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${
              !hasPrescription ? 'border-primary border-2' : ''
            }`}
            onClick={() => onSelect('patient-only')}
          >
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-secondary" />
                Create Patient Only
              </CardTitle>
              {!hasPrescription && (
                <div className="text-xs text-secondary font-medium">Recommended</div>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm space-y-2">
                <p>Use this when:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Patient doesn't have prescription yet</li>
                  <li>Waiting for doctor referral</li>
                  <li>Need to verify insurance first</li>
                  <li>Waiting for auth approval</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  Creates patient record only. Add episode later when prescription arrives.
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Keep as Lead option */}
        <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-all">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Keep as Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              Don't create anything in EMR yet. Keep tracking this as a lead in NEO until more information is available.
            </CardDescription>
            <Button 
              variant="outline" 
              className="mt-3" 
              onClick={onCancel}
            >
              Keep as Lead
            </Button>
          </CardContent>
        </Card>

        {/* Current referral info */}
        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm space-y-1">
              <p className="font-medium">Current Referral:</p>
              <p>Patient: {referral.patientInfo.firstName} {referral.patientInfo.lastName}</p>
              <p>Condition: {referral.clinicalInfo.primaryDiagnosis || '(Not specified)'}</p>
              <p>Referring Provider: {referral.clinicalInfo.referringProvider || '(Not specified)'}</p>
              <p>Source: {referral.source.toUpperCase()}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}

