import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Phone,
  MessageCircle,
  Mail,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";

type MessageType = "sms" | "email" | "fax" | "call";
type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";
type MessageDirection = "inbound" | "outbound";

interface MessageLog {
  id: string;
  type: MessageType;
  direction: MessageDirection;
  status: MessageStatus;
  sender: string;
  recipient: string;
  patientName?: string;
  subject?: string;
  content: string;
  timestamp: string;
  duration?: string; // for calls
  deliveryTime?: string;
  errorMessage?: string;
  channel?: string;
  userId?: string;
  userName?: string;
}

// Mock data
const mockLogs: MessageLog[] = [
  {
    id: "1",
    type: "sms",
    direction: "outbound",
    status: "delivered",
    sender: "(555) 100-0001",
    recipient: "(555) 123-4567",
    patientName: "Sarah Johnson",
    content: "Hi Sarah, this is PT Clinic. Your appointment is scheduled for tomorrow at 2 PM.",
    timestamp: "2024-03-15T14:30:00",
    deliveryTime: "2024-03-15T14:30:05",
    channel: "Twilio",
    userId: "u1",
    userName: "Admin User"
  },
  {
    id: "2",
    type: "sms",
    direction: "inbound",
    status: "read",
    sender: "(555) 123-4567",
    recipient: "(555) 100-0001",
    patientName: "Sarah Johnson",
    content: "Thank you! I'll be there.",
    timestamp: "2024-03-15T14:35:00",
    deliveryTime: "2024-03-15T14:35:02",
    channel: "Twilio"
  },
  {
    id: "3",
    type: "email",
    direction: "outbound",
    status: "delivered",
    sender: "noreply@ptclinic.com",
    recipient: "michael.chen@email.com",
    patientName: "Michael Chen",
    subject: "Appointment Confirmation",
    content: "Dear Michael, Your evaluation is scheduled for next Monday at 10 AM...",
    timestamp: "2024-03-15T13:00:00",
    deliveryTime: "2024-03-15T13:00:15",
    channel: "SendGrid",
    userId: "u2",
    userName: "Reception Staff"
  },
  {
    id: "4",
    type: "sms",
    direction: "outbound",
    status: "failed",
    sender: "(555) 100-0001",
    recipient: "(555) 999-9999",
    patientName: "John Doe",
    content: "Appointment reminder",
    timestamp: "2024-03-15T12:30:00",
    errorMessage: "Invalid phone number",
    channel: "Twilio",
    userId: "u1",
    userName: "Admin User"
  },
  {
    id: "5",
    type: "fax",
    direction: "outbound",
    status: "delivered",
    sender: "(555) 100-0002",
    recipient: "(555) 888-8888",
    patientName: "Emily Rodriguez",
    subject: "Medical Records Request",
    content: "Medical records for Emily Rodriguez - Date of Birth: 01/15/1985",
    timestamp: "2024-03-15T11:00:00",
    deliveryTime: "2024-03-15T11:05:00",
    channel: "eFax",
    userId: "u3",
    userName: "Medical Records"
  },
  {
    id: "6",
    type: "call",
    direction: "outbound",
    status: "delivered",
    sender: "(555) 100-0001",
    recipient: "(555) 234-5678",
    patientName: "David Thompson",
    content: "Follow-up call regarding PT appointment",
    timestamp: "2024-03-15T10:30:00",
    duration: "3m 45s",
    channel: "VoIP System",
    userId: "u2",
    userName: "Reception Staff"
  },
  {
    id: "7",
    type: "sms",
    direction: "inbound",
    status: "read",
    sender: "(555) 456-7890",
    recipient: "(555) 100-0001",
    patientName: "Lisa Anderson",
    content: "Can I reschedule my appointment?",
    timestamp: "2024-03-15T09:45:00",
    deliveryTime: "2024-03-15T09:45:03",
    channel: "Twilio"
  },
  {
    id: "8",
    type: "email",
    direction: "outbound",
    status: "pending",
    sender: "noreply@ptclinic.com",
    recipient: "patient@email.com",
    patientName: "Robert Wilson",
    subject: "Insurance Authorization Update",
    content: "Your insurance authorization has been approved...",
    timestamp: "2024-03-15T09:00:00",
    channel: "SendGrid",
    userId: "u1",
    userName: "Admin User"
  }
];

const getMessageTypeIcon = (type: MessageType) => {
  switch (type) {
    case "sms":
      return <MessageCircle className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "fax":
      return <FileText className="h-4 w-4" />;
    case "call":
      return <Phone className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: MessageStatus) => {
  const variants = {
    sent: { variant: "secondary" as const, label: "Sent", icon: Clock },
    delivered: { variant: "default" as const, label: "Delivered", icon: CheckCircle },
    read: { variant: "default" as const, label: "Read", icon: CheckCircle },
    failed: { variant: "destructive" as const, label: "Failed", icon: XCircle },
    pending: { variant: "outline" as const, label: "Pending", icon: Clock }
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getDirectionBadge = (direction: MessageDirection) => {
  return direction === "inbound" ? (
    <Badge variant="outline" className="gap-1">
      <ArrowDown className="h-3 w-3" />
      Inbound
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <ArrowUp className="h-3 w-3" />
      Outbound
    </Badge>
  );
};

export default function MessageLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<MessageLog[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MessageType | "all">("all");
  const [filterDirection, setFilterDirection] = useState<MessageDirection | "all">("all");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "all">("all");
  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("today");

  const filteredLogs = logs.filter(log => {
    // Type filter
    if (filterType !== "all" && log.type !== filterType) return false;
    
    // Direction filter
    if (filterDirection !== "all" && log.direction !== filterDirection) return false;
    
    // Status filter
    if (filterStatus !== "all" && log.status !== filterStatus) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.patientName?.toLowerCase().includes(query) ||
        log.sender.includes(query) ||
        log.recipient.includes(query) ||
        log.content.toLowerCase().includes(query) ||
        log.subject?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your message logs are being prepared for download..."
    });
  };

  // Calculate statistics
  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === "sent" || l.status === "delivered" || l.status === "read").length,
    failed: logs.filter(l => l.status === "failed").length,
    pending: logs.filter(l => l.status === "pending").length,
    sms: logs.filter(l => l.type === "sms").length,
    email: logs.filter(l => l.type === "email").length,
    fax: logs.filter(l => l.type === "fax").length,
    calls: logs.filter(l => l.type === "call").length
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Message Logs</h1>
              <p className="text-muted-foreground">Comprehensive message history and analytics</p>
            </div>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.total}</div>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Successfully Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Distribution by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.sms}</div>
                <div className="text-sm text-muted-foreground">SMS</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.email}</div>
                <div className="text-sm text-muted-foreground">Email</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.fax}</div>
                <div className="text-sm text-muted-foreground">Fax</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.calls}</div>
                <div className="text-sm text-muted-foreground">Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Message Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="fax">Fax</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDirection} onValueChange={(value: any) => setFilterDirection(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>

            {/* Logs Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No logs found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMessageTypeIcon(log.type)}
                            <span className="capitalize">{log.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getDirectionBadge(log.direction)}</TableCell>
                        <TableCell className="font-medium">
                          {log.patientName || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.sender}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.recipient}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.userName || "-"}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Message Details</DialogTitle>
                              </DialogHeader>
                              {selectedLog && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Type</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getMessageTypeIcon(selectedLog.type)}
                                        <span className="capitalize">{selectedLog.type}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Direction</div>
                                      <div className="mt-1">{getDirectionBadge(selectedLog.direction)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                                      <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Patient</div>
                                      <div className="mt-1">{selectedLog.patientName || "-"}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">From</div>
                                      <div className="mt-1">{selectedLog.sender}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">To</div>
                                      <div className="mt-1">{selectedLog.recipient}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Sent At</div>
                                      <div className="mt-1">{formatTimestamp(selectedLog.timestamp)}</div>
                                    </div>
                                    {selectedLog.deliveryTime && (
                                      <div>
                                        <div className="text-sm font-medium text-muted-foreground">Delivered At</div>
                                        <div className="mt-1">{formatTimestamp(selectedLog.deliveryTime)}</div>
                                      </div>
                                    )}
                                    {selectedLog.duration && (
                                      <div>
                                        <div className="text-sm font-medium text-muted-foreground">Duration</div>
                                        <div className="mt-1">{selectedLog.duration}</div>
                                      </div>
                                    )}
                                    {selectedLog.channel && (
                                      <div>
                                        <div className="text-sm font-medium text-muted-foreground">Channel</div>
                                        <div className="mt-1">{selectedLog.channel}</div>
                                      </div>
                                    )}
                                    {selectedLog.userName && (
                                      <div>
                                        <div className="text-sm font-medium text-muted-foreground">Sent By</div>
                                        <div className="mt-1">{selectedLog.userName}</div>
                                      </div>
                                    )}
                                  </div>

                                  {selectedLog.subject && (
                                    <div>
                                      <div className="text-sm font-medium text-muted-foreground">Subject</div>
                                      <div className="mt-1">{selectedLog.subject}</div>
                                    </div>
                                  )}

                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Content</div>
                                    <div className="p-4 bg-muted rounded-lg">
                                      {selectedLog.content}
                                    </div>
                                  </div>

                                  {selectedLog.errorMessage && (
                                    <div>
                                      <div className="text-sm font-medium text-destructive mb-2">Error Message</div>
                                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                                        {selectedLog.errorMessage}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
