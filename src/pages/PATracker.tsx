import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Shield,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Phone,
  Calendar,
  ArrowLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PARequest {
  id: string;
  patientId: string;
  patientName: string;
  stage: "required" | "submitted" | "pending_review" | "approved" | "denied" | "resubmitted";
  priority: "routine" | "urgent" | "stat";
  serviceType: string;
  visits: number;
  visitsApproved?: number;
  provider: string;
  payer: string;
  submittedDate?: string;
  reviewDate?: string;
  approvalDate?: string;
  denialDate?: string;
  resubmittedDate?: string;
  expirationDate?: string;
  referenceNumber: string;
  notes: string;
  phone?: string;
  denialReason?: string;
  daysInStage?: number;
}

const mockPARequests: PARequest[] = [
  {
    id: "PA-001",
    patientId: "PAT-1234",
    patientName: "Sarah Johnson",
    stage: "approved",
    priority: "routine",
    serviceType: "Physical Therapy",
    visits: 12,
    visitsApproved: 12,
    provider: "Dr. Smith",
    payer: "Blue Cross Blue Shield",
    submittedDate: "2024-01-10",
    approvalDate: "2024-01-12",
    expirationDate: "2024-07-12",
    referenceNumber: "PA12345678",
    notes: "Approved for 12 visits, eval + 11 treatments",
    phone: "(555) 123-4567",
    daysInStage: 2
  },
  {
    id: "PA-002",
    patientId: "PAT-5678",
    patientName: "Michael Davis",
    stage: "pending_review",
    priority: "urgent",
    serviceType: "Occupational Therapy",
    visits: 8,
    provider: "Dr. Johnson",
    payer: "Aetna",
    submittedDate: "2024-01-15",
    reviewDate: "2024-01-16",
    referenceNumber: "PA87654321",
    notes: "Peer-to-peer review scheduled",
    phone: "(555) 234-5678",
    daysInStage: 1
  },
  {
    id: "PA-003",
    patientId: "PAT-9012",
    patientName: "Emma Wilson",
    stage: "denied",
    priority: "routine",
    serviceType: "Speech Therapy",
    visits: 6,
    provider: "Dr. Lee",
    payer: "United Healthcare",
    submittedDate: "2024-01-08",
    denialDate: "2024-01-14",
    referenceNumber: "PA11223344",
    notes: "Denied - insufficient medical necessity documentation",
    denialReason: "Lack of medical necessity documentation",
    phone: "(555) 345-6789",
    daysInStage: 1
  },
  {
    id: "PA-004",
    patientId: "PAT-3456",
    patientName: "Robert Chen",
    stage: "submitted",
    priority: "stat",
    serviceType: "Physical Therapy",
    visits: 20,
    provider: "Dr. Brown",
    payer: "Medicare",
    submittedDate: "2024-01-14",
    referenceNumber: "PA55667788",
    notes: "STAT request - post-surgical",
    phone: "(555) 456-7890",
    daysInStage: 1
  },
  {
    id: "PA-005",
    patientId: "PAT-7890",
    patientName: "Lisa Martinez",
    stage: "required",
    priority: "urgent",
    serviceType: "Physical Therapy",
    visits: 15,
    provider: "Dr. Garcia",
    payer: "Cigna",
    referenceNumber: "PA99887766",
    notes: "PA needed before scheduling - complex case",
    phone: "(555) 567-8901",
    daysInStage: 0
  },
  {
    id: "PA-006",
    patientId: "PAT-2468",
    patientName: "James Taylor",
    stage: "resubmitted",
    priority: "urgent",
    serviceType: "Occupational Therapy",
    visits: 10,
    provider: "Dr. White",
    payer: "Blue Cross Blue Shield",
    submittedDate: "2024-01-05",
    denialDate: "2024-01-10",
    resubmittedDate: "2024-01-13",
    referenceNumber: "PA44556677",
    notes: "Resubmitted with additional clinical documentation",
    denialReason: "Incomplete initial evaluation",
    phone: "(555) 678-9012",
    daysInStage: 2
  },
  {
    id: "PA-007",
    patientId: "PAT-1357",
    patientName: "Amanda Rodriguez",
    stage: "approved",
    priority: "routine",
    serviceType: "Physical Therapy",
    visits: 8,
    visitsApproved: 6,
    provider: "Dr. Kim",
    payer: "Aetna",
    submittedDate: "2024-01-11",
    approvalDate: "2024-01-13",
    expirationDate: "2024-04-13",
    referenceNumber: "PA33445566",
    notes: "Partial approval - 6 visits authorized instead of 8",
    phone: "(555) 789-0123",
    daysInStage: 2
  },
  {
    id: "PA-008",
    patientId: "PAT-8642",
    patientName: "Kevin Park",
    stage: "pending_review",
    priority: "stat",
    serviceType: "Speech Therapy",
    visits: 12,
    provider: "Dr. Patel",
    payer: "United Healthcare",
    submittedDate: "2024-01-15",
    reviewDate: "2024-01-16",
    referenceNumber: "PA22334455",
    notes: "Expedited review requested",
    phone: "(555) 890-1234",
    daysInStage: 0
  }
];

const stages = [
  { key: "required", label: "PA Required", color: "bg-slate-500/10" },
  { key: "submitted", label: "PA Submitted", color: "bg-blue-500/10" },
  { key: "pending_review", label: "Pending Review", color: "bg-amber-500/10" },
  { key: "approved", label: "PA Approved", color: "bg-emerald-500/10" },
  { key: "denied", label: "PA Denied", color: "bg-red-500/10" },
  { key: "resubmitted", label: "PA Re-Submitted", color: "bg-purple-500/10" }
];

function PACard({ request }: { request: PARequest }) {
  const getPriorityColor = () => {
    switch (request.priority) {
      case "stat":
        return "bg-urgent text-urgent-foreground";
      case "urgent":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStageIcon = () => {
    switch (request.stage) {
      case "required":
        return <AlertCircle className="h-4 w-4" />;
      case "submitted":
        return <FileText className="h-4 w-4" />;
      case "pending_review":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "denied":
        return <XCircle className="h-4 w-4" />;
      case "resubmitted":
        return <RefreshCcw className="h-4 w-4" />;
    }
  };

  const getDaysColor = () => {
    if (!request.daysInStage) return "text-muted-foreground";
    if (request.stage === "submitted" || request.stage === "pending_review") {
      if (request.daysInStage > 3) return "text-destructive font-semibold";
      if (request.daysInStage > 1) return "text-warning font-semibold";
    }
    return "text-muted-foreground";
  };

  return (
    <Card className="w-full mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {request.referenceNumber}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getPriorityColor()}`}>
              {request.priority.toUpperCase()}
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-foreground text-sm mb-1">{request.patientName}</h4>
        <p className="text-xs text-muted-foreground mb-2">{request.patientId}</p>
        
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <FileText className="h-3 w-3 mr-1" />
            {request.serviceType}
          </div>
          <div className="flex items-center text-xs">
            <Badge variant="outline" className="text-xs">
              {request.visitsApproved 
                ? `${request.visitsApproved}/${request.visits} visits`
                : `${request.visits} visits requested`
              }
            </Badge>
          </div>
          {request.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {request.phone}
            </div>
          )}
        </div>

        <div className="space-y-1 mb-3">
          <div className="text-xs">
            <span className="text-muted-foreground">Payer:</span>{" "}
            <span className="font-medium">{request.payer}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Provider:</span>{" "}
            <span>{request.provider}</span>
          </div>
        </div>

        {request.denialReason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-2 mb-3">
            <p className="text-xs text-destructive font-medium">Denial Reason:</p>
            <p className="text-xs text-destructive">{request.denialReason}</p>
          </div>
        )}

        {request.expirationDate && (
          <div className="flex items-center text-xs mb-3">
            <Calendar className="h-3 w-3 mr-1 text-success" />
            <span className="text-success">Expires: {request.expirationDate}</span>
          </div>
        )}

        {request.notes && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{request.notes}</p>
        )}

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            {getStageIcon()}
            {request.submittedDate && (
              <span className="text-muted-foreground">{request.submittedDate}</span>
            )}
          </div>
          {request.daysInStage !== undefined && (
            <span className={getDaysColor()}>
              Day {request.daysInStage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, requests }: { stage: typeof stages[0]; requests: PARequest[] }) {
  const stageRequests = requests.filter(req => req.stage === stage.key);

  return (
    <div className="w-80 min-w-80 bg-accent/30 rounded-lg p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{stage.label}</h3>
          <Badge variant="outline" className="text-xs">
            {stageRequests.length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 h-[600px] overflow-y-auto">
        {stageRequests.map(request => (
          <PACard key={request.id} request={request} />
        ))}
        {stageRequests.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No requests in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export default function PATracker() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PARequest[]>(mockPARequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [payerFilter, setPayerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showNewPADialog, setShowNewPADialog] = useState(false);
  const [newPAData, setNewPAData] = useState({
    patientId: "",
    patientName: "",
    serviceType: "Physical Therapy",
    visits: "12",
    provider: "",
    payer: "",
    priority: "routine" as "routine" | "urgent" | "stat",
    notes: "",
    phone: "",
    referrer: ""
  });

  // Check if we're coming from Opportunities board with a new PA request
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      const storedData = localStorage.getItem('newPARequest');
      if (storedData) {
        try {
          const paData = JSON.parse(storedData);
          setNewPAData({
            patientId: paData.patientId || "",
            patientName: paData.patientName || "",
            serviceType: paData.serviceType || "Physical Therapy",
            visits: "12",
            provider: "",
            payer: paData.insurance || "",
            priority: paData.priority || "routine",
            notes: paData.condition ? `Referral for ${paData.condition}` : "",
            phone: paData.phone || "",
            referrer: paData.referrer || ""
          });
          setShowNewPADialog(true);
          localStorage.removeItem('newPARequest');
          
          toast({
            title: "PA Request Ready",
            description: `Pre-filled PA request for ${paData.patientName}`,
          });
        } catch (e) {
          console.error("Error parsing PA data:", e);
        }
      }
    }
  }, [searchParams, toast]);

  const handleSubmitPA = () => {
    const newRequest: PARequest = {
      id: `PA-${String(requests.length + 1).padStart(3, '0')}`,
      patientId: newPAData.patientId,
      patientName: newPAData.patientName,
      stage: "required",
      priority: newPAData.priority,
      serviceType: newPAData.serviceType,
      visits: parseInt(newPAData.visits) || 0,
      provider: newPAData.provider,
      payer: newPAData.payer,
      referenceNumber: `PA${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      notes: newPAData.notes,
      phone: newPAData.phone,
      daysInStage: 0
    };

    setRequests([newRequest, ...requests]);
    
    toast({
      title: "PA Request Created",
      description: `Created PA request ${newRequest.referenceNumber} for ${newPAData.patientName}`,
    });

    setShowNewPADialog(false);
    setNewPAData({
      patientId: "",
      patientName: "",
      serviceType: "Physical Therapy",
      visits: "12",
      provider: "",
      payer: "",
      priority: "routine",
      notes: "",
      phone: "",
      referrer: ""
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayer = payerFilter === "all" || request.payer === payerFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    return matchesSearch && matchesPayer && matchesPriority;
  });

  // Get unique payers for filter
  const uniquePayers = Array.from(new Set(requests.map(r => r.payer))).sort();

  return (
    <Layout>
      <div className="flex-1 p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Prior Authorization Board</h2>
            <p className="text-muted-foreground mt-1">Track PA requests through the authorization process</p>
          </div>
          <Button className="gap-2" onClick={() => setShowNewPADialog(true)}>
            <Plus className="h-4 w-4" />
            New PA Request
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredRequests.length}</div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">
                {filteredRequests.filter(r => r.stage === "submitted" || r.stage === "pending_review").length}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredRequests.filter(r => r.stage === "approved").length}
              </div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredRequests.filter(r => r.stage === "denied").length}
              </div>
              <p className="text-xs text-muted-foreground">Denied</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient, ID, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={payerFilter} onValueChange={setPayerFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by payer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payers</SelectItem>
              {uniquePayers.map(payer => (
                <SelectItem key={payer} value={payer}>{payer}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="stat">STAT</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
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
              requests={filteredRequests} 
            />
          ))}
        </div>

        {/* New PA Request Dialog */}
        <Dialog open={showNewPADialog} onOpenChange={setShowNewPADialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New PA Request</DialogTitle>
                <DialogDescription>
                  Submit a new prior authorization request
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                    id="patientId"
                      value={newPAData.patientId}
                      onChange={(e) => setNewPAData(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="PAT-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                    id="patientName"
                      value={newPAData.patientName}
                      onChange={(e) => setNewPAData(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newPAData.phone}
                  onChange={(e) => setNewPAData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                  <Select 
                    value={newPAData.serviceType} 
                    onValueChange={(value) => setNewPAData(prev => ({ ...prev, serviceType: value }))}
                  >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                        <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                        <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                        <SelectItem value="Massage Therapy">Massage Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visits">Number of Visits</Label>
                    <Input
                    id="visits"
                      type="number"
                      value={newPAData.visits}
                      onChange={(e) => setNewPAData(prev => ({ ...prev, visits: e.target.value }))}
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="provider">Referring Provider</Label>
                    <Input
                    id="provider"
                      value={newPAData.provider}
                      onChange={(e) => setNewPAData(prev => ({ ...prev, provider: e.target.value }))}
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="payer">Insurance Payer</Label>
                    <Input
                    id="payer"
                      value={newPAData.payer}
                      onChange={(e) => setNewPAData(prev => ({ ...prev, payer: e.target.value }))}
                    placeholder="Blue Cross Blue Shield"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newPAData.priority} 
                  onValueChange={(value: "routine" | "urgent" | "stat") => setNewPAData(prev => ({ ...prev, priority: value }))}
                >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                  id="notes"
                    value={newPAData.notes}
                    onChange={(e) => setNewPAData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Clinical justification, diagnosis, treatment plan..."
                  rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPADialog(false)}>
                Cancel
                        </Button>
              <Button onClick={handleSubmitPA}>
                Create PA Request
                  </Button>
              </div>
            </DialogContent>
          </Dialog>
      </div>
    </Layout>
  );
}
