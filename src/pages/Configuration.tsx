import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Users, FileText, Bell, Target, Save, UserCheck, MapPin, Phone, Plus, Trash2, Edit, Play, Pause, CheckCircle, Clock, Mail, MessageSquare } from "lucide-react";
import { SequenceWorkflowBuilder } from "@/components/SequenceWorkflowBuilder";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface Location {
  id: string;
  name: string;
  timezone: string;
  businessHours: { start: string; end: string };
  status: "active" | "inactive";
  assignedAgents: string[];
}

interface FaxLine {
  id: string;
  number: string;
  purpose: "referrals" | "insurance" | "records" | "billing" | "general";
  locationId: string;
  assignmentLogic: string;
  activeAgents: string[];
  status: "active" | "inactive";
}

export default function Configuration() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "locations");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Web Leads Configuration State
  const [webLeadsConfig, setWebLeadsConfig] = useState({
    assignmentLogic: "round-robin",
    autoAssignment: true,
    priorityBased: false,
    notifyOnNewLead: true,
    notificationDelay: "immediate",
    maxLeadsPerAgent: "10",
    businessHoursOnly: false,
    activeAgents: ["Sarah Wilson", "Michael Chen", "Lisa Johnson", "Amanda Rodriguez", "James Thompson"],
  });

  // Fax Leads Configuration State
  const [faxLeadsConfig, setFaxLeadsConfig] = useState({
    assignmentLogic: "manual",
    autoAssignment: false,
    autoCategorization: true,
    routingByCategory: true,
    notifyOnNewFax: true,
    notificationDelay: "5",
    requireReview: true,
    activeAgents: ["Sarah Wilson", "Michael Chen", "Lisa Johnson"],
  });

  // Locations State
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "1",
      name: "Downtown Clinic",
      timezone: "America/New_York",
      businessHours: { start: "09:00", end: "17:00" },
      status: "active",
      assignedAgents: ["Sarah Wilson", "Michael Chen"],
    },
    {
      id: "2",
      name: "West Side Branch",
      timezone: "America/New_York",
      businessHours: { start: "08:00", end: "18:00" },
      status: "active",
      assignedAgents: ["Lisa Johnson"],
    },
  ]);

  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: "",
    timezone: "America/New_York",
    businessHours: { start: "09:00", end: "17:00" },
    status: "active",
    assignedAgents: [],
  });

  // Fax Lines State
  const [faxLines, setFaxLines] = useState<FaxLine[]>([
    {
      id: "1",
      number: "+1-555-0101",
      purpose: "referrals",
      locationId: "1",
      assignmentLogic: "round-robin",
      activeAgents: ["Sarah Wilson", "Michael Chen"],
      status: "active",
    },
    {
      id: "2",
      number: "+1-555-0102",
      purpose: "insurance",
      locationId: "1",
      assignmentLogic: "manual",
      activeAgents: ["Lisa Johnson"],
      status: "active",
    },
  ]);

  const [newFaxLine, setNewFaxLine] = useState<Partial<FaxLine>>({
    number: "",
    purpose: "general",
    locationId: "",
    assignmentLogic: "manual",
    activeAgents: [],
    status: "active",
  });

  // Sequences State
  const [selectedSequence, setSelectedSequence] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const sequences = [
    {
      id: "SEQ-001",
      name: "Lead Qualification",
      description: "Automated sequence to qualify new leads and gather initial information",
      status: "active",
      enrolledCount: 24,
      completionRate: 68,
      steps: [
        { id: 1, type: "email", title: "Welcome Email", delay: 0, delayUnit: "minutes" },
        { id: 2, type: "sms", title: "Initial SMS Follow-up", delay: 2, delayUnit: "hours" },
        { id: 3, type: "call", title: "Qualification Call", delay: 1, delayUnit: "days" },
        { id: 4, type: "email", title: "Service Information", delay: 2, delayUnit: "days" }
      ],
      createdAt: "2024-01-10",
      lastModified: "2024-01-15"
    },
    {
      id: "SEQ-002",
      name: "Patient Intake",
      description: "Guide new patients through the intake process and appointment scheduling",
      status: "active",
      enrolledCount: 18,
      completionRate: 82,
      steps: [
        { id: 1, type: "email", title: "Welcome to Practice", delay: 0, delayUnit: "minutes" },
        { id: 2, type: "email", title: "Complete Forms Reminder", delay: 1, delayUnit: "days" },
        { id: 3, type: "sms", title: "Appointment Confirmation", delay: 2, delayUnit: "days" },
        { id: 4, type: "call", title: "Pre-appointment Check-in", delay: 1, delayUnit: "days" }
      ],
      createdAt: "2024-01-08",
      lastModified: "2024-01-12"
    },
    {
      id: "SEQ-003",
      name: "Feedback Collection",
      description: "Collect patient feedback after service completion",
      status: "active",
      enrolledCount: 45,
      completionRate: 54,
      steps: [
        { id: 1, type: "email", title: "Thank You Email", delay: 1, delayUnit: "days" },
        { id: 2, type: "email", title: "Feedback Survey", delay: 3, delayUnit: "days" },
        { id: 3, type: "sms", title: "Survey Reminder", delay: 2, delayUnit: "days" }
      ],
      createdAt: "2024-01-05",
      lastModified: "2024-01-14"
    },
    {
      id: "SEQ-004",
      name: "NPS Survey",
      description: "Measure patient satisfaction and Net Promoter Score",
      status: "active",
      enrolledCount: 32,
      completionRate: 61,
      steps: [
        { id: 1, type: "email", title: "NPS Survey Email", delay: 7, delayUnit: "days" },
        { id: 2, type: "sms", title: "Survey Follow-up", delay: 3, delayUnit: "days" }
      ],
      createdAt: "2024-01-03",
      lastModified: "2024-01-10"
    },
    {
      id: "SEQ-005",
      name: "Google Review Request",
      description: "Encourage satisfied patients to leave Google reviews",
      status: "active",
      enrolledCount: 28,
      completionRate: 43,
      steps: [
        { id: 1, type: "email", title: "Review Request", delay: 5, delayUnit: "days" },
        { id: 2, type: "sms", title: "Review Reminder", delay: 3, delayUnit: "days" }
      ],
      createdAt: "2024-01-01",
      lastModified: "2024-01-08"
    },
    {
      id: "SEQ-006",
      name: "Follow-up Care",
      description: "Post-treatment follow-up and continued care engagement",
      status: "paused",
      enrolledCount: 12,
      completionRate: 75,
      steps: [
        { id: 1, type: "email", title: "Recovery Tips", delay: 3, delayUnit: "days" },
        { id: 2, type: "call", title: "Check-in Call", delay: 7, delayUnit: "days" },
        { id: 3, type: "email", title: "Schedule Follow-up", delay: 14, delayUnit: "days" }
      ],
      createdAt: "2023-12-28",
      lastModified: "2024-01-05"
    },
    {
      id: "SEQ-007",
      name: "Insurance Verification",
      description: "Automated insurance verification and eligibility confirmation",
      status: "active",
      enrolledCount: 21,
      completionRate: 88,
      steps: [
        { id: 1, type: "email", title: "Insurance Info Request", delay: 0, delayUnit: "minutes" },
        { id: 2, type: "call", title: "Verification Call", delay: 1, delayUnit: "days" },
        { id: 3, type: "email", title: "Verification Complete", delay: 0, delayUnit: "minutes" }
      ],
      createdAt: "2023-12-20",
      lastModified: "2024-01-06"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "paused": return "bg-orange-100 text-orange-800 border-orange-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <MessageSquare className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const sequenceStats = {
    total: sequences.length,
    active: sequences.filter(s => s.status === "active").length,
    totalEnrolled: sequences.reduce((sum, s) => sum + s.enrolledCount, 0),
    avgCompletion: Math.round(
      sequences.reduce((sum, s) => sum + s.completionRate, 0) / sequences.length
    )
  };

  const agents = [
    "Sarah Wilson",
    "Michael Chen",
    "Lisa Johnson",
    "Amanda Rodriguez",
    "James Thompson"
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
  ];

  const handleSaveWebLeads = () => {
    toast({
      title: "Configuration Saved",
      description: "Web leads configuration has been updated successfully.",
    });
  };

  const handleSaveFaxLeads = () => {
    toast({
      title: "Configuration Saved",
      description: "Fax leads configuration has been updated successfully.",
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.name) {
      toast({
        title: "Error",
        description: "Please enter a location name.",
        variant: "destructive",
      });
      return;
    }

    const location: Location = {
      id: String(locations.length + 1),
      name: newLocation.name,
      timezone: newLocation.timezone || "America/New_York",
      businessHours: newLocation.businessHours || { start: "09:00", end: "17:00" },
      status: newLocation.status || "active",
      assignedAgents: newLocation.assignedAgents || [],
    };

    setLocations([...locations, location]);
    setNewLocation({
      name: "",
      timezone: "America/New_York",
      businessHours: { start: "09:00", end: "17:00" },
      status: "active",
      assignedAgents: [],
    });

    toast({
      title: "Location Added",
      description: `${location.name} has been added successfully.`,
    });
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    toast({
      title: "Location Deleted",
      description: "Location has been removed.",
    });
  };

  const handleAddFaxLine = () => {
    if (!newFaxLine.number || !newFaxLine.locationId) {
      toast({
        title: "Error",
        description: "Please enter fax number and select a location.",
        variant: "destructive",
      });
      return;
    }

    const faxLine: FaxLine = {
      id: String(faxLines.length + 1),
      number: newFaxLine.number,
      purpose: newFaxLine.purpose || "general",
      locationId: newFaxLine.locationId,
      assignmentLogic: newFaxLine.assignmentLogic || "manual",
      activeAgents: newFaxLine.activeAgents || [],
      status: newFaxLine.status || "active",
    };

    setFaxLines([...faxLines, faxLine]);
    setNewFaxLine({
      number: "",
      purpose: "general",
      locationId: "",
      assignmentLogic: "manual",
      activeAgents: [],
      status: "active",
    });

    toast({
      title: "Fax Line Added",
      description: `Fax line ${faxLine.number} has been added successfully.`,
    });
  };

  const handleDeleteFaxLine = (id: string) => {
    setFaxLines(faxLines.filter((line) => line.id !== id));
    toast({
      title: "Fax Line Deleted",
      description: "Fax line has been removed.",
    });
  };

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">System Configuration</h2>
          <p className="text-muted-foreground mt-1">Manage system settings and configurations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="fax-lines">
              <Phone className="h-4 w-4 mr-2" />
              Fax Lines
            </TabsTrigger>
            <TabsTrigger value="sequences">
              <Target className="h-4 w-4 mr-2" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="web-leads">
              <Users className="h-4 w-4 mr-2" />
              Web Leads
            </TabsTrigger>
            <TabsTrigger value="fax-leads">
              <FileText className="h-4 w-4 mr-2" />
              Fax Leads
            </TabsTrigger>
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Locations Configuration */}
          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Add New Location
                </CardTitle>
                <CardDescription>
                  Add a clinic or branch location to your system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location-name">Location Name</Label>
                    <Input
                      id="location-name"
                      placeholder="e.g., Downtown Clinic"
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation({ ...newLocation, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location-timezone">Timezone</Label>
                    <Select
                      value={newLocation.timezone}
                      onValueChange={(value) =>
                        setNewLocation({ ...newLocation, timezone: value })
                      }
                    >
                      <SelectTrigger id="location-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-start">Business Hours Start</Label>
                    <Input
                      id="business-start"
                      type="time"
                      value={newLocation.businessHours?.start}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          businessHours: {
                            ...newLocation.businessHours!,
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-end">Business Hours End</Label>
                    <Input
                      id="business-end"
                      type="time"
                      value={newLocation.businessHours?.end}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          businessHours: {
                            ...newLocation.businessHours!,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Agents</Label>
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <div key={agent} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-location-agent-${agent}`}
                          checked={newLocation.assignedAgents?.includes(agent)}
                          onCheckedChange={(checked) => {
                            const current = newLocation.assignedAgents || [];
                            if (checked) {
                              setNewLocation({
                                ...newLocation,
                                assignedAgents: [...current, agent],
                              });
                            } else {
                              setNewLocation({
                                ...newLocation,
                                assignedAgents: current.filter((a) => a !== agent),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`new-location-agent-${agent}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {agent}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddLocation} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Locations</CardTitle>
                <CardDescription>
                  Manage your clinic and branch locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{location.name}</h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              location.status === "active"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {location.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.timezone} • {location.businessHours.start} -{" "}
                          {location.businessHours.end}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {location.assignedAgents.length} agent(s):{" "}
                          {location.assignedAgents.join(", ")}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fax Lines Configuration */}
          <TabsContent value="fax-lines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Add New Fax Line
                </CardTitle>
                <CardDescription>
                  Configure a new fax line or virtual DID for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fax-number">Fax Number / DID</Label>
                    <Input
                      id="fax-number"
                      placeholder="+1-555-0123"
                      value={newFaxLine.number}
                      onChange={(e) =>
                        setNewFaxLine({ ...newFaxLine, number: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fax-location">Location</Label>
                    <Select
                      value={newFaxLine.locationId}
                      onValueChange={(value) =>
                        setNewFaxLine({ ...newFaxLine, locationId: value })
                      }
                    >
                      <SelectTrigger id="fax-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fax-purpose">Purpose</Label>
                    <Select
                      value={newFaxLine.purpose}
                      onValueChange={(value: any) =>
                        setNewFaxLine({ ...newFaxLine, purpose: value })
                      }
                    >
                      <SelectTrigger id="fax-purpose">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="referrals">Referrals</SelectItem>
                        <SelectItem value="insurance">Insurance / Auth</SelectItem>
                        <SelectItem value="records">Medical Records</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fax-assignment">Assignment Logic</Label>
                    <Select
                      value={newFaxLine.assignmentLogic}
                      onValueChange={(value) =>
                        setNewFaxLine({ ...newFaxLine, assignmentLogic: value })
                      }
                    >
                      <SelectTrigger id="fax-assignment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="load-balanced">Load Balanced</SelectItem>
                        <SelectItem value="category-based">Category-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Active Agents</Label>
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <div key={agent} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-fax-agent-${agent}`}
                          checked={newFaxLine.activeAgents?.includes(agent)}
                          onCheckedChange={(checked) => {
                            const current = newFaxLine.activeAgents || [];
                            if (checked) {
                              setNewFaxLine({
                                ...newFaxLine,
                                activeAgents: [...current, agent],
                              });
                            } else {
                              setNewFaxLine({
                                ...newFaxLine,
                                activeAgents: current.filter((a) => a !== agent),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`new-fax-agent-${agent}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {agent}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddFaxLine} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Fax Line
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Fax Lines</CardTitle>
                <CardDescription>
                  Manage your fax lines and virtual DIDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faxLines.map((line) => {
                    const location = locations.find((loc) => loc.id === line.locationId);
                    return (
                      <div
                        key={line.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{line.number}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">
                              {line.purpose}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                line.status === "active"
                                  ? "bg-success/20 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {line.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Location: {location?.name || "Unknown"} • Assignment:{" "}
                            {line.assignmentLogic}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {line.activeAgents.length} agent(s):{" "}
                            {line.activeAgents.join(", ")}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteFaxLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sequences Configuration */}
          <TabsContent value="sequences" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sequenceStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Sequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{sequenceStats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sequenceStats.totalEnrolled}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sequenceStats.avgCompletion}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Drip Sequences</CardTitle>
                    <CardDescription>Manage automated communication sequences</CardDescription>
                  </div>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Sequence
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Sequence</DialogTitle>
                        <DialogDescription>
                          Set up a new automated sequence for leads or patients
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="seq-name">Sequence Name</Label>
                          <Input id="seq-name" placeholder="e.g., New Patient Welcome" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seq-desc">Description</Label>
                          <Textarea id="seq-desc" placeholder="Describe the purpose of this sequence..." rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seq-status">Status</Label>
                          <Select defaultValue="draft">
                            <SelectTrigger id="seq-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => setCreateDialogOpen(false)}>Create & Configure Steps</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sequence Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences.map((sequence) => (
                      <TableRow key={sequence.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sequence.name}</div>
                            <div className="text-sm text-muted-foreground">{sequence.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sequence.status)}>
                            {sequence.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {sequence.status === "paused" && <Pause className="h-3 w-3 mr-1" />}
                            {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{sequence.enrolledCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${sequence.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{sequence.completionRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{sequence.steps.length} steps</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedSequence(sequence)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>Edit Sequence - {sequence.name}</DialogTitle>
                                  <DialogDescription>Build your sequence workflow with drag-and-drop</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Sequence Name</Label>
                                      <Input defaultValue={sequence.name} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      <Select defaultValue={sequence.status}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="paused">Paused</SelectItem>
                                          <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea defaultValue={sequence.description} rows={2} />
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-base font-semibold">Workflow Builder</Label>
                                    <SequenceWorkflowBuilder />
                                  </div>

                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Save Workflow</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => console.log(`Toggle sequence ${sequence.id}`)}
                            >
                              {sequence.status === "active" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Leads Configuration */}
          <TabsContent value="web-leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Assignment Logic
                </CardTitle>
                <CardDescription>
                  Configure how web leads are assigned to agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-logic">Assignment Method</Label>
                    <Select
                      value={webLeadsConfig.assignmentLogic}
                      onValueChange={(value) =>
                        setWebLeadsConfig({ ...webLeadsConfig, assignmentLogic: value })
                      }
                    >
                      <SelectTrigger id="assignment-logic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="load-balanced">Load Balanced</SelectItem>
                        <SelectItem value="priority-based">Priority Based</SelectItem>
                        <SelectItem value="manual">Manual Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {webLeadsConfig.assignmentLogic === "round-robin" &&
                        "Distributes leads evenly among all agents in sequence"}
                      {webLeadsConfig.assignmentLogic === "load-balanced" &&
                        "Assigns to agents with the fewest active leads"}
                      {webLeadsConfig.assignmentLogic === "priority-based" &&
                        "Routes leads based on source priority and agent specialization"}
                      {webLeadsConfig.assignmentLogic === "manual" &&
                        "All leads require manual assignment by an admin or manager"}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-assignment">Enable Auto-Assignment</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically assign new leads to agents
                      </p>
                    </div>
                    <Switch
                      id="auto-assignment"
                      checked={webLeadsConfig.autoAssignment}
                      onCheckedChange={(checked) =>
                        setWebLeadsConfig({ ...webLeadsConfig, autoAssignment: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="priority-based">Priority-Based Routing</Label>
                      <p className="text-sm text-muted-foreground">
                        Route high-priority leads to senior agents first
                      </p>
                    </div>
                    <Switch
                      id="priority-based"
                      checked={webLeadsConfig.priorityBased}
                      onCheckedChange={(checked) =>
                        setWebLeadsConfig({ ...webLeadsConfig, priorityBased: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="business-hours">Business Hours Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Only auto-assign during business hours (9 AM - 5 PM)
                      </p>
                    </div>
                    <Switch
                      id="business-hours"
                      checked={webLeadsConfig.businessHoursOnly}
                      onCheckedChange={(checked) =>
                        setWebLeadsConfig({ ...webLeadsConfig, businessHoursOnly: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="max-leads">Max Leads Per Agent</Label>
                    <Input
                      id="max-leads"
                      type="number"
                      value={webLeadsConfig.maxLeadsPerAgent}
                      onChange={(e) =>
                        setWebLeadsConfig({ ...webLeadsConfig, maxLeadsPerAgent: e.target.value })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum number of active leads an agent can have
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Active Agents
                </CardTitle>
                <CardDescription>
                  Select which agents should receive web leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent} className="flex items-center space-x-2">
                        <Checkbox
                          id={`web-agent-${agent}`}
                          checked={webLeadsConfig.activeAgents.includes(agent)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWebLeadsConfig({
                                ...webLeadsConfig,
                                activeAgents: [...webLeadsConfig.activeAgents, agent],
                              });
                            } else {
                              setWebLeadsConfig({
                                ...webLeadsConfig,
                                activeAgents: webLeadsConfig.activeAgents.filter((a) => a !== agent),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`web-agent-${agent}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {agent}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {webLeadsConfig.activeAgents.length} of {agents.length} agents selected
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure notification settings for web leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-new-lead">Notify on New Lead</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when new leads are received
                    </p>
                  </div>
                  <Switch
                    id="notify-new-lead"
                    checked={webLeadsConfig.notifyOnNewLead}
                    onCheckedChange={(checked) =>
                      setWebLeadsConfig({ ...webLeadsConfig, notifyOnNewLead: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-delay">Notification Timing</Label>
                  <Select
                    value={webLeadsConfig.notificationDelay}
                    onValueChange={(value) =>
                      setWebLeadsConfig({ ...webLeadsConfig, notificationDelay: value })
                    }
                  >
                    <SelectTrigger id="notification-delay">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Hourly digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveWebLeads} className="gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          {/* Fax Leads Configuration */}
          <TabsContent value="fax-leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Assignment Logic
                </CardTitle>
                <CardDescription>
                  Configure how fax leads are assigned to agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fax-assignment-logic">Assignment Method</Label>
                    <Select
                      value={faxLeadsConfig.assignmentLogic}
                      onValueChange={(value) =>
                        setFaxLeadsConfig({ ...faxLeadsConfig, assignmentLogic: value })
                      }
                    >
                      <SelectTrigger id="fax-assignment-logic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Assignment</SelectItem>
                        <SelectItem value="category-based">Category-Based</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="specialist">Specialist Routing</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {faxLeadsConfig.assignmentLogic === "manual" &&
                        "All faxes require manual review and assignment by an admin or manager"}
                      {faxLeadsConfig.assignmentLogic === "category-based" &&
                        "Routes faxes based on automatically detected category"}
                      {faxLeadsConfig.assignmentLogic === "round-robin" &&
                        "Distributes faxes evenly among all agents"}
                      {faxLeadsConfig.assignmentLogic === "specialist" &&
                        "Routes to agents based on document type and specialization"}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="fax-auto-assignment">Enable Auto-Assignment</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically assign faxes based on rules
                      </p>
                    </div>
                    <Switch
                      id="fax-auto-assignment"
                      checked={faxLeadsConfig.autoAssignment}
                      onCheckedChange={(checked) =>
                        setFaxLeadsConfig({ ...faxLeadsConfig, autoAssignment: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-categorization">Auto-Categorization</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and categorize fax documents
                      </p>
                    </div>
                    <Switch
                      id="auto-categorization"
                      checked={faxLeadsConfig.autoCategorization}
                      onCheckedChange={(checked) =>
                        setFaxLeadsConfig({ ...faxLeadsConfig, autoCategorization: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="routing-by-category">Route by Category</Label>
                      <p className="text-sm text-muted-foreground">
                        Use category to determine assignment
                      </p>
                    </div>
                    <Switch
                      id="routing-by-category"
                      checked={faxLeadsConfig.routingByCategory}
                      onCheckedChange={(checked) =>
                        setFaxLeadsConfig({ ...faxLeadsConfig, routingByCategory: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-review">Require Manual Review</Label>
                      <p className="text-sm text-muted-foreground">
                        All auto-assigned faxes must be reviewed by staff
                      </p>
                    </div>
                    <Switch
                      id="require-review"
                      checked={faxLeadsConfig.requireReview}
                      onCheckedChange={(checked) =>
                        setFaxLeadsConfig({ ...faxLeadsConfig, requireReview: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Active Agents
                </CardTitle>
                <CardDescription>
                  Select which agents should receive fax leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fax-agent-${agent}`}
                          checked={faxLeadsConfig.activeAgents.includes(agent)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFaxLeadsConfig({
                                ...faxLeadsConfig,
                                activeAgents: [...faxLeadsConfig.activeAgents, agent],
                              });
                            } else {
                              setFaxLeadsConfig({
                                ...faxLeadsConfig,
                                activeAgents: faxLeadsConfig.activeAgents.filter((a) => a !== agent),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`fax-agent-${agent}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {agent}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {faxLeadsConfig.activeAgents.length} of {agents.length} agents selected
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Category Routing Rules
                </CardTitle>
                <CardDescription>
                  Assign agents to specific fax categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Referral Documents</Label>
                      <Select defaultValue="sarah-wilson">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent} value={agent.toLowerCase().replace(" ", "-")}>
                              {agent}
                            </SelectItem>
                          ))}
                          <SelectItem value="team">Front Desk Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Insurance Documents</Label>
                      <Select defaultValue="team">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent} value={agent.toLowerCase().replace(" ", "-")}>
                              {agent}
                            </SelectItem>
                          ))}
                          <SelectItem value="team">Billing Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Medical Records</Label>
                      <Select defaultValue="clinical">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent} value={agent.toLowerCase().replace(" ", "-")}>
                              {agent}
                            </SelectItem>
                          ))}
                          <SelectItem value="clinical">Clinical Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Other Documents</Label>
                      <Select defaultValue="manual">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent} value={agent.toLowerCase().replace(" ", "-")}>
                              {agent}
                            </SelectItem>
                          ))}
                          <SelectItem value="manual">Requires Manual Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure notification settings for fax leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-new-fax">Notify on New Fax</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when new faxes are received
                    </p>
                  </div>
                  <Switch
                    id="notify-new-fax"
                    checked={faxLeadsConfig.notifyOnNewFax}
                    onCheckedChange={(checked) =>
                      setFaxLeadsConfig({ ...faxLeadsConfig, notifyOnNewFax: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fax-notification-delay">Notification Delay (minutes)</Label>
                  <Input
                    id="fax-notification-delay"
                    type="number"
                    value={faxLeadsConfig.notificationDelay}
                    onChange={(e) =>
                      setFaxLeadsConfig({ ...faxLeadsConfig, notificationDelay: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Delay before sending notification (0 for immediate)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveFaxLeads} className="gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          {/* General Configuration */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  System-wide configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Additional configuration options coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
