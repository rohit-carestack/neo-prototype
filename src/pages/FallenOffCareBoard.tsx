import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw, Phone, MessageSquare, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useUserRole } from "@/contexts/UserRoleContext";

interface AtRiskPatient {
  id: string;
  patientName: string;
  lastVisit: string;
  nextScheduled?: string;
  authorizedVisits: number;
  usedVisits: number;
  phone: string;
  therapist: string;
  diagnosis: string;
  stage: "detected" | "contacted" | "callback_scheduled" | "rescheduled" | "reengaged" | "lost";
  riskLevel: "high" | "medium" | "watch";
  daysSinceLastVisit: number;
  missedAppointments: number;
}

const mockPatients: AtRiskPatient[] = [
  {
    id: "1",
    patientName: "Sarah Martinez",
    lastVisit: "2024-01-01",
    authorizedVisits: 12,
    usedVisits: 6,
    phone: "(555) 123-4567",
    therapist: "Dr. Sarah Chen",
    diagnosis: "Lower back pain",
    stage: "detected",
    riskLevel: "high",
    daysSinceLastVisit: 14,
    missedAppointments: 2
  },
  {
    id: "2",
    patientName: "Michael Johnson",
    lastVisit: "2023-12-28",
    authorizedVisits: 8,
    usedVisits: 4,
    phone: "(555) 234-5678",
    therapist: "Dr. Mike Thompson",
    diagnosis: "Shoulder impingement",
    stage: "contacted",
    riskLevel: "medium",
    daysSinceLastVisit: 18,
    missedAppointments: 1
  },
  {
    id: "3",
    patientName: "Emma Davis",
    lastVisit: "2024-01-03",
    nextScheduled: "2024-01-25",
    authorizedVisits: 10,
    usedVisits: 8,
    phone: "(555) 345-6789",
    therapist: "Dr. Lisa Anderson",
    diagnosis: "Post-surgical knee rehab",
    stage: "callback_scheduled",
    riskLevel: "watch",
    daysSinceLastVisit: 12,
    missedAppointments: 0
  },
  {
    id: "4",
    patientName: "Robert Wilson",
    lastVisit: "2023-12-20",
    authorizedVisits: 15,
    usedVisits: 5,
    phone: "(555) 456-7890",
    therapist: "Dr. Tom Rogers",
    diagnosis: "Chronic neck pain",
    stage: "detected",
    riskLevel: "high",
    daysSinceLastVisit: 26,
    missedAppointments: 3
  },
  {
    id: "5",
    patientName: "Lisa Chen",
    lastVisit: "2024-01-05",
    nextScheduled: "2024-01-20",
    authorizedVisits: 12,
    usedVisits: 10,
    phone: "(555) 567-8901",
    therapist: "Dr. Sarah Chen",
    diagnosis: "Ankle sprain recovery",
    stage: "rescheduled",
    riskLevel: "watch",
    daysSinceLastVisit: 10,
    missedAppointments: 1
  },
  {
    id: "6",
    patientName: "David Park",
    lastVisit: "2024-01-08",
    nextScheduled: "2024-01-22",
    authorizedVisits: 8,
    usedVisits: 7,
    phone: "(555) 678-9012",
    therapist: "Dr. Mike Thompson",
    diagnosis: "Carpal tunnel post-op",
    stage: "reengaged",
    riskLevel: "watch",
    daysSinceLastVisit: 7,
    missedAppointments: 0
  }
];

const stages = [
  { key: "detected", label: "Detected At-Risk", color: "bg-red-500/10" },
  { key: "contacted", label: "Contacted", color: "bg-orange-500/10" },
  { key: "callback_scheduled", label: "Callback Scheduled", color: "bg-blue-500/10" },
  { key: "rescheduled", label: "Rescheduled", color: "bg-warning/10" },
  { key: "reengaged", label: "Re-engaged", color: "bg-success/10" },
  { key: "lost", label: "Lost to Care", color: "bg-muted" }
];

function PatientCard({ patient }: { patient: AtRiskPatient }) {
  const getRiskColor = () => {
    switch (patient.riskLevel) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      default: return "bg-blue-500 text-white";
    }
  };

  const getRiskIcon = () => {
    if (patient.riskLevel === "high") return <AlertTriangle className="h-3 w-3" />;
    return null;
  };

  return (
    <Card className="w-full mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={getRiskColor()}>
              {getRiskIcon()}
              <span className="ml-1">{patient.riskLevel.toUpperCase()}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {patient.daysSinceLastVisit}d gap
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-foreground text-sm mb-1">{patient.patientName}</h4>
        <p className="text-xs text-muted-foreground mb-2">{patient.diagnosis}</p>

        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Visits:</span>
            <span className="font-medium">{patient.usedVisits}/{patient.authorizedVisits} used</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last Visit:</span>
            <span>{patient.lastVisit}</span>
          </div>
          {patient.missedAppointments > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-destructive">Missed:</span>
              <span className="text-destructive font-medium">{patient.missedAppointments} appts</span>
            </div>
          )}
          {patient.nextScheduled && (
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3 w-3" />
              <span>Next: {patient.nextScheduled}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Phone className="h-3 w-3 mr-1" />
          {patient.phone}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <MessageSquare className="h-3 w-3 mr-1" />
            Text
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, patients }: { stage: typeof stages[0]; patients: AtRiskPatient[] }) {
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

export default function FallenOffCareBoard() {
  const { isAdmin } = useUserRole();
  const [patients] = useState<AtRiskPatient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access Fallen-Off Care Board</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "all" || patient.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <Layout>
      <div className="flex-1 p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Fallen-Off Care Board</h2>
            <p className="text-muted-foreground mt-1">Detect and reactivate under-scheduled patients</p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync from EMR
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="watch">Watch</SelectItem>
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
              <div className="text-2xl font-bold text-red-600">{patients.filter(p => p.riskLevel === "high").length}</div>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{patients.filter(p => p.missedAppointments > 0).length}</div>
              <p className="text-xs text-muted-foreground">Missed Visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{patients.filter(p => p.stage === "reengaged").length}</div>
              <p className="text-xs text-muted-foreground">Re-engaged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">67%</div>
              <p className="text-xs text-muted-foreground">Recovery Rate</p>
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
