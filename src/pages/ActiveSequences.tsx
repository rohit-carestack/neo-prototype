import { Layout } from "@/components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, StopCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActiveSequences() {
  // Mock data - replace with actual data fetching
  const activeSequences = [
    {
      id: 1,
      phoneNumber: "+1 (555) 123-4567",
      sequenceName: "New Patient Intake",
      status: "running",
      started: "2024-01-15 10:30 AM",
      currentStep: "Step 2: Initial Contact",
      completionRate: 45,
    },
    {
      id: 2,
      phoneNumber: "+1 (555) 234-5678",
      sequenceName: "Follow-up Reminder",
      status: "running",
      started: "2024-01-14 02:15 PM",
      currentStep: "Step 3: SMS Reminder",
      completionRate: 67,
    },
    {
      id: 3,
      phoneNumber: "+1 (555) 345-6789",
      sequenceName: "Appointment Confirmation",
      status: "paused",
      started: "2024-01-13 09:00 AM",
      currentStep: "Step 1: Email",
      completionRate: 20,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Sequences</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage sequences currently running on phone numbers
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Running</CardDescription>
              <CardTitle className="text-3xl">
                {activeSequences.filter((s) => s.status === "running").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paused</CardDescription>
              <CardTitle className="text-3xl">
                {activeSequences.filter((s) => s.status === "paused").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Active</CardDescription>
              <CardTitle className="text-3xl">{activeSequences.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sequence Assignments</CardTitle>
            <CardDescription>View all phone numbers with active sequence assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Sequence Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell className="font-mono">{sequence.phoneNumber}</TableCell>
                    <TableCell className="font-medium">{sequence.sequenceName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(sequence.status)}>
                        {sequence.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sequence.currentStep}
                    </TableCell>
                    <TableCell className="text-sm">{sequence.started}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${sequence.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {sequence.completionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {sequence.status === "running" ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
