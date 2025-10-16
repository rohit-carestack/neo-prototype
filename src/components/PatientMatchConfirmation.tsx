/**
 * PatientMatchConfirmation Component
 * 
 * Shows side-by-side comparison when an existing patient is found
 * but contact info differs from the referral.
 * Allows user to selectively update fields.
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertCircle, Phone, Sparkles } from 'lucide-react';
import type { ExistingPatient } from './CreateInEMRButton';
import type { Referral, ReferralWithProvenance } from '../types/referral';
import type { FieldProvenance } from '../types/field-provenance';
import { isAIExtracted } from '../types/field-provenance';

export interface PatientDifference {
  field: string;
  label: string;
  emrValue: string | undefined;
  referralValue: string | undefined;
  isAIExtracted?: boolean;
  confidence?: number;
}

export interface PatientMatchConfirmationProps {
  emrPatient: ExistingPatient;
  referral: Referral | ReferralWithProvenance;
  onConfirm: (updateFields: string[], useEMRData: boolean) => void;
  onReject: () => void;
  onCallToVerify?: () => void;
}

/**
 * Compare patients and find differences
 */
function findDifferences(
  emrPatient: ExistingPatient,
  referral: Referral | ReferralWithProvenance
): PatientDifference[] {
  const differences: PatientDifference[] = [];

  // Check phone
  if (emrPatient.phone !== referral.patientInfo.phone) {
    differences.push({
      field: 'phone',
      label: 'Phone',
      emrValue: emrPatient.phone,
      referralValue: referral.patientInfo.phone,
      isAIExtracted: 'source' in (referral.patientInfo as any).phone 
        ? isAIExtracted((referral.patientInfo as any).phone as FieldProvenance<string>)
        : false,
    });
  }

  // Check email
  if (emrPatient.email !== referral.patientInfo.email) {
    differences.push({
      field: 'email',
      label: 'Email',
      emrValue: emrPatient.email,
      referralValue: referral.patientInfo.email,
      isAIExtracted: 'source' in (referral.patientInfo as any).email
        ? isAIExtracted((referral.patientInfo as any).email as FieldProvenance<string>)
        : false,
    });
  }

  // Check address
  const emrAddress = [
    emrPatient.address?.street,
    emrPatient.address?.city,
    emrPatient.address?.state,
    emrPatient.address?.zipCode,
  ].filter(Boolean).join(', ');

  const referralAddress = [
    referral.patientInfo.address?.street,
    referral.patientInfo.address?.city,
    referral.patientInfo.address?.state,
    referral.patientInfo.address?.zipCode,
  ].filter(Boolean).join(', ');

  if (emrAddress !== referralAddress && (emrAddress || referralAddress)) {
    differences.push({
      field: 'address',
      label: 'Address',
      emrValue: emrAddress,
      referralValue: referralAddress,
    });
  }

  return differences;
}

export function PatientMatchConfirmation({
  emrPatient,
  referral,
  onConfirm,
  onReject,
  onCallToVerify,
}: PatientMatchConfirmationProps) {
  const differences = findDifferences(emrPatient, referral);
  const [selectedUpdates, setSelectedUpdates] = useState<Set<string>>(
    // By default, select updateable fields that are AI-extracted
    new Set(differences.filter(d => d.isAIExtracted).map(d => d.field))
  );

  const handleToggleField = (field: string) => {
    setSelectedUpdates(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const handleUpdateAndContinue = () => {
    onConfirm(Array.from(selectedUpdates), false);
  };

  const handleKeepEMRData = () => {
    onConfirm([], true);
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Patient Found with Different Contact Info</AlertTitle>
        <AlertDescription className="text-amber-800">
          We found a matching patient in the EMR, but some contact information differs from this referral.
          Please review and decide what to do.
        </AlertDescription>
      </Alert>

      {/* Existing Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existing Patient in EMR</CardTitle>
          <CardDescription>
            MRN: {emrPatient.mrn} • Last Visit: {emrPatient.lastVisit || 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {emrPatient.firstName} {emrPatient.lastName}</p>
            <p><strong>DOB:</strong> {new Date(emrPatient.dateOfBirth).toLocaleDateString()}</p>
            {emrPatient.previousEpisodes && emrPatient.previousEpisodes.length > 0 && (
              <div>
                <p className="font-medium mb-1">Previous Episodes:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {emrPatient.previousEpisodes.map((ep) => (
                    <li key={ep.id} className="text-xs">
                      {ep.diagnosis} ({ep.status}) - {new Date(ep.startDate).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Differences Table */}
      {differences.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Contact Information Differences</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>EMR Record</TableHead>
                <TableHead>New Referral</TableHead>
                <TableHead className="text-center">Update?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {differences.map((diff) => (
                <TableRow key={diff.field}>
                  <TableCell className="font-medium">{diff.label}</TableCell>
                  <TableCell className="text-sm">
                    {diff.emrValue || <span className="text-muted-foreground">(none)</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className={diff.isAIExtracted ? 'text-amber-600' : ''}>
                        {diff.referralValue || <span className="text-muted-foreground">(none)</span>}
                      </span>
                      {diff.isAIExtracted && (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-xs">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedUpdates.has(diff.field)}
                      onCheckedChange={() => handleToggleField(diff.field)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Explanation */}
      <Alert>
        <AlertDescription className="text-sm">
          <p className="font-medium mb-2">Is this the same patient?</p>
          <p className="text-muted-foreground">
            People change phone numbers, move to new addresses, and update email addresses.
            If this is the same patient with updated information, select which fields to update and continue.
          </p>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleUpdateAndContinue} className="flex-1" disabled={selectedUpdates.size === 0 && differences.length > 0}>
          Update Selected & Continue
          {selectedUpdates.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedUpdates.size} field{selectedUpdates.size !== 1 ? 's' : ''}
            </Badge>
          )}
        </Button>

        <Button onClick={handleKeepEMRData} variant="outline" className="flex-1">
          Keep EMR Data
        </Button>

        <Button onClick={onReject} variant="outline" className="flex-1">
          Different Patient
          <span className="text-xs ml-2">(Create New)</span>
        </Button>

        {onCallToVerify && (
          <Button onClick={onCallToVerify} variant="ghost" className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Call Patient to Verify
          </Button>
        )}
      </div>
    </div>
  );
}

