import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneMissed, 
  Bot,
  CheckSquare,
  ChevronDown,
  Calendar,
  MoreHorizontal
} from "lucide-react";

interface CallLog {
  id: string;
  type: "inbound" | "outbound" | "missed";
  caller: {
    name: string;
    initials: string;
    location?: string;
    extension?: string;
  };
  timestamp: string;
  date: string;
  summary?: {
    text: string;
    conversionProbability?: number;
    callPurpose?: string;
    callOutcome?: string;
    callOutcomeReason?: string;
    reasonExplained?: string;
  };
  actionItem?: string;
  hasVoiceBot?: boolean;
  hasToDoAI?: boolean;
}

const mockCallLogs: CallLog[] = [
  {
    id: "1",
    type: "inbound",
    caller: {
      name: "Sadiye Akturk",
      initials: "S",
      location: "Bright Smiles Edina",
      extension: "Brightsmiles Anish - Do Not Modify"
    },
    timestamp: "12:27 pm",
    date: "09/24/2025",
    summary: {
      text: "The call involves a patient reaching out to Bright Smiles to schedule an appointment. The patient requests an appointment for 2:00 PM the same day due to a broken tooth. The agent acknowledges the request, and the conversation is brief and focused on setting up the appointment.",
      conversionProbability: 80,
      callPurpose: "Emergency Appointment",
      callOutcome: "Appointment Not Booked",
      callOutcomeReason: "Not Yet Decided",
      reasonExplained: "The patient expressed a desire for an appointment but did not confirm the booking, indicating they may need to check their schedule or consider other factors before making a final decision."
    },
    actionItem: "Schedule Appointment for 2:00 PM Today",
    hasToDoAI: true
  },
  {
    id: "2",
    type: "inbound",
    caller: {
      name: "Carlos Restrepo",
      initials: "C",
      location: "Bright Smiles Edina",
      extension: "Carlos Restrepo"
    },
    timestamp: "07:54 am",
    date: "09/24/2025"
  },
  {
    id: "3",
    type: "missed",
    caller: {
      name: "Tom Py",
      initials: "T",
      location: "UTC",
      extension: "Sentry - Do not edit"
    },
    timestamp: "07:11 am",
    date: "09/24/2025"
  },
  {
    id: "4",
    type: "inbound",
    caller: {
      name: "Tom Py",
      initials: "T",
      location: "UTC",
      extension: "Sentry - Do not edit"
    },
    timestamp: "06:33 am",
    date: "09/24/2025",
    summary: {
      text: "The call involves a patient inquiring about available time slots for an appointment. Initially, Agent 1 informs the patient that there is no availability at 5:00 PM, prompting the patient to express frustration. Agent 1 then connects the patient to Agent 2, who confirms that there are indeed three available slots at 5:00 PM. The patient agrees to the appointment and is advised to arrive 30 minutes early for paperwork.",
      callPurpose: "New Appointment Booking",
      callOutcome: "Appointment Booked"
    }
  }
];

const getCallTypeIcon = (type: string) => {
  switch (type) {
    case "inbound":
      return <PhoneIncoming className="h-4 w-4 text-primary" />;
    case "outbound":
      return <Phone className="h-4 w-4 text-success" />;
    case "missed":
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    default:
      return <Phone className="h-4 w-4" />;
  }
};

function CallLogCard({ callLog }: { callLog: CallLog }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getCallTypeIcon(callLog.type)}
            <span className="text-sm text-muted-foreground capitalize">{callLog.type} Call</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{callLog.timestamp}</div>
            <div className="text-sm text-muted-foreground">{callLog.date}</div>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {callLog.caller.initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{callLog.caller.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {callLog.caller.location && (
                <>
                  <span>📍 {callLog.caller.location}</span>
                  {callLog.caller.extension && (
                    <>
                      <span>📞 {callLog.caller.extension}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {callLog.summary && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                🧠 IQ Summary
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {callLog.summary.text}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {callLog.summary.conversionProbability && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Conversion Probability: </span>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    {callLog.summary.conversionProbability}%
                  </Badge>
                </div>
              )}
              
              {callLog.summary.callPurpose && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Call Purpose: </span>
                  <span className="font-medium">{callLog.summary.callPurpose}</span>
                </div>
              )}
              
              {callLog.summary.callOutcome && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Call Outcome: </span>
                  <span className="font-medium">{callLog.summary.callOutcome}</span>
                </div>
              )}
              
              {callLog.summary.callOutcomeReason && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Call Outcome Reason: </span>
                  <span className="font-medium">{callLog.summary.callOutcomeReason}</span>
                </div>
              )}
            </div>

            {callLog.summary.reasonExplained && (
              <div className="text-sm mb-4">
                <span className="text-muted-foreground">Reason Explained: </span>
                <span className="text-foreground">{callLog.summary.reasonExplained}</span>
              </div>
            )}
          </div>
        )}

        {callLog.actionItem && (
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-2 text-primary border-primary">
              <CheckSquare className="h-4 w-4" />
              {callLog.actionItem}
            </Button>
            {callLog.hasToDoAI && (
              <span className="text-xs text-muted-foreground">ℹ️</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CallLogs() {
  const [activeTab, setActiveTab] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [extensionFilter, setExtensionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("30days");

  const filterCalls = (calls: CallLog[]) => {
    return calls.filter(call => {
      if (activeTab === "missed" && call.type !== "missed") return false;
      if (activeTab === "voicebot" && !call.hasVoiceBot) return false;
      if (activeTab === "todo" && !call.hasToDoAI) return false;
      
      return true;
    });
  };

  const filteredCalls = filterCalls(mockCallLogs);

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Call Logs</h2>
          <p className="text-muted-foreground mt-1">View and manage all incoming and outgoing call records</p>
        </div>

        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
              <TabsTrigger value="voicebot">VoiceBot</TabsTrigger>
              <TabsTrigger value="todo" className="gap-1">
                To Do AI <CheckSquare className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Location</span>
              <span className="text-muted-foreground">:</span>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="bright-smiles">Bright Smiles Edina</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by Extension</span>
              <span className="text-muted-foreground">:</span>
              <Select value={extensionFilter} onValueChange={setExtensionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="carlos">Carlos Restrepo</SelectItem>
                  <SelectItem value="anish">Brightsmiles Anish</SelectItem>
                  <SelectItem value="sentry">Sentry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Show Only</span>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCalls.map(call => (
            <CallLogCard key={call.id} callLog={call} />
          ))}
          
          {filteredCalls.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No call logs found matching your filters.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}