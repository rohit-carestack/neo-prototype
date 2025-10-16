import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";

// Mock data for demonstration
const mockActivityData = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:25",
    actor: "Sarah Johnson (Intake Coordinator)",
    actorType: "user" as const,
    action: "Lead Assigned",
    entity: "Lead #2847",
    entityType: "lead" as const,
    details: "Assigned to John Smith",
    before: "Unassigned",
    after: "John Smith",
    ipAddress: "192.168.1.101"
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:28:12",
    actor: "AI System",
    actorType: "system" as const,
    action: "Fax Classified",
    entity: "Fax #4521",
    entityType: "fax" as const,
    details: "Classified as Referral with 94% confidence",
    before: "Unclassified",
    after: "Referral (94%)",
    ipAddress: null
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:25:08",
    actor: "Mike Chen (Billing Specialist)",
    actorType: "user" as const,
    action: "Eligibility Check Completed",
    entity: "Patient #1234",
    entityType: "patient" as const,
    details: "Blue Cross Blue Shield - Eligible, $25 copay, PA required",
    before: "Unknown eligibility",
    after: "Eligible (PA Required)",
    ipAddress: "192.168.1.102"
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:20:45",
    actor: "Auto Router",
    actorType: "system" as const,
    action: "Lead Routed",
    entity: "Lead #2845",
    entityType: "lead" as const,
    details: "Routed to Downtown Location based on ZIP code",
    before: "Unrouted",
    after: "Downtown Location",
    ipAddress: null
  },
  {
    id: "5",
    timestamp: "2024-01-15 14:18:33",
    actor: "Lisa Wong (Clinic Manager)",
    actorType: "user" as const,
    action: "Stage Changed",
    entity: "Lead #2843",
    entityType: "lead" as const,
    details: "Moved from 'Contacted' to 'Ready to Schedule'",
    before: "Contacted",
    after: "Ready to Schedule",
    ipAddress: "192.168.1.103"
  },
  {
    id: "6",
    timestamp: "2024-01-15 14:15:20",
    actor: "Sequence Engine",
    actorType: "system" as const,
    action: "SMS Sent",
    entity: "Patient #1235",
    entityType: "patient" as const,
    details: "Referral → First Eval sequence, Step 2: Intake paperwork reminder",
    before: null,
    after: null,
    ipAddress: null
  },
  {
    id: "7",
    timestamp: "2024-01-15 14:12:15",
    actor: "David Kim (Intake Coordinator)",
    actorType: "user" as const,
    action: "Workers Comp Case Created",
    entity: "WC Case #789",
    entityType: "workerscomp" as const,
    details: "Claim #WC-2024-001, Employer: ABC Manufacturing",
    before: null,
    after: "WC Intake",
    ipAddress: "192.168.1.104"
  },
  {
    id: "8",
    timestamp: "2024-01-15 14:08:42",
    actor: "AI System",
    actorType: "system" as const,
    action: "Duplicate Detected",
    entity: "Lead #2846",
    entityType: "lead" as const,
    details: "Possible duplicate of Patient #1234 (89% match score)",
    before: "New lead",
    after: "Flagged as duplicate",
    ipAddress: null
  }
];

const actorTypeColors = {
  user: "blue",
  system: "green",
  ai: "purple"
};

const entityTypeColors = {
  lead: "orange",
  patient: "blue",
  fax: "gray",
  workerscomp: "red",
  eligibility: "purple"
};

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actorFilter, setActorFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const filteredData = mockActivityData.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActor = actorFilter === "all" || item.actorType === actorFilter;
    const matchesEntity = entityFilter === "all" || item.entityType === entityFilter;
    
    return matchesSearch && matchesActor && matchesEntity;
  });

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Activity Log</h2>
          <p className="text-muted-foreground mt-1">Complete audit trail of all system activities and user actions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Activity</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
            <CardDescription>
              Real-time tracking of all actions for HIPAA compliance and operational oversight
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={actorFilter} onValueChange={setActorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actors</SelectItem>
                  <SelectItem value="user">Users Only</SelectItem>
                  <SelectItem value="system">System Only</SelectItem>
                  <SelectItem value="ai">AI Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="fax">Faxes</SelectItem>
                  <SelectItem value="workerscomp">Workers Comp</SelectItem>
                  <SelectItem value="eligibility">Eligibility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Before → After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-sm">
                        {activity.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={actorTypeColors[activity.actorType] as any} className="text-xs">
                            {activity.actorType}
                          </Badge>
                          <span className="text-sm">{activity.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{activity.action}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={entityTypeColors[activity.entityType] as any} className="text-xs">
                            {activity.entityType}
                          </Badge>
                          <span className="text-sm">{activity.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground">
                          {activity.details}
                        </span>
                      </TableCell>
                      <TableCell>
                        {activity.before && activity.after ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{activity.before}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{activity.after}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No activities found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}