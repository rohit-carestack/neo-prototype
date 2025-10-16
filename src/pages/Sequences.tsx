/**
 * Sequences Management Page
 * 
 * Centralized view for managing all patient sequences:
 * - View active, paused, and completed sequences
 * - Add patients to sequences (single or bulk)
 * - Pause, resume, or stop sequences
 * - Search through EMR patients
 */

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Workflow, 
  Search, 
  Plus, 
  Pause, 
  Play, 
  X, 
  CheckCircle2, 
  Clock, 
  User,
  Users,
  Filter,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sequences as sequenceConfigs, type ActiveSequence } from "@/config/sequences";

// Mock EMR patients data
const mockEMRPatients = [
  { id: "PAT001", mrn: "MRN12345", name: "John Smith", dob: "1985-03-20", phone: "(555) 987-6543", lastVisit: "2024-01-10", condition: "Lower Back Pain", location: "ETS Hartford", hasActiveSequence: false },
  { id: "PAT002", mrn: "MRN67890", name: "Sarah Johnson", dob: "1992-07-14", phone: "(555) 456-7890", lastVisit: "2024-01-15", condition: "Shoulder Injury", location: "ETS West Hartford", hasActiveSequence: false },
  { id: "PAT003", mrn: "MRN54321", name: "Michael Chen", dob: "1978-11-25", phone: "(555) 234-5678", lastVisit: "2024-01-12", condition: "Knee Pain", location: "ETS Hartford", hasActiveSequence: true },
  { id: "PAT004", mrn: "MRN98765", name: "Emily Davis", dob: "1990-05-18", phone: "(555) 345-6789", lastVisit: "2024-01-08", condition: "Neck Pain", location: "ETS New Haven", hasActiveSequence: false },
  { id: "PAT005", mrn: "MRN11223", name: "David Wilson", dob: "1982-09-30", phone: "(555) 567-8901", lastVisit: "2024-01-14", condition: "Hip Pain", location: "ETS Stamford", hasActiveSequence: false },
  { id: "PAT006", mrn: "MRN33445", name: "Lisa Anderson", dob: "1995-02-22", phone: "(555) 678-9012", lastVisit: "2023-12-15", condition: "Lower Back Pain", location: "ETS Hartford", hasActiveSequence: false },
  { id: "PAT007", mrn: "MRN55667", name: "James Taylor", dob: "1988-12-05", phone: "(555) 789-0123", lastVisit: "2023-12-20", condition: "Shoulder Injury", location: "ETS West Hartford", hasActiveSequence: false },
  { id: "PAT008", mrn: "MRN77889", name: "Maria Garcia", dob: "1975-08-17", phone: "(555) 890-1234", lastVisit: "2024-01-13", condition: "Knee Pain", location: "ETS New Haven", hasActiveSequence: false },
  { id: "PAT009", mrn: "MRN99001", name: "Robert Lee", dob: "1980-06-12", phone: "(555) 901-2345", lastVisit: "2023-11-28", condition: "Lower Back Pain", location: "ETS Hartford", hasActiveSequence: false },
  { id: "PAT010", mrn: "MRN22334", name: "Patricia Moore", dob: "1987-04-09", phone: "(555) 012-3456", lastVisit: "2023-11-15", condition: "Hip Pain", location: "ETS Stamford", hasActiveSequence: false },
];

// Mock active sequences
const mockActiveSequences = [
  {
    id: "SEQ001",
    patientId: "PAT001",
    patientName: "John Smith",
    patientMRN: "MRN12345",
    sequenceId: "SEQ-001",
    sequenceName: "Web Lead Acknowledgement",
    enrolledDate: "2024-01-15",
    currentStep: 2,
    totalSteps: 3,
    status: "active" as const,
    nextAction: "Send follow-up email",
    nextActionDate: "2024-01-18",
  },
  {
    id: "SEQ002",
    patientId: "PAT002",
    patientName: "Sarah Johnson",
    patientMRN: "MRN67890",
    sequenceId: "SEQ-003",
    sequenceName: "Lead Qualification",
    enrolledDate: "2024-01-14",
    currentStep: 3,
    totalSteps: 5,
    status: "active" as const,
    nextAction: "Call patient for qualification",
    nextActionDate: "2024-01-17",
  },
  {
    id: "SEQ003",
    patientId: "PAT003",
    patientName: "Michael Chen",
    patientMRN: "MRN54321",
    sequenceId: "SEQ-005",
    sequenceName: "Appointment Reminder",
    enrolledDate: "2024-01-13",
    currentStep: 1,
    totalSteps: 2,
    status: "paused" as const,
    nextAction: "Send appointment reminder",
    nextActionDate: "2024-01-20",
  },
  {
    id: "SEQ004",
    patientId: "PAT004",
    patientName: "Emily Davis",
    patientMRN: "MRN98765",
    sequenceId: "SEQ-007",
    sequenceName: "Follow-up Care",
    enrolledDate: "2024-01-10",
    currentStep: 4,
    totalSteps: 4,
    status: "active" as const,
    nextAction: "Complete follow-up survey",
    nextActionDate: "2024-01-16",
  },
  {
    id: "SEQ005",
    patientId: "PAT005",
    patientName: "David Wilson",
    patientMRN: "MRN11223",
    sequenceId: "SEQ-006",
    sequenceName: "Insurance Verification",
    enrolledDate: "2024-01-12",
    currentStep: 2,
    totalSteps: 3,
    status: "completed" as const,
    nextAction: undefined,
    nextActionDate: undefined,
  },
];

export default function Sequences() {
  const { toast } = useToast();
  const [activeSequences, setActiveSequences] = useState(mockActiveSequences);
  const [selectedSequences, setSelectedSequences] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sequenceTypeFilter, setSequenceTypeFilter] = useState("all");
  
  // Add patient to sequence modal
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [addPatientStep, setAddPatientStep] = useState<"method" | "single" | "bulk" | "csv">("method");
  const [selectedSequenceConfig, setSelectedSequenceConfig] = useState<string>("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  
  // Advanced filters for bulk selection
  const [lastVisitFilter, setLastVisitFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [bulkNotes, setBulkNotes] = useState<string>("");
  const [enrollmentDate, setEnrollmentDate] = useState<string>("");

  const filteredSequences = activeSequences.filter(seq => {
    const matchesSearch = 
      seq.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seq.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seq.sequenceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || seq.status === statusFilter;
    const matchesType = sequenceTypeFilter === "all" || seq.sequenceId === sequenceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredPatients = mockEMRPatients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.phone.includes(patientSearchTerm);
    
    const matchesLastVisit = lastVisitFilter === "all" || (() => {
      const visitDate = new Date(patient.lastVisit);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (lastVisitFilter === "7days") return daysDiff <= 7;
      if (lastVisitFilter === "30days") return daysDiff <= 30;
      if (lastVisitFilter === "60days") return daysDiff <= 60;
      if (lastVisitFilter === "90days") return daysDiff > 90;
      return true;
    })();
    
    const matchesCondition = conditionFilter === "all" || patient.condition === conditionFilter;
    const matchesLocation = locationFilter === "all" || patient.location === locationFilter;
    
    return matchesSearch && matchesLastVisit && matchesCondition && matchesLocation;
  });

  const getStatusColor = (status: ActiveSequence['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-300';
    }
  };

  const getStatusIcon = (status: ActiveSequence['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <X className="h-3 w-3" />;
    }
  };

  const handlePauseSequence = (seqId: string) => {
    setActiveSequences(prev => prev.map(seq =>
      seq.id === seqId ? { ...seq, status: 'paused' as const } : seq
    ));
    toast({
      title: "Sequence Paused",
      description: "The sequence has been paused successfully.",
    });
  };

  const handleResumeSequence = (seqId: string) => {
    setActiveSequences(prev => prev.map(seq =>
      seq.id === seqId ? { ...seq, status: 'active' as const } : seq
    ));
    toast({
      title: "Sequence Resumed",
      description: "The sequence is now active again.",
    });
  };

  const handleStopSequence = (seqId: string) => {
    setActiveSequences(prev => prev.filter(seq => seq.id !== seqId));
    toast({
      title: "Sequence Stopped",
      description: "The sequence has been removed.",
      variant: "destructive",
    });
  };

  const handleBulkPause = () => {
    setActiveSequences(prev => prev.map(seq =>
      selectedSequences.includes(seq.id) ? { ...seq, status: 'paused' as const } : seq
    ));
    toast({
      title: "Sequences Paused",
      description: `${selectedSequences.length} sequence(s) paused.`,
    });
    setSelectedSequences([]);
  };

  const handleBulkStop = () => {
    setActiveSequences(prev => prev.filter(seq => !selectedSequences.includes(seq.id)));
    toast({
      title: "Sequences Stopped",
      description: `${selectedSequences.length} sequence(s) removed.`,
      variant: "destructive",
    });
    setSelectedSequences([]);
  };

  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // Parse CSV - in production, use a proper CSV parser library
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
        setCsvData(data);
        toast({
          title: "CSV Loaded",
          description: `${data.length} patients found in file`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleAddPatientsToSequence = () => {
    let patientCount = 0;
    
    if (addPatientStep === "single" || addPatientStep === "bulk") {
      patientCount = selectedPatients.length;
      if (!selectedSequenceConfig || patientCount === 0) {
        toast({
          title: "Missing Information",
          description: "Please select a sequence and at least one patient.",
          variant: "destructive",
        });
        return;
      }
    } else if (addPatientStep === "csv") {
      patientCount = csvData.length;
      if (!selectedSequenceConfig || patientCount === 0) {
        toast({
          title: "Missing Information",
          description: "Please select a sequence and upload a CSV file.",
          variant: "destructive",
        });
        return;
      }
    }

    const sequenceConfig = sequenceConfigs.find(s => s.id === selectedSequenceConfig);
    
    toast({
      title: "Patients Added",
      description: `${patientCount} patient(s) added to ${sequenceConfig?.name}${enrollmentDate ? ` starting ${new Date(enrollmentDate).toLocaleDateString()}` : ''}`,
    });
    
    // Reset
    setAddPatientDialogOpen(false);
    setAddPatientStep("method");
    setSelectedPatients([]);
    setPatientSearchTerm("");
    setSelectedSequenceConfig("");
    setCsvFile(null);
    setCsvData([]);
    setLastVisitFilter("all");
    setConditionFilter("all");
    setLocationFilter("all");
    setBulkNotes("");
    setEnrollmentDate("");
  };

  const handleCloseModal = () => {
    setAddPatientDialogOpen(false);
    setAddPatientStep("method");
    setSelectedPatients([]);
    setPatientSearchTerm("");
    setSelectedSequenceConfig("");
    setCsvFile(null);
    setCsvData([]);
    setLastVisitFilter("all");
    setConditionFilter("all");
    setLocationFilter("all");
    setBulkNotes("");
    setEnrollmentDate("");
  };

  const stats = {
    total: activeSequences.length,
    active: activeSequences.filter(s => s.status === 'active').length,
    paused: activeSequences.filter(s => s.status === 'paused').length,
    completed: activeSequences.filter(s => s.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Sequences</h1>
              <p className="text-muted-foreground">Manage patient communication sequences</p>
            </div>
            
            <Dialog open={addPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patients to Sequence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    {addPatientStep === "method" && "Add Patients to Sequence"}
                    {addPatientStep === "single" && "Add Single Patient"}
                    {addPatientStep === "bulk" && "Select Multiple Patients"}
                    {addPatientStep === "csv" && "Import from CSV"}
                  </DialogTitle>
                  <DialogDescription>
                    {addPatientStep === "method" && "Choose how you want to add patients"}
                    {addPatientStep === "single" && "Search and add one patient at a time"}
                    {addPatientStep === "bulk" && "Filter and select multiple patients - see selections in real-time"}
                    {addPatientStep === "csv" && "Upload a CSV file with patient MRNs or IDs"}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                  
                  {/* Step 1: Choose Method */}
                  {addPatientStep === "method" && (
                    <div className="grid grid-cols-3 gap-4 py-8">
                      <Card
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                        onClick={() => setAddPatientStep("single")}
                      >
                        <CardContent className="pt-6 text-center space-y-3">
                          <User className="h-12 w-12 mx-auto text-primary" />
                          <h3 className="font-semibold">Single Patient</h3>
                          <p className="text-sm text-muted-foreground">
                            Search and add one patient at a time
                          </p>
                          <ChevronRight className="h-5 w-5 mx-auto text-muted-foreground" />
                        </CardContent>
                      </Card>

                      <Card
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                        onClick={() => setAddPatientStep("bulk")}
                      >
                        <CardContent className="pt-6 text-center space-y-3">
                          <Users className="h-12 w-12 mx-auto text-primary" />
                          <h3 className="font-semibold">Bulk Selection</h3>
                          <p className="text-sm text-muted-foreground">
                            Filter and select multiple patients
                          </p>
                          <ChevronRight className="h-5 w-5 mx-auto text-muted-foreground" />
                        </CardContent>
                      </Card>

                      <Card
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                        onClick={() => setAddPatientStep("csv")}
                      >
                        <CardContent className="pt-6 text-center space-y-3">
                          <Upload className="h-12 w-12 mx-auto text-primary" />
                          <h3 className="font-semibold">CSV Import</h3>
                          <p className="text-sm text-muted-foreground">
                            Upload a file with patient MRNs
                          </p>
                          <ChevronRight className="h-5 w-5 mx-auto text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 2a: Single Patient */}
                  {addPatientStep === "single" && (
                    <>
                      <div className="space-y-2">
                        <Label>Select Sequence</Label>
                        <Select value={selectedSequenceConfig} onValueChange={setSelectedSequenceConfig}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a sequence..." />
                          </SelectTrigger>
                          <SelectContent>
                            {sequenceConfigs.map((seq) => (
                              <SelectItem key={seq.id} value={seq.id}>
                                <div className="flex items-center gap-2">
                                  <span>{seq.name}</span>
                                  {seq.isAI && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Search Patient</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, MRN, or phone..."
                            value={patientSearchTerm}
                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="border rounded-lg">
                        <ScrollArea className="h-[300px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>DOB</TableHead>
                                <TableHead>MRN</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                  <TableCell>
                                    <div className="font-medium">{patient.name}</div>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{patient.dob}</TableCell>
                                  <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                                  <TableCell className="text-sm">{patient.phone}</TableCell>
                                  <TableCell className="text-sm">{patient.condition}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant={selectedPatients.includes(patient.id) ? "default" : "outline"}
                                      onClick={() => {
                                        // Single patient mode - only allow one selection at a time
                                        if (selectedPatients.includes(patient.id)) {
                                          setSelectedPatients([]);
                                        } else {
                                          setSelectedPatients([patient.id]);
                                        }
                                      }}
                                    >
                                      {selectedPatients.includes(patient.id) ? "Selected" : "Select"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>

                      {selectedPatients.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {mockEMRPatients.find(p => p.id === selectedPatients[0])?.name} selected
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2b: Bulk Selection */}
                  {addPatientStep === "bulk" && (
                    <>
                      <div className="space-y-4">
                        {/* Sequence Selection */}
                        <div className="space-y-2">
                          <Label>Select Sequence</Label>
                          <Select value={selectedSequenceConfig} onValueChange={setSelectedSequenceConfig}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a sequence..." />
                            </SelectTrigger>
                            <SelectContent>
                              {sequenceConfigs.map((seq) => (
                                <SelectItem key={seq.id} value={seq.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{seq.name}</span>
                                    {seq.isAI && (
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        <Sparkles className="h-2.5 w-2.5 mr-1" />
                                        AI
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Filters Bar */}
                        <div className="bg-muted/30 p-3 rounded-lg border">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="Search name, MRN, phone..."
                                value={patientSearchTerm}
                                onChange={(e) => setPatientSearchTerm(e.target.value)}
                                className="pl-8 h-9"
                              />
                            </div>

                            <Select value={lastVisitFilter} onValueChange={setLastVisitFilter}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Last Visit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Patients</SelectItem>
                                <SelectItem value="7days">Within 7 days</SelectItem>
                                <SelectItem value="30days">Within 30 days</SelectItem>
                                <SelectItem value="60days">Within 60 days</SelectItem>
                                <SelectItem value="90days">Over 90 days ago</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={conditionFilter} onValueChange={setConditionFilter}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Conditions</SelectItem>
                                <SelectItem value="Lower Back Pain">Lower Back Pain</SelectItem>
                                <SelectItem value="Shoulder Injury">Shoulder Injury</SelectItem>
                                <SelectItem value="Knee Pain">Knee Pain</SelectItem>
                                <SelectItem value="Hip Pain">Hip Pain</SelectItem>
                                <SelectItem value="Neck Pain">Neck Pain</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                <SelectItem value="ETS Hartford">ETS Hartford</SelectItem>
                                <SelectItem value="ETS West Hartford">ETS West Hartford</SelectItem>
                                <SelectItem value="ETS New Haven">ETS New Haven</SelectItem>
                                <SelectItem value="ETS Stamford">ETS Stamford</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Showing <span className="font-semibold text-foreground">{filteredPatients.length}</span> of <span className="font-semibold text-foreground">{mockEMRPatients.length}</span> patients
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => {
                                setPatientSearchTerm("");
                                setLastVisitFilter("all");
                                setConditionFilter("all");
                                setLocationFilter("all");
                              }}
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-3 gap-4">
                          {/* Left: Patient List */}
                          <div className="col-span-2 border rounded-lg">
                            <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                              <h4 className="text-sm font-semibold">Available Patients</h4>
                              <Checkbox
                                checked={selectedPatients.length === filteredPatients.filter(p => !p.hasActiveSequence).length && filteredPatients.filter(p => !p.hasActiveSequence).length > 0}
                                onCheckedChange={(checked) => {
                                  setSelectedPatients(checked ? filteredPatients.filter(p => !p.hasActiveSequence).map(p => p.id) : []);
                                }}
                              />
                            </div>
                            <ScrollArea className="h-[400px]">
                              <div className="p-2 space-y-1">
                                {filteredPatients.map((patient) => (
                                  <div
                                    key={patient.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors ${
                                      patient.hasActiveSequence ? 'opacity-50' : ''
                                    } ${selectedPatients.includes(patient.id) ? 'border-primary bg-primary/5' : ''}`}
                                  >
                                    <Checkbox
                                      checked={selectedPatients.includes(patient.id)}
                                      disabled={patient.hasActiveSequence}
                                      onCheckedChange={(checked) => {
                                        setSelectedPatients(prev =>
                                          checked
                                            ? [...prev, patient.id]
                                            : prev.filter(id => id !== patient.id)
                                        );
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">{patient.name}</div>
                                        {patient.hasActiveSequence && (
                                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                                            In Sequence
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        DOB: {patient.dob} • MRN: {patient.mrn}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        {patient.condition} • {patient.location} • Last visit: {patient.lastVisit}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>

                          {/* Right: Selected Patients */}
                          <div className="border rounded-lg">
                            <div className="p-3 bg-primary/10 border-b">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Selected ({selectedPatients.length})
                              </h4>
                            </div>
                            <ScrollArea className="h-[400px]">
                              {selectedPatients.length === 0 ? (
                                <div className="p-6 text-center">
                                  <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                                  <p className="text-sm text-muted-foreground">No patients selected</p>
                                  <p className="text-xs text-muted-foreground mt-1">Select patients from the list</p>
                                </div>
                              ) : (
                                <div className="p-2 space-y-1">
                                  {mockEMRPatients
                                    .filter(p => selectedPatients.includes(p.id))
                                    .map((patient) => (
                                      <div key={patient.id} className="flex items-start gap-2 p-2 rounded bg-background border">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-xs">{patient.name}</div>
                                          <div className="text-[10px] text-muted-foreground">
                                            DOB: {patient.dob}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">
                                            {patient.mrn}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            setSelectedPatients(prev => prev.filter(id => id !== patient.id));
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        </div>

                        {/* Optional Settings */}
                        {selectedPatients.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
                            <div className="space-y-2">
                              <Label className="text-xs">Enrollment Date (Optional)</Label>
                              <Input
                                type="date"
                                value={enrollmentDate}
                                onChange={(e) => setEnrollmentDate(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Batch Notes (Optional)</Label>
                              <Input
                                placeholder="e.g., Q1 Re-engagement"
                                value={bulkNotes}
                                onChange={(e) => setBulkNotes(e.target.value)}
                                className="h-9"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Step 2c: CSV Import */}
                  {addPatientStep === "csv" && (
                    <>
                      <div className="space-y-2">
                        <Label>Select Sequence</Label>
                        <Select value={selectedSequenceConfig} onValueChange={setSelectedSequenceConfig}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a sequence..." />
                          </SelectTrigger>
                          <SelectContent>
                            {sequenceConfigs.map((seq) => (
                              <SelectItem key={seq.id} value={seq.id}>
                                <div className="flex items-center gap-2">
                                  <span>{seq.name}</span>
                                  {seq.isAI && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Upload CSV File</Label>
                          <div className="mt-2">
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {csvFile ? (
                                    <>
                                      <FileText className="h-10 w-10 mb-3 text-primary" />
                                      <p className="mb-2 text-sm font-medium">{csvFile.name}</p>
                                      <p className="text-xs text-muted-foreground">{csvData.length} patients found</p>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-muted-foreground">CSV file with MRN or Patient ID column</p>
                                    </>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".csv"
                                  onChange={handleCsvFileUpload}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {csvData.length > 0 && (
                          <>
                            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {csvData.length} patient(s) ready to add
                              </span>
                            </div>

                            <div className="border rounded-lg">
                              <ScrollArea className="h-[250px]">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Patient Data Preview</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {csvData.slice(0, 10).map((row, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <div className="flex gap-4 text-sm">
                                            {Object.entries(row).map(([key, value]) => (
                                              <div key={key}>
                                                <span className="font-medium">{key}:</span> {String(value)}
                                              </div>
                                            ))}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    {csvData.length > 10 && (
                                      <TableRow>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                          ... and {csvData.length - 10} more
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </div>
                          </>
                        )}

                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">CSV Format Requirements:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• First row must contain column headers</li>
                            <li>• Must include either "MRN" or "PatientID" column</li>
                            <li>• Optional columns: Name, Phone, Email</li>
                            <li>• Example: MRN,Name,Phone</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  {addPatientStep !== "method" && (
                    <Button variant="outline" onClick={() => setAddPatientStep("method")}>
                      Back
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  {addPatientStep !== "method" && (
                    <Button 
                      onClick={handleAddPatientsToSequence}
                      disabled={!selectedSequenceConfig || selectedPatients.length === 0}
                    >
                      {addPatientStep === "single" 
                        ? "Add to Sequence" 
                        : `Add ${selectedPatients.length > 0 ? selectedPatients.length : ''} to Sequence`
                      }
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sequences</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Workflow className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paused</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.paused}</p>
                  </div>
                  <Pause className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Sequences</CardTitle>
              {selectedSequences.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleBulkPause}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Selected ({selectedSequences.length})
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkStop}>
                    <X className="h-4 w-4 mr-2" />
                    Stop Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient, MRN, or sequence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sequenceTypeFilter} onValueChange={setSequenceTypeFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Sequence Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sequences</SelectItem>
                  {sequenceConfigs.map((seq) => (
                    <SelectItem key={seq.id} value={seq.id}>{seq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSequences.length === filteredSequences.length && filteredSequences.length > 0}
                      onCheckedChange={(checked) => {
                        setSelectedSequences(checked ? filteredSequences.map(s => s.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSequences.map((seq) => (
                  <TableRow key={seq.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSequences.includes(seq.id)}
                        onCheckedChange={(checked) => {
                          setSelectedSequences(prev =>
                            checked
                              ? [...prev, seq.id]
                              : prev.filter(id => id !== seq.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{seq.patientName}</div>
                        <div className="text-sm text-muted-foreground">MRN: {seq.patientMRN}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{seq.sequenceName}</div>
                        <div className="text-xs text-muted-foreground">Started {seq.enrolledDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Step {seq.currentStep} of {seq.totalSteps}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(seq.currentStep / seq.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(seq.status)}`}>
                        {getStatusIcon(seq.status)}
                        <span className="ml-1 capitalize">{seq.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {seq.nextAction ? (
                        <div className="text-sm">
                          <div>{seq.nextAction}</div>
                          {seq.nextActionDate && (
                            <div className="text-xs text-muted-foreground">{seq.nextActionDate}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {seq.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePauseSequence(seq.id)}
                            title="Pause sequence"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {seq.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResumeSequence(seq.id)}
                            title="Resume sequence"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStopSequence(seq.id)}
                          title="Stop sequence"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredSequences.length === 0 && (
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sequences found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || sequenceTypeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by adding patients to a sequence"}
                </p>
                <Button onClick={() => setAddPatientDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patients to Sequence
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
