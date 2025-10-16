/**
 * ProvenanceInput Component
 * 
 * An input field that displays data provenance (source) and allows verification/editing.
 * Shows visual indicators for AI-extracted, verified, or manually-entered data.
 */

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { CheckCircle, Edit, AlertCircle, Sparkles } from 'lucide-react';
import type { FieldProvenance } from '../types/field-provenance';
import { isAIExtracted, isVerified } from '../types/field-provenance';

export interface ProvenanceInputProps {
  label: string;
  value: string | number;
  provenance: FieldProvenance;
  onChange?: (value: string | number) => void;
  onVerify?: (value: string | number) => void;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export function ProvenanceInput({
  label,
  value,
  provenance,
  onChange,
  onVerify,
  required = false,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  helpText,
}: ProvenanceInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const aiExtracted = isAIExtracted(provenance);
  const verified = isVerified(provenance);

  const handleVerify = () => {
    if (onVerify) {
      onVerify(value);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onChange) {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const getInputClassName = () => {
    const baseClass = 'w-full';
    if (aiExtracted) return `${baseClass} ai-extracted-input`;
    if (verified) return `${baseClass} verified-input`;
    return baseClass;
  };

  const getBadge = () => {
    if (verified) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 border-green-300 bg-green-50 text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Verified by {provenance.verifiedBy}</p>
                {provenance.verifiedAt && (
                  <p className="text-muted-foreground">
                    {new Date(provenance.verifiedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (aiExtracted) {
      const confidencePercent = provenance.confidence 
        ? Math.round(provenance.confidence * 100)
        : null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 border-amber-300 bg-amber-50 text-amber-700">
                <Sparkles className="mr-1 h-3 w-3" />
                AI {confidencePercent && `${confidencePercent}%`}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Extracted by AI</p>
                {provenance.extractedFrom && (
                  <p className="text-muted-foreground">
                    From: {provenance.extractedFrom}
                  </p>
                )}
                {confidencePercent && (
                  <p className="text-muted-foreground">
                    Confidence: {confidencePercent}%
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return null;
  };

  const renderInput = () => {
    const inputProps = {
      value: isEditing ? editValue : value,
      onChange: (e: any) => {
        if (isEditing) {
          setEditValue(e.target.value);
        } else if (onChange) {
          onChange(e.target.value);
        }
      },
      disabled: disabled || (!isEditing && aiExtracted),
      className: getInputClassName(),
      placeholder,
    };

    if (type === 'textarea') {
      return <Textarea {...inputProps} rows={3} />;
    }

    return <Input {...inputProps} type={type} />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
          {getBadge()}
        </Label>
      </div>

      {renderInput()}

      {/* Actions for AI-extracted fields */}
      {aiExtracted && !verified && !isEditing && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleVerify}
            className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Looks Good
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="h-7 text-xs"
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
      )}

      {/* Edit mode actions */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs"
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Help text and source info */}
      {(helpText || provenance.extractedFrom) && (
        <div className="space-y-1">
          {helpText && (
            <p className="text-xs text-muted-foreground">{helpText}</p>
          )}
          {provenance.extractedFrom && !verified && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please verify this was extracted correctly
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ProvenanceLegend Component
 * 
 * Shows a legend explaining the different field indicators
 */
export function ProvenanceLegend() {
  return (
    <div className="rounded-lg border bg-muted/50 p-3 text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
          <span className="text-muted-foreground">AI extracted - please verify</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-muted-foreground">Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-yellow-600" />
          <span className="text-muted-foreground">Required field</span>
        </div>
      </div>
    </div>
  );
}

