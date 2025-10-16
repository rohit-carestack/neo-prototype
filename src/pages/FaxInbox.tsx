import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useFaxLines } from "@/contexts/FaxLineContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Users,
  ArrowUp,
  ArrowDown,
  Send,
  Upload,
  Calendar,
  MoreHorizontal,
  UserPlus,
  Building2,
  Phone,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  User,
  Shield,
  MessageSquare,
  Workflow,
  Clipboard,
  CheckSquare,
  Clock,
  Plus,
  Sparkles,
  MapPin
} from "lucide-react";
import { AddToBoardModal, createOpportunityFromFax } from "@/components/AddToBoardModal";
import { CreateInEMRButton } from "@/components/CreateInEMRButton";
import { convertFaxToReferral } from "@/utils/referral-converters";
import type { EMRCreationResult } from "@/components/CreateInEMRButton";
import { SequenceManagementModal } from "@/components/SequenceManagementModal";
import type { ActiveSequence, SequenceConfig } from "@/config/sequences";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Interface for tracking AI extraction sources
interface FieldSource {
  page: number;
  confidence?: number;
  extractedBy: 'AI' | 'Manual';
}

interface FaxDocument {
  id: string;
  fileName: string;
  sender?: string;
  senderNumber: string;
  recipient?: string;
  receiverNumber?: string;
  patientName?: string;
  direction: "inbound" | "outbound";
  category: "Referral" | "Insurance" | "Clinical" | "Plan of Care" | "Others";
  status: "read" | "unread";
  boardStatus?: "opportunity" | "todo" | null;
  boardAssignedAgent?: string;
  receivedAt?: string;
  sentAt?: string;
  pages: number;
  faxNumber?: string;
  urgency?: "low" | "medium" | "high" | "urgent";
  summary?: string;
  
  // Fax line information
  faxLineId?: string;
  faxLineName?: string;
  faxLineLocation?: string;
  
  // Referral-specific metadata
  referralId?: string;
  referralStatus?: "Authorized" | "Pending" | "Denied" | "Approved";
  referralCreatedDate?: string;
  orderText?: string;
  dob?: string;
  phonePrimary?: string;
  primaryInsurance?: {
    company: string;
    memberId: string;
    groupNumber?: string;
  };
  secondaryInsurance?: {
    company: string;
    memberId: string;
    groupNumber?: string;
  };
  networkStatus?: "IN" | "OON" | "Unknown";
  authExpirationDate?: string;
  visitsAuthorized?: number;
  diagnosisCodes?: string[];
  diagnosisDescriptions?: string[];
  providerName?: string;
  providerOrg?: string;
  
  // Patient status
  patientStatus?: "new" | "existing" | "unknown";
  existingPatientMRN?: string; // If existing patient, their MRN
  
  // AI extraction source tracking
  sources?: {
    patientName?: FieldSource;
    dob?: FieldSource;
    phonePrimary?: FieldSource;
    primaryInsurance?: FieldSource;
    secondaryInsurance?: FieldSource;
    networkStatus?: FieldSource;
    authExpirationDate?: FieldSource;
    visitsAuthorized?: FieldSource;
    providerName?: FieldSource;
    referralStatus?: FieldSource;
    orderText?: FieldSource;
    diagnosisCodes?: FieldSource;
  };
}

const agents = [
  "Sarah Wilson",
  "Michael Chen", 
  "Lisa Johnson",
  "Amanda Rodriguez",
  "James Thompson"
];

const mockFaxes: FaxDocument[] = [
  {
    id: "1",
    fileName: "fax_20240115_093012.pdf",
    sender: "Orthopedic Associates",
    senderNumber: "(555) 100-0001",
    patientName: "John Smith",
    direction: "inbound",
    category: "Referral",
    status: "unread",
    receivedAt: "2024-01-15 09:30",
    pages: 3,
    faxNumber: "(555) 100-0001",
    faxLineId: "1",
    faxLineName: "Hartford Main Line",
    faxLineLocation: "ETS Hartford",
    summary: "PT evaluation and treatment for lower back pain. BCBS primary, Medicare Part B secondary. 18 visits authorized through Apr 2024.",
    referralId: "REF123",
    referralStatus: "Pending",
    referralCreatedDate: "2024-01-15",
    orderText: "Physical therapy evaluation and treatment for lower back pain, 3x per week for 6 weeks",
    dob: "1985-03-20",
    phonePrimary: "(555) 987-6543",
    primaryInsurance: {
      company: "Blue Cross Blue Shield",
      memberId: "ABC123456789",
      groupNumber: "GRP001"
    },
    secondaryInsurance: {
      company: "Medicare Part B",
      memberId: "1234567890A",
      groupNumber: "MED002"
    },
    networkStatus: "IN",
    authExpirationDate: "2024-04-15",
    visitsAuthorized: undefined, // AI couldn't extract this
    diagnosisCodes: ["M54.5", "M25.50"],
    diagnosisDescriptions: ["Low back pain", "Pain in unspecified joint"],
    providerName: "Dr. Sarah Johnson",
    providerOrg: "Orthopedic Associates",
    patientStatus: "existing",
    existingPatientMRN: "MRN12345",
    sources: {
      patientName: { page: 1, confidence: 0.98, extractedBy: 'AI' },
      dob: { page: 1, confidence: 0.95, extractedBy: 'AI' },
      phonePrimary: { page: 1, confidence: 0.92, extractedBy: 'AI' },
      primaryInsurance: { page: 1, confidence: 0.96, extractedBy: 'AI' },
      secondaryInsurance: { page: 1, confidence: 0.94, extractedBy: 'AI' },
      networkStatus: { page: 1, confidence: 0.89, extractedBy: 'AI' },
      authExpirationDate: { page: 2, confidence: 0.97, extractedBy: 'AI' },
      visitsAuthorized: { page: 0, confidence: 0, extractedBy: 'Manual' }, // AI couldn't extract this
      providerName: { page: 1, confidence: 0.99, extractedBy: 'AI' },
      referralStatus: { page: 2, confidence: 0.91, extractedBy: 'AI' },
      orderText: { page: 2, confidence: 0.94, extractedBy: 'AI' },
      diagnosisCodes: { page: 2, confidence: 0.96, extractedBy: 'AI' }
    }
  },
  {
    id: "2",
    fileName: "fax_20240115_084523.pdf",
    senderNumber: "(555) 999-0001",
    recipient: "Blue Cross Blue Shield",
    receiverNumber: "(555) 800-1234",
    direction: "outbound",
    category: "Insurance",
    status: "read",
    assignedTo: "Sarah Wilson",
    sentAt: "2024-01-15 08:45",
    pages: 2,
    summary: "Insurance verification request sent to BCBS for patient eligibility and benefits confirmation."
  },
  {
    id: "3",
    fileName: "fax_20240115_071245.pdf",
    sender: "Sports Medicine Center",
    senderNumber: "(555) 100-0001",
    patientName: "Sarah Johnson",
    direction: "inbound",
    category: "Referral",
    status: "unread",
    assignedTo: "Michael Chen",
    receivedAt: "2024-01-15 07:12",
    pages: 4,
    faxNumber: "(555) 100-0001",
    faxLineId: "1",
    faxLineName: "Hartford Main Line",
    faxLineLocation: "ETS Hartford",
    summary: "ACL reconstruction rehab referral, 2x/week for 12 weeks. Aetna IN network. 24 visits authorized through Jul 2024.",
    referralId: "REF124",
    referralStatus: "Authorized",
    referralCreatedDate: "2024-01-14",
    orderText: "ACL reconstruction rehabilitation, 2x per week for 12 weeks, progressive strengthening protocol",
    dob: "1992-07-14",
    phonePrimary: "(555) 456-7890",
    primaryInsurance: {
      company: "Aetna",
      memberId: "AET987654321",
      groupNumber: "CORP500"
    },
    networkStatus: "IN",
    authExpirationDate: "2024-07-14",
    visitsAuthorized: 24,
    diagnosisCodes: ["S83.511A", "Z47.1"],
    diagnosisDescriptions: ["Sprain of anterior cruciate ligament of right knee, initial encounter", "Aftercare following joint replacement surgery"],
    providerName: "Dr. Michael Chen",
    providerOrg: "Sports Medicine Center",
    patientStatus: "new"
  },
  {
    id: "4",
    fileName: "fax_20240114_162034.pdf",
    senderNumber: "(555) 999-0001",
    recipient: "Medicare",
    receiverNumber: "(555) 800-5678",
    direction: "outbound",
    category: "Plan of Care",
    status: "read",
    boardStatus: "todo",
    boardAssignedAgent: "Lisa Johnson",
    sentAt: "2024-01-14 16:20",
    pages: 1,
    summary: "Plan of Care sent to Medicare for certification approval."
  },
  {
    id: "5",
    fileName: "fax_20240114_143018.pdf",
    sender: "Neurological Associates",
    senderNumber: "(555) 100-0002",
    patientName: "Mary Wilson",
    direction: "inbound",
    category: "Referral",
    status: "unread",
    receivedAt: "2024-01-14 14:30",
    pages: 2,
    faxNumber: "(555) 100-0002",
    faxLineId: "2",
    faxLineName: "Hartford Referrals",
    faxLineLocation: "ETS Hartford",
    summary: "Post-stroke PT referral, 3x/week for 8 weeks. Focus on gait training and balance. Medicare + Humana. 24 visits authorized.",
    referralId: "REF125",
    referralStatus: "Pending",
    referralCreatedDate: "2024-01-14",
    orderText: "Physical therapy for post-stroke rehabilitation, 3x per week for 8 weeks, focus on gait training and balance",
    dob: "1958-11-03",
    phonePrimary: "(555) 654-3210",
    primaryInsurance: {
      company: "Medicare Part B",
      memberId: "5678901234B",
      groupNumber: "MED003"
    },
    secondaryInsurance: {
      company: "Humana Medicare Supplement",
      memberId: "HUM123456",
      groupNumber: "SUP789"
    },
    networkStatus: "IN",
    authExpirationDate: "2024-05-14",
    visitsAuthorized: 24,
    diagnosisCodes: ["I69.354", "R26.81"],
    diagnosisDescriptions: ["Hemiplegia and hemiparesis following cerebral infarction affecting left non-dominant side", "Unsteadiness on feet"],
    providerName: "Dr. Lisa Rodriguez",
    providerOrg: "Neurological Associates"
  },
  {
    id: "6",
    fileName: "fax_20240114_101532.pdf",
    sender: "Regional Medical Center",
    senderNumber: "(555) 456-7890",
    patientName: "Robert Davis",
    direction: "inbound",
    category: "Clinical",
    status: "read",
    boardStatus: "opportunity",
    boardAssignedAgent: "Michael Chen",
    receivedAt: "2024-01-14 10:15",
    pages: 5,
    summary: "Clinical documentation including physician notes, diagnostic imaging results, and treatment history for ongoing care."
  },
  {
    id: "7",
    fileName: "fax_20240113_154512.pdf",
    sender: "Cardiology Clinic",
    senderNumber: "(555) 999-0001",
    patientName: "Jennifer Brown",
    direction: "inbound",
    category: "Referral",
    status: "unread",
    receivedAt: "2024-01-13 15:45",
    pages: 3,
    faxNumber: "(555) 999-0001",
    faxLineId: "4",
    faxLineName: "Global Insurance Line",
    summary: "Cardiac rehab phase II, 3x/week for 12 weeks. Cigna OUT of network. 36 visits approved through Jun 2024.",
    referralId: "REF126",
    referralStatus: "Approved",
    referralCreatedDate: "2024-01-13",
    orderText: "Cardiac rehabilitation phase II, 3x per week for 12 weeks, monitored exercise progression",
    dob: "1970-05-18",
    phonePrimary: "(555) 789-0123",
    primaryInsurance: {
      company: "Cigna",
      memberId: "CIG456789012",
      groupNumber: "EMP100"
    },
    networkStatus: "OON",
    authExpirationDate: "2024-06-13",
    visitsAuthorized: 36,
    diagnosisCodes: ["I25.10", "Z51.89"],
    diagnosisDescriptions: ["Atherosclerotic heart disease of native coronary artery without angina pectoris", "Encounter for other specified aftercare"],
    providerName: "Dr. James Wilson",
    providerOrg: "Cardiology Clinic"
  },
  {
    id: "8",
    fileName: "fax_20240113_113045.pdf",
    sender: "United Healthcare",
    senderNumber: "(555) 567-8901",
    direction: "inbound",
    category: "Insurance",
    status: "unread",
    receivedAt: "2024-01-13 11:30",
    pages: 2,
    summary: "Insurance authorization response from UnitedHealthcare with updated coverage details and authorization numbers."
  },
  {
    id: "9",
    fileName: "fax_20240113_093020.pdf",
    sender: "Office Supplies Inc",
    senderNumber: "(555) 222-3333",
    direction: "inbound",
    category: "Others",
    status: "read",
    boardStatus: "todo",
    boardAssignedAgent: "Amanda Rodriguez",
    receivedAt: "2024-01-13 09:30",
    pages: 1,
    summary: "Monthly office supply invoice and delivery confirmation for January order."
  },
  {
    id: "10",
    fileName: "fax_20240112_164520.pdf",
    sender: "Dr. Patricia Martinez - Primary Care",
    senderNumber: "(555) 333-4444",
    patientName: "Thomas Anderson",
    direction: "inbound",
    category: "Plan of Care",
    status: "read",
    boardStatus: "opportunity",
    boardAssignedAgent: "James Thompson",
    receivedAt: "2024-01-12 16:45",
    pages: 3,
    summary: "Signed Plan of Care returned from Dr. Martinez for ongoing physical therapy treatment authorization.",
    providerName: "Dr. Patricia Martinez",
    providerOrg: "Martinez Primary Care"
  }
];

/**
 * Helper component to display field labels with AI extraction indicators
 */
interface FieldLabelProps {
  label: string;
  source?: FieldSource;
  onNavigateToSource?: (page: number) => void;
}

function FieldLabelWithSource({ label, source, onNavigateToSource }: FieldLabelProps) {
  const [isHovered, setIsHovered] = useState(false);

  // No source tracking - just show regular label
  if (!source) {
    return <Label className="text-sm font-medium text-muted-foreground">{label}</Label>;
  }

  // AI extracted - show subtle indicator and navigation on hover
  if (source.extractedBy === 'AI') {
    return (
      <div 
        className="flex items-center justify-between group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          {label}
          <Sparkles className="h-3 w-3 text-purple-500 opacity-60" />
        </Label>
        {onNavigateToSource && isHovered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            onClick={() => onNavigateToSource(source.page)}
          >
            <MapPin className="h-2.5 w-2.5 mr-0.5" />
            p{source.page}
          </Button>
        )}
      </div>
    );
  }

  // Manual entry required - show warning
  return (
    <Label className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
      {label}
      <span className="text-[10px] text-amber-500">(Manual)</span>
    </Label>
  );
}

export default function FaxInbox() {
  const { toast } = useToast();
  const { isAdmin, isAgent } = useUserRole();
  const { getAssignableAgents, canAgentViewLine, getAgentFaxLines } = useFaxLines();
  const [faxes, setFaxes] = useState<FaxDocument[]>(mockFaxes);
  
  // Mock current user - in production, this would come from auth context
  const currentAgentName = "Sarah Wilson";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [selectedFaxes, setSelectedFaxes] = useState<string[]>([]);
  const [selectedFax, setSelectedFax] = useState<FaxDocument | null>(null);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [sendFaxOpen, setSendFaxOpen] = useState(false);
  const [workflowAssignOpen, setWorkflowAssignOpen] = useState(false);
  const [workflowAssignNotes, setWorkflowAssignNotes] = useState("");
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  const [selectedFaxForSequence, setSelectedFaxForSequence] = useState<string | null>(null);
  const [addToBoardDialogOpen, setAddToBoardDialogOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  // Function to navigate to a specific page in the PDF viewer
  const handleNavigateToPage = (page: number) => {
    setPageNumber(page);
    // Scroll to top of PDF viewer to show the navigated page
    const pdfViewer = document.querySelector('.pdf-viewer');
    if (pdfViewer) {
      pdfViewer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    toast({
      title: "Navigated to source",
      description: `Viewing page ${page} where this field was extracted.`,
      duration: 3000,
    });
  };

  // Close side panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedFax) {
        setSelectedFax(null);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedFax]);

  const [sendFaxForm, setSendFaxForm] = useState({
    recipient: "",
    faxNumber: "",
    senderNumber: "(555) 999-0001", // Our office number
    category: "Others" as FaxDocument["category"],
    coverSheet: "",
    document: null as File | null
  });

  const filteredFaxes = faxes.filter(fax => {
    const matchesSearch = 
      fax.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fax.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fax.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fax.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || fax.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || fax.category === categoryFilter;
    const matchesDirection = directionFilter === "all" || fax.direction === directionFilter;
    const matchesTab = activeTab === "received" ? fax.direction === "inbound" : fax.direction === "outbound";
    
    // Agent visibility: Only show faxes from assigned fax lines
    if (isAgent && fax.faxLineId) {
      const canView = canAgentViewLine(currentAgentName, fax.faxLineId);
      if (!canView) return false;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDirection && matchesTab;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFaxes(filteredFaxes.map(f => f.id));
    } else {
      setSelectedFaxes([]);
    }
  };

  const handleSelectFax = (faxId: string, checked: boolean) => {
    if (checked) {
      setSelectedFaxes([...selectedFaxes, faxId]);
    } else {
      setSelectedFaxes(selectedFaxes.filter(id => id !== faxId));
    }
  };

  const handleViewFax = (fax: FaxDocument) => {
    setSelectedFax(fax);
    setPageNumber(1); // Reset to first page when viewing new fax
  };

  const handleBulkProcessed = () => {
    setFaxes(prev => prev.map(fax => 
      selectedFaxes.includes(fax.id) 
        ? { ...fax, status: "read" as const }
        : fax
    ));
    setSelectedFaxes([]);
  };


  const handleSelfAssign = (faxId: string) => {
    // Open Add to Board modal instead
    const fax = faxes.find(f => f.id === faxId);
    if (fax) {
      setSelectedFax(fax);
      setAddToBoardDialogOpen(true);
    }
  };

  const handleCall = (patientName?: string, phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`);
    }
    toast({
      title: "Call Initiated",
      description: `Calling ${patientName || "patient"}`,
    });
  };

  const handleMessage = (patientName?: string, phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`sms:${phoneNumber}`);
    }
    toast({
      title: "Message Opened",
      description: `Opening message to ${patientName || "patient"}`,
    });
  };

  const handleStartSequence = (sequence: SequenceConfig, contextData?: Record<string, any>) => {
    const fax = faxes.find(f => f.id === selectedFaxForSequence);
    console.log('Starting sequence:', sequence, 'with context:', contextData);
    
    toast({
      title: "Sequence Started",
      description: `${fax?.patientName || "Patient"} added to ${sequence.name}`,
    });
    setSequenceDialogOpen(false);
    setSelectedFaxForSequence(null);
  };

  const handleWorkflowAssign = (agent: string) => {
    if (selectedFax) {
      // Open add to board modal instead
      setAddToBoardDialogOpen(true);
      setWorkflowAssignOpen(false);
      setWorkflowAssignNotes("");
    }
  };

  const handleSendFax = () => {
    // Here you would implement the actual fax sending logic
    console.log("Sending fax:", sendFaxForm);
    setSendFaxOpen(false);
    setSendFaxForm({
      recipient: "",
      faxNumber: "",
      senderNumber: "(555) 999-0001",
      category: "Others",
      coverSheet: "",
      document: null
    });
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return "";
    
    // Parse the date string (format: "2024-01-15 09:30")
    const [datePart, timePart] = dateTimeString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    
    // Format: "Jan 14, 2024 2:30 PM"
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[date.getMonth()];
    const dayNum = date.getDate();
    const yearNum = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${monthName} ${dayNum}, ${yearNum} ${hours}:${minutesStr} ${ampm}`;
  };

  const getDirectionIcon = (direction: "inbound" | "outbound") => {
    if (direction === "inbound") {
      return <ArrowDown className="h-4 w-4 text-success" />;
    } else {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      "Referral": "bg-gold-light text-gold-foreground border-gold/30",
      "Insurance": "bg-primary/10 text-primary border-primary/20",
      "Clinical": "bg-warning/10 text-warning border-warning/20",
      "Plan of Care": "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
      "Others": "bg-muted/10 text-muted-foreground border-muted/20"
    };
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || colors.Others}>
        {category}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "Unread": "bg-urgent/10 text-urgent border-urgent/20",
      "Needs Review": "bg-warning/10 text-warning border-warning/20",
      "Processed": "bg-success/10 text-success border-success/20"
    };
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const getAssignedBadge = (assignedTo?: string) => {
    if (!assignedTo) return null;
    const colors = {
      "Front Desk": "bg-primary/10 text-primary border-primary/20",
      "Billing": "bg-secondary/10 text-secondary-foreground border-secondary/20",
      "Clinical": "bg-success/10 text-success border-success/20"
    };
    return (
      <Badge variant="outline" className={colors[assignedTo as keyof typeof colors]}>
        {assignedTo}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="relative">
        {/* Main Content - Fax List */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Fax Inbox</h2>
              <p className="text-muted-foreground mt-1">Manage inbound and outbound fax communications</p>
            </div>
            <Dialog open={sendFaxOpen} onOpenChange={setSendFaxOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Fax
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Send New Fax</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter recipient name"
                      value={sendFaxForm.recipient}
                      onChange={(e) => setSendFaxForm(prev => ({ ...prev, recipient: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="faxNumber">Fax Number</Label>
                    <Input
                      id="faxNumber"
                      placeholder="(555) 123-4567"
                      value={sendFaxForm.faxNumber}
                      onChange={(e) => setSendFaxForm(prev => ({ ...prev, faxNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={sendFaxForm.category} 
                      onValueChange={(value: FaxDocument["category"]) => 
                        setSendFaxForm(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Clinical">Clinical</SelectItem>
                        <SelectItem value="Plan of Care">Plan of Care</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="document">Document</Label>
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setSendFaxForm(prev => ({ 
                        ...prev, 
                        document: e.target.files?.[0] || null 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="coverSheet">Cover Sheet (Optional)</Label>
                    <Textarea
                      id="coverSheet"
                      placeholder="Add a cover sheet message..."
                      value={sendFaxForm.coverSheet}
                      onChange={(e) => setSendFaxForm(prev => ({ ...prev, coverSheet: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSendFaxOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendFax}>
                    Send Fax
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "received" | "sent")} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search faxes, senders, patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Clinical">Clinical</SelectItem>
                    <SelectItem value="Plan of Care">Plan of Care</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>

                    <Select value={directionFilter} onValueChange={setDirectionFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Actions */}
              {selectedFaxes.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {selectedFaxes.length} fax(es) selected
                      </span>
                      <Button variant="outline" size="sm" onClick={handleBulkProcessed}>
                        Mark as Read
                      </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // For bulk add to board, we'll use the first selected fax to open the modal
                      const firstSelectedFax = faxes.find(f => selectedFaxes.includes(f.id));
                      if (firstSelectedFax) {
                        setSelectedFax(firstSelectedFax);
                        setAddToBoardDialogOpen(true);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Board
                  </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fax List */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedFaxes.length === filteredFaxes.length && filteredFaxes.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Fax Line</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Board Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaxes.map((fax) => (
                    <TableRow 
                      key={fax.id} 
                      className={`hover:bg-muted/50 cursor-pointer ${selectedFax?.id === fax.id ? 'bg-accent' : ''} ${fax.status === 'unread' ? 'border-l-4 border-l-primary bg-primary/5' : 'border-l-4 border-l-transparent'}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedFaxes.includes(fax.id)}
                          onCheckedChange={(checked) => handleSelectFax(fax.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        <div className="flex items-start gap-3">
                          {getDirectionIcon(fax.direction)}
                          <div className="flex flex-col gap-1">
                            <span className={`${fax.status === 'unread' ? 'font-semibold' : 'font-normal'} text-primary hover:underline`}>
                              {fax.fileName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {fax.pages} pages • {formatDateTime(fax.direction === "inbound" ? fax.receivedAt : fax.sentAt)}
                            </span>
                            {fax.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                                {fax.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        <div className={`${fax.status === 'unread' ? 'font-semibold' : 'font-normal'}`}>
                          {fax.senderNumber}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        <div className={`${fax.status === 'unread' ? 'font-semibold' : 'font-normal'}`}>
                          {fax.direction === "outbound" ? fax.receiverNumber || "—" : "(555) 999-0001"}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        {fax.patientName ? (
                          <div className={`${fax.status === 'unread' ? 'font-semibold' : 'font-normal'}`}>{fax.patientName}</div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        {fax.faxLineName ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{fax.faxLineName}</span>
                            {fax.faxLineLocation && (
                              <span className="text-xs text-muted-foreground">{fax.faxLineLocation}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>{getCategoryBadge(fax.category)}</TableCell>
                      <TableCell onClick={() => handleViewFax(fax)}>
                        <div className="flex items-center justify-between gap-2">
                          {fax.boardStatus ? (
                            <div className="flex flex-col">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  fax.boardStatus === "opportunity" 
                                    ? "bg-blue-500/10 text-blue-700 border-blue-300" 
                                    : "bg-amber-500/10 text-amber-700 border-amber-300"
                                }`}
                              >
                                {fax.boardStatus === "opportunity" ? "Opportunity" : "To-Do"}
                              </Badge>
                              {fax.boardAssignedAgent && (
                                <span className="text-xs text-muted-foreground mt-1">{fax.boardAssignedAgent}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFax(fax);
                              setAddToBoardDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewFax(fax)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
                
                {filteredFaxes.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No faxes found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search criteria" : "No faxes match the current filters"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Panel - Redesigned Workflow-First Layout */}
        {selectedFax && !addToBoardDialogOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 z-10" 
              onClick={() => setSelectedFax(null)}
            />
            
            {/* Side Panel */}
            <div className="absolute top-0 right-0 w-full max-w-[900px] min-w-[800px] h-full border-l bg-background shadow-xl z-20 flex flex-col">
              {/* Header with Status */}
              <div className="sticky top-0 bg-background border-b px-6 py-4 z-30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getDirectionIcon(selectedFax.direction)}
                    <h2 className="font-semibold text-lg truncate">{selectedFax.fileName}</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFax(null)}
                    className="hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Status Pills */}
                <div className="flex items-center gap-2">
                  {selectedFax.status === 'unread' && (
                    <Badge variant="outline" className="bg-urgent/10 text-urgent border-urgent/20">
                      Unread
                    </Badge>
                  )}
                  {selectedFax.networkStatus === 'OON' && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      Out of Network
                    </Badge>
                  )}
                  {getCategoryBadge(selectedFax.category)}
                </div>
              </div>

              {/* Workflow Actions Bar */}
              <div className="bg-muted/30 border-b px-6 py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Button 
                    type="button"
                    variant="default" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAddToBoardDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add to Board
                  </Button>
                  <CreateInEMRButton
                    referral={convertFaxToReferral(selectedFax)}
                    onSuccess={(result: EMRCreationResult) => {
                      toast({
                        title: "Success!",
                        description: `Created in EMR: MRN ${result.patientMRN}`,
                      });
                      // Optionally update fax status or refresh list
                    }}
                    variant="ghost"
                    size="sm"
                  />
                  <Button
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCall(selectedFax.patientName, selectedFax.phonePrimary);
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Call Patient
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMessage(selectedFax.patientName, selectedFax.phonePrimary);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFaxForSequence(selectedFax.id);
                      setSequenceDialogOpen(true);
                    }}
                  >
                    <Workflow className="h-4 w-4" />
                    Add to Sequence
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 min-h-0">
                {/* PDF Viewer - Resizable Left Side */}
                <div className="w-2/5 min-w-[350px] max-w-[450px] border-r flex flex-col">
                  {/* PDF Controls */}
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground min-w-20 text-center">
                        Page {pageNumber}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(pageNumber + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 min-w-0" />
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("/sample-fax.pdf", "_blank")}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* PDF Canvas */}
                  <div className="flex-1 bg-muted/30 p-4 overflow-auto">
                    <div className="bg-white rounded shadow-sm mx-auto max-w-full" style={{width: `${Math.min(300 * scale, 350)}px`}}>
                      <canvas
                        ref={(canvas) => {
                          if (canvas) {
                            const context = canvas.getContext('2d');
                            if (context) {
                              const maxWidth = 350;
                              const canvasWidth = Math.min(300 * scale, maxWidth);
                              const canvasHeight = canvasWidth * 1.3; // Maintain aspect ratio
                              
                              canvas.width = canvasWidth;
                              canvas.height = canvasHeight;
                              
                              context.fillStyle = '#ffffff';
                              context.fillRect(0, 0, canvas.width, canvas.height);
                              
                              context.strokeStyle = '#e5e7eb';
                              context.lineWidth = 1;
                              context.strokeRect(0, 0, canvas.width, canvas.height);
                              
                              context.fillStyle = '#6b7280';
                              context.font = `${Math.max(10, 12 * (canvasWidth/300))}px Arial`;
                              context.textAlign = 'center';
                              context.fillText(`${selectedFax.fileName}`, canvas.width / 2, canvas.height / 2);
                              context.fillText(`Page ${pageNumber} of ${selectedFax.pages}`, canvas.width / 2, canvas.height / 2 + 20 * (canvasWidth/300));
                            }
                          }
                        }}
                        className="block w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Details - Right Side */}
                <div className="flex-1 overflow-auto">
                  <div className="p-6 space-y-6">
                    {/* Patient & Coverage Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Patient & Coverage Summary
                          </CardTitle>
                          {selectedFax.sources && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Extracted
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Patient Status Indicator */}
                        {selectedFax.patientStatus && (
                          <div className="pb-3 border-b">
                            {selectedFax.patientStatus === "new" ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                                  <User className="h-3 w-3 mr-1" />
                                  New Patient
                                </Badge>
                                <span className="text-sm text-muted-foreground">No existing record found</span>
                              </div>
                            ) : selectedFax.patientStatus === "existing" ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                  <CheckSquare className="h-3 w-3 mr-1" />
                                  Existing Patient
                                </Badge>
                                {selectedFax.existingPatientMRN && (
                                  <span className="text-sm text-muted-foreground">
                                    MRN: <span className="font-mono font-medium text-foreground">{selectedFax.existingPatientMRN}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Patient Status Unknown
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {selectedFax.patientName && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabelWithSource 
                                label="Patient Name" 
                                source={selectedFax.sources?.patientName}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <p className="font-semibold">{selectedFax.patientName}</p>
                            </div>
                            <div>
                              <FieldLabelWithSource 
                                label="Date of Birth" 
                                source={selectedFax.sources?.dob}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <p>{selectedFax.dob || "—"}</p>
                            </div>
                            <div>
                              <FieldLabelWithSource 
                                label="Phone" 
                                source={selectedFax.sources?.phonePrimary}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <p>{selectedFax.phonePrimary || "—"}</p>
                            </div>
                            <div>
                              <FieldLabelWithSource 
                                label="Network Status" 
                                source={selectedFax.sources?.networkStatus}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <Badge variant="outline" className={`mt-1 ${
                                selectedFax.networkStatus === 'IN' 
                                  ? "bg-success/10 text-success border-success/20"
                                  : selectedFax.networkStatus === 'OON'
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-muted/10 text-muted-foreground border-muted/20"
                              }`}>
                                {selectedFax.networkStatus === 'IN' ? 'In Network' : 
                                 selectedFax.networkStatus === 'OON' ? 'Out of Network' : 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {selectedFax.primaryInsurance && (
                          <div className="border-t pt-4">
                            <FieldLabelWithSource 
                              label="Primary Insurance" 
                              source={selectedFax.sources?.primaryInsurance}
                              onNavigateToSource={handleNavigateToPage}
                            />
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">{selectedFax.primaryInsurance.company}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Member ID:</span> {selectedFax.primaryInsurance.memberId}
                              </div>
                              {selectedFax.primaryInsurance.groupNumber && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Group:</span> {selectedFax.primaryInsurance.groupNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedFax.secondaryInsurance && (
                          <div className="border-t pt-4">
                            <FieldLabelWithSource 
                              label="Secondary Insurance" 
                              source={selectedFax.sources?.secondaryInsurance}
                              onNavigateToSource={handleNavigateToPage}
                            />
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">{selectedFax.secondaryInsurance.company}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Member ID:</span> {selectedFax.secondaryInsurance.memberId}
                              </div>
                              {selectedFax.secondaryInsurance.groupNumber && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Group:</span> {selectedFax.secondaryInsurance.groupNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedFax.authExpirationDate && (
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FieldLabelWithSource 
                                  label="Auth Expires" 
                                  source={selectedFax.sources?.authExpirationDate}
                                  onNavigateToSource={handleNavigateToPage}
                                />
                                <p>{selectedFax.authExpirationDate}</p>
                              </div>
                              <div>
                                <FieldLabelWithSource 
                                  label="Visits Authorized" 
                                  source={selectedFax.sources?.visitsAuthorized}
                                  onNavigateToSource={handleNavigateToPage}
                                />
                                {selectedFax.visitsAuthorized ? (
                                  <p>{selectedFax.visitsAuthorized}</p>
                                ) : (
                                  <p className="text-sm text-amber-600 italic">Could not extract</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Collapsible Referral Details */}
                    {selectedFax.category === "Referral" && (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Referral Details</CardTitle>
                            {selectedFax.sources && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Extracted
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabelWithSource 
                                label="Referring Provider" 
                                source={selectedFax.sources?.providerName}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <p className="font-medium">{selectedFax.providerName || "—"}</p>
                              <p className="text-sm text-muted-foreground">{selectedFax.providerOrg}</p>
                            </div>
                            <div>
                              <FieldLabelWithSource 
                                label="Referral Status" 
                                source={selectedFax.sources?.referralStatus}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <Badge variant="outline" className={
                                selectedFax.referralStatus === 'Authorized' 
                                  ? "bg-success/10 text-success border-success/20"
                                  : selectedFax.referralStatus === 'Pending'
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-muted/10 text-muted-foreground border-muted/20"
                              }>
                                {selectedFax.referralStatus}
                              </Badge>
                            </div>
                          </div>
                          
                          {selectedFax.orderText && (
                            <div>
                              <FieldLabelWithSource 
                                label="Order Details" 
                                source={selectedFax.sources?.orderText}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <p className="text-sm bg-muted/50 p-3 rounded mt-1">{selectedFax.orderText}</p>
                            </div>
                          )}

                          {selectedFax.diagnosisCodes && selectedFax.diagnosisCodes.length > 0 && (
                            <div>
                              <FieldLabelWithSource 
                                label="Diagnosis" 
                                source={selectedFax.sources?.diagnosisCodes}
                                onNavigateToSource={handleNavigateToPage}
                              />
                              <div className="mt-2 space-y-1">
                                {selectedFax.diagnosisCodes.map((code, index) => (
                                  <div key={code} className="text-sm">
                                    <span className="font-mono bg-muted px-2 py-1 rounded">{code}</span>
                                    {selectedFax.diagnosisDescriptions?.[index] && (
                                      <span className="ml-2 text-muted-foreground">
                                        {selectedFax.diagnosisDescriptions[index]}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Document Source Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Document Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedFax.faxLineName && (
                          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <Label className="text-sm font-medium text-muted-foreground">Fax Line</Label>
                            <p className="font-semibold text-primary">{selectedFax.faxLineName}</p>
                            {selectedFax.faxLineLocation && (
                              <p className="text-sm text-muted-foreground">{selectedFax.faxLineLocation}</p>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Direction</Label>
                            <div className="flex items-center gap-2">
                              {getDirectionIcon(selectedFax.direction)}
                              <span className="capitalize">{selectedFax.direction}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Pages</Label>
                            <p>{selectedFax.pages}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              {selectedFax.direction === 'inbound' ? 'Received' : 'Sent'}
                            </Label>
                            <p>{formatDateTime(selectedFax.direction === 'inbound' ? selectedFax.receivedAt : selectedFax.sentAt)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Fax Number</Label>
                            <p>{selectedFax.senderNumber}</p>
                          </div>
                        </div>

                        {selectedFax.assignedTo && (
                          <div className="border-t pt-4">
                            <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                            <div className="mt-1">
                              <p className="font-medium">{selectedFax.assignedTo}</p>
                              {selectedFax.assignedNotes && (
                                <p className="text-sm text-muted-foreground mt-1">{selectedFax.assignedNotes}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <Phone className="h-4 w-4" />
                            View Call History
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <Building2 className="h-4 w-4" />
                            Coverage Board
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <Send className="h-4 w-4" />
                            Forward Fax
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sequence Management Modal */}
        <SequenceManagementModal
          isOpen={sequenceDialogOpen}
          onClose={() => {
            setSequenceDialogOpen(false);
            setSelectedFaxForSequence(null);
          }}
          onStartSequence={handleStartSequence}
          activeSequences={[]} // TODO: Add actual active sequences for the patient
          patientName={selectedFaxForSequence ? faxes.find(f => f.id === selectedFaxForSequence)?.patientName : undefined}
          entityType="fax"
        />

        {/* Add to Board Modal - Simple board selection */}
        {selectedFax && (
          <AddToBoardModal
            isOpen={addToBoardDialogOpen}
            onClose={() => {
              setAddToBoardDialogOpen(false);
              setSelectedFax(null); // Clear selected fax to prevent side panel from opening
            }}
            onConfirm={(data) => {
              // Update fax with board status
              setFaxes(prev => prev.map(f => 
                f.id === selectedFax.id 
                  ? { 
                      ...f, 
                      boardStatus: data.board,
                      boardAssignedAgent: data.assignedAgent 
                    }
                  : f
              ));
              
              const boardName = data.board === "opportunity" ? "Opportunities" : "Tasks & To-Do";
              toast({
                title: "Added to Board!",
                description: `${data.patientName} added to ${boardName} board and assigned to ${data.assignedAgent}`,
              });
              setAddToBoardDialogOpen(false);
              setSelectedFax(null); // Clear selected fax
              setSelectedFaxes([]); // Clear bulk selection after adding
            }}
            patientName={selectedFax.patientName}
            condition={selectedFax.diagnosisDescriptions?.[0] || selectedFax.summary}
            phone={selectedFax.phonePrimary}
            insurance={selectedFax.primaryInsurance?.company}
            referrer={selectedFax.providerName || selectedFax.providerOrg || selectedFax.sender}
            sourceDocument={{ type: 'fax', id: selectedFax.id, name: selectedFax.fileName }}
          />
        )}

      </div>
    </Layout>
  );
}