/**
 * DynamicCustomFields Component
 * 
 * Renders practice-specific custom fields based on configuration.
 * Supports conditional display, auto-population, and various field types.
 */

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { CustomFieldDefinition } from '../types/practice-config';

export interface DynamicCustomFieldsProps {
  fields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  referralData?: any; // For auto-population
}

/**
 * Evaluates conditional display rules
 */
function shouldShowField(
  field: CustomFieldDefinition,
  values: Record<string, any>
): boolean {
  if (!field.showWhen) return true;

  const dependentValue = values[field.showWhen.field];

  if (field.showWhen.equals !== undefined) {
    return dependentValue === field.showWhen.equals;
  }

  if (field.showWhen.notEquals !== undefined) {
    return dependentValue !== field.showWhen.notEquals;
  }

  if (field.showWhen.contains !== undefined) {
    if (Array.isArray(dependentValue)) {
      return dependentValue.includes(field.showWhen.contains);
    }
    if (typeof dependentValue === 'string') {
      return dependentValue.includes(field.showWhen.contains);
    }
  }

  return true;
}

/**
 * Auto-populate field value from referral data
 */
function getAutoPopulatedValue(
  field: CustomFieldDefinition,
  referralData: any
): any {
  if (!field.autoPopulateFrom || !referralData) return field.defaultValue;

  // Get value from referral using path
  const path = field.autoPopulateFrom;
  const value = path.split('.').reduce((obj, key) => obj?.[key], referralData);

  // Apply transform if defined
  if (value && field.autoPopulateTransform) {
    return field.autoPopulateTransform[value] || value;
  }

  return value || field.defaultValue;
}

/**
 * Single dynamic field renderer
 */
function DynamicField({
  definition,
  value,
  onChange,
}: {
  definition: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
}) {
  const fieldId = `field-${definition.fieldName}`;

  switch (definition.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            {definition.label}
            {definition.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type={definition.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={definition.placeholder}
            required={definition.required}
          />
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            {definition.label}
            {definition.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={definition.placeholder}
            required={definition.required}
            rows={3}
          />
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            {definition.label}
            {definition.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger id={fieldId}>
              <SelectValue placeholder={definition.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {!definition.required && (
                <SelectItem value="">None</SelectItem>
              )}
              {definition.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={fieldId}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={fieldId} className="cursor-pointer">
            {definition.label}
          </Label>
          {definition.helpText && (
            <p className="text-xs text-muted-foreground ml-2">({definition.helpText})</p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            {definition.label}
            {definition.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={definition.required}
          />
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );

    case 'multiselect':
      // Simple implementation - could be enhanced with a proper multi-select component
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            {definition.label}
            {definition.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-2 border rounded p-3">
            {definition.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldId}-${option}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = value || [];
                    if (checked) {
                      onChange([...current, option]);
                    } else {
                      onChange(current.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${fieldId}-${option}`} className="cursor-pointer text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {definition.helpText && (
            <p className="text-xs text-muted-foreground">{definition.helpText}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

/**
 * Main component
 */
export function DynamicCustomFields({
  fields,
  values,
  onChange,
  referralData,
}: DynamicCustomFieldsProps) {
  // Initialize with auto-populated values
  useEffect(() => {
    if (referralData) {
      fields.forEach((field) => {
        if (field.autoPopulateFrom && !values[field.fieldName]) {
          const autoValue = getAutoPopulatedValue(field, referralData);
          if (autoValue !== undefined) {
            onChange(field.fieldName, autoValue);
          }
        }
      });
    }
  }, [referralData]); // Only run on mount or when referral data changes

  // Group fields by group
  const fieldsByGroup = fields.reduce((acc, field) => {
    const group = field.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {} as Record<string, CustomFieldDefinition[]>);

  // Sort fields within each group by order
  Object.keys(fieldsByGroup).forEach((group) => {
    fieldsByGroup[group].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {Object.entries(fieldsByGroup).map(([group, groupFields]) => (
        <div key={group} className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
            {group}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupFields
              .filter((field) => shouldShowField(field, values))
              .map((field) => (
                <DynamicField
                  key={field.fieldName}
                  definition={field}
                  value={values[field.fieldName]}
                  onChange={(value) => onChange(field.fieldName, value)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

