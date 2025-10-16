import {
  Phone,
  PhoneCall,
  Voicemail,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Workflow,
  FileCheck,
  AlertCircle,
  BriefcaseMedical,
  CreditCard,
  Users,
  Building2,
  Bot,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Award,
  UserCheck,
  Radio,
  Settings,
  UserCog,
  Globe,
  type LucideIcon,
} from "lucide-react";

export type UserRole = "admin" | "agent" | "both";

export interface SubTab {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  roles?: UserRole[]; // Roles that can see this sub-tab
}

export interface MainTab {
  id: string;
  title: string;
  icon: LucideIcon;
  subTabs?: SubTab[];
  url?: string; // For tabs without sub-tabs
  roles?: UserRole[]; // Roles that can see this main tab
}

export const navigationConfig: MainTab[] = [
  {
    id: "call",
    title: "Call",
    icon: Phone,
    roles: ["both"], // Both admin and agent can access calls
    subTabs: [
      {
        id: "call-logs",
        title: "Call Logs",
        url: "/calls/logs",
        icon: Phone,
        roles: ["both"],
      },
      {
        id: "internal-calls",
        title: "Internal Calls",
        url: "/calls/internal",
        icon: PhoneCall,
        roles: ["both"],
      },
      {
        id: "voicemail",
        title: "Voicemail",
        url: "/calls/voicemail",
        icon: Voicemail,
        roles: ["both"],
      },
      {
        id: "bot-assisted-calls",
        title: "Bot-Assisted Calls",
        url: "/calls/bot-assisted",
        icon: Bot,
        roles: ["both"],
      },
    ],
  },
  {
    id: "messaging",
    title: "Messaging",
    icon: MessageSquare,
    roles: ["both"],
    subTabs: [
      {
        id: "text-messages",
        title: "Text Messages",
        url: "/messaging/texts",
        icon: MessageCircle,
        roles: ["both"],
      },
      // Hidden for now
      // {
      //   id: "message-logs",
      //   title: "Message Logs",
      //   url: "/messaging/logs",
      //   icon: FileText,
      //   roles: ["both"],
      // },
    ],
  },
  {
    id: "fax",
    title: "Fax",
    icon: FileText,
    url: "/fax",
    roles: ["both"],
  },
  {
    id: "web-leads",
    title: "Web Leads",
    icon: Globe,
    url: "/leads",
    roles: ["admin"], // Only admins see all web leads
  },
  {
    id: "boards",
    title: "Boards",
    icon: LayoutDashboard,
    roles: ["both"],
    subTabs: [
      {
        id: "opportunities-board",
        title: "Opportunities Board",
        url: "/opportunities",
        icon: Workflow,
        roles: ["both"], // Agent sees only assigned leads
      },
      // {
      //   id: "prior-auth-board",
      //   title: "Prior Auth Board",
      //   url: "/opportunities/pa-tracker",
      //   icon: FileCheck,
      //   roles: ["both"],
      // },
      // {
      //   id: "future-opportunities-board",
      //   title: "Future Opportunities",
      //   url: "/boards/future-opportunities",
      //   icon: Workflow,
      //   roles: ["admin"], // Only admins manage reactivation
      // },
      {
        id: "fallen-off-care-board",
        title: "Fallen-Off Care",
        url: "/boards/fallen-off-care",
        icon: AlertCircle,
        roles: ["admin"], // Admin oversight board
      },
      {
        id: "waitlist-board",
        title: "Waitlist Board",
        url: "/opportunities/waitlist",
        icon: AlertCircle,
        roles: ["both"],
      },
      {
        id: "miscellaneous-board",
        title: "Tasks & To-Do",
        url: "/boards/miscellaneous",
        icon: BriefcaseMedical,
        roles: ["both"], // Everyone has personal tasks
      },
    ],
  },
  {
    id: "sequences",
    title: "Sequences",
    icon: Workflow,
    url: "/sequences",
    roles: ["both"],
  },
  {
    id: "eligibility",
    title: "Eligibility and Benefits",
    icon: CreditCard,
    url: "/eligibility",
    roles: ["both"],
  },
  {
    id: "contacts",
    title: "Contacts",
    icon: Users,
    roles: ["both"],
    subTabs: [
      {
        id: "patients",
        title: "Patients",
        url: "/directory/patients",
        icon: Users,
        roles: ["both"],
      },
      {
        id: "referrers",
        title: "Referrers",
        url: "/directory/referrers",
        icon: Building2,
        roles: ["admin"], // Only admins see all referrers
      },
    ],
  },
  {
    id: "ai-insights",
    title: "Analytics & Insights",
    icon: BarChart3,
    roles: ["admin"], // Only admins see full analytics
    subTabs: [
      {
        id: "conversion-analytics",
        title: "Conversion Analytics",
        url: "/analytics/conversion",
        icon: TrendingUp,
        roles: ["admin"],
      },
      {
        id: "call-analytics",
        title: "Call Analytics",
        url: "/ai/call-analytics",
        icon: BarChart3,
        roles: ["admin"],
      },
      {
        id: "message-analytics",
        title: "Message Analytics",
        url: "/ai/message-analytics",
        icon: TrendingUp,
        roles: ["admin"],
      },
      {
        id: "staff-performance",
        title: "Staff Performance",
        url: "/ai/staff-performance",
        icon: UserCheck,
        roles: ["admin"],
      },
    ],
  },
  {
    id: "my-performance",
    title: "My Performance",
    icon: Award,
    url: "/my-performance",
    roles: ["agent"], // Agents see only their own metrics
  },
  {
    id: "live-status",
    title: "Live Status",
    icon: Radio,
    url: "/live-status",
    roles: ["admin"],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: Settings,
    roles: ["admin"], // Only admins configure system
    subTabs: [
      {
        id: "system-config",
        title: "System Configuration",
        url: "/config",
        icon: Settings,
        roles: ["admin"],
      },
      {
        id: "fax-lines",
        title: "Fax Line Configuration",
        url: "/config/fax-lines",
        icon: Phone,
        roles: ["admin"],
      },
      {
        id: "roles-privacy",
        title: "Roles & Privacy",
        url: "/config/roles",
        icon: UserCog,
        roles: ["admin"],
      },
    ],
  },
];

