import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Phone, Mail, MapPin, Clock, TrendingUp, Users, Target, Filter, Plus, Eye, Edit, MessageSquare, UserCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { CreateInEMRButton } from "@/components/CreateInEMRButton";
import { convertLeadToReferral } from "@/utils/referral-converters";
import { useToast } from "@/hooks/use-toast";
import type { EMRCreationResult } from "@/components/CreateInEMRButton";
import { SequenceManagementModal } from "@/components/SequenceManagementModal";
import type { SequenceConfig } from "@/config/sequences";
import { AddToBoardModal } from "@/components/AddToBoardModal";
import type { AddToBoardData } from "@/components/AddToBoardModal";

const leadsData = [
    {
      id: "WL-001",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      source: "contact form",
      service: "Physical Therapy",
      status: "not contacted",
      priority: "high",
      submittedAt: "2024-01-15T10:30:00",
      lastContact: null,
      boardStatus: "opportunity" as "opportunity" | "todo" | null,
      boardAssignedAgent: "Amanda Rodriguez",
      notes: "Interested in post-surgery rehabilitation",
      location: "Downtown Clinic",
      formDetails: {
        preferredAppointmentTime: "Morning",
        painLevel: "7/10",
        insuranceProvider: "Blue Cross",
        reasonForVisit: "Post-surgery knee rehabilitation",
        previousTreatment: "Physical therapy 2 years ago"
      }
    },
    {
      id: "WL-002",
      name: "Michael Chen",
      email: "m.chen@company.com",
      phone: "(555) 234-5678",
      source: "google ads",
      service: "Occupational Therapy",
      status: "contacted",
      priority: "medium",
      submittedAt: "2024-01-15T09:15:00",
      lastContact: "2024-01-15T14:30:00",
      contactedBy: "Sarah Wilson",
      callId: "CALL-001",
      boardStatus: "todo" as "opportunity" | "todo" | null,
      boardAssignedAgent: "Sarah Wilson",
      notes: "Work-related injury, needs assessment",
      location: "North Branch",
      formDetails: {
        preferredAppointmentTime: "Afternoon",
        painLevel: "5/10",
        insuranceProvider: "Aetna",
        reasonForVisit: "Carpal tunnel syndrome from work",
        previousTreatment: "None"
      }
    },
    {
      id: "WL-003",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "(555) 345-6789",
      source: "instagram ads",
      service: "Sports Medicine",
      status: "contacted",
      priority: "high",
      submittedAt: "2024-01-14T16:45:00",
      lastContact: "2024-01-15T11:00:00",
      contactedBy: "Michael Chen",
      callId: "CALL-002",
      boardStatus: "opportunity" as "opportunity" | "todo" | null,
      boardAssignedAgent: "Michael Chen",
      notes: "Marathon runner, knee pain consultation",
      location: "Sports Center",
      formDetails: {
        preferredAppointmentTime: "Evening",
        painLevel: "6/10",
        insuranceProvider: "UnitedHealth",
        reasonForVisit: "Knee pain during marathon training",
        previousTreatment: "Massage therapy"
      }
    },
    {
      id: "WL-004",
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "(555) 456-7890",
      source: "contact form",
      service: "Pain Management",
      status: "contacted",
      priority: "medium",
      submittedAt: "2024-01-14T14:20:00",
      lastContact: "2024-01-15T09:30:00",
      contactedBy: "Lisa Johnson",
      callId: "CALL-003",
      boardStatus: null,
      boardAssignedAgent: undefined,
      notes: "Chronic back pain, scheduled consultation",
      location: "Pain Center",
      formDetails: {
        preferredAppointmentTime: "Morning",
        painLevel: "8/10",
        insuranceProvider: "Cigna",
        reasonForVisit: "Chronic lower back pain",
        previousTreatment: "Chiropractic care, pain medication"
      }
    },
    {
      id: "WL-005",
      name: "Lisa Thompson",
      email: "lisa.t@email.com",
      phone: "(555) 567-8901",
      source: "website chat",
      service: "Wellness Program",
      status: "not contacted",
      priority: "low",
      submittedAt: "2024-01-14T11:30:00",
      lastContact: "2024-01-14T15:45:00",
      boardStatus: "todo" as "opportunity" | "todo" | null,
      boardAssignedAgent: "James Thompson",
      notes: "General wellness inquiry, follow up next week",
      location: "Wellness Center",
      formDetails: {
        preferredAppointmentTime: "Flexible",
        painLevel: "2/10",
        insuranceProvider: "Kaiser",
        reasonForVisit: "General wellness consultation",
        previousTreatment: "Yoga classes"
      }
    }
  ];

export default function WebLeads() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  const [selectedLeadForSequence, setSelectedLeadForSequence] = useState<string | null>(null);
  const [addToBoardDialogOpen, setAddToBoardDialogOpen] = useState(false);
  const [selectedLeadForBoard, setSelectedLeadForBoard] = useState<any>(null);
  const { toast } = useToast();
  const [leads, setLeads] = useState(leadsData);

  const agents = [
    "Sarah Wilson",
    "Michael Chen", 
    "Lisa Johnson",
    "Amanda Rodriguez",
    "James Thompson"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "contacted": return "bg-green-100 text-green-800 border-green-200";
      case "not contacted": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
    if (agentFilter !== "all" && lead.boardAssignedAgent !== agentFilter) return false;
    return true;
  });

  const handleReassignLead = (leadId: string, newAgent: string) => {
    // In a real app, this would make an API call
    console.log(`Reassigning lead ${leadId} to ${newAgent}`);
    setReassignDialogOpen(false);
    setReassignLeadId(null);
  };

  const stats = {
    total: leads.length,
    contacted: leads.filter(l => l.status === "contacted").length,
    notContacted: leads.filter(l => l.status === "not contacted").length,
    contactRate: Math.round((leads.filter(l => l.status === "contacted").length / leads.length) * 100)
  };

  const handleAddToSequence = (leadId: string, sequence: string) => {
    console.log(`Adding lead ${leadId} to sequence: ${sequence}`);
    setSequenceDialogOpen(false);
    setSelectedLeadForSequence(null);
  };

  const handleStartSequence = (sequence: SequenceConfig, contextData?: Record<string, any>) => {
    const lead = leads.find(l => l.id === selectedLeadForSequence);
    console.log('Starting sequence:', sequence, 'with context:', contextData);
    
    toast({
      title: "Sequence Started",
      description: `${lead?.name || "Lead"} added to ${sequence.name}`,
    });
    setSequenceDialogOpen(false);
    setSelectedLeadForSequence(null);
  };

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Web Leads</h2>
          <p className="text-muted-foreground mt-1">Manage leads from web forms and online sources</p>
        </div>


        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">All Leads</TabsTrigger>
            <TabsTrigger value="sources">Lead Sources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="not contacted">Not Contacted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="contact form">Contact Form</SelectItem>
                    <SelectItem value="website chat">Website Chat</SelectItem>
                    <SelectItem value="google ads">Google Ads</SelectItem>
                    <SelectItem value="instagram ads">Instagram Ads</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>

            {/* Leads Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Board Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </Badge>
                            {lead.status === "contacted" && lead.contactedBy && (
                              <div className="text-xs text-muted-foreground">
                                by {lead.contactedBy}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between gap-2">
                            {lead.boardStatus ? (
                              <div className="flex flex-col">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    lead.boardStatus === "opportunity"
                                      ? "bg-blue-500/10 text-blue-700 border-blue-300"
                                      : "bg-amber-500/10 text-amber-700 border-amber-300"
                                  }`}
                                >
                                  {lead.boardStatus === "opportunity" ? "Opportunity" : "To-Do"}
                                </Badge>
                                {lead.boardAssignedAgent && (
                                  <span className="text-xs text-muted-foreground mt-1">{lead.boardAssignedAgent}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeadForBoard(lead);
                                setAddToBoardDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(lead.submittedAt).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              {new Date(lead.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${lead.phone}`)}>
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => window.open(`sms:${lead.phone}`)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Lead Details - {lead.name}</DialogTitle>
                                  <DialogDescription className="sr-only">Detailed information and actions for this web lead.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Contact Information</Label>
                                      <div className="mt-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{lead.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{lead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{lead.location}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm font-medium">Lead Details</Label>
                                      <div className="mt-1 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Source:</span>
                                          <Badge variant="outline">{lead.source}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Service:</span>
                                          <span className="text-sm">{lead.service}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Status & Priority</Label>
                                      <div className="mt-1 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Status:</span>
                                          <Badge className={getStatusColor(lead.status)}>
                                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Board Status:</span>
                                          {lead.boardStatus ? (
                                            <div className="flex flex-col items-end gap-1">
                                              <Badge variant="outline" className={`text-xs ${
                                                lead.boardStatus === "opportunity"
                                                  ? "bg-blue-500/10 text-blue-700 border-blue-300"
                                                  : "bg-amber-500/10 text-amber-700 border-amber-300"
                                              }`}>
                                                {lead.boardStatus === "opportunity" ? "Opportunity" : "To-Do"}
                                              </Badge>
                                              {lead.boardAssignedAgent && (
                                                <span className="text-xs text-muted-foreground">{lead.boardAssignedAgent}</span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-sm text-muted-foreground">Not assigned</span>
                                          )}
                                        </div>
                                        {lead.status === "contacted" && lead.contactedBy && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Contacted by:</span>
                                            <span className="text-sm font-medium">{lead.contactedBy}</span>
                                          </div>
                                        )}
                                        {lead.status === "contacted" && lead.callId && (
                                          <div className="mt-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              onClick={() => window.location.href = `/calls/${lead.callId}`}
                                              className="w-full"
                                            >
                                              View Call Details
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-sm font-medium">Timeline</Label>
                                      <div className="mt-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          <div className="text-sm">
                                            <div>Submitted: {new Date(lead.submittedAt).toLocaleString()}</div>
                                            {lead.lastContact && (
                                              <div className="text-muted-foreground">
                                                Last Contact: {new Date(lead.lastContact).toLocaleString()}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                   <div className="col-span-2 space-y-4">
                                     <div>
                                       <Label className="text-sm font-medium">Form Details</Label>
                                       <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                                         <div className="flex justify-between">
                                           <span className="text-sm text-muted-foreground">Preferred Appointment:</span>
                                           <span className="text-sm">{lead.formDetails?.preferredAppointmentTime}</span>
                                         </div>
                                         <div className="flex justify-between">
                                           <span className="text-sm text-muted-foreground">Pain Level:</span>
                                           <span className="text-sm">{lead.formDetails?.painLevel}</span>
                                         </div>
                                         <div className="flex justify-between">
                                           <span className="text-sm text-muted-foreground">Insurance Provider:</span>
                                           <span className="text-sm">{lead.formDetails?.insuranceProvider}</span>
                                         </div>
                                         <div className="flex justify-between">
                                           <span className="text-sm text-muted-foreground">Reason for Visit:</span>
                                           <span className="text-sm">{lead.formDetails?.reasonForVisit}</span>
                                         </div>
                                         <div className="flex justify-between">
                                           <span className="text-sm text-muted-foreground">Previous Treatment:</span>
                                           <span className="text-sm">{lead.formDetails?.previousTreatment}</span>
                                         </div>
                                       </div>
                                     </div>
                                     
                                     <div>
                                       <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                                       <Textarea
                                         id="notes"
                                         defaultValue={lead.notes}
                                         className="mt-1"
                                         rows={3}
                                       />
                                     </div>
                                   </div>

                                   <div className="col-span-2 flex flex-wrap gap-2">
                                    <CreateInEMRButton
                                      referral={convertLeadToReferral(lead)}
                                      onSuccess={(result: EMRCreationResult) => {
                                        toast({
                                          title: "Success!",
                                          description: `Created in EMR: MRN ${result.patientMRN}${result.episodeId ? `, Episode ${result.episodeId}` : ''}`,
                                        });
                                      }}
                                      size="sm"
                                    />
                                    <Button 
                                      size="sm"
                                      onClick={() => window.open(`tel:${selectedLead?.phone}`)}
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call Lead
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => window.open(`sms:${selectedLead?.phone}`)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Text Message
                                    </Button>
                                    <Button
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => {
                                         setSelectedLeadForSequence(selectedLead?.id || null);
                                         setSequenceDialogOpen(true);
                                       }}
                                     >
                                       <Workflow className="h-4 w-4 mr-2" />
                                       Add to Sequence
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => {
                                         setSelectedLeadForBoard(selectedLead);
                                         setAddToBoardDialogOpen(true);
                                       }}
                                     >
                                       <Plus className="h-4 w-4 mr-2" />
                                       Add to Board
                                     </Button>
                                   </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLeadForSequence(lead.id);
                                setSequenceDialogOpen(true);
                              }}
                            >
                              <Workflow className="h-4 w-4" />
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

          <TabsContent value="sources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Contact Form", "Google Ads", "Social Media", "Referral", "Website Chat"].map((source) => {
                const sourceLeads = leads.filter(lead => lead.source === source);
                const converted = sourceLeads.filter(lead => lead.status === "converted").length;
                const conversionRate = sourceLeads.length > 0 ? Math.round((converted / sourceLeads.length) * 100) : 0;
                
                return (
                  <Card key={source}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{source}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Leads:</span>
                          <span className="font-semibold">{sourceLeads.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Converted:</span>
                          <span className="font-semibold text-green-600">{converted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Conversion Rate:</span>
                          <span className="font-semibold">{conversionRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics dashboard coming soon...</p>
                  <p className="text-sm">Track lead conversion trends, source performance, and more.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sequence Management Modal */}
        <SequenceManagementModal
          isOpen={sequenceDialogOpen}
          onClose={() => {
            setSequenceDialogOpen(false);
            setSelectedLeadForSequence(null);
          }}
          onStartSequence={handleStartSequence}
          activeSequences={[]} // TODO: Add actual active sequences for the lead
          patientName={selectedLeadForSequence ? leads.find(l => l.id === selectedLeadForSequence)?.name : undefined}
          entityType="lead"
        />

        {/* Add to Board Modal */}
        {selectedLeadForBoard && (
          <AddToBoardModal
            isOpen={addToBoardDialogOpen}
            onClose={() => {
              setAddToBoardDialogOpen(false);
              setSelectedLeadForBoard(null);
            }}
            onConfirm={(data: AddToBoardData) => {
              // Update lead with board status
              setLeads(prev => prev.map(l =>
                l.id === selectedLeadForBoard.id
                  ? {
                      ...l,
                      boardStatus: data.board,
                      boardAssignedAgent: data.assignedAgent
                    }
                  : l
              ));

              const boardName = data.board === "opportunity" ? "Opportunities" : "Tasks & To-Do";
              toast({
                title: "Added to Board!",
                description: `${data.patientName} added to ${boardName} board and assigned to ${data.assignedAgent}`,
              });
              setAddToBoardDialogOpen(false);
              setSelectedLeadForBoard(null);
            }}
            patientName={selectedLeadForBoard.name}
            condition={selectedLeadForBoard.service}
            phone={selectedLeadForBoard.phone}
            insurance={selectedLeadForBoard.formDetails?.insuranceProvider}
            referrer={selectedLeadForBoard.source}
            sourceDocument={{ type: 'web', id: selectedLeadForBoard.id, name: `Web Lead - ${selectedLeadForBoard.name}` }}
          />
        )}
      </div>
    </Layout>
  );
}