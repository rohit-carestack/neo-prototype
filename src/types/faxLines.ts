export type AssignmentRuleType = "manual" | "round_robin" | "fixed_owner";

export interface FaxLine {
  id: string;
  name: string;
  phoneNumber: string;
  location?: string; // If null/undefined, it's a global line
  assignedAgents: string[]; // Agent user IDs or names
  assignmentRule: AssignmentRuleType;
  fixedOwner?: string; // Used when assignmentRule is "fixed_owner"
  isActive: boolean;
  createdAt: string;
  createdBy: string; // Admin who created it
  lastAssignedIndex?: number; // For round robin tracking
}

export interface FaxLineAssignment {
  faxLineId: string;
  agentId: string;
  agentName: string;
  assignedAt: string;
  assignedBy: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  adminIds: string[]; // Admins for this location
}

// Extended FaxDocument type to include fax line information
export interface FaxLineInfo {
  faxLineId: string;
  faxLineName: string;
  location?: string;
}


