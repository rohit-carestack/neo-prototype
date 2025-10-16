/**
 * CreatePatientOnlyFlow Component
 * 
 * Flow for creating just the patient record (no episode).
 * Used for web leads without prescriptions.
 */

import { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProvenanceInput, ProvenanceLegend } from './ProvenanceInput';
import { DynamicCustomFields } from './DynamicCustomFields';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, Info } from 'lucide-react';
import { getCurrentPracticeConfig } from '../config/practice-configs';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { EMRCreationResult } from './CreateInEMRButton';
import { updateField, verifyField } from '../types/field-provenance';
import { useToast } from '../hooks/use-toast';

export interface CreatePatientOnlyFlowProps {
  referral: Referral | ReferralWithProvenance;
  onSuccess: (result: EMRCreationResult) => void;
  onCancel: () => void;
}

export function CreatePatientOnlyFlow({
  referral,
  onSuccess,
  onCancel,
}: CreatePatientOnlyFlowProps) {
  const [step, setStep] = useState<'patient' | 'custom' | 'review' | 'creating'>('patient');
  const [patientData, setPatientData] = useState(referral.patientInfo);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const practiceConfig = getCurrentPracticeConfig();
  const { toast } = useToast();
  const currentUserId = 'user_123';

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
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult: EMRCreationResult = {
        patientMRN: 'MRN-' + Math.random().toString(36).substring(7).toUpperCase(),
        isNewPatient: true,
      };

      onSuccess(mockResult);
    } catch (error) {
      console.error('Error creating patient:', error);
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
          <DialogTitle>Creating Patient in EMR...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Creating patient record...</p>
            <p className="text-xs text-muted-foreground">Episode will be added later when prescription arrives</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Patient Only</DialogTitle>
        <DialogDescription>
          Create the patient record now. Episode can be added later when prescription is received.
        </DialogDescription>
      </DialogHeader>

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This will create just the patient record in the EMR. You can create the episode later 
          when the patient provides a prescription or sees their doctor.
        </AlertDescription>
      </Alert>

      <ProvenanceLegend />

      <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient">Patient Info</TabsTrigger>
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

          <Button 
            onClick={() => practiceConfig.customPatientFields.length > 0 ? setStep('custom') : setStep('review')} 
            className="w-full"
          >
            {practiceConfig.customPatientFields.length > 0 ? 'Next: Custom Fields' : 'Next: Review'}
          </Button>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <DynamicCustomFields
            fields={practiceConfig.customPatientFields}
            values={customFieldValues}
            onChange={handleCustomFieldChange}
            referralData={referral}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('patient')} className="flex-1">
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
              Review patient information before creating in EMR.
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

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Next Steps:</strong> After creating the patient record, you can add an episode 
              later when the prescription arrives or insurance is verified.
            </AlertDescription>
          </Alert>

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
                'Create Patient in EMR'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

