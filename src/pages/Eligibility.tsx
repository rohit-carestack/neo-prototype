import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Eye, CheckCircle, Clock, Play, Volume2, User, Phone, FileText, Calendar, UserCircle, Check, ArrowRight, Upload } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { EligibilityJobModal } from "@/components/EligibilityJobModal";
import { PublishData } from "@/components/PublishToEMRModal";

// Enhanced data structure for primary/secondary insurance and COB
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
  // Secondary-specific fields
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
  publishedToEMR?: boolean;
  publishedAt?: string;
  publishedBy?: string;
}

// Helper functions for calculations
const calculatePatientResponsibility = (job: EligibilityJob): number => {
  const primary = job.results[0];
  const secondary = job.results[1];
  const serviceCost = job.estimatedServiceCost || 150; // Default PT visit cost
  
  let patientOwes = primary.copay;
  
  // Calculate deductible portion
  if (primary.deductibleRemaining > 0) {
    const deductiblePortion = Math.min(serviceCost - primary.copay, primary.deductibleRemaining);
    patientOwes += deductiblePortion;
  }
  
  // Calculate coinsurance on the remaining amount
  const afterDeductible = Math.max(0, serviceCost - primary.copay - Math.min(serviceCost - primary.copay, primary.deductibleRemaining));
  const primaryCoinsurance = afterDeductible * (primary.coinsurance / 100);
  
  // Apply secondary coverage if exists
  if (secondary) {
    let secondaryCoverage = 0;
    if (secondary.coversCopay) {
      secondaryCoverage += primary.copay;
    }
    if (secondary.coversCoinsurance) {
      secondaryCoverage += primaryCoinsurance;
    }
    patientOwes = Math.max(0, patientOwes + primaryCoinsurance - secondaryCoverage);
  } else {
    patientOwes += primaryCoinsurance;
  }
  
  return Math.round(patientOwes * 100) / 100;
};

const canScheduleToday = (job: EligibilityJob): boolean => {
  const primary = job.results[0];
  if (!primary) return false;
  
  const blockers = [
    primary.eligibilityStatus !== "eligible",
    primary.networkStatus === "out-of-network",
    primary.paRequired && primary.paThreshold && primary.visitLimit && primary.visitLimit.used >= primary.paThreshold && !job.paObtained,
    primary.visitLimit && primary.visitLimit.used >= primary.visitLimit.allowed
  ];
  
  return !blockers.some(b => b);
};

// Mock data for demonstration
const mockEligibilityJobs: EligibilityJob[] = [
  {
    id: "EB-001",
    targetType: "patient",
    targetId: "PAT-1234",
    targetName: "Sarah Johnson",
    status: "completed",
    payers: ["Blue Cross Blue Shield", "Medicare"],
    createdAt: "2024-01-15 14:25:00",
    completedAt: "2024-01-15 14:26:15",
    requestedBy: "Mike Chen",
    estimatedServiceCost: 150,
    paObtained: false,
    recording: {
      url: "/recordings/eb-001-primary.mp3",
      duration: "5:42",
      transcript: `Agent: Good afternoon, thank you for calling Blue Cross Blue Shield eligibility verification line. This is Jennifer speaking. How may I help you today?

Representative: Hi Jennifer, this is calling from Premier Physical Therapy. I need to verify benefits for one of our patients.

Agent: Absolutely, I'd be happy to help with that. Can I get the member's ID number please?

Representative: Yes, the member ID is 123456789.

Agent: Thank you. And can I have the member's date of birth for verification purposes?

Representative: The date of birth is January 15th, 1985.

Agent: Perfect, thank you. I'm pulling up the account now. Can you confirm the member's name for me?

Representative: Yes, it's Sarah Johnson.

Agent: Great, I have Sarah Johnson here. What type of services are we verifying today?

Representative: We're verifying for physical therapy services, outpatient.

Agent: Okay, let me pull up the physical therapy benefits. One moment please... Alright, I can confirm that Sarah Johnson does have active coverage under Blue Cross Blue Shield. The policy is currently active with an effective date of January 1st, 2024. For outpatient physical therapy, the copay is $25 per visit. The coinsurance is 20% after the deductible is met. Currently, she has $450 remaining on her deductible out of $2,000. She has used 3 visits out of her allowed 20 visits per calendar year. The policy is in-network with your facility.

Representative: Okay, great. Is there any prior authorization required?

Agent: Yes, prior authorization is required for physical therapy visits after the 12th visit in the calendar year. So visits 1 through 12 do not require authorization, but visit 13 onwards will need prior auth.

Representative: Perfect. And does she have any secondary insurance on file?

Agent: Yes, I do see Medicare listed as secondary coverage. You'll want to call them separately for their coverage details.

Representative: Thank you. Can I get a reference number for this call?

Agent: Absolutely. Your reference number is BCBS-2024-789456. Is there anything else I can help you with today?

Representative: No, that's everything I needed. Thank you so much for your help, Jennifer.

Agent: You're very welcome! Have a great day.`
    },
    secondaryRecording: {
      url: "/recordings/eb-001-secondary.mp3",
      duration: "4:15",
      transcript: `Agent: Medicare verification services, this is David. How can I assist you today?

Representative: Hi David, I'm calling from Premier Physical Therapy. I need to verify secondary coverage for a patient.

Agent: I'd be happy to help. Can you provide the Medicare number?

Representative: Yes, it's 1EG4-TE5-MK72.

Agent: Thank you. And the beneficiary's name and date of birth?

Representative: Sarah Johnson, date of birth January 15th, 1985.

Agent: Perfect. Let me pull up her account... Okay, I have Sarah Johnson's Medicare Part B coverage here. This shows as secondary insurance. What services are you verifying?

Representative: Physical therapy, outpatient services.

Agent: Alright. I can confirm this is an active Medicare Part B policy with an effective date of June 1st, 2023. As secondary insurance, Medicare will process claims after the primary insurance. For physical therapy, Medicare Part B typically has no copay when it's secondary, and the coinsurance is also covered as secondary. The coordination of benefits rule states that Medicare covers the copay and coinsurance amounts that remain after the primary insurance processes the claim.

Representative: That's excellent news. Are there any visit limits or prior authorization requirements from Medicare?

Agent: No, Medicare Part B does not have visit limits for outpatient physical therapy when medically necessary, and no prior authorization is required as secondary payer. The primary insurance determines those requirements.

Representative: Perfect. Can I get a reference number?

Agent: Yes, your reference number is MCARE-2024-123789. The key thing to remember is to always bill the primary insurance first, then submit the explanation of benefits to Medicare for secondary processing.

Representative: Understood. Thank you so much for your help.

Agent: You're welcome. Have a great day!`
    },
    checklist: {
      copay: { collected: true, value: "$25", highlight: "967-985" },
      coinsurance: { collected: true, value: "20%", highlight: "990-1020" },
      deductible: { collected: true, value: "$450 remaining", highlight: "1047-1105" },
      visitLimit: { collected: true, value: "20 visits/year, 3 used", highlight: "1110-1180" },
      paRequired: { collected: true, value: "Yes, after 12 visits", highlight: "1329-1480" },
      networkStatus: { collected: true, value: "In-network", highlight: "1185-1230" },
      effectiveDate: { collected: true, value: "2024-01-01", highlight: "891-960" },
      memberID: { collected: true, value: "123456789", highlight: "275-287" },
      primaryInsurance: { collected: true, value: "Blue Cross Blue Shield - Active", highlight: "850-960" },
      secondaryInsurance: { collected: true, value: "Medicare - Secondary", highlight: "1485-1590" }
    },
    results: [
      {
        payerName: "Blue Cross Blue Shield",
        eligibilityStatus: "eligible",
        copay: 25,
        coinsurance: 20,
        deductibleTotal: 2000,
        deductibleRemaining: 450,
        outOfPocketMax: 6000,
        outOfPocketUsed: 1550,
        visitLimit: { allowed: 20, used: 3, period: "calendar year" },
        paRequired: true,
        paThreshold: 12,
        referralRequired: false,
        networkStatus: "in-network",
        effectiveDate: "2024-01-01",
        groupNumber: "GRP-456789",
        planType: "PPO",
        subscriberName: "Sarah Johnson",
        subscriberRelationship: "Self",
        referenceNumber: "BCBS-2024-789456",
        rawNotes: "Active policy, PA required for PT services over 12 visits"
      },
      {
        payerName: "Medicare",
        eligibilityStatus: "secondary",
        copay: 0,
        coinsurance: 0,
        deductibleRemaining: 0,
        visitLimit: null,
        paRequired: false,
        referralRequired: false,
        networkStatus: "participating",
        effectiveDate: "2023-06-01",
        planType: "Medicare Part B",
        subscriberName: "Sarah Johnson",
        subscriberRelationship: "Self",
        referenceNumber: "MCARE-2024-123789",
        coversCopay: true,
        coversCoinsurance: true,
        cobRules: "Secondary to primary insurance. Covers copay and coinsurance after primary processes.",
        rawNotes: "Secondary coverage, covers after primary"
      }
    ]
  },
  {
    id: "EB-002",
    targetType: "lead",
    targetId: "LEAD-5678",
    targetName: "Michael Davis",
    status: "running",
    payers: ["Aetna"],
    createdAt: "2024-01-15 15:10:00",
    completedAt: null,
    requestedBy: "Lisa Wong",
    estimatedServiceCost: 150,
    results: []
  },
  {
    id: "EB-003",
    targetType: "patient",
    targetId: "PAT-5678",
    targetName: "Emma Wilson",
    status: "completed",
    payers: ["United Healthcare"],
    createdAt: "2024-01-15 13:45:00",
    completedAt: "2024-01-15 13:46:30",
    requestedBy: "David Kim",
    estimatedServiceCost: 150,
    paObtained: false,
    recording: {
      url: "/recordings/eb-003.mp3",
      duration: "4:15",
      transcript: `Agent: Thank you for calling United Healthcare benefits verification. This is Marcus. How can I assist you?

Representative: Hi Marcus, I'm calling from Wellness Physical Therapy to verify coverage for a patient.

Agent: I'd be happy to help with that. May I have the member ID?

Representative: Sure, it's 987654321.

Agent: Thank you. And the member's full name?

Representative: Emma Wilson.

Agent: Great, and date of birth for verification?

Representative: March 22nd, 1978.

Agent: Perfect, I have Emma Wilson's account pulled up. What services are we checking benefits for today?

Representative: Physical therapy, outpatient services.

Agent: Alright, let me review the PT benefits... Okay, I can confirm Emma Wilson has active United Healthcare coverage. The policy effective date is January 1st, 2024. For physical therapy visits, the copay is $30 per visit. Her annual deductible is $500, which has been met in full, so she has $0 remaining on the deductible. The coinsurance is 0% since the deductible has been met. She's allowed 30 physical therapy visits per calendar year and has used 5 so far.

Representative: That's great. Does she need prior authorization?

Agent: No prior authorization is required for physical therapy services with her current plan. Your facility shows as in-network, so she'll receive full in-network benefits.

Representative: Perfect. Any secondary coverage on file?

Agent: No, I don't see any secondary insurance listed on this account. United Healthcare is her primary and only coverage.

Representative: Understood. Thank you so much for the information.

Agent: You're welcome! The reference number for this verification is UHC-2024-456123. Have a great day!`
    },
    checklist: {
      copay: { collected: true, value: "$30", highlight: "605-650" },
      coinsurance: { collected: true, value: "0%", highlight: "750-800" },
      deductible: { collected: true, value: "$0 remaining (met)", highlight: "655-748" },
      visitLimit: { collected: true, value: "30 visits/year, 5 used", highlight: "805-890" },
      paRequired: { collected: true, value: "No", highlight: "925-1010" },
      networkStatus: { collected: true, value: "In-network", highlight: "1015-1105" },
      effectiveDate: { collected: true, value: "2024-01-01", highlight: "540-600" },
      memberID: { collected: true, value: "987654321", highlight: "175-187" },
      primaryInsurance: { collected: true, value: "United Healthcare - Active", highlight: "505-600" },
      secondaryInsurance: { collected: false, value: null, highlight: null }
    },
    results: [
      {
        payerName: "United Healthcare",
        eligibilityStatus: "eligible",
        copay: 30,
        coinsurance: 0,
        deductibleTotal: 500,
        deductibleRemaining: 0,
        outOfPocketMax: 5000,
        outOfPocketUsed: 500,
        visitLimit: { allowed: 30, used: 5, period: "calendar year" },
        paRequired: false,
        referralRequired: false,
        networkStatus: "in-network",
        effectiveDate: "2024-01-01",
        groupNumber: "GRP-789012",
        planType: "HMO",
        subscriberName: "Emma Wilson",
        subscriberRelationship: "Self",
        referenceNumber: "UHC-2024-456123",
        rawNotes: "Active policy, deductible met"
      }
    ]
  },
  {
    id: "EB-004",
    targetType: "referral",
    targetId: "REF-9012",
    targetName: "Robert Chen",
    status: "pending",
    payers: ["Cigna"],
    createdAt: "2024-01-15 16:00:00",
    completedAt: null,
    requestedBy: "Sarah Johnson",
    estimatedServiceCost: 150,
    results: []
  }
];

const checklistItems = [
  { id: "primaryInsurance", label: "Primary Insurance", required: true },
  { id: "secondaryInsurance", label: "Secondary Insurance", required: false },
  { id: "eligibility", label: "Eligibility (active/effective dates)", required: true },
  { id: "copay", label: "Copay", required: true },
  { id: "coinsurance", label: "Coinsurance", required: true },
  { id: "deductible", label: "Deductible", required: true },
  { id: "outOfPocketMax", label: "Out-of-pocket max", required: true },
  { id: "visitLimits", label: "Visit limits", required: true },
  { id: "priorAuth", label: "Prior auth", required: true },
  { id: "referralRequirement", label: "Referral requirement", required: true },
  { id: "payerReference", label: "Payer reference # (the golden key)", required: true }
];

const statusColors = {
  pending: "secondary",
  running: "outline", 
  completed: "default"
} as const;

const statusIcons = {
  pending: Clock,
  running: Clock,
  completed: CheckCircle
};

export default function Eligibility() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<typeof mockEligibilityJobs[0] | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [newJobData, setNewJobData] = useState({
    targetType: "patient",
    targetId: "",
    targetName: "",
    payers: [] as string[],
    notes: ""
  });
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("benefits");
  const [jobs, setJobs] = useState(mockEligibilityJobs);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.payers.some(payer => payer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = () => {
    // In real app, this would make API call
    console.log("Creating eligibility job:", newJobData);
    setShowNewJobDialog(false);
    setNewJobData({
      targetType: "patient",
      targetId: "",
      targetName: "",
      payers: [],
      notes: ""
    });
  };

  const handlePublish = (publishData: PublishData) => {
    // Update the job to mark it as published
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === publishData.jobId 
          ? {
              ...job,
              publishedToEMR: true,
              publishedAt: new Date().toISOString(),
              publishedBy: job.requestedBy // In real app, would be current user
            }
          : job
      )
    );

    // Update selected job if it's the one being published
    if (selectedJob?.id === publishData.jobId) {
      setSelectedJob({
        ...selectedJob,
        publishedToEMR: true,
        publishedAt: new Date().toISOString(),
        publishedBy: selectedJob.requestedBy
      });
    }

    console.log("Publishing to EMR:", publishData);
  };

  return (
    <Layout>
      <div className="flex-1 p-6 space-y-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Eligibility & Benefits</h2>
          <p className="text-muted-foreground mt-1">Manual eligibility verification and benefits checking system</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TooltipProvider>
            <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New E&B Job
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Eligibility & Benefits Job</DialogTitle>
                <DialogDescription>
                  Manual eligibility verification - no auto-run policy
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetType">Target Type</Label>
                    <Select value={newJobData.targetType} onValueChange={(value) => setNewJobData(prev => ({ ...prev, targetType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetId">Target ID</Label>
                    <Input
                      value={newJobData.targetId}
                      onChange={(e) => setNewJobData(prev => ({ ...prev, targetId: e.target.value }))}
                      placeholder="PAT-1234, LEAD-5678, etc."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetName">Patient/Lead Name</Label>
                  <Input
                    value={newJobData.targetName}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, targetName: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payers (Select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Blue Cross Blue Shield", "Aetna", "United Healthcare", "Cigna", "Medicare", "Medicaid"].map(payer => (
                      <div key={payer} className="flex items-center space-x-2">
                        <Checkbox
                          id={payer}
                          checked={newJobData.payers.includes(payer)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewJobData(prev => ({ ...prev, payers: [...prev.payers, payer] }));
                            } else {
                              setNewJobData(prev => ({ ...prev, payers: prev.payers.filter(p => p !== payer) }));
                            }
                          }}
                        />
                        <Label htmlFor={payer} className="text-sm">{payer}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    value={newJobData.notes}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateJob}>Create Job</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </TooltipProvider>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Jobs</CardTitle>
            <CardDescription>
              Manual eligibility verification requests and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Payers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const StatusIcon = statusIcons[job.status];
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-sm">{job.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.targetType === "patient" && <User className="h-4 w-4 text-blue-500" />}
                            {job.targetType === "lead" && <Phone className="h-4 w-4 text-green-500" />}
                            {job.targetType === "referral" && <FileText className="h-4 w-4 text-purple-500" />}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{job.targetName}</span>
                                {job.publishedToEMR && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                          <Upload className="h-3 w-3 mr-1" />
                                          Published
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Published to EMR on {new Date(job.publishedAt!).toLocaleDateString()}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{job.targetId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {job.payers.map(payer => (
                              <Badge key={payer} variant="outline" className="text-xs">
                                {payer}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={statusColors[job.status] as any}>
                              {job.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{job.requestedBy}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                         <TableCell>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => setSelectedJob(job)}
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             {job.status === "completed" && job.recording && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setPlayingRecording(playingRecording === job.id ? null : job.id)}
                               >
                                 {playingRecording === job.id ? <Volume2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                               </Button>
                             )}
                           </div>
                         </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No eligibility jobs found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Modal - Using new EligibilityJobModal component */}
        {selectedJob && (
          <EligibilityJobModal 
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            calculatePatientResponsibility={calculatePatientResponsibility}
            canScheduleToday={canScheduleToday}
            onPublish={handlePublish}
          />
        )}
      </div>
    </Layout>
  );
}