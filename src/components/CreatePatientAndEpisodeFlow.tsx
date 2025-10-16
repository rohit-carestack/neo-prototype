/**
 * CreatePatientAndEpisodeFlow Component
 * 
 * Complete flow for creating both patient and episode in EMR.
 * Multi-step process with AI-extracted field verification.
 */

import { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProvenanceInput, ProvenanceLegend } from './ProvenanceInput';
import { DynamicCustomFields } from './DynamicCustomFields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getCurrentPracticeConfig } from '../config/practice-configs';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { EMRCreationResult } from './CreateInEMRButton';
import { updateField, verifyField, extractValues } from '../types/field-provenance';
import { useToast } from '../hooks/use-toast';

export interface CreatePatientAndEpisodeFlowProps {
  referral: Referral | ReferralWithProvenance;
  onSuccess: (result: EMRCreationResult) => void;
  onCancel: () => void;
}

export function CreatePatientAndEpisodeFlow({
  referral,
  onSuccess,
  onCancel,
}: CreatePatientAndEpisodeFlowProps) {
  const [step, setStep] = useState<'patient' | 'episode' | 'custom' | 'review' | 'creating'>('patient');
  const [patientData, setPatientData] = useState(referral.patientInfo);
  const [episodeData, setEpisodeData] = useState(referral.clinicalInfo);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const practiceConfig = getCurrentPracticeConfig();
  const { toast } = useToast();
  const currentUserId = 'user_123'; // TODO: Get from auth

  const handlePatientFieldChange = (field: string, value: any) => {
    setPatientData(prev => ({
      ...prev,
      [field]: updateField((prev as any)[field], value, currentUserId),
    }));
  };

  const handlePatientFieldVerify = (field: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: verifyField((prev as any)[field], currentUserId),
    }));
  };

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

  const handleSubmit = async () => {
    setStep('creating');
    setIsCreating(true);

    try {
      // TODO: Replace with actual EMR API calls
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: EMRCreationResult = {
        patientMRN: 'MRN-' + Math.random().toString(36).substring(7).toUpperCase(),
        episodeId: 'EP-' + Math.random().toString(36).substring(7).toUpperCase(),
        isNewPatient: true,
      };

      onSuccess(mockResult);
    } catch (error) {
      console.error('Error creating in EMR:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create patient in EMR. Please try again.',
      });
      setStep('review');
      setIsCreating(false);
    }
  };

  if (step === 'creating') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Creating in EMR...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Creating patient record...</p>
            <p className="text-xs text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Patient + Episode in EMR</DialogTitle>
        <DialogDescription>
          Complete all required fields. AI-extracted fields are marked with badges for verification.
        </DialogDescription>
      </DialogHeader>

      <ProvenanceLegend />

      <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patient">Patient Info</TabsTrigger>
          <TabsTrigger value="episode">Episode Info</TabsTrigger>
          <TabsTrigger value="custom" disabled={practiceConfig.customPatientFields.length === 0}>
            Custom Fields {practiceConfig.customPatientFields.length > 0 && `(${practiceConfig.customPatientFields.length})`}
          </TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Patient Info Tab */}
        <TabsContent value="patient" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProvenanceInput
              label="First Name"
              value={(patientData as any).firstName?.value || patientData.firstName}
              provenance={(patientData as any).firstName}
              onChange={(v) => handlePatientFieldChange('firstName', v)}
              onVerify={() => handlePatientFieldVerify('firstName')}
              required
            />

            <ProvenanceInput
              label="Last Name"
              value={(patientData as any).lastName?.value || patientData.lastName}
              provenance={(patientData as any).lastName}
              onChange={(v) => handlePatientFieldChange('lastName', v)}
              onVerify={() => handlePatientFieldVerify('lastName')}
              required
            />

            <ProvenanceInput
              label="Date of Birth"
              value={(patientData as any).dateOfBirth?.value || patientData.dateOfBirth}
              provenance={(patientData as any).dateOfBirth}
              onChange={(v) => handlePatientFieldChange('dateOfBirth', v)}
              onVerify={() => handlePatientFieldVerify('dateOfBirth')}
              type="date"
              required
            />

            <ProvenanceInput
              label="Phone"
              value={(patientData as any).phone?.value || patientData.phone}
              provenance={(patientData as any).phone}
              onChange={(v) => handlePatientFieldChange('phone', v)}
              onVerify={() => handlePatientFieldVerify('phone')}
              type="tel"
              required
            />

            <ProvenanceInput
              label="Email"
              value={(patientData as any).email?.value || patientData.email}
              provenance={(patientData as any).email}
              onChange={(v) => handlePatientFieldChange('email', v)}
              onVerify={() => handlePatientFieldVerify('email')}
              type="email"
            />
          </div>

          <Button onClick={() => setStep('episode')} className="w-full">
            Next: Episode Information
          </Button>
        </TabsContent>

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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('patient')} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={() => practiceConfig.customPatientFields.length > 0 ? setStep('custom') : setStep('review')} 
              className="flex-1"
            >
              {practiceConfig.customPatientFields.length > 0 ? 'Next: Custom Fields' : 'Next: Review'}
            </Button>
          </div>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <DynamicCustomFields
            fields={[...practiceConfig.customPatientFields, ...practiceConfig.customEpisodeFields]}
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
              Review all information before creating in EMR. You can go back to edit any section.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Name:</strong> {(patientData as any).firstName?.value || patientData.firstName} {(patientData as any).lastName?.value || patientData.lastName}</p>
              <p><strong>DOB:</strong> {(patientData as any).dateOfBirth?.value || patientData.dateOfBirth}</p>
              <p><strong>Phone:</strong> {(patientData as any).phone?.value || patientData.phone}</p>
              {((patientData as any).email?.value || patientData.email) && (
                <p><strong>Email:</strong> {(patientData as any).email?.value || patientData.email}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Episode Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Diagnosis:</strong> {(episodeData as any).primaryDiagnosis?.value || episodeData.primaryDiagnosis}</p>
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
                'Create Patient + Episode in EMR'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

