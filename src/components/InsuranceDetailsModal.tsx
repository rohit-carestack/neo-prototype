import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsuranceData {
  insuranceProvider: string;
  memberId: string;
  groupNumber: string;
  dateOfBirth: string;
  subscriberName: string;
  relationship: string;
  policyNumber: string;
  additionalNotes: string;
}

interface InsuranceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  onSubmit: (data: InsuranceData & { insuranceCardFiles: File[] }) => void;
}

export function InsuranceDetailsModal({ 
  isOpen, 
  onClose, 
  patientName, 
  onSubmit 
}: InsuranceDetailsModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsuranceData>({
    insuranceProvider: "",
    memberId: "",
    groupNumber: "",
    dateOfBirth: "",
    subscriberName: "",
    relationship: "self",
    policyNumber: "",
    additionalNotes: ""
  });
  const [insuranceCardFiles, setInsuranceCardFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof InsuranceData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setInsuranceCardFiles(prev => [...prev, ...fileArray]);
      toast({
        title: "Files uploaded",
        description: `${fileArray.length} insurance card file(s) added.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setInsuranceCardFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.insuranceProvider || !formData.memberId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the insurance provider and member ID.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({ ...formData, insuranceCardFiles });
      toast({
        title: "Insurance details submitted",
        description: "Running E&B check with the provided information.",
      });
      onClose();
      // Reset form
      setFormData({
        insuranceProvider: "",
        memberId: "",
        groupNumber: "",
        dateOfBirth: "",
        subscriberName: "",
        relationship: "self",
        policyNumber: "",
        additionalNotes: ""
      });
      setInsuranceCardFiles([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit insurance details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Insurance Information Required
          </DialogTitle>
          <DialogDescription>
            We need insurance details for <span className="font-semibold">{patientName}</span> to run the Eligibility & Benefits check.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Insurance Card Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Insurance Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload front and back of insurance card
                  </p>
                  <Label htmlFor="insurance-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm">
                      Choose Files
                    </Button>
                    <Input
                      id="insurance-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              
              {insuranceCardFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files:</Label>
                  {insuranceCardFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Details Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Insurance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance-provider">Insurance Provider *</Label>
                  <Input
                    id="insurance-provider"
                    placeholder="e.g., Blue Cross Blue Shield"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="member-id">Member ID *</Label>
                  <Input
                    id="member-id"
                    placeholder="Insurance member ID"
                    value={formData.memberId}
                    onChange={(e) => handleInputChange("memberId", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-number">Group Number</Label>
                  <Input
                    id="group-number"
                    placeholder="Group/Plan number"
                    value={formData.groupNumber}
                    onChange={(e) => handleInputChange("groupNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-number">Policy Number</Label>
                  <Input
                    id="policy-number"
                    placeholder="Policy number"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriber Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Subscriber Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriber-name">Subscriber Name</Label>
                  <Input
                    id="subscriber-name"
                    placeholder="Primary insurance holder name"
                    value={formData.subscriberName}
                    onChange={(e) => handleInputChange("subscriberName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship to Subscriber</Label>
                  <Select 
                    value={formData.relationship} 
                    onValueChange={(value) => handleInputChange("relationship", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="date-of-birth">Patient Date of Birth</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additional-notes">Additional Notes</Label>
            <Textarea
              id="additional-notes"
              placeholder="Any additional insurance information or special circumstances..."
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Running E&B..." : "Run E&B Check"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}