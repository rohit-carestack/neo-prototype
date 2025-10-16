import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Common insurance providers list
const insuranceProviders = [
  "Aetna",
  "Ambetter",
  "Anthem Blue Cross Blue Shield",
  "Blue Cross Blue Shield",
  "CIGNA",
  "CareFirst",
  "Centene",
  "EmblemHealth",
  "Excellus BlueCross BlueShield",
  "Geisinger Health Plan",
  "HealthFirst",
  "HealthPartners",
  "Highmark",
  "Horizon Blue Cross Blue Shield",
  "Humana",
  "Independence Blue Cross",
  "Kaiser Permanente",
  "Medicaid",
  "Medicare",
  "Molina Healthcare",
  "MVP Health Care",
  "Oscar Health",
  "Oxford Health Plans",
  "Premera Blue Cross",
  "Priority Health",
  "TRICARE",
  "UnitedHealthcare",
  "WellCare",
  "Other",
].sort();

interface Lead {
  id: string;
  source: "referral" | "web" | "call" | "fax";
  patientName: string;
  condition: string;
  referrer?: string;
  phone?: string;
  email?: string;
  insurance?: string;
}

interface EligibilityVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSubmit: (data: any) => void;
}

export function EligibilityVerificationModal({ open, onOpenChange, lead, onSubmit }: EligibilityVerificationModalProps) {
  const [insuranceCardFront, setInsuranceCardFront] = useState<File | null>(null);
  const [insuranceCardBack, setInsuranceCardBack] = useState<File | null>(null);
  const [insuranceCardFrontPreview, setInsuranceCardFrontPreview] = useState<string | null>(null);
  const [insuranceCardBackPreview, setInsuranceCardBackPreview] = useState<string | null>(null);
  const [secondaryInsuranceCardFront, setSecondaryInsuranceCardFront] = useState<File | null>(null);
  const [secondaryInsuranceCardBack, setSecondaryInsuranceCardBack] = useState<File | null>(null);
  const [secondaryInsuranceCardFrontPreview, setSecondaryInsuranceCardFrontPreview] = useState<string | null>(null);
  const [secondaryInsuranceCardBackPreview, setSecondaryInsuranceCardBackPreview] = useState<string | null>(null);
  const [primaryInsuranceOpen, setPrimaryInsuranceOpen] = useState(false);
  const [secondaryInsuranceOpen, setSecondaryInsuranceOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    dateOfBirth: "",
    primaryInsurance: "",
    primaryInsuranceId: "",
    primaryGroupNumber: "",
    secondaryInsurance: "",
    secondaryInsuranceId: "",
    secondaryGroupNumber: "",
    phone: "",
    email: "",
  });

  // Update form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        patientName: lead.patientName || "",
        dateOfBirth: "",
        primaryInsurance: lead.insurance || "",
        primaryInsuranceId: "",
        primaryGroupNumber: "",
        secondaryInsurance: "",
        secondaryInsuranceId: "",
        secondaryGroupNumber: "",
        phone: lead.phone || "",
        email: lead.email || "",
      });
    }
  }, [lead]);

  // Check if a previous job exists (mock check - in real app, check database)
  const hasPreviousJob = Math.random() > 0.7; // 30% chance for demo
  const previousJobDate = "2024-01-10 14:30";

  const handleFileUpload = (file: File, side: 'front' | 'back', insurance: 'primary' | 'secondary') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (insurance === 'primary') {
        if (side === 'front') {
          setInsuranceCardFront(file);
          setInsuranceCardFrontPreview(result);
        } else {
          setInsuranceCardBack(file);
          setInsuranceCardBackPreview(result);
        }
      } else {
        if (side === 'front') {
          setSecondaryInsuranceCardFront(file);
          setSecondaryInsuranceCardFrontPreview(result);
        } else {
          setSecondaryInsuranceCardBack(file);
          setSecondaryInsuranceCardBackPreview(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (side: 'front' | 'back', insurance: 'primary' | 'secondary') => {
    if (insurance === 'primary') {
      if (side === 'front') {
        setInsuranceCardFront(null);
        setInsuranceCardFrontPreview(null);
      } else {
        setInsuranceCardBack(null);
        setInsuranceCardBackPreview(null);
      }
    } else {
      if (side === 'front') {
        setSecondaryInsuranceCardFront(null);
        setSecondaryInsuranceCardFrontPreview(null);
      } else {
        setSecondaryInsuranceCardBack(null);
        setSecondaryInsuranceCardBackPreview(null);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit({
      lead,
      insuranceCardFront,
      insuranceCardBack,
      secondaryInsuranceCardFront,
      secondaryInsuranceCardBack,
      ...formData,
    });
    onOpenChange(false);
  };

  const isReferral = lead?.source === "referral";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl">Eligibility & Benefits Verification</DialogTitle>
          <DialogDescription>
            Verify insurance eligibility and benefits for {lead?.patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <div className="space-y-6 py-6">
            {/* Previous Job Warning */}
            {hasPreviousJob && (
              <Alert className="bg-warning/5 border-warning/20">
                <AlertCircle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  A verification job was previously run for this patient on {previousJobDate}. 
                  Running a new verification will create a new job record.
                </AlertDescription>
              </Alert>
            )}

            {/* Two Column Layout for Forms */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-4 bg-card p-5 rounded-lg border">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-sm font-medium">
                      Patient Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="Full name"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patient@email.com"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Insurance */}
              <div className="space-y-4 bg-card p-5 rounded-lg border">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Primary Insurance</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryInsurance" className="text-sm font-medium">
                      Insurance Provider <span className="text-destructive">*</span>
                    </Label>
                    <Popover open={primaryInsuranceOpen} onOpenChange={setPrimaryInsuranceOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={primaryInsuranceOpen}
                          className="w-full justify-between h-10 font-normal"
                        >
                          {formData.primaryInsurance || "Select insurance provider..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-popover z-50 w-[var(--radix-popover-trigger-width)]" align="start">
                        <Command className="bg-popover">
                          <CommandInput placeholder="Search insurance provider..." className="h-10" />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No provider found.</CommandEmpty>
                            <CommandGroup>
                              {insuranceProviders.map((provider) => (
                                <CommandItem
                                  key={provider}
                                  value={provider}
                                  onSelect={(currentValue) => {
                                    setFormData({ ...formData, primaryInsurance: currentValue === formData.primaryInsurance.toLowerCase() ? "" : provider });
                                    setPrimaryInsuranceOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.primaryInsurance === provider ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {provider}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryInsuranceId" className="text-sm font-medium">
                      Member/Policy ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="primaryInsuranceId"
                      value={formData.primaryInsuranceId}
                      onChange={(e) => setFormData({ ...formData, primaryInsuranceId: e.target.value })}
                      placeholder="Insurance ID"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryGroupNumber" className="text-sm font-medium">Group Number</Label>
                    <Input
                      id="primaryGroupNumber"
                      value={formData.primaryGroupNumber}
                      onChange={(e) => setFormData({ ...formData, primaryGroupNumber: e.target.value })}
                      placeholder="Group #"
                      className="h-10"
                    />
                  </div>

                  {/* Insurance Card Upload CTA */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">Insurance Card (Optional)</Label>
                      <span className="text-xs text-primary font-medium">• Auto-fills form</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front */}
                      {insuranceCardFrontPreview ? (
                        <div className="relative border rounded overflow-hidden group">
                          <img src={insuranceCardFrontPreview} alt="Card front" className="w-full h-24 object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile('front', 'primary')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded p-3 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                          <input
                            type="file"
                            id="insurance-front"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'front', 'primary');
                            }}
                          />
                          <label htmlFor="insurance-front" className="cursor-pointer">
                            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Front</p>
                          </label>
                        </div>
                      )}

                      {/* Back */}
                      {insuranceCardBackPreview ? (
                        <div className="relative border rounded overflow-hidden group">
                          <img src={insuranceCardBackPreview} alt="Card back" className="w-full h-24 object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile('back', 'primary')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded p-3 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                          <input
                            type="file"
                            id="insurance-back"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'back', 'primary');
                            }}
                          />
                          <label htmlFor="insurance-back" className="cursor-pointer">
                            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Back</p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Insurance (for referrals) */}
            {isReferral && (
              <div className="space-y-4 bg-card p-5 rounded-lg border">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Secondary Insurance (Optional)</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryInsurance" className="text-sm font-medium">Insurance Provider</Label>
                    <Popover open={secondaryInsuranceOpen} onOpenChange={setSecondaryInsuranceOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={secondaryInsuranceOpen}
                          className="w-full justify-between h-10 font-normal"
                        >
                          {formData.secondaryInsurance || "Select insurance provider..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-popover z-50 w-[var(--radix-popover-trigger-width)]" align="start">
                        <Command className="bg-popover">
                          <CommandInput placeholder="Search insurance provider..." className="h-10" />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No provider found.</CommandEmpty>
                            <CommandGroup>
                              {insuranceProviders.map((provider) => (
                                <CommandItem
                                  key={provider}
                                  value={provider}
                                  onSelect={(currentValue) => {
                                    setFormData({ ...formData, secondaryInsurance: currentValue === formData.secondaryInsurance.toLowerCase() ? "" : provider });
                                    setSecondaryInsuranceOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.secondaryInsurance === provider ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {provider}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryInsuranceId" className="text-sm font-medium">Member/Policy ID</Label>
                      <Input
                        id="secondaryInsuranceId"
                        value={formData.secondaryInsuranceId}
                        onChange={(e) => setFormData({ ...formData, secondaryInsuranceId: e.target.value })}
                        placeholder="Insurance ID"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryGroupNumber" className="text-sm font-medium">Group Number</Label>
                      <Input
                        id="secondaryGroupNumber"
                        value={formData.secondaryGroupNumber}
                        onChange={(e) => setFormData({ ...formData, secondaryGroupNumber: e.target.value })}
                        placeholder="Group #"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Insurance Card Upload CTA */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">Insurance Card (Optional)</Label>
                      <span className="text-xs text-primary font-medium">• Auto-fills form</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front */}
                      {secondaryInsuranceCardFrontPreview ? (
                        <div className="relative border rounded overflow-hidden group">
                          <img src={secondaryInsuranceCardFrontPreview} alt="Card front" className="w-full h-24 object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile('front', 'secondary')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded p-3 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                          <input
                            type="file"
                            id="secondary-insurance-front"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'front', 'secondary');
                            }}
                          />
                          <label htmlFor="secondary-insurance-front" className="cursor-pointer">
                            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Front</p>
                          </label>
                        </div>
                      )}

                      {/* Back */}
                      {secondaryInsuranceCardBackPreview ? (
                        <div className="relative border rounded overflow-hidden group">
                          <img src={secondaryInsuranceCardBackPreview} alt="Card back" className="w-full h-24 object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile('back', 'secondary')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded p-3 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                          <input
                            type="file"
                            id="secondary-insurance-back"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'back', 'secondary');
                            }}
                          />
                          <label htmlFor="secondary-insurance-back" className="cursor-pointer">
                            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Back</p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Run Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
