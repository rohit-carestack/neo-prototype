import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Upload, RefreshCw, Phone, Mail, Calendar, User } from "lucide-react";
import { useUserRole } from "@/contexts/UserRoleContext";

interface DischargedPatient {
  id: string;
  patientName: string;
  dischargeDate: string;
  diagnosis: string;
  therapist: string;
  notes: string;
  phone?: string;
  email?: string;
  stage: "new" | "reviewed" | "contacted" | "interested" | "scheduled" | "reactivated";
  priority: "low" | "medium" | "high";
  daysSinceDischarge: number;
}

const mockPatients: DischargedPatient[] = [
  {
    id: "1",
    patientName: "Robert Martinez",
    dischargeDate: "2024-01-10",
    diagnosis: "Lower back pain - completed 8 weeks",
    therapist: "Dr. Sarah Chen",
    notes: "Excellent progress, expressed interest in maintenance program",
    phone: "(555) 123-4567",
    email: "robert.m@email.com",
    stage: "new",
    priority: "high",
    daysSinceDischarge: 5
  },
  {
    id: "2",
    patientName: "Lisa Johnson",
    dischargeDate: "2024-01-08",
    diagnosis: "Post-surgical knee rehab",
    therapist: "Dr. Mike Thompson",
    notes: "Full recovery achieved, may need follow-up in 6 months",
    phone: "(555) 234-5678",
    stage: "reviewed",
    priority: "medium",
    daysSinceDischarge: 7
  },
  {
    id: "3",
    patientName: "David Park",
    dischargeDate: "2024-01-05",
    diagnosis: "Shoulder impingement",
    therapist: "Dr. Sarah Chen",
    notes: "Discharged at goal, good candidate for preventative care",
    phone: "(555) 345-6789",
    email: "david.p@email.com",
    stage: "contacted",
    priority: "high",
    daysSinceDischarge: 10
  },
  {
    id: "4",
    patientName: "Jennifer Wu",
    dischargeDate: "2024-01-03",
    diagnosis: "Chronic neck pain management",
    therapist: "Dr. Lisa Anderson",
    notes: "Responded well to treatment, expressed interest in wellness program",
    phone: "(555) 456-7890",
    email: "jennifer.w@email.com",
    stage: "interested",
    priority: "high",
    daysSinceDischarge: 12
  },
  {
    id: "5",
    patientName: "Michael Brown",
    dischargeDate: "2023-12-28",
    diagnosis: "Sports injury - ankle sprain",
    therapist: "Dr. Tom Rogers",
    notes: "Full recovery, athlete may benefit from performance training",
    phone: "(555) 567-8901",
    stage: "scheduled",
    priority: "medium",
    daysSinceDischarge: 18
  },
  {
    id: "6",
    patientName: "Amanda Davis",
    dischargeDate: "2023-12-20",
    diagnosis: "Carpal tunnel post-op",
    therapist: "Dr. Sarah Chen",
    notes: "Successful discharge, enrolled in monthly maintenance",
    phone: "(555) 678-9012",
    email: "amanda.d@email.com",
    stage: "reactivated",
    priority: "low",
    daysSinceDischarge: 26
  }
];

const stages = [
  { key: "new", label: "New Discharges", color: "bg-muted" },
  { key: "reviewed", label: "Reviewed", color: "bg-blue-500/10" },
  { key: "contacted", label: "Contacted", color: "bg-secondary/10" },
  { key: "interested", label: "Interested", color: "bg-warning/10" },
  { key: "scheduled", label: "Scheduled", color: "bg-success/10" },
  { key: "reactivated", label: "Reactivated", color: "bg-primary/10" }
];

function PatientCard({ patient }: { patient: DischargedPatient }) {
  const getPriorityColor = () => {
    switch (patient.priority) {
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="w-full mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor()}>
              {patient.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {patient.daysSinceDischarge}d ago
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-foreground text-sm mb-1">{patient.patientName}</h4>
        <p className="text-xs text-muted-foreground mb-2">{patient.diagnosis}</p>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {patient.therapist}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Discharged: {patient.dischargeDate}
          </div>
          {patient.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {patient.phone}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3 italic line-clamp-2">
          {patient.notes}
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, patients }: { stage: typeof stages[0]; patients: DischargedPatient[] }) {
  const stagePatients = patients.filter(p => p.stage === stage.key);

  return (
    <div className="w-80 min-w-80 bg-accent/30 rounded-lg p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{stage.label}</h3>
          <Badge variant="outline" className="text-xs">
            {stagePatients.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 h-[600px] overflow-y-auto">
        {stagePatients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
        {stagePatients.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No patients in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export default function FutureOpportunitiesBoard() {
  const { isAdmin } = useUserRole();
  const [patients] = useState<DischargedPatient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("all");

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access Future Opportunities Board</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTherapist = therapistFilter === "all" || patient.therapist === therapistFilter;
    return matchesSearch && matchesTherapist;
  });

  return (
    <Layout>
      <div className="flex-1 p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Future Opportunities</h2>
            <p className="text-muted-foreground mt-1">Re-engage discharged patients for future care</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync from EMR
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={therapistFilter} onValueChange={setTherapistFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by therapist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Therapists</SelectItem>
              <SelectItem value="Dr. Sarah Chen">Dr. Sarah Chen</SelectItem>
              <SelectItem value="Dr. Mike Thompson">Dr. Mike Thompson</SelectItem>
              <SelectItem value="Dr. Lisa Anderson">Dr. Lisa Anderson</SelectItem>
              <SelectItem value="Dr. Tom Rogers">Dr. Tom Rogers</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Total Discharges</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{patients.filter(p => p.stage === "reactivated").length}</div>
              <p className="text-xs text-muted-foreground">Reactivated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{patients.filter(p => p.priority === "high").length}</div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">52%</div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[650px] w-full">
          {stages.map(stage => (
            <StageColumn key={stage.key} stage={stage} patients={filteredPatients} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
