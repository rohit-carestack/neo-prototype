import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Phone, Mail, Calendar, FileText, Send, CheckCircle2, Clock, AlertCircle, FileImage } from "lucide-react";

type ActivityType = "call" | "fax" | "enb" | "message" | "form" | "appointment" | "verification";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "in-progress" | "pending" | "failed";
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  insurance: string;
  lastActivity: string;
  status: "active" | "inactive" | "pending";
  totalActivities: number;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "John Smith",
    dob: "03/15/1985",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    insurance: "Blue Cross Blue Shield",
    lastActivity: "2 hours ago",
    status: "active",
    totalActivities: 24
  },
  {
    id: "2",
    name: "Sarah Johnson",
    dob: "07/22/1990",
    phone: "(555) 234-5678",
    email: "sarah.j@email.com",
    insurance: "Aetna",
    lastActivity: "1 day ago",
    status: "active",
    totalActivities: 18
  },
  {
    id: "3",
    name: "Michael Chen",
    dob: "11/08/1978",
    phone: "(555) 345-6789",
    email: "m.chen@email.com",
    insurance: "UnitedHealthcare",
    lastActivity: "3 days ago",
    status: "pending",
    totalActivities: 12
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    dob: "05/30/1995",
    phone: "(555) 456-7890",
    email: "emily.r@email.com",
    insurance: "Cigna",
    lastActivity: "1 week ago",
    status: "active",
    totalActivities: 31
  },
  {
    id: "5",
    name: "David Williams",
    dob: "09/12/1982",
    phone: "(555) 567-8901",
    email: "d.williams@email.com",
    insurance: "Medicare",
    lastActivity: "2 weeks ago",
    status: "inactive",
    totalActivities: 8
  }
];

const mockActivities: Record<string, Activity[]> = {
  "1": [
    {
      id: "a1",
      type: "enb",
      title: "E&B Verification Completed",
      description: "Insurance eligibility verified for Blue Cross Blue Shield",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: "a2",
      type: "call",
      title: "Outbound Call",
      description: "Appointment confirmation call - Patient confirmed for 03/25",
      timestamp: "5 hours ago",
      status: "completed"
    },
    {
      id: "a3",
      type: "fax",
      title: "Fax Received",
      description: "Medical records from referring physician",
      timestamp: "1 day ago",
      status: "completed"
    },
    {
      id: "a4",
      type: "enb",
      title: "E&B Verification In Progress",
      description: "Verifying secondary insurance coverage",
      timestamp: "1 day ago",
      status: "in-progress"
    },
    {
      id: "a5",
      type: "form",
      title: "Form Sent",
      description: "Patient intake form sent via email",
      timestamp: "2 days ago",
      status: "completed"
    },
    {
      id: "a6",
      type: "message",
      title: "SMS Reminder",
      description: "Appointment reminder sent",
      timestamp: "3 days ago",
      status: "completed"
    },
    {
      id: "a7",
      type: "call",
      title: "Inbound Call",
      description: "Patient inquiry about insurance coverage",
      timestamp: "4 days ago",
      status: "completed"
    },
    {
      id: "a8",
      type: "verification",
      title: "Insurance Verification",
      description: "Primary insurance verified and active",
      timestamp: "1 week ago",
      status: "completed"
    }
  ]
};

const activityIcons = {
  call: Phone,
  fax: FileImage,
  enb: CheckCircle2,
  message: Mail,
  form: FileText,
  appointment: Calendar,
  verification: CheckCircle2
};

const activityColors = {
  call: "bg-primary",
  fax: "bg-accent",
  enb: "bg-success",
  message: "bg-info",
  form: "bg-warning",
  appointment: "bg-primary",
  verification: "bg-success"
};

const statusColors = {
  completed: "bg-success",
  "in-progress": "bg-warning",
  pending: "bg-muted",
  failed: "bg-destructive"
};

const statusIcons = {
  completed: CheckCircle2,
  "in-progress": Clock,
  pending: Clock,
  failed: AlertCircle
};

export default function Patients() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Auto-open patient profile if ID is in URL
  useEffect(() => {
    const patientId = searchParams.get('id');
    if (patientId) {
      const patient = mockPatients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        setSheetOpen(true);
      }
    }
  }, [searchParams]);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setSheetOpen(true);
  };

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Patient Directory</h2>
          <p className="text-muted-foreground mt-1">Search and manage patient information</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, leads, referrers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePatientClick(patient)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                      <Badge variant={patient.status === "active" ? "default" : patient.status === "pending" ? "secondary" : "outline"}>
                        {patient.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">DOB</p>
                        <p className="font-medium">{patient.dob}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{patient.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{patient.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Insurance</p>
                        <p className="font-medium">{patient.insurance}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Last Activity: <span className="text-foreground font-medium">{patient.lastActivity}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Total Activities: <span className="text-foreground font-medium">{patient.totalActivities}</span>
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Patient Profile Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-2xl">
            {selectedPatient && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-2xl">{selectedPatient.name}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Patient Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{selectedPatient.dob}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={selectedPatient.status === "active" ? "default" : "outline"}>
                            {selectedPatient.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedPatient.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-sm">{selectedPatient.email}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Insurance Provider</p>
                          <p className="font-medium">{selectedPatient.insurance}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {mockActivities[selectedPatient.id]?.map((activity) => {
                            const Icon = activityIcons[activity.type];
                            const StatusIcon = statusIcons[activity.status];
                            
                            return (
                              <div key={activity.id} className="flex gap-4">
                                <div className="relative">
                                  <div className={`rounded-full p-2 ${activityColors[activity.type]} text-white`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  {activity.id !== mockActivities[selectedPatient.id][mockActivities[selectedPatient.id].length - 1].id && (
                                    <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                                  )}
                                </div>
                                
                                <div className="flex-1 pb-8">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <p className="font-semibold text-foreground">{activity.title}</p>
                                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {activity.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                                  <div className="mt-2 flex gap-2">
                                    <Button variant="outline" size="sm">View Details</Button>
                                    {activity.type === "call" && (
                                      <Button variant="ghost" size="sm">Listen to Recording</Button>
                                    )}
                                    {activity.type === "fax" && (
                                      <Button variant="ghost" size="sm">View Fax</Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}