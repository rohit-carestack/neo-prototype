import { createContext, useContext, useState, ReactNode } from "react";
import type { FaxLine } from "@/types/faxLines";

// Mock data - in production this would come from an API
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
    assignedAgents: ["James Thompson", "Sarah Wilson"],
    assignmentRule: "manual",
    isActive: true,
    createdAt: "2024-01-15",
    createdBy: "Admin"
  },
];

interface FaxLineContextType {
  faxLines: FaxLine[];
  getFaxLineByNumber: (phoneNumber: string) => FaxLine | undefined;
  getAssignableAgents: (faxLineId: string) => string[];
  canAgentViewLine: (agentName: string, faxLineId: string) => boolean;
  getAgentFaxLines: (agentName: string) => FaxLine[];
  getNextAssignee: (faxLineId: string) => string | undefined;
}

const FaxLineContext = createContext<FaxLineContextType | undefined>(undefined);

export function FaxLineProvider({ children }: { children: ReactNode }) {
  const [faxLines] = useState<FaxLine[]>(mockFaxLines);

  const getFaxLineByNumber = (phoneNumber: string): FaxLine | undefined => {
    return faxLines.find(line => line.phoneNumber === phoneNumber);
  };

  const getAssignableAgents = (faxLineId: string): string[] => {
    const line = faxLines.find(l => l.id === faxLineId);
    return line?.assignedAgents || [];
  };

  const canAgentViewLine = (agentName: string, faxLineId: string): boolean => {
    const line = faxLines.find(l => l.id === faxLineId);
    return line?.assignedAgents.includes(agentName) || false;
  };

  const getAgentFaxLines = (agentName: string): FaxLine[] => {
    return faxLines.filter(line => line.assignedAgents.includes(agentName));
  };

  const getNextAssignee = (faxLineId: string): string | undefined => {
    const line = faxLines.find(l => l.id === faxLineId);
    if (!line) return undefined;

    switch (line.assignmentRule) {
      case "fixed_owner":
        return line.fixedOwner;
      
      case "round_robin":
        const index = line.lastAssignedIndex || 0;
        const nextIndex = (index + 1) % line.assignedAgents.length;
        // In a real app, you'd update this in the database
        return line.assignedAgents[nextIndex];
      
      case "manual":
      default:
        return undefined; // Manual assignment - no auto-assignment
    }
  };

  const value = {
    faxLines,
    getFaxLineByNumber,
    getAssignableAgents,
    canAgentViewLine,
    getAgentFaxLines,
    getNextAssignee,
  };

  return (
    <FaxLineContext.Provider value={value}>
      {children}
    </FaxLineContext.Provider>
  );
}

export function useFaxLines() {
  const context = useContext(FaxLineContext);
  if (context === undefined) {
    throw new Error("useFaxLines must be used within a FaxLineProvider");
  }
  return context;
}


