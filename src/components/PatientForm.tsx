import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Mail, MapPin, Shield, FileText, AlertCircle } from "lucide-react";
import { CreatePatientDTO } from "@/types/patient";

interface PatientFormProps {
  initialData?: Partial<CreatePatientDTO>;
  onSubmit: (data: CreatePatientDTO) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  showEMRFields?: boolean;
}

export function PatientForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showEMRFields = true 
}: PatientFormProps) {
  const [formData, setFormData] = useState<Partial<CreatePatientDTO>>({
    // Demographics
    firstName: initialData?.firstName || "",
    middleName: initialData?.middleName || "",
    lastName: initialData?.lastName || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    gender: initialData?.gender || undefined,
    ssn: initialData?.ssn || "",
    
    // Contact
    primaryPhone: initialData?.primaryPhone || "",
    secondaryPhone: initialData?.secondaryPhone || "",
    email: initialData?.email || "",
    preferredContactMethod: initialData?.preferredContactMethod || "phone",
    preferredLanguage: initialData?.preferredLanguage || "English",
    
    // Address
    address: initialData?.address || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    
    // Emergency Contact
    emergencyContact: initialData?.emergencyContact || {
      name: "",
      relationship: "",
      phone: "",
    },
    
    // Insurance
    primaryInsurance: initialData?.primaryInsurance || {
      company: "",
      memberId: "",
      groupNumber: "",
      subscriberName: "",
      subscriberRelationship: "self",
    },
    secondaryInsurance: initialData?.secondaryInsurance,
    
    // Consent
    hipaaConsentSigned: initialData?.hipaaConsentSigned || false,
    treatmentConsentSigned: initialData?.treatmentConsentSigned || false,
    communicationConsent: initialData?.communicationConsent || {
      phone: true,
      email: true,
      text: true,
    },
    
    // Metadata
    referralSource: initialData?.referralSource,
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CreatePatientDTO] as any),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      // Validate DOB is in the past
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        newErrors.dateOfBirth = "Date of birth must be in the past";
      }
    }
    if (!formData.primaryPhone?.trim()) {
      newErrors.primaryPhone = "Primary phone is required";
    } else {
      // Basic phone validation (US format)
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.primaryPhone.replace(/\s/g, ''))) {
        newErrors.primaryPhone = "Invalid phone number format";
      }
    }
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Insurance validation (optional but if provided, must be complete)
    if (formData.primaryInsurance?.company && !formData.primaryInsurance?.memberId) {
      newErrors.primaryInsuranceMemberId = "Member ID is required when insurance company is provided";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      await onSubmit(formData as CreatePatientDTO);
    } catch (error) {
      console.error("Error submitting patient form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics">
            <User className="h-4 w-4 mr-2" />
            Demographics
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="insurance">
            <Shield className="h-4 w-4 mr-2" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="consent">
            <FileText className="h-4 w-4 mr-2" />
            Consent
          </TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2" data-error={!!errors.firstName}>
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => updateField("middleName", e.target.value)}
                  />
                </div>

                <div className="space-y-2" data-error={!!errors.lastName}>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2" data-error={!!errors.dateOfBirth}>
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-destructive" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="space-y-2" data-error={!!errors.gender}>
                  <Label htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => updateField("gender", value)}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ssn">Social Security Number (Optional)</Label>
                  <Input
                    id="ssn"
                    type="password"
                    value={formData.ssn}
                    onChange={(e) => updateField("ssn", e.target.value)}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Input
                    id="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={(e) => updateField("preferredLanguage", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2" data-error={!!errors.primaryPhone}>
                  <Label htmlFor="primaryPhone">
                    Primary Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="primaryPhone"
                    type="tel"
                    value={formData.primaryPhone}
                    onChange={(e) => updateField("primaryPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className={errors.primaryPhone ? "border-destructive" : ""}
                  />
                  {errors.primaryPhone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.primaryPhone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input
                    id="secondaryPhone"
                    type="tel"
                    value={formData.secondaryPhone}
                    onChange={(e) => updateField("secondaryPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2" data-error={!!errors.email}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="patient@example.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select 
                    value={formData.preferredContactMethod} 
                    onValueChange={(value) => updateField("preferredContactMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address?.street}
                    onChange={(e) => updateNestedField("address", "street", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address?.city}
                      onChange={(e) => updateNestedField("address", "city", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address?.state}
                      onChange={(e) => updateNestedField("address", "state", e.target.value)}
                      placeholder="CT"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.address?.zipCode}
                      onChange={(e) => updateNestedField("address", "zipCode", e.target.value)}
                      placeholder="06901"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Contact
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContact?.name}
                      onChange={(e) => updateNestedField("emergencyContact", "name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={formData.emergencyContact?.relationship}
                      onChange={(e) => updateNestedField("emergencyContact", "relationship", e.target.value)}
                      placeholder="Spouse, Parent, Sibling"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContact?.phone}
                    onChange={(e) => updateNestedField("emergencyContact", "phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Primary Insurance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryInsuranceCompany">Insurance Company</Label>
                  <Input
                    id="primaryInsuranceCompany"
                    value={formData.primaryInsurance?.company}
                    onChange={(e) => updateNestedField("primaryInsurance", "company", e.target.value)}
                    placeholder="Blue Cross Blue Shield"
                  />
                </div>

                <div className="space-y-2" data-error={!!errors.primaryInsuranceMemberId}>
                  <Label htmlFor="primaryInsuranceMemberId">Member ID</Label>
                  <Input
                    id="primaryInsuranceMemberId"
                    value={formData.primaryInsurance?.memberId}
                    onChange={(e) => updateNestedField("primaryInsurance", "memberId", e.target.value)}
                    className={errors.primaryInsuranceMemberId ? "border-destructive" : ""}
                  />
                  {errors.primaryInsuranceMemberId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.primaryInsuranceMemberId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryInsuranceGroupNumber">Group Number</Label>
                  <Input
                    id="primaryInsuranceGroupNumber"
                    value={formData.primaryInsurance?.groupNumber}
                    onChange={(e) => updateNestedField("primaryInsurance", "groupNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriberRelationship">Subscriber Relationship</Label>
                  <Select 
                    value={formData.primaryInsurance?.subscriberRelationship}
                    onValueChange={(value) => updateNestedField("primaryInsurance", "subscriberRelationship", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.primaryInsurance?.subscriberRelationship !== "self" && (
                <div className="space-y-2">
                  <Label htmlFor="subscriberName">Subscriber Name</Label>
                  <Input
                    id="subscriberName"
                    value={formData.primaryInsurance?.subscriberName}
                    onChange={(e) => updateNestedField("primaryInsurance", "subscriberName", e.target.value)}
                    placeholder="If not self"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secondary Insurance - Collapsible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Secondary Insurance (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryInsuranceCompany">Insurance Company</Label>
                  <Input
                    id="secondaryInsuranceCompany"
                    value={formData.secondaryInsurance?.company || ""}
                    onChange={(e) => {
                      if (!formData.secondaryInsurance) {
                        updateField("secondaryInsurance", { company: e.target.value });
                      } else {
                        updateNestedField("secondaryInsurance", "company", e.target.value);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryInsuranceMemberId">Member ID</Label>
                  <Input
                    id="secondaryInsuranceMemberId"
                    value={formData.secondaryInsurance?.memberId || ""}
                    onChange={(e) => updateNestedField("secondaryInsurance", "memberId", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="hipaaConsent"
                  checked={formData.hipaaConsentSigned}
                  onCheckedChange={(checked) => updateField("hipaaConsentSigned", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="hipaaConsent" className="font-medium cursor-pointer">
                    HIPAA Consent
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Patient acknowledges receipt of HIPAA Notice of Privacy Practices
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="treatmentConsent"
                  checked={formData.treatmentConsentSigned}
                  onCheckedChange={(checked) => updateField("treatmentConsentSigned", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="treatmentConsent" className="font-medium cursor-pointer">
                    Treatment Consent
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Patient consents to evaluation and treatment
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Communication Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="consentPhone"
                      checked={formData.communicationConsent?.phone}
                      onCheckedChange={(checked) => 
                        updateNestedField("communicationConsent", "phone", checked)
                      }
                    />
                    <Label htmlFor="consentPhone" className="cursor-pointer">
                      Phone calls
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="consentEmail"
                      checked={formData.communicationConsent?.email}
                      onCheckedChange={(checked) => 
                        updateNestedField("communicationConsent", "email", checked)
                      }
                    />
                    <Label htmlFor="consentEmail" className="cursor-pointer">
                      Email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="consentText"
                      checked={formData.communicationConsent?.text}
                      onCheckedChange={(checked) => 
                        updateNestedField("communicationConsent", "text", checked)
                      }
                    />
                    <Label htmlFor="consentText" className="cursor-pointer">
                      Text messages
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Any additional notes about this patient"
                  rows={4}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Patient..." : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}

