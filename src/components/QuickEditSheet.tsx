/**
 * QuickEditSheet Component
 * 
 * A side drawer for quickly editing opportunity card details.
 * Shows AI-extracted fields with badges and allows verification/editing.
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ProvenanceInput } from './ProvenanceInput';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Sparkles } from 'lucide-react';
import type { FieldProvenance } from '../types/field-provenance';
import { updateField, verifyField, isAIExtracted } from '../types/field-provenance';

export interface QuickEditData {
  patientName: FieldProvenance<string>;
  condition: FieldProvenance<string>;
  referrer?: FieldProvenance<string>;
  phone?: FieldProvenance<string>;
  email?: FieldProvenance<string>;
  insurance?: FieldProvenance<string>;
  insuranceStatus: "not_verified" | "verified" | "in_network" | "out_of_network";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  stage: string;
}

export interface QuickEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuickEditData) => void;
  data: QuickEditData;
  opportunityId: string;
}

export function QuickEditSheet({
  isOpen,
  onClose,
  onSave,
  data,
  opportunityId,
}: QuickEditSheetProps) {
  const [editData, setEditData] = useState<QuickEditData>(data);
  const [hasChanges, setHasChanges] = useState(false);
  const currentUserId = 'user_123'; // TODO: Get from auth context

  // Check if any fields are AI-extracted and unverified
  const hasUnverifiedAIFields = Object.entries(editData).some(([key, value]) => {
    if (value && typeof value === 'object' && 'source' in value) {
      return isAIExtracted(value as FieldProvenance<any>);
    }
    return false;
  });

  const handleFieldChange = (fieldName: keyof QuickEditData, newValue: any) => {
    setEditData(prev => ({
      ...prev,
      [fieldName]: updateField(prev[fieldName] as FieldProvenance<any>, newValue, currentUserId),
    }));
    setHasChanges(true);
  };

  const handleFieldVerify = (fieldName: keyof QuickEditData) => {
    setEditData(prev => ({
      ...prev,
      [fieldName]: verifyField(prev[fieldName] as FieldProvenance<any>, currentUserId),
    }));
    setHasChanges(true);
  };

  const handleSelectChange = (fieldName: keyof QuickEditData, value: any) => {
    setEditData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editData);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditData(data); // Reset to original
    setHasChanges(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Opportunity</SheetTitle>
          <SheetDescription>
            Update any AI-extracted or incorrect information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* AI Fields Alert */}
          {hasUnverifiedAIFields && (
            <Alert className="border-amber-200 bg-amber-50">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Some fields were AI-extracted. Please verify they're correct.
              </AlertDescription>
            </Alert>
          )}

          {/* Patient Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Patient Information</h4>

            <ProvenanceInput
              label="Patient Name"
              value={editData.patientName.value}
              provenance={editData.patientName}
              onChange={(v) => handleFieldChange('patientName', v)}
              onVerify={() => handleFieldVerify('patientName')}
              required
            />

            <ProvenanceInput
              label="Condition/Diagnosis"
              value={editData.condition.value}
              provenance={editData.condition}
              onChange={(v) => handleFieldChange('condition', v)}
              onVerify={() => handleFieldVerify('condition')}
              required
              type="textarea"
            />

            {editData.phone && (
              <ProvenanceInput
                label="Phone"
                value={editData.phone.value}
                provenance={editData.phone}
                onChange={(v) => handleFieldChange('phone', v)}
                onVerify={() => handleFieldVerify('phone')}
                type="tel"
              />
            )}

            {editData.email && (
              <ProvenanceInput
                label="Email"
                value={editData.email.value}
                provenance={editData.email}
                onChange={(v) => handleFieldChange('email', v)}
                onVerify={() => handleFieldVerify('email')}
                type="email"
              />
            )}
          </div>

          <Separator />

          {/* Clinical Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Clinical Information</h4>

            {editData.referrer && (
              <ProvenanceInput
                label="Referring Provider"
                value={editData.referrer.value}
                provenance={editData.referrer}
                onChange={(v) => handleFieldChange('referrer', v)}
                onVerify={() => handleFieldVerify('referrer')}
              />
            )}

            {editData.insurance && (
              <ProvenanceInput
                label="Insurance"
                value={editData.insurance.value}
                provenance={editData.insurance}
                onChange={(v) => handleFieldChange('insurance', v)}
                onVerify={() => handleFieldVerify('insurance')}
              />
            )}

            <div className="space-y-2">
              <Label>Insurance Status</Label>
              <Select
                value={editData.insuranceStatus}
                onValueChange={(v) => handleSelectChange('insuranceStatus', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_verified">Not Verified</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="in_network">In Network</SelectItem>
                  <SelectItem value="out_of_network">Out of Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Workflow Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Workflow</h4>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={editData.priority}
                onValueChange={(v) => handleSelectChange('priority', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={editData.assignedTo || 'unassigned'}
                onValueChange={(v) => handleSelectChange('assignedTo', v === 'unassigned' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                  <SelectItem value="Lisa Johnson">Lisa Johnson</SelectItem>
                  <SelectItem value="David Kim">David Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={editData.stage}
                onValueChange={(v) => handleSelectChange('stage', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="ready_to_schedule">Ready to Schedule</SelectItem>
                  <SelectItem value="scheduled_eval">Scheduled Eval</SelectItem>
                  <SelectItem value="verified_benefits">Verified Benefits</SelectItem>
                  <SelectItem value="financial_conversation">Financial Conversation</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

