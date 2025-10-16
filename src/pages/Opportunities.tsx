import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Filter, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  User,
  FileText,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Users,
  X,
  Info,
  ChevronDown,
  Shield,
  FileCheck,
  Workflow
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InsuranceDetailsModal } from "@/components/InsuranceDetailsModal";
import { EligibilityVerificationModal } from "@/components/EligibilityVerificationModal";
import { SequenceManagementModal } from "@/components/SequenceManagementModal";
import { useToast } from "@/hooks/use-toast";
import { QuickEditSheet } from "@/components/QuickEditSheet";
import { CreateInEMRButton } from "@/components/CreateInEMRButton";
import { convertOpportunityToReferral } from "@/utils/referral-converters";
import { createProvenanceField } from "@/types/field-provenance";
import type { QuickEditData } from "@/components/QuickEditSheet";
import type { EMRCreationResult } from "@/components/CreateInEMRButton";

interface ActiveSequence {
  id: string;
  sequenceName: string;
  status: "active" | "paused" | "completed" | "failed";
  startedAt: string;
  currentStep: number;
  totalSteps: number;
  context: Record<string, string>;
  lastActivity?: string;
}

interface Lead {
  id: string;
  source: "referral" | "web" | "call" | "fax";
  patientName: string;
  condition: string;
  referrer?: string;
  stage: "unassigned" | "assigned" | "contacted" | "ready_to_schedule" | "scheduled_eval" | "verified_benefits" | "financial_conversation" | "arrived";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  createdAt: string;
  lastActivity?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  networkStatus?: "in-network" | "out-of-network" | "unknown";
  verificationStatus?: "verified" | "needs-verification" | "expired";
  verifiedDate?: string;
  slaStatus: "good" | "warning" | "breach";
  activeSequence?: ActiveSequence;
  // Call-specific data
  callData?: {
    duration: string;
    transcript: { speaker: string; message: string; timestamp: string }[];
    iqSummary: string;
    callPurpose: string;
    callOutcome: string;
    sentiment: string;
    treatmentCategory: string;
  };
  // Web-specific data
  webData?: {
    chatHistory: { sender: string; message: string; timestamp: string }[];
    sourceUrl: string;
    sessionDuration: string;
  };
  // Fax-specific data
  faxData?: {
    faxUrl: string;
    extractedFields: { label: string; value: string }[];
    receivedTime: string;
  };
}

const mockLeads: Lead[] = [
  {
    id: "1",
    source: "referral",
    patientName: "John Smith",
    condition: "Lower back pain",
    referrer: "Dr. Anderson",
    stage: "unassigned",
    priority: "high",
    createdAt: "2024-01-15 09:30",
    phone: "(555) 123-4567",
    insurance: "Blue Cross Blue Shield",
    networkStatus: "in-network",
    verificationStatus: "needs-verification",
    slaStatus: "warning"
  },
  {
    id: "2",
    source: "web",
    patientName: "Sarah Johnson",
    condition: "Knee rehabilitation",
    stage: "assigned",
    priority: "medium",
    assignedTo: "Sarah Wilson",
    createdAt: "2024-01-15 08:45",
    lastActivity: "Called patient",
    phone: "(555) 234-5678",
    email: "sarah.j@email.com",
    insurance: "Aetna",
    networkStatus: "out-of-network",
    verificationStatus: "verified",
    verifiedDate: "2 days ago",
    slaStatus: "good"
  },
  {
    id: "3",
    source: "call",
    patientName: "Mike Davis",
    condition: "Shoulder injury",
    stage: "contacted",
    priority: "urgent",
    assignedTo: "Tom Rogers",
    createdAt: "2024-01-15 07:15",
    lastActivity: "Paperwork sent",
    phone: "(555) 345-6789",
    insurance: "Medicare",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "1 hour ago",
    slaStatus: "good",
    callData: {
      duration: "00:03:45",
      transcript: [
        { speaker: "Agent", message: "Hi, thank you for calling. How can I help you?", timestamp: "00:00" },
        { speaker: "Patient", message: "I need an appointment for my shoulder injury.", timestamp: "00:15" },
        { speaker: "Agent", message: "I can help you with that. Let me check our availability.", timestamp: "00:30" }
      ],
      iqSummary: "Patient called requesting appointment for shoulder injury. Agent confirmed availability and scheduled evaluation.",
      callPurpose: "Appointment Request",
      callOutcome: "Appointment Scheduled",
      sentiment: "Positive",
      treatmentCategory: "Orthopedic"
    }
  },
  {
    id: "4",
    source: "referral",
    patientName: "Emma Wilson",
    condition: "Post-surgical rehab",
    referrer: "Dr. Martinez",
    stage: "ready_to_schedule",
    priority: "high",
    assignedTo: "Lisa Chen",
    createdAt: "2024-01-14 16:20",
    lastActivity: "Insurance verified",
    phone: "(555) 456-7890",
    email: "emma.w@email.com",
    insurance: "UnitedHealth",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "1 day ago",
    slaStatus: "good"
  },
  {
    id: "5",
    source: "web",
    patientName: "Robert Brown",
    condition: "Neck pain",
    stage: "scheduled_eval",
    priority: "medium",
    assignedTo: "Sarah Wilson",
    createdAt: "2024-01-14 14:10",
    lastActivity: "Eval scheduled for Jan 18",
    phone: "(555) 567-8901",
    email: "robert.b@email.com",
    insurance: "Cigna",
    networkStatus: "in-network",
    verificationStatus: "expired",
    verifiedDate: "45 days ago",
    slaStatus: "good"
  },
  // Web leads
  {
    id: "6",
    source: "web",
    patientName: "Jennifer Martinez",
    condition: "Chronic hip pain",
    stage: "unassigned",
    priority: "medium",
    createdAt: "2024-01-15 11:15",
    phone: "(555) 678-9012",
    email: "jen.martinez@email.com",
    insurance: "Kaiser Permanente",
    networkStatus: "out-of-network",
    verificationStatus: "needs-verification",
    slaStatus: "good"
  },
  {
    id: "7",
    source: "web",
    patientName: "David Park",
    condition: "Sports injury - ankle",
    stage: "assigned",
    priority: "high",
    assignedTo: "Mike Thompson",
    createdAt: "2024-01-15 10:30",
    lastActivity: "Initial contact made",
    phone: "(555) 789-0123",
    email: "david.park@email.com",
    insurance: "Blue Cross Blue Shield",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "3 hours ago",
    slaStatus: "good"
  },
  {
    id: "8",
    source: "web",
    patientName: "Lisa Chen",
    condition: "Carpal tunnel syndrome",
    stage: "contacted",
    priority: "medium",
    assignedTo: "Sarah Wilson",
    createdAt: "2024-01-14 15:45",
    lastActivity: "Forms sent via email",
    phone: "(555) 890-1234",
    email: "lisa.chen@email.com",
    insurance: "Aetna",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "12 hours ago",
    slaStatus: "good",
    webData: {
      chatHistory: [
        { sender: "Bot", message: "Hi! How can I help you today?", timestamp: "14:30" },
        { sender: "Patient", message: "I'm having issues with my wrist", timestamp: "14:31" },
        { sender: "Bot", message: "I can help you schedule an evaluation. What's your name?", timestamp: "14:31" },
        { sender: "Patient", message: "Lisa Chen", timestamp: "14:32" }
      ],
      sourceUrl: "https://website.com/contact",
      sessionDuration: "8 minutes"
    }
  },
  // Call leads
  {
    id: "9",
    source: "call",
    patientName: "James Rodriguez",
    condition: "Post-operative knee rehab",
    stage: "ready_to_schedule",
    priority: "urgent",
    assignedTo: "Tom Rogers",
    createdAt: "2024-01-15 13:20",
    lastActivity: "Insurance approved",
    phone: "(555) 901-2345",
    insurance: "UnitedHealth",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "30 mins ago",
    slaStatus: "good"
  },
  {
    id: "10",
    source: "call",
    patientName: "Amy Thompson",
    condition: "Sciatica treatment",
    stage: "assigned",
    priority: "high",
    assignedTo: "Lisa Chen",
    createdAt: "2024-01-15 12:10",
    lastActivity: "Scheduled callback",
    phone: "(555) 012-3456",
    insurance: "Medicare",
    slaStatus: "warning"
  },
  {
    id: "11",
    source: "call",
    patientName: "Kevin Wu",
    condition: "Wrist fracture recovery",
    stage: "verified_benefits",
    priority: "medium",
    assignedTo: "Mike Thompson",
    createdAt: "2024-01-14 17:30",
    lastActivity: "Benefits verified",
    phone: "(555) 234-5678",
    insurance: "Cigna",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "1 day ago",
    slaStatus: "good"
  },
  {
    id: "14",
    source: "referral",
    patientName: "Patricia Lee",
    condition: "Hip replacement rehab",
    referrer: "Dr. Smith",
    stage: "financial_conversation",
    priority: "medium",
    assignedTo: "Lisa Chen",
    createdAt: "2024-01-13 11:00",
    lastActivity: "Financial discussion completed",
    phone: "(555) 111-2222",
    insurance: "Medicare",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "2 days ago",
    slaStatus: "good"
  },
  {
    id: "15",
    source: "web",
    patientName: "Thomas Anderson",
    condition: "Sports injury",
    stage: "arrived",
    priority: "high",
    assignedTo: "Sarah Wilson",
    createdAt: "2024-01-12 09:30",
    lastActivity: "Checked in for eval",
    phone: "(555) 333-4444",
    email: "t.anderson@email.com",
    insurance: "Blue Cross Blue Shield",
    networkStatus: "in-network",
    verificationStatus: "verified",
    verifiedDate: "5 days ago",
    slaStatus: "good"
  },
  {
    id: "12",
    source: "call",
    patientName: "Maria Gonzalez",
    condition: "Lower back strain",
    stage: "contacted",
    priority: "medium",
    assignedTo: "Sarah Wilson",
    createdAt: "2024-01-14 09:15",
    lastActivity: "Initial assessment completed",
    phone: "(555) 345-6789",
    insurance: "Blue Cross Blue Shield",
    slaStatus: "good"
  },
  // Add a fax lead example
  {
    id: "13",
    source: "fax",
    patientName: "Dr. Susan Williams",
    condition: "Physical therapy referral",
    referrer: "Dr. Thompson",
    stage: "unassigned",
    priority: "high",
    createdAt: "2024-01-15 14:20",
    phone: "(555) 456-7890",
    insurance: "Blue Cross Blue Shield",
    slaStatus: "good",
    faxData: {
      faxUrl: "/fax/referral-001.pdf",
      receivedTime: "2024-01-15 14:20",
      extractedFields: [
        { label: "Patient Name", value: "Dr. Susan Williams" },
        { label: "Referring Physician", value: "Dr. Thompson" },
        { label: "Diagnosis", value: "Post-surgical rehabilitation" },
        { label: "Insurance", value: "Blue Cross Blue Shield" },
        { label: "Urgency", value: "High Priority" },
        { label: "Requested Services", value: "Physical Therapy Evaluation" }
      ]
    }
  }
];

// Using centralized sequence configuration from /config/sequences.ts

const stages = [
  { key: "unassigned", label: "Unassigned", color: "bg-muted" },
  { key: "assigned", label: "Assigned", color: "bg-blue-500/10" },
  { key: "contacted", label: "Contacted", color: "bg-purple-500/10" },
  { key: "ready_to_schedule", label: "Ready to Schedule", color: "bg-amber-500/10" },
  { key: "scheduled_eval", label: "Scheduled Eval", color: "bg-cyan-500/10" },
  { key: "verified_benefits", label: "Verified Benefits", color: "bg-emerald-500/10" },
  { key: "financial_conversation", label: "Financial Conversation Done", color: "bg-teal-500/10" },
  { key: "arrived", label: "Arrived for Appointment", color: "bg-success/10" }
];

function LeadCard({ lead, onStageChange, onCardClick, onRunEligibility, onManageSequences, onQuickEdit }: { 
  lead: Lead; 
  onStageChange: (leadId: string, newStage: string) => void;
  onCardClick: (lead: Lead) => void;
  onRunEligibility: (lead: Lead) => void;
  onManageSequences: (lead: Lead) => void;
  onQuickEdit: (lead: Lead) => void;
}) {
  const getSourceIcon = () => {
    switch (lead.source) {
      case "referral":
        return <FileText className="h-4 w-4" />;
      case "web":
        return <Globe className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (lead.priority) {
      case "urgent":
        return "bg-urgent text-urgent-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSLAColor = () => {
    switch (lead.slaStatus) {
      case "breach":
        return "text-urgent";
      case "warning":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  return (
    <Card className="w-full mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log("LeadCard clicked:", lead.id);
      onCardClick(lead);
    }}>
      <CardContent className="p-4">
        {/* Header with Source Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {getSourceIcon()}
            <Badge variant="outline" className="text-xs">
              {lead.source.toUpperCase()}
            </Badge>
            {lead.source === "call" && lead.callData && (
              <Badge variant="outline" className="text-xs bg-primary/10">
                {lead.callData.duration}
              </Badge>
            )}
            {lead.source === "web" && lead.webData && (
              <Badge variant="outline" className="text-xs bg-secondary/10">
                Chat
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{lead.createdAt}</span>
        </div>

        {/* Patient Info */}
        <h4 className="font-semibold text-foreground mb-1">{lead.patientName}</h4>
        <p className="text-sm text-muted-foreground mb-3">{lead.condition}</p>
        
        {/* Contact & Clinical Info */}
        <div className="space-y-2 mb-3">
          {lead.referrer && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
              {lead.referrer}
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="h-3 w-3 mr-1.5 flex-shrink-0" />
              {lead.phone}
            </div>
          )}
          
          {/* Insurance Section */}
          {lead.insurance && (
            <div className="pt-1 border-t">
              <div className="flex items-center justify-between text-xs mt-2">
                <div className="flex items-center text-muted-foreground">
                  <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="font-medium">{lead.insurance}</span>
                </div>
                {lead.networkStatus && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ml-2 ${
                      lead.networkStatus === "in-network" 
                        ? "bg-success/10 text-success border-success/20" 
                        : lead.networkStatus === "out-of-network"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {lead.networkStatus === "in-network" ? "In-Network" : 
                     lead.networkStatus === "out-of-network" ? "Out-of-Network" : "Unknown"}
                  </Badge>
                )}
              </div>
              {lead.verificationStatus && (
                <div className="flex items-center gap-1.5 text-xs mt-1.5 ml-5">
                  {lead.verificationStatus === "verified" && (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="text-success">Verified {lead.verifiedDate}</span>
                    </>
                  )}
                  {lead.verificationStatus === "needs-verification" && (
                    <>
                      <AlertCircle className="h-3 w-3 text-warning flex-shrink-0" />
                      <span className="text-warning">Needs Verification</span>
                    </>
                  )}
                  {lead.verificationStatus === "expired" && (
                    <>
                      <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                      <span className="text-destructive">Re-verify (verified {lead.verifiedDate})</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        {(lead.activeSequence || lead.assignedTo) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {lead.activeSequence && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                <Workflow className="h-2.5 w-2.5 mr-1" />
                {lead.activeSequence.sequenceName}
              </Badge>
            )}
            {lead.assignedTo && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                <Users className="h-2.5 w-2.5 mr-1" />
                {lead.assignedTo}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons - Clean Single Row */}
        <div className="flex gap-1.5 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onManageSequences(lead);
            }}
          >
            <Workflow className="h-3.5 w-3.5 mr-1" />
            Sequences
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onRunEligibility(lead);
            }}
          >
            Run E&B
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs px-2"
            onClick={(e) => {
              e.stopPropagation();
              onQuickEdit(lead);
            }}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, leads, onStageChange, onCardClick, onRunEligibility, onManageSequences, onQuickEdit }: { 
  stage: typeof stages[0]; 
  leads: Lead[]; 
  onStageChange: (leadId: string, newStage: string) => void;
  onCardClick: (lead: Lead) => void;
  onRunEligibility: (lead: Lead) => void;
  onManageSequences: (lead: Lead) => void;
  onQuickEdit: (lead: Lead) => void;
}) {
  const stageLeads = leads.filter(lead => lead.stage === stage.key);

  return (
    <div className="w-80 min-w-80 bg-accent/30 rounded-lg p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{stage.label}</h3>
          <Badge variant="outline" className="text-xs">
            {stageLeads.length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 h-[600px] overflow-y-auto">
        {stageLeads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onStageChange={onStageChange} 
            onCardClick={onCardClick} 
            onRunEligibility={onRunEligibility}
            onManageSequences={onManageSequences}
            onQuickEdit={onQuickEdit}
          />
        ))}
        {stageLeads.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export default function Opportunities() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isVerificationConfirmOpen, setIsVerificationConfirmOpen] = useState(false);
  const [leadForInsurance, setLeadForInsurance] = useState<Lead | null>(null);
  const [leadForEligibility, setLeadForEligibility] = useState<Lead | null>(null);
  const [pendingVerificationLead, setPendingVerificationLead] = useState<Lead | null>(null);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [selectedLeadForSequence, setSelectedLeadForSequence] = useState<Lead | null>(null);

  // Auto-open lead profile if ID is in URL
  useEffect(() => {
    const leadId = searchParams.get('id');
    if (leadId) {
      const lead = mockLeads.find(l => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
        setIsDrawerOpen(true);
      }
    }
  }, [searchParams]);

  const handleStageChange = (leadId: string, newStage: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage as Lead["stage"] } : lead
    ));
  };

  const handleCardClick = (lead: Lead) => {
    console.log("Card clicked:", lead.id, lead.patientName, lead.source);
    setSelectedLead(lead);
    setIsDrawerOpen(true);
    console.log("Drawer state set to true");
  };

  const handleRunEligibility = (lead: Lead) => {
    // Check if recently verified
    if (lead.verificationStatus === "verified") {
      setPendingVerificationLead(lead);
      setIsVerificationConfirmOpen(true);
    } else {
      setLeadForEligibility(lead);
      setIsEligibilityModalOpen(true);
    }
  };

  const handleConfirmReVerification = () => {
    if (pendingVerificationLead) {
      setLeadForEligibility(pendingVerificationLead);
      setIsEligibilityModalOpen(true);
      setIsVerificationConfirmOpen(false);
      setPendingVerificationLead(null);
    }
  };

  const handleCancelReVerification = () => {
    setIsVerificationConfirmOpen(false);
    setPendingVerificationLead(null);
  };

  const handleEligibilitySubmit = (data: any) => {
    console.log("Eligibility verification submitted:", data);
    toast({
      title: "Verification Started",
      description: `Running ${data.verificationMethod} verification for ${data.patientName}`,
    });
  };

  const handleInsuranceSubmit = async (data: any) => {
    if (!leadForInsurance) return;
    
    // Update the lead with insurance information
    setLeads(prev => prev.map(lead => 
      lead.id === leadForInsurance.id 
        ? { ...lead, insurance: data.insuranceProvider }
        : lead
    ));

    // Run E&B with the provided information
    toast({
      title: "E&B Check Started",
      description: `Running eligibility check for ${leadForInsurance.patientName} with ${data.insuranceProvider}`,
    });
    
    // Here you would implement the actual E&B API call with the insurance data
    console.log("Running E&B with insurance data:", data);
    
    setIsInsuranceModalOpen(false);
    setLeadForInsurance(null);
  };

  const handleManageSequences = (lead: Lead) => {
    setSelectedLeadForSequence(lead);
    setIsSequenceModalOpen(true);
  };

  const handleQuickEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsQuickEditOpen(true);
  };

  const handleSaveQuickEdit = (data: QuickEditData) => {
    // Update the lead with edited data
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === editingLead?.id 
        ? {
            ...lead,
            patientName: data.patientName.value,
            condition: data.condition.value,
            phone: data.phone?.value,
            email: data.email?.value,
            insurance: data.insurance?.value,
            priority: data.priority,
            assignedTo: data.assignedTo,
            stage: data.stage,
          }
        : lead
    ));
    setIsQuickEditOpen(false);
    setEditingLead(null);
    toast({
      title: "Updated!",
      description: "Opportunity card updated successfully.",
    });
  };

  const handleStartSequence = (sequence: import("@/config/sequences").SequenceConfig, contextData?: Record<string, any>) => {
    if (!selectedLeadForSequence) return;

    const newSequence: ActiveSequence = {
      id: `seq-${Date.now()}`,
      sequenceName: sequence.name,
      status: "active",
      startedAt: new Date().toLocaleDateString(),
      currentStep: 1,
      totalSteps: 5, // Mock value
      context: contextData || {},
    };

    // Phase 1: Simple conflict - pause existing sequence if any
    setLeads(prev => prev.map(lead => {
      if (lead.id === selectedLeadForSequence.id) {
        // If there's an existing sequence, mark it as paused
        const updatedLead = { ...lead };
        if (lead.activeSequence) {
          // In Phase 1, we just replace it
          toast({
            title: "Previous Sequence Paused",
            description: `"${lead.activeSequence.sequenceName}" was paused to start "${sequenceName}"`,
            variant: "default",
          });
        }
        updatedLead.activeSequence = newSequence;
        return updatedLead;
      }
      return lead;
    }));

    toast({
      title: "Sequence Started",
      description: `"${sequenceName}" has been started for ${selectedLeadForSequence.patientName}`,
    });

    setIsSequenceModalOpen(false);
  };

  const handlePauseSequence = (sequenceId: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.activeSequence?.id === sequenceId) {
        return {
          ...lead,
          activeSequence: { ...lead.activeSequence, status: "paused" as const }
        };
      }
      return lead;
    }));

    toast({
      title: "Sequence Paused",
      description: "The sequence has been paused",
    });
  };

  const handleResumeSequence = (sequenceId: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.activeSequence?.id === sequenceId) {
        return {
          ...lead,
          activeSequence: { ...lead.activeSequence, status: "active" as const }
        };
      }
      return lead;
    }));

    toast({
      title: "Sequence Resumed",
      description: "The sequence has been resumed",
    });
  };

  const handleCancelSequence = (sequenceId: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.activeSequence?.id === sequenceId) {
        const { activeSequence, ...leadWithoutSequence } = lead;
        return leadWithoutSequence;
      }
      return lead;
    }));

    toast({
      title: "Sequence Cancelled",
      description: "The sequence has been cancelled",
      variant: "destructive",
    });

    setIsSequenceModalOpen(false);
  };

  const handleRequirePA = (lead: Lead) => {
    // Store the lead data in localStorage to pass to PA board
    const paData = {
      fromLead: true,
      leadId: lead.id,
      patientName: lead.patientName,
      patientId: lead.id.replace('L', 'PAT'),
      phone: lead.phone,
      insurance: lead.insurance,
      condition: lead.condition,
      priority: lead.priority === "urgent" ? "urgent" : lead.priority === "high" ? "urgent" : "routine",
      serviceType: "Physical Therapy", // Default, can be customized
      referrer: lead.referrer
    };
    
    localStorage.setItem('newPARequest', JSON.stringify(paData));
    
    toast({
      title: "PA Required",
      description: `Creating PA request for ${lead.patientName}. Redirecting to PA Board...`,
    });
    
    // Navigate to PA board after a short delay
    setTimeout(() => {
      navigate('/pa-tracker?action=create');
    }, 1000);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <Layout>
      <div className="flex-1 p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Opportunities Board</h2>
            <p className="text-muted-foreground mt-1">Manage leads from all sources</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="call">Call</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[650px] w-full">
          {stages.map(stage => (
            <StageColumn 
              key={stage.key} 
              stage={stage} 
              leads={filteredLeads} 
              onStageChange={handleStageChange}
              onCardClick={handleCardClick}
              onRunEligibility={handleRunEligibility}
              onManageSequences={handleManageSequences}
              onQuickEdit={handleQuickEdit}
            />
          ))}
        </div>

        {/* Patient Details Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-w-md ml-auto h-full">
            <DrawerHeader className="flex items-center justify-between border-b p-4">
              <DrawerTitle className="text-lg font-semibold">Patient Details</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            
            {selectedLead && (
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Header Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {selectedLead.source === "referral" && <FileText className="h-5 w-5" />}
                    {selectedLead.source === "web" && <Globe className="h-5 w-5" />}
                    {selectedLead.source === "call" && <Phone className="h-5 w-5" />}
                    {selectedLead.source === "fax" && <FileText className="h-5 w-5" />}
                    <Badge variant="outline" className={`
                      ${selectedLead.priority === "urgent" ? "bg-urgent text-urgent-foreground" : ""}
                      ${selectedLead.priority === "high" ? "bg-warning text-warning-foreground" : ""}
                      ${selectedLead.priority === "medium" ? "bg-secondary text-secondary-foreground" : ""}
                      ${selectedLead.priority === "low" ? "bg-muted text-muted-foreground" : ""}
                    `}>
                      {selectedLead.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {selectedLead.source.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedLead.patientName}</h3>
                    <p className="text-muted-foreground mt-1">{selectedLead.condition}</p>
                  </div>

                  {selectedLead.referrer && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      Referred by {selectedLead.referrer}
                    </div>
                  )}
                </div>

                {/* Source-Specific Content */}
                {selectedLead.source === "call" && selectedLead.callData && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Call Details</h4>
                    
                    {/* Call Summary */}
                    <div className="bg-primary/5 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">IQ Summary</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedLead.callData.iqSummary}</p>
                    </div>

                    {/* Call Insights */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Call Purpose</span>
                        <p className="text-sm">{selectedLead.callData.callPurpose}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Call Outcome</span>
                        <p className="text-sm">{selectedLead.callData.callOutcome}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Sentiment</span>
                        <p className="text-sm">{selectedLead.callData.sentiment}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Treatment Category</span>
                        <p className="text-sm">{selectedLead.callData.treatmentCategory}</p>
                      </div>
                    </div>

                    {/* Transcript Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Transcript</h5>
                        <Button variant="outline" size="sm">View Full Call Path</Button>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2 max-h-32 overflow-y-auto">
                        {selectedLead.callData.transcript.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-primary">{item.speaker}:</span>
                            <span className="ml-2 text-muted-foreground">{item.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLead.source === "web" && selectedLead.webData && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Web Lead Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Source URL</span>
                        <p className="text-sm">{selectedLead.webData.sourceUrl}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Session Duration</span>
                        <p className="text-sm">{selectedLead.webData.sessionDuration}</p>
                      </div>
                    </div>

                    {/* Chat History */}
                    <div className="space-y-3">
                      <h5 className="font-medium">Chatbot Conversation</h5>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-3 max-h-48 overflow-y-auto">
                        {selectedLead.webData.chatHistory.map((message, index) => (
                          <div key={index} className={`flex ${message.sender === 'Patient' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.sender === 'Patient' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              <div className="font-medium text-xs mb-1">{message.sender}</div>
                              <div>{message.message}</div>
                              <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLead.source === "fax" && selectedLead.faxData && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Fax Details</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Received: {selectedLead.faxData.receivedTime}</span>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Fax
                        </Button>
                      </div>
                    </div>

                    {/* Extracted Fields */}
                    <div className="space-y-3">
                      <h5 className="font-medium">Extracted Information</h5>
                      <div className="grid gap-3">
                        {selectedLead.faxData.extractedFields.map((field, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm font-medium text-muted-foreground">{field.label}</span>
                            <span className="text-sm">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.email}</span>
                    </div>
                  )}
                </div>

                {/* Insurance */}
                {selectedLead.insurance && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Insurance</h4>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.insurance}</span>
                    </div>
                  </div>
                )}

                {/* Assignment */}
                {selectedLead.assignedTo && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Assignment</h4>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assigned to {selectedLead.assignedTo}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Timeline</h4>
                  <div className="space-y-3">
                    {/* Mock activity timeline */}
                    <div className="relative border-l-2 border-border pl-4 pb-4 space-y-4">
                      {/* E&B Job - Completed */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-success border-2 border-background"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-success">E&B Verification Complete</span>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Eligibility verification completed. Coverage confirmed.</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">View Details</Button>
                        </div>
                      </div>

                      {/* Call */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">Outbound Call</span>
                            <span className="text-xs text-muted-foreground">Yesterday</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Spoke with patient about scheduling. Positive sentiment.</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">Listen to Recording</Button>
                        </div>
                      </div>

                      {/* E&B Job - In Progress */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-warning border-2 border-background animate-pulse"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-warning">E&B Verification In Progress</span>
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Eligibility verification initiated. Waiting for payer response.</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">View Status</Button>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-secondary border-2 border-background"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">SMS Sent</span>
                            <span className="text-xs text-muted-foreground">3 days ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Appointment reminder sent. Delivered.</p>
                        </div>
                      </div>

                      {/* Forms */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">Forms Sent</span>
                            <span className="text-xs text-muted-foreground">4 days ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Patient intake forms sent via email.</p>
                        </div>
                      </div>

                      {/* Created */}
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-muted-foreground border-2 border-background"></div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">Lead Created</span>
                            <span className="text-xs text-muted-foreground">{selectedLead.createdAt}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Initial contact from {selectedLead.source}.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SLA Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">SLA Status</h4>
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${
                      selectedLead.slaStatus === "breach" ? "text-urgent" :
                      selectedLead.slaStatus === "warning" ? "text-warning" : "text-success"
                    }`} />
                    <Badge variant="outline" className={`
                      ${selectedLead.slaStatus === "breach" ? "text-urgent border-urgent" : ""}
                      ${selectedLead.slaStatus === "warning" ? "text-warning border-warning" : ""}
                      ${selectedLead.slaStatus === "good" ? "text-success border-success" : ""}
                    `}>
                      {selectedLead.slaStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  <CreateInEMRButton
                    referral={convertOpportunityToReferral(selectedLead)}
                    onSuccess={(result: EMRCreationResult) => {
                      toast({
                        title: "Success!",
                        description: `Created in EMR: MRN ${result.patientMRN}${result.episodeId ? `, Episode ${result.episodeId}` : ''}`,
                      });
                      // Update lead to mark as created in EMR
                      setLeads(prevLeads => prevLeads.map(lead => 
                        lead.id === selectedLead.id 
                          ? { ...lead, emrMRN: result.patientMRN, emrEpisodeId: result.episodeId }
                          : lead
                      ));
                    }}
                    className="w-full"
                  />
                  <Button 
                    className="w-full"
                    onClick={() => handleRunEligibility(selectedLead)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Run E&B Check
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                    onClick={() => handleRequirePA(selectedLead)}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Require Prior Auth
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      handleManageSequences(selectedLead);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Add to Sequence
                  </Button>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>

        {/* Re-verification Confirmation Dialog */}
        <AlertDialog open={isVerificationConfirmOpen} onOpenChange={setIsVerificationConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Insurance Already Verified</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This patient's insurance was recently verified{" "}
                  {pendingVerificationLead?.verifiedDate && (
                    <span className="font-semibold text-success">
                      {pendingVerificationLead.verifiedDate}
                    </span>
                  )}.
                </p>
                <p>
                  Running a new verification may incur additional costs. Are you sure you want to proceed?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelReVerification}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmReVerification}>
                Yes, Run Verification
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Insurance Details Modal */}
        <InsuranceDetailsModal
          isOpen={isInsuranceModalOpen}
          onClose={() => {
            setIsInsuranceModalOpen(false);
            setLeadForInsurance(null);
          }}
          patientName={leadForInsurance?.patientName || ""}
          onSubmit={handleInsuranceSubmit}
        />

        {/* Eligibility Verification Modal */}
        <EligibilityVerificationModal
          open={isEligibilityModalOpen}
          onOpenChange={setIsEligibilityModalOpen}
          lead={leadForEligibility}
          onSubmit={handleEligibilitySubmit}
        />

        {/* Sequence Management Modal */}
        <SequenceManagementModal
          isOpen={isSequenceModalOpen}
          onClose={() => setIsSequenceModalOpen(false)}
          onStartSequence={handleStartSequence}
          activeSequences={selectedLeadForSequence?.activeSequence ? [
            {
              sequenceId: selectedLeadForSequence.activeSequence.id,
              sequenceName: selectedLeadForSequence.activeSequence.sequenceName,
              enrolledDate: selectedLeadForSequence.activeSequence.startedAt,
              currentStep: selectedLeadForSequence.activeSequence.currentStep,
              totalSteps: selectedLeadForSequence.activeSequence.totalSteps,
              status: selectedLeadForSequence.activeSequence.status,
              nextAction: selectedLeadForSequence.activeSequence.nextAction,
              nextActionDate: selectedLeadForSequence.activeSequence.nextActionDate,
            }
          ] : []}
          patientName={selectedLeadForSequence?.patientName}
          entityType="lead"
        />

        {/* Quick Edit Sheet */}
        {editingLead && (
          <QuickEditSheet
            isOpen={isQuickEditOpen}
            onClose={() => {
              setIsQuickEditOpen(false);
              setEditingLead(null);
            }}
            onSave={handleSaveQuickEdit}
            data={{
              patientName: createProvenanceField(editingLead.patientName, 'user_input'),
              condition: createProvenanceField(editingLead.condition, 'user_input'),
              referrer: editingLead.referrer ? createProvenanceField(editingLead.referrer, 'user_input') : undefined,
              phone: editingLead.phone ? createProvenanceField(editingLead.phone, 'user_input') : undefined,
              email: editingLead.email ? createProvenanceField(editingLead.email, 'user_input') : undefined,
              insurance: editingLead.insurance ? createProvenanceField(editingLead.insurance, 'user_input') : undefined,
              insuranceStatus: editingLead.verificationStatus === 'verified' ? 'verified' : 'not_verified',
              priority: editingLead.priority,
              assignedTo: editingLead.assignedTo,
              stage: editingLead.stage,
            }}
            opportunityId={editingLead.id}
          />
        )}
      </div>
    </Layout>
  );
}