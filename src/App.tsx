import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { FaxLineProvider } from "@/contexts/FaxLineContext";
import Index from "./pages/Index";
import Opportunities from "./pages/Opportunities";
import FaxInbox from "./pages/FaxInbox";
import ActivityLog from "./pages/ActivityLog";
import WebLeads from "./pages/WebLeads";
import Calls from "./pages/Calls";
import CallLogs from "./pages/CallLogs";
import InternalCalls from "./pages/InternalCalls";
import Voicemail from "./pages/Voicemail";
import PATracker from "./pages/PATracker";
import CoverageIssues from "./pages/CoverageIssues";
import WorkersComp from "./pages/WorkersComp";
import Eligibility from "./pages/Eligibility";
import Sequences from "./pages/Sequences";
import ActiveSequences from "./pages/ActiveSequences";
import Unassigned from "./pages/Unassigned";
import Patients from "./pages/Patients";
import Referrers from "./pages/Referrers";
import FunnelAnalytics from "./pages/FunnelAnalytics";
import SLAPerformance from "./pages/SLAPerformance";
import Configuration from "./pages/Configuration";
import RolesPrivacy from "./pages/RolesPrivacy";
import NotFound from "./pages/NotFound";
import TextMessages from "./pages/TextMessages";
import MessageLogs from "./pages/MessageLogs";
import WaitlistBoard from "./pages/WaitlistBoard";
import TasksBoard from "./pages/TasksBoard";
import ConversationAI from "./pages/ConversationAI";
import CallAnalytics from "./pages/CallAnalytics";
import MessageAnalytics from "./pages/MessageAnalytics";
import CaseConversionAnalytics from "./pages/CaseConversionAnalytics";
import CallScoring from "./pages/CallScoring";
import StaffPerformance from "./pages/StaffPerformance";
import LiveStatus from "./pages/LiveStatus";
import BotAssistedCalls from "./pages/BotAssistedCalls";
import FutureOpportunitiesBoard from "./pages/FutureOpportunitiesBoard";
import FallenOffCareBoard from "./pages/FallenOffCareBoard";
import MiscellaneousBoard from "./pages/MiscellaneousBoard";
import MyPerformance from "./pages/MyPerformance";
import ConversionAnalytics from "./pages/ConversionAnalytics";
import FaxLineConfiguration from "./pages/FaxLineConfiguration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserRoleProvider>
      <FaxLineProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/fax" element={<FaxInbox />} />
          <Route path="/leads" element={<WebLeads />} />
          
          {/* Call Routes */}
          <Route path="/calls" element={<Calls />} />
          <Route path="/calls/logs" element={<CallLogs />} />
          <Route path="/calls/internal" element={<InternalCalls />} />
          <Route path="/calls/voicemail" element={<Voicemail />} />
          <Route path="/calls/bot-assisted" element={<BotAssistedCalls />} />
          
          {/* Messaging Routes */}
          <Route path="/messaging/texts" element={<TextMessages />} />
          <Route path="/messaging/logs" element={<MessageLogs />} />
          
          {/* Board Routes */}
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/pa-tracker" element={<PATracker />} />
          <Route path="/opportunities/coverage" element={<CoverageIssues />} />
          <Route path="/opportunities/workers-comp" element={<WorkersComp />} />
          <Route path="/opportunities/waitlist" element={<WaitlistBoard />} />
          <Route path="/opportunities/tasks" element={<TasksBoard />} />
          <Route path="/boards/future-opportunities" element={<FutureOpportunitiesBoard />} />
          <Route path="/boards/fallen-off-care" element={<FallenOffCareBoard />} />
          <Route path="/boards/miscellaneous" element={<MiscellaneousBoard />} />
          
          {/* Eligibility */}
          <Route path="/eligibility" element={<Eligibility />} />
          
          {/* Sequences */}
          <Route path="/sequences" element={<Sequences />} />
          <Route path="/sequences/active" element={<ActiveSequences />} />
          <Route path="/unassigned" element={<Unassigned />} />
          
          {/* Contacts/Directory */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/directory/patients" element={<Patients />} />
          <Route path="/directory/referrers" element={<Referrers />} />
          
          {/* AI & Insights */}
          <Route path="/ai/conversation" element={<ConversationAI />} />
          <Route path="/ai/call-analytics" element={<CallAnalytics />} />
          <Route path="/ai/message-analytics" element={<MessageAnalytics />} />
          <Route path="/ai/case-conversion" element={<CaseConversionAnalytics />} />
          <Route path="/ai/call-scoring" element={<CallScoring />} />
          <Route path="/ai/staff-performance" element={<StaffPerformance />} />
          
          {/* Analytics */}
          <Route path="/analytics/conversion" element={<ConversionAnalytics />} />
          
          {/* Agent Performance */}
          <Route path="/my-performance" element={<MyPerformance />} />
          
          {/* Live Status */}
          <Route path="/live-status" element={<LiveStatus />} />
          
          {/* Analytics (legacy) */}
          <Route path="/analytics/funnel" element={<FunnelAnalytics />} />
          <Route path="/analytics/sla" element={<SLAPerformance />} />
          
          {/* Configuration */}
          <Route path="/config" element={<Configuration />} />
          <Route path="/config/fax-lines" element={<FaxLineConfiguration />} />
          <Route path="/config/roles" element={<RolesPrivacy />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
        </TooltipProvider>
      </FaxLineProvider>
    </UserRoleProvider>
  </QueryClientProvider>
);

export default App;
