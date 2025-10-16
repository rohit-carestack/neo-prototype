import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, CheckCircle, AlertCircle, DollarSign, Shield, Calendar, User } from "lucide-react";
import { useState } from "react";

interface InsuranceResult {
  payerName: string;
  eligibilityStatus: string;
  copay: number;
  coinsurance: number;
  deductibleTotal?: number;
  deductibleRemaining: number;
  outOfPocketMax?: number;
  outOfPocketUsed?: number;
  visitLimit: { allowed: number; used: number; period: string } | null;
  paRequired: boolean;
  paThreshold?: number;
  referralRequired?: boolean;
  networkStatus: string;
  effectiveDate: string;
  groupNumber?: string;
  planType?: string;
  subscriberName?: string;
  subscriberRelationship?: string;
  referenceNumber?: string;
  rawNotes: string;
  coversCopay?: boolean;
  coversCoinsurance?: boolean;
  cobRules?: string;
}

interface EligibilityJob {
  id: string;
  targetType: "patient" | "lead" | "referral";
  targetId: string;
  targetName: string;
  status: "pending" | "running" | "completed";
  method: string;
  payers: string[];
  createdAt: string;
  completedAt: string | null;
  requestedBy: string;
  estimatedServiceCost?: number;
  paObtained?: boolean;
  recording?: {
    url: string;
    duration: string;
    transcript: string;
  };
  secondaryRecording?: {
    url: string;
    duration: string;
    transcript: string;
  };
  checklist?: any;
  results: InsuranceResult[];
}

interface PublishToEMRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: EligibilityJob;
  patientResponsibility: number;
  canScheduleToday: boolean;
  onPublish: (publishData: PublishData) => void;
}

export interface PublishData {
  jobId: string;
  includeTranscript: boolean;
  includeRecording: boolean;
  includeSummary: boolean;
  includeFinancials: boolean;
  includeSecondaryInsurance: boolean;
  additionalNotes: string;
}

export function PublishToEMRModal({ 
  open, 
  onOpenChange, 
  job, 
  patientResponsibility,
  canScheduleToday,
  onPublish 
}: PublishToEMRModalProps) {
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeRecording, setIncludeRecording] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeSecondaryInsurance, setIncludeSecondaryInsurance] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const primary = job.results[0];
  const secondary = job.results[1];
  const hasSecondary = !!secondary;

  const handlePublish = () => {
    setIsPublishing(true);
    
    // Simulate API call
    setTimeout(() => {
      onPublish({
        jobId: job.id,
        includeTranscript,
        includeRecording,
        includeSummary,
        includeFinancials,
        includeSecondaryInsurance: hasSecondary && includeSecondaryInsurance,
        additionalNotes,
      });
      setIsPublishing(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish E&B Report to EMR
          </DialogTitle>
          <DialogDescription>
            Review and customize what will be published to {job.targetName}'s EMR profile
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-6 py-4">
          {/* Patient Info Card */}
          <Card className="border-primary/30">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">{job.targetName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{job.targetId} • {job.targetType}</p>
                  </div>
                </div>
                <Badge variant={canScheduleToday ? "default" : "secondary"}>
                  {canScheduleToday ? "Ready to Schedule" : "Action Required"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Status Alert */}
          <Alert className={canScheduleToday ? "bg-success/10 border-success/40" : "bg-warning/10 border-warning/40"}>
            {canScheduleToday ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
            <AlertDescription>
              {canScheduleToday 
                ? "This report shows the patient is eligible and ready to schedule. Publishing will add this verification to their EMR profile."
                : "This report shows action items required. Publishing will document current status and required next steps in the EMR."
              }
            </AlertDescription>
          </Alert>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="summary" 
                      checked={includeSummary}
                      onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                    />
                    <Label htmlFor="summary" className="font-semibold cursor-pointer">
                      Eligibility Summary
                    </Label>
                  </div>
                  <Badge variant="outline">Required</Badge>
                </div>
                {includeSummary && (
                  <div className="ml-6 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job ID:</span>
                      <span className="font-mono">{job.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verification Date:</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span>{job.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified By:</span>
                      <span>{job.requestedBy}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Payer:</span>
                      <span className="font-semibold">{primary.payerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={primary.eligibilityStatus === "eligible" ? "default" : "secondary"}>
                        {primary.eligibilityStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Status:</span>
                      <Badge variant={primary.networkStatus === "in-network" ? "default" : "destructive"}>
                        {primary.networkStatus}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Financial Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="financials" 
                    checked={includeFinancials}
                    onCheckedChange={(checked) => setIncludeFinancials(checked as boolean)}
                  />
                  <Label htmlFor="financials" className="font-semibold cursor-pointer">
                    Financial Details
                  </Label>
                </div>
                {includeFinancials && (
                  <div className="ml-6 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                      <span className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Patient Responsibility Today
                      </span>
                      <span className="text-xl font-bold text-primary">${patientResponsibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Copay:</span>
                      <span>${primary.copay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coinsurance:</span>
                      <span>{primary.coinsurance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductible Remaining:</span>
                      <span>${primary.deductibleRemaining} of ${primary.deductibleTotal || 0}</span>
                    </div>
                    {primary.visitLimit && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visits Remaining:</span>
                        <span>{primary.visitLimit.allowed - primary.visitLimit.used} of {primary.visitLimit.allowed}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prior Auth Required:</span>
                      <span>{primary.paRequired ? (primary.paThreshold ? `After visit ${primary.paThreshold}` : "Yes") : "No"}</span>
                    </div>
                    {primary.referenceNumber && (
                      <div className="p-2 bg-primary/5 rounded border border-primary/20">
                        <span className="text-xs text-muted-foreground">Reference #:</span>
                        <div className="font-mono font-semibold">{primary.referenceNumber}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Secondary Insurance */}
              {hasSecondary && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="secondary" 
                        checked={includeSecondaryInsurance}
                        onCheckedChange={(checked) => setIncludeSecondaryInsurance(checked as boolean)}
                      />
                      <Label htmlFor="secondary" className="font-semibold cursor-pointer">
                        Secondary Insurance Details
                      </Label>
                    </div>
                    {includeSecondaryInsurance && (
                      <div className="ml-6 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-semibold">{secondary.payerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Covers Copay:</span>
                          <Badge variant={secondary.coversCopay ? "default" : "secondary"}>
                            {secondary.coversCopay ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Covers Coinsurance:</span>
                          <Badge variant={secondary.coversCoinsurance ? "default" : "secondary"}>
                            {secondary.coversCoinsurance ? "Yes" : "No"}
                          </Badge>
                        </div>
                        {secondary.cobRules && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {secondary.cobRules}
                          </div>
                        )}
                        {secondary.referenceNumber && (
                          <div className="p-2 bg-secondary/5 rounded border border-secondary/20 mt-2">
                            <span className="text-xs text-muted-foreground">Reference #:</span>
                            <div className="font-mono font-semibold">{secondary.referenceNumber}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Call Transcript */}
              {job.recording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="transcript" 
                      checked={includeTranscript}
                      onCheckedChange={(checked) => setIncludeTranscript(checked as boolean)}
                    />
                    <Label htmlFor="transcript" className="font-semibold cursor-pointer">
                      Verification Call Transcript
                    </Label>
                  </div>
                  {includeTranscript && (
                    <div className="ml-6 p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-muted-foreground">
                          {hasSecondary && job.secondaryRecording 
                            ? "Primary & Secondary Call Transcripts" 
                            : "Full Call Transcript"
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Complete transcript of the verification call with {primary.payerName}
                        {hasSecondary && job.secondaryRecording && ` and ${secondary.payerName}`} will be attached.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recording Link */}
              {job.recording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="recording" 
                      checked={includeRecording}
                      onCheckedChange={(checked) => setIncludeRecording(checked as boolean)}
                    />
                    <Label htmlFor="recording" className="font-semibold cursor-pointer">
                      Audio Recording Link
                    </Label>
                  </div>
                  {includeRecording && (
                    <div className="ml-6 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="text-xs text-muted-foreground">
                        Secure link to the audio recording will be included in the EMR record for audit purposes.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes or context for the clinical team..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Preview of what will be published */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              This report will be published to the patient's insurance/eligibility section in the EMR. 
              It will be timestamped and attributed to {job.requestedBy}.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="border-t pt-4 flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isPublishing || !includeSummary}
            className="flex-1"
          >
            {isPublishing ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Publish to EMR
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


