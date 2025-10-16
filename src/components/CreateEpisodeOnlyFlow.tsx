/**
 * CreateEpisodeOnlyFlow Component
 * 
 * Flow for creating just an episode for an existing patient.
 * Shows patient match confirmation if contact info differs.
 */

import { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProvenanceInput, ProvenanceLegend } from './ProvenanceInput';
import { DynamicCustomFields } from './DynamicCustomFields';
import { PatientMatchConfirmation } from './PatientMatchConfirmation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, User } from 'lucide-react';
import { getCurrentPracticeConfig } from '../config/practice-configs';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { EMRCreationResult, ExistingPatient } from './CreateInEMRButton';
import { updateField, verifyField } from '../types/field-provenance';
import { useToast } from '../hooks/use-toast';

export interface CreateEpisodeOnlyFlowProps {
  referral: Referral | ReferralWithProvenance;
  existingPatient: ExistingPatient;
  onSuccess: (result: EMRCreationResult) => void;
  onCancel: () => void;
}

export function CreateEpisodeOnlyFlow({
  referral,
  existingPatient,
  onSuccess,
  onCancel,
}: CreateEpisodeOnlyFlowProps) {
  const [step, setStep] = useState<'confirm' | 'episode' | 'custom' | 'review' | 'creating'>('confirm');
  const [episodeData, setEpisodeData] = useState(referral.clinicalInfo);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [shouldUpdatePatient, setShouldUpdatePatient] = useState(false);
  const [updateFields, setUpdateFields] = useState<string[]>([]);
  const practiceConfig = getCurrentPracticeConfig();
  const { toast } = useToast();
  const currentUserId = 'user_123';

  const handleEpisodeFieldChange = (field: string, value: any) => {
    setEpisodeData(prev => ({
      ...prev,
      [field]: updateField((prev as any)[field], value, currentUserId),
    }));
  };

  const handleEpisodeFieldVerify = (field: string) => {
    setEpisodeData(prev => ({
      ...prev,
      [field]: verifyField((prev as any)[field], currentUserId),
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handlePatientConfirmed = (selectedUpdateFields: string[], useEMRData: boolean) => {
    setShouldUpdatePatient(!useEMRData && selectedUpdateFields.length > 0);
    setUpdateFields(selectedUpdateFields);
    setStep('episode');
  };

  const handlePatientRejected = () => {
    // User says this is a different patient
    // In a real implementation, this would go back to create new patient flow
    toast({
      title: 'Different Patient',
      description: 'Please use "Create Patient" flow instead.',
    });
    onCancel();
  };

  const handleSubmit = async () => {
    setStep('creating');
    setIsCreating(true);

    try {
      // Step 1: Update patient if needed
      if (shouldUpdatePatient && updateFields.length > 0) {
        // TODO: Update patient in EMR
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 2: Create episode
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult: EMRCreationResult = {
        patientMRN: existingPatient.mrn,
        episodeId: 'EP-' + Math.random().toString(36).substring(7).toUpperCase(),
        isNewPatient: false,
      };

      onSuccess(mockResult);
    } catch (error) {
      console.error('Error creating episode:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create episode in EMR. Please try again.',
      });
      setStep('review');
      setIsCreating(false);
    }
  };

  if (step === 'creating') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Creating Episode in EMR...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            {shouldUpdatePatient && <p className="text-sm font-medium">Updating patient information...</p>}
            <p className="text-sm font-medium">Creating episode...</p>
            <p className="text-xs text-muted-foreground">
              For patient: {existingPatient.firstName} {existingPatient.lastName} (MRN: {existingPatient.mrn})
            </p>
          </div>
        </div>
      </>
    );
  }

  // Confirm patient match
  if (step === 'confirm') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Confirm Patient Match</DialogTitle>
          <DialogDescription>
            We found an existing patient in the EMR. Please confirm this is the correct patient.
          </DialogDescription>
        </DialogHeader>

        <PatientMatchConfirmation
          emrPatient={existingPatient}
          referral={referral}
          onConfirm={handlePatientConfirmed}
          onReject={handlePatientRejected}
        />
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Episode for Existing Patient</DialogTitle>
        <DialogDescription>
          Creating a new episode for {existingPatient.firstName} {existingPatient.lastName} (MRN: {existingPatient.mrn})
        </DialogDescription>
      </DialogHeader>

      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Existing Patient
            <Badge variant="outline" className="ml-2">MRN: {existingPatient.mrn}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p><strong>Name:</strong> {existingPatient.firstName} {existingPatient.lastName}</p>
          <p><strong>DOB:</strong> {new Date(existingPatient.dateOfBirth).toLocaleDateString()}</p>
          {existingPatient.phone && <p><strong>Phone:</strong> {existingPatient.phone}</p>}
          {existingPatient.lastVisit && <p><strong>Last Visit:</strong> {existingPatient.lastVisit}</p>}
        </CardContent>
      </Card>

      <ProvenanceLegend />

      <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="episode">Episode Info</TabsTrigger>
          <TabsTrigger value="custom" disabled={practiceConfig.customEpisodeFields.length === 0}>
            Custom Fields {practiceConfig.customEpisodeFields.length > 0 && `(${practiceConfig.customEpisodeFields.length})`}
          </TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Episode Info Tab */}
        <TabsContent value="episode" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <ProvenanceInput
              label="Primary Diagnosis"
              value={(episodeData as any).primaryDiagnosis?.value || episodeData.primaryDiagnosis}
              provenance={(episodeData as any).primaryDiagnosis}
              onChange={(v) => handleEpisodeFieldChange('primaryDiagnosis', v)}
              onVerify={() => handleEpisodeFieldVerify('primaryDiagnosis')}
              required
            />

            <ProvenanceInput
              label="Diagnosis Description"
              value={(episodeData as any).diagnosisDescription?.value || episodeData.diagnosisDescription}
              provenance={(episodeData as any).diagnosisDescription}
              onChange={(v) => handleEpisodeFieldChange('diagnosisDescription', v)}
              onVerify={() => handleEpisodeFieldVerify('diagnosisDescription')}
              type="textarea"
            />

            <ProvenanceInput
              label="Referring Provider"
              value={(episodeData as any).referringProvider?.value || episodeData.referringProvider}
              provenance={(episodeData as any).referringProvider}
              onChange={(v) => handleEpisodeFieldChange('referringProvider', v)}
              onVerify={() => handleEpisodeFieldVerify('referringProvider')}
              required
            />

            <ProvenanceInput
              label="Referring Organization"
              value={(episodeData as any).referringOrganization?.value || episodeData.referringOrganization}
              provenance={(episodeData as any).referringOrganization}
              onChange={(v) => handleEpisodeFieldChange('referringOrganization', v)}
              onVerify={() => handleEpisodeFieldVerify('referringOrganization')}
            />

            <ProvenanceInput
              label="Prescription/Order Text"
              value={(episodeData as any).orderText?.value || episodeData.orderText}
              provenance={(episodeData as any).orderText}
              onChange={(v) => handleEpisodeFieldChange('orderText', v)}
              onVerify={() => handleEpisodeFieldVerify('orderText')}
              type="textarea"
              required
            />
          </div>

          <Button 
            onClick={() => practiceConfig.customEpisodeFields.length > 0 ? setStep('custom') : setStep('review')} 
            className="w-full"
          >
            {practiceConfig.customEpisodeFields.length > 0 ? 'Next: Custom Fields' : 'Next: Review'}
          </Button>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <DynamicCustomFields
            fields={practiceConfig.customEpisodeFields}
            values={customFieldValues}
            onChange={handleCustomFieldChange}
            referralData={referral}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('episode')} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep('review')} className="flex-1">
              Next: Review
            </Button>
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4 mt-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Review episode information before creating in EMR.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Episode Information</CardTitle>
              <CardDescription>
                For patient: {existingPatient.firstName} {existingPatient.lastName} (MRN: {existingPatient.mrn})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Diagnosis:</strong> {(episodeData as any).primaryDiagnosis?.value || episodeData.primaryDiagnosis}</p>
              {((episodeData as any).diagnosisDescription?.value || episodeData.diagnosisDescription) && (
                <p><strong>Description:</strong> {(episodeData as any).diagnosisDescription?.value || episodeData.diagnosisDescription}</p>
              )}
              <p><strong>Referring Provider:</strong> {(episodeData as any).referringProvider?.value || episodeData.referringProvider}</p>
              {((episodeData as any).referringOrganization?.value || episodeData.referringOrganization) && (
                <p><strong>Organization:</strong> {(episodeData as any).referringOrganization?.value || episodeData.referringOrganization}</p>
              )}
            </CardContent>
          </Card>

          {Object.keys(customFieldValues).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.entries(customFieldValues).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {shouldUpdatePatient && updateFields.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                <strong>Note:</strong> The following patient fields will also be updated: {updateFields.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Episode in EMR'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

