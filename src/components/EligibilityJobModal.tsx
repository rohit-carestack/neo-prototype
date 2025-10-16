import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Clock, Calendar, UserCircle, Play, Volume2, FileText, Copy, DollarSign, Shield, CreditCard, ArrowRight, Check, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { PublishToEMRModal, PublishData } from "./PublishToEMRModal";

interface EligibilityJobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  calculatePatientResponsibility: (job: any) => number;
  canScheduleToday: (job: any) => boolean;
  onPublish?: (publishData: PublishData) => void;
}

export function EligibilityJobModal({ 
  job, 
  isOpen, 
  onClose,
  calculatePatientResponsibility,
  canScheduleToday,
  onPublish
}: EligibilityJobModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const primary = job?.results?.[0];
  const secondary = job?.results?.[1];
  const hasSecondary = !!secondary;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handlePublish = (publishData: PublishData) => {
    if (onPublish) {
      onPublish(publishData);
    }
    toast({ 
      title: "Published to EMR!", 
      description: `E&B report for ${job.targetName} has been published to their EMR profile.` 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {job && primary && (
          <>
            {/* Peace of Mind Banner */}
            <div className={`p-4 rounded-lg border-2 ${
              canScheduleToday(job) ? "bg-success/10 border-success/40" : "bg-warning/10 border-warning/40"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {canScheduleToday(job) ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-warning" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {canScheduleToday(job) ? "✅ Ready to Schedule" : "⚠️ Action Required"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{job.targetName} • {job.targetId}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Patient Owes Today</div>
                    <div className="text-2xl font-bold text-primary">${calculatePatientResponsibility(job)}</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">PA Status</div>
                    <Badge variant={primary.paRequired ? "destructive" : "default"}>
                      {primary.paRequired ? (primary.paThreshold ? `After ${primary.paThreshold} visits` : "Required") : "Not Required"}
                    </Badge>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Network</div>
                    <Badge variant={primary.networkStatus === "in-network" ? "default" : "destructive"}>
                      {primary.networkStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{job.id}</h2>
                <div className="flex items-center gap-2">
                  {job.status === "completed" && job.targetType === "patient" && !job.publishedToEMR && (
                    <Button 
                      variant="default"
                      onClick={() => setShowPublishModal(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Publish to EMR
                    </Button>
                  )}
                  {job.publishedToEMR && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      <Upload className="h-3 w-3 mr-1" />
                      Published to EMR
                    </Badge>
                  )}
                  <Badge>{job.status}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />{new Date(job.createdAt).toLocaleDateString()}</Badge>
                <Badge variant="outline"><UserCircle className="h-3 w-3 mr-1" />{job.requestedBy}</Badge>
                {job.publishedToEMR && job.publishedAt && (
                  <Badge variant="outline" className="bg-success/5 border-success/20">
                    <Upload className="h-3 w-3 mr-1" />
                    EMR: {new Date(job.publishedAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Coverage Overview</TabsTrigger>
                <TabsTrigger value="primary">Primary Insurance</TabsTrigger>
                {hasSecondary && <TabsTrigger value="secondary">Secondary Insurance</TabsTrigger>}
                <TabsTrigger value="recording">Call Recording</TabsTrigger>
              </TabsList>

              {/* Tab 1: Coverage Overview */}
              <TabsContent value="overview" className="flex-1 overflow-y-auto mt-4 space-y-4">
                {/* Insurance Cards */}
                <div className={`grid ${hasSecondary ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="bg-primary/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{primary.payerName}</CardTitle>
                          <CardDescription>Primary Insurance</CardDescription>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      <div><Label className="text-xs">Member ID</Label><div className="font-mono">{job.checklist?.memberID?.value || "N/A"}</div></div>
                      <div><Label className="text-xs">Plan Type</Label><div>{primary.planType || "N/A"}</div></div>
                      <div><Label className="text-xs">Effective Date</Label><div>{primary.effectiveDate}</div></div>
                    </CardContent>
                  </Card>

                  {hasSecondary && (
                    <Card className="border-2 border-secondary/20">
                      <CardHeader className="bg-secondary/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{secondary.payerName}</CardTitle>
                            <CardDescription>Secondary Insurance</CardDescription>
                          </div>
                          <Badge variant="secondary">Secondary</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-2">
                        <div><Label className="text-xs">Plan Type</Label><div>{secondary.planType || "N/A"}</div></div>
                        <div><Label className="text-xs">Effective Date</Label><div>{secondary.effectiveDate}</div></div>
                        <div><Label className="text-xs">COB Rule</Label><div className="text-xs">{secondary.cobRules || "Secondary to primary"}</div></div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* COB Explanation */}
                {hasSecondary && (
                  <Card className="bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        How Coordination of Benefits Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-background p-2 rounded">
                          <CreditCard className="h-4 w-4" />
                          <span>Service Claim</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="flex items-center gap-2 bg-primary/10 p-2 rounded">
                          <span className="font-semibold">Primary Pays First</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="flex items-center gap-2 bg-secondary/10 p-2 rounded">
                          <span className="font-semibold">Secondary Covers Balance</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="flex items-center gap-2 bg-success/10 p-2 rounded">
                          <DollarSign className="h-4 w-4" />
                          <span>Patient Owes</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{secondary.cobRules}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Copay (Primary)</span>
                        <span className="font-bold">${primary.copay}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Deductible Remaining</span>
                        <span className="font-bold">${primary.deductibleRemaining} of ${primary.deductibleTotal || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Coinsurance (Primary)</span>
                        <span className="font-bold">{primary.coinsurance}%</span>
                      </div>
                      {hasSecondary && secondary.coversCoinsurance && (
                        <div className="flex justify-between items-center p-3 bg-success/10 rounded">
                          <span>Secondary Coverage</span>
                          <span className="font-bold text-success">Covers {secondary.coversCopay ? "copay + " : ""}coinsurance</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                        <span className="text-lg font-bold">Patient Owes Today</span>
                        <span className="text-2xl font-bold text-primary">${calculatePatientResponsibility(job)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Action Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Coverage is active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {primary.networkStatus === "in-network" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        )}
                        <span className="text-sm">{primary.networkStatus === "in-network" ? "In-network" : "Out-of-network"} at facility</span>
                      </div>
                      {primary.visitLimit && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm">Visits available: {primary.visitLimit.allowed - primary.visitLimit.used} remaining</span>
                        </div>
                      )}
                      {primary.paRequired && primary.paThreshold && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span className="text-sm">PA required after visit {primary.paThreshold}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Primary Insurance */}
              <TabsContent value="primary" className="flex-1 overflow-y-auto mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded cursor-pointer hover:bg-muted/50" onClick={() => { setHighlightedText("copay"); setActiveTab("recording"); }}>
                      <Label className="text-xs text-muted-foreground">Copay</Label>
                      <div className="text-xl font-bold">${primary.copay}</div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground mt-1" />
                    </div>
                    <div className="p-3 bg-muted/30 rounded cursor-pointer hover:bg-muted/50" onClick={() => { setHighlightedText("coinsurance"); setActiveTab("recording"); }}>
                      <Label className="text-xs text-muted-foreground">Coinsurance</Label>
                      <div className="text-xl font-bold">{primary.coinsurance}%</div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground mt-1" />
                    </div>
                    <div className="p-3 bg-muted/30 rounded cursor-pointer hover:bg-muted/50" onClick={() => { setHighlightedText("deductible"); setActiveTab("recording"); }}>
                      <Label className="text-xs text-muted-foreground">Deductible Remaining</Label>
                      <div className="text-xl font-bold">${primary.deductibleRemaining}</div>
                      <div className="text-xs text-muted-foreground">of ${primary.deductibleTotal || 0}</div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground mt-1" />
                    </div>
                    <div className="p-3 bg-muted/30 rounded">
                      <Label className="text-xs text-muted-foreground">Out-of-Pocket Max</Label>
                      <div className="text-xl font-bold">${primary.outOfPocketUsed || 0}</div>
                      <div className="text-xs text-muted-foreground">of ${primary.outOfPocketMax || 0}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visit Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {primary.visitLimit && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Visit Limits</Label>
                        <div className="font-medium">{primary.visitLimit.used} of {primary.visitLimit.allowed} used ({primary.visitLimit.period})</div>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">PA Required</Label>
                      <div className="font-medium">{primary.paRequired ? (primary.paThreshold ? `Yes, after visit ${primary.paThreshold}` : "Yes") : "No"}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Referral Required</Label>
                      <div className="font-medium">{primary.referralRequired ? "Yes" : "No"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Policy Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Payer</Label>
                        <div className="font-medium">{primary.payerName}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Plan Type</Label>
                        <div className="font-medium">{primary.planType || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Network Status</Label>
                        <div className="font-medium capitalize">{primary.networkStatus}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Effective Date</Label>
                        <div className="font-medium">{primary.effectiveDate}</div>
                      </div>
                      {primary.subscriberName && (
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">Subscriber</Label>
                          <div className="font-medium">{primary.subscriberName} ({primary.subscriberRelationship})</div>
                        </div>
                      )}
                      {primary.referenceNumber && (
                        <div className="col-span-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <Label className="text-xs text-muted-foreground">Reference # (Golden Key)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="font-mono font-bold text-lg">{primary.referenceNumber}</div>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(primary.referenceNumber!, "Reference number")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Secondary Insurance */}
              {hasSecondary && (
                <TabsContent value="secondary" className="flex-1 overflow-y-auto mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>What Secondary Covers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Copay Coverage</span>
                        <Badge variant={secondary.coversCopay ? "default" : "secondary"}>
                          {secondary.coversCopay ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Coinsurance Coverage</span>
                        <Badge variant={secondary.coversCoinsurance ? "default" : "secondary"}>
                          {secondary.coversCoinsurance ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Coordination Rules</Label>
                        <div className="text-sm mt-1">{secondary.cobRules}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Policy Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Payer</Label>
                          <div className="font-medium">{secondary.payerName}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Plan Type</Label>
                          <div className="font-medium">{secondary.planType || "N/A"}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Effective Date</Label>
                          <div className="font-medium">{secondary.effectiveDate}</div>
                        </div>
                        {secondary.referenceNumber && (
                          <div className="col-span-2 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                            <Label className="text-xs text-muted-foreground">Reference #</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="font-mono font-bold">{secondary.referenceNumber}</div>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(secondary.referenceNumber!, "Reference number")}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Tab 4: Call Recording & Transcript */}
              <TabsContent value="recording" className="flex-1 overflow-y-auto mt-4">
                {job.recording || job.secondaryRecording ? (
                  <div className="space-y-4">
                    {/* Check if we have both primary and secondary recordings */}
                    {job.recording && job.secondaryRecording ? (
                      <Accordion type="single" collapsible defaultValue="primary" className="space-y-4">
                        {/* Primary Insurance Recording */}
                        <AccordionItem value="primary" className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-4 hover:no-underline bg-primary/5 hover:bg-primary/10">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <Badge variant="default">Primary</Badge>
                                <span className="font-semibold">{primary.payerName} Verification Call</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {job.recording.duration}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setPlayingRecording(playingRecording === 'primary' ? null : 'primary')}
                                >
                                  {playingRecording === 'primary' ? <Volume2 className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                  {playingRecording === 'primary' ? "Stop" : "Play"} Recording
                                </Button>
                                {primary.referenceNumber && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(primary.referenceNumber!, "Reference number")}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    {primary.referenceNumber}
                                  </Button>
                                )}
                              </div>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Transcript</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border max-h-96 overflow-y-auto space-y-3">
                                    {job.recording.transcript.split('\n\n').map((paragraph: string, pIndex: number) => {
                                      const isRepresentative = paragraph.startsWith('Representative:');
                                      return (
                                        <div key={pIndex} className={isRepresentative ? 'ml-4' : ''}>
                                          {paragraph}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Secondary Insurance Recording */}
                        <AccordionItem value="secondary" className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-4 hover:no-underline bg-secondary/5 hover:bg-secondary/10">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">Secondary</Badge>
                                <span className="font-semibold">{secondary.payerName} Verification Call</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {job.secondaryRecording.duration}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setPlayingRecording(playingRecording === 'secondary' ? null : 'secondary')}
                                >
                                  {playingRecording === 'secondary' ? <Volume2 className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                  {playingRecording === 'secondary' ? "Stop" : "Play"} Recording
                                </Button>
                                {secondary.referenceNumber && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(secondary.referenceNumber!, "Reference number")}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    {secondary.referenceNumber}
                                  </Button>
                                )}
                              </div>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Transcript</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border max-h-96 overflow-y-auto space-y-3">
                                    {job.secondaryRecording.transcript.split('\n\n').map((paragraph: string, pIndex: number) => {
                                      const isRepresentative = paragraph.startsWith('Representative:');
                                      return (
                                        <div key={pIndex} className={isRepresentative ? 'ml-4' : ''}>
                                          {paragraph}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      /* Single Recording Display */
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <Button variant="outline" onClick={() => setPlayingRecording(playingRecording === 'single' ? null : 'single')}>
                                {playingRecording === 'single' ? <Volume2 className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {playingRecording === 'single' ? "Stop" : "Play"} Recording
                              </Button>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {job.recording?.duration || job.secondaryRecording?.duration}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Transcript</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border max-h-96 overflow-y-auto space-y-3">
                              {(job.recording?.transcript || job.secondaryRecording?.transcript || '').split('\n\n').map((paragraph: string, pIndex: number) => {
                                const isRepresentative = paragraph.startsWith('Representative:');
                                return (
                                  <div key={pIndex} className={isRepresentative ? 'ml-4' : ''}>
                                    {paragraph}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recording available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>

      {/* Publish to EMR Modal */}
      {job && showPublishModal && (
        <PublishToEMRModal
          open={showPublishModal}
          onOpenChange={setShowPublishModal}
          job={job}
          patientResponsibility={calculatePatientResponsibility(job)}
          canScheduleToday={canScheduleToday(job)}
          onPublish={handlePublish}
        />
      )}
    </Dialog>
  );
}
