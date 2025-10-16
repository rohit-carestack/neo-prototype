import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Building2, 
  Settings,
  UserPlus,
  UserMinus,
  Globe
} from "lucide-react";
import type { FaxLine, AssignmentRuleType, Location } from "@/types/faxLines";

// Mock data
const mockLocations: Location[] = [
  { id: "1", name: "ETS Hartford", address: "123 Main St, Hartford, CT", adminIds: ["admin1"] },
  { id: "2", name: "ETS New Haven", address: "456 Elm St, New Haven, CT", adminIds: ["admin1"] },
  { id: "3", name: "ETS Bridgeport", address: "789 Oak Ave, Bridgeport, CT", adminIds: ["admin2"] },
];

const mockAgents = [
  { id: "agent1", name: "Sarah Wilson" },
  { id: "agent2", name: "Michael Chen" },
  { id: "agent3", name: "Lisa Johnson" },
  { id: "agent4", name: "Amanda Rodriguez" },
  { id: "agent5", name: "James Thompson" },
];

const mockFaxLines: FaxLine[] = [
  {
    id: "1",
    name: "Hartford Main Line",
    phoneNumber: "(555) 100-0001",
    location: "ETS Hartford",
    assignedAgents: ["Sarah Wilson", "Michael Chen"],
    assignmentRule: "round_robin",
    isActive: true,
    createdAt: "2024-01-01",
    createdBy: "Admin",
    lastAssignedIndex: 0
  },
  {
    id: "2",
    name: "Hartford Referrals",
    phoneNumber: "(555) 100-0002",
    location: "ETS Hartford",
    assignedAgents: ["Sarah Wilson"],
    assignmentRule: "fixed_owner",
    fixedOwner: "Sarah Wilson",
    isActive: true,
    createdAt: "2024-01-05",
    createdBy: "Admin"
  },
  {
    id: "3",
    name: "New Haven Main",
    phoneNumber: "(555) 200-0001",
    location: "ETS New Haven",
    assignedAgents: ["Lisa Johnson", "Amanda Rodriguez"],
    assignmentRule: "manual",
    isActive: true,
    createdAt: "2024-01-10",
    createdBy: "Admin"
  },
  {
    id: "4",
    name: "Global Insurance Line",
    phoneNumber: "(555) 999-0001",
    location: undefined, // Global line
    assignedAgents: ["James Thompson"],
    assignmentRule: "manual",
    isActive: true,
    createdAt: "2024-01-15",
    createdBy: "Admin"
  },
];

export default function FaxLineConfiguration() {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [faxLines, setFaxLines] = useState<FaxLine[]>(mockFaxLines);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<FaxLine | null>(null);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    location: "",
    assignmentRule: "manual" as AssignmentRuleType,
    fixedOwner: "",
    isActive: true
  });

  // Current admin's location (mock - would come from user context)
  const currentAdminLocation = "ETS Hartford";

  // Filter fax lines based on admin's location
  const visibleFaxLines = faxLines.filter(line => 
    !line.location || line.location === currentAdminLocation
  );

  const handleCreateLine = () => {
    const newLine: FaxLine = {
      id: Date.now().toString(),
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      location: formData.location || undefined,
      assignedAgents: [],
      assignmentRule: formData.assignmentRule,
      fixedOwner: formData.fixedOwner || undefined,
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    };

    setFaxLines([...faxLines, newLine]);
    setEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Fax Line Created",
      description: `${newLine.name} has been created successfully.`,
    });
  };

  const handleUpdateLine = () => {
    if (!selectedLine) return;

    setFaxLines(faxLines.map(line => 
      line.id === selectedLine.id
        ? {
            ...line,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            location: formData.location || undefined,
            assignmentRule: formData.assignmentRule,
            fixedOwner: formData.fixedOwner || undefined,
            isActive: formData.isActive
          }
        : line
    ));

    setEditDialogOpen(false);
    setSelectedLine(null);
    resetForm();

    toast({
      title: "Fax Line Updated",
      description: `Changes saved successfully.`,
    });
  };

  const handleDeleteLine = (lineId: string) => {
    setFaxLines(faxLines.filter(line => line.id !== lineId));
    toast({
      title: "Fax Line Deleted",
      description: "The fax line has been removed.",
    });
  };

  const handleAddAgent = (lineId: string, agentName: string) => {
    setFaxLines(faxLines.map(line => {
      if (line.id === lineId && !line.assignedAgents.includes(agentName)) {
        return {
          ...line,
          assignedAgents: [...line.assignedAgents, agentName]
        };
      }
      return line;
    }));

    toast({
      title: "Agent Added",
      description: `${agentName} has been added to the fax line.`,
    });
  };

  const handleRemoveAgent = (lineId: string, agentName: string) => {
    setFaxLines(faxLines.map(line => {
      if (line.id === lineId) {
        const newAgents = line.assignedAgents.filter(a => a !== agentName);
        // Prevent removing last agent
        if (newAgents.length === 0) {
          toast({
            title: "Cannot Remove Agent",
            description: "A fax line must have at least one assigned agent.",
            variant: "destructive"
          });
          return line;
        }
        return {
          ...line,
          assignedAgents: newAgents
        };
      }
      return line;
    }));

    toast({
      title: "Agent Removed",
      description: `${agentName} has been removed from the fax line.`,
    });
  };

  const handleToggleActive = (lineId: string, isActive: boolean) => {
    setFaxLines(faxLines.map(line =>
      line.id === lineId ? { ...line, isActive } : line
    ));
  };

  const openEditDialog = (line?: FaxLine) => {
    if (line) {
      setSelectedLine(line);
      setFormData({
        name: line.name,
        phoneNumber: line.phoneNumber,
        location: line.location || "",
        assignmentRule: line.assignmentRule,
        fixedOwner: line.fixedOwner || "",
        isActive: line.isActive
      });
    } else {
      setSelectedLine(null);
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      location: "",
      assignmentRule: "manual",
      fixedOwner: "",
      isActive: true
    });
  };

  const getAssignmentRuleLabel = (rule: AssignmentRuleType) => {
    const labels = {
      manual: "Manual Assignment",
      round_robin: "Round Robin",
      fixed_owner: "Fixed Owner"
    };
    return labels[rule];
  };

  const getAssignmentRuleBadge = (rule: AssignmentRuleType) => {
    const colors = {
      manual: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
      round_robin: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300",
      fixed_owner: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300"
    };
    return (
      <Badge variant="outline" className={colors[rule]}>
        {getAssignmentRuleLabel(rule)}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Fax Line Configuration</h2>
            <p className="text-muted-foreground mt-1">
              Manage fax lines, agent assignments, and routing rules for {currentAdminLocation}
            </p>
          </div>
          <Button className="gap-2" onClick={() => openEditDialog()}>
            <Plus className="h-4 w-4" />
            New Fax Line
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visibleFaxLines.length}</p>
                  <p className="text-xs text-muted-foreground">Total Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visibleFaxLines.filter(l => l.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visibleFaxLines.filter(l => l.location).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Location Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visibleFaxLines.filter(l => !l.location).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Global Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fax Lines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fax Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assignment Rule</TableHead>
                  <TableHead>Assigned Agents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleFaxLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.name}</TableCell>
                    <TableCell className="font-mono text-sm">{line.phoneNumber}</TableCell>
                    <TableCell>
                      {line.location ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{line.location}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          Global
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getAssignmentRuleBadge(line.assignmentRule)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {line.assignedAgents.length}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Users className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Manage Agents - {line.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Assigned Agents</Label>
                                <div className="mt-2 space-y-2">
                                  {line.assignedAgents.map((agent) => (
                                    <div 
                                      key={agent}
                                      className="flex items-center justify-between p-2 rounded-lg border"
                                    >
                                      <span className="text-sm font-medium">{agent}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveAgent(line.id, agent)}
                                      >
                                        <UserMinus className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label>Add Agent</Label>
                                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                  {mockAgents
                                    .filter(agent => !line.assignedAgents.includes(agent.name))
                                    .map((agent) => (
                                      <Button
                                        key={agent.id}
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                        onClick={() => handleAddAgent(line.id, agent.name)}
                                      >
                                        <UserPlus className="h-4 w-4" />
                                        {agent.name}
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={line.isActive}
                          onCheckedChange={(checked) => handleToggleActive(line.id, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {line.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(line)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {visibleFaxLines.length === 0 && (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No fax lines configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first fax line to start managing incoming faxes
                </p>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Fax Line
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedLine ? "Edit Fax Line" : "Create New Fax Line"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Line Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Hartford Main Line"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location or leave blank for global" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Global (No Location)</SelectItem>
                    {mockLocations
                      .filter(loc => loc.name === currentAdminLocation)
                      .map((loc) => (
                        <SelectItem key={loc.id} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to create a global line visible only to admins
                </p>
              </div>
              <div>
                <Label htmlFor="assignmentRule">Assignment Rule</Label>
                <Select
                  value={formData.assignmentRule}
                  onValueChange={(value: AssignmentRuleType) => 
                    setFormData({ ...formData, assignmentRule: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Assignment</SelectItem>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="fixed_owner">Fixed Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.assignmentRule === "fixed_owner" && (
                <div>
                  <Label htmlFor="fixedOwner">Fixed Owner</Label>
                  <Select
                    value={formData.fixedOwner}
                    onValueChange={(value) => setFormData({ ...formData, fixedOwner: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={selectedLine ? handleUpdateLine : handleCreateLine}>
                {selectedLine ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}


