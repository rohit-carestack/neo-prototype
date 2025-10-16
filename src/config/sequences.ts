/**
 * Centralized Sequence Configuration
 * All sequence-related data and types for consistency across the app
 */

export interface SequenceContextField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface SequenceConfig {
  id: string;
  name: string;
  description: string;
  isAI: boolean;
  contextFields: SequenceContextField[];
  category?: "engagement" | "verification" | "follow-up" | "acknowledgement";
}

export const sequences: SequenceConfig[] = [
  {
    id: "SEQ-001",
    name: "Web Lead Acknowledgement",
    description: "Automated acknowledgement for new web leads with next steps",
    isAI: true,
    category: "acknowledgement",
    contextFields: []
  },
  {
    id: "SEQ-002",
    name: "Referral Received Acknowledgement",
    description: "Acknowledge receipt of referral and set expectations",
    isAI: false,
    category: "acknowledgement",
    contextFields: [
      {
        name: "referringProvider",
        label: "Referring Provider",
        type: "text",
        required: true,
        placeholder: "e.g., Dr. Smith from Orthopedic Associates"
      },
      {
        name: "patientCondition",
        label: "Patient Condition/Diagnosis",
        type: "text",
        required: true,
        placeholder: "e.g., Lower back pain, Post-surgical rehab"
      }
    ]
  },
  {
    id: "SEQ-003",
    name: "Lead Qualification",
    description: "Qualify and gather information from new leads",
    isAI: true,
    category: "engagement",
    contextFields: []
  },
  {
    id: "SEQ-004",
    name: "Patient Intake",
    description: "Gather patient information and prepare for first visit",
    isAI: false,
    category: "engagement",
    contextFields: []
  },
  {
    id: "SEQ-005",
    name: "Appointment Reminder",
    description: "Remind patients about upcoming appointments",
    isAI: true,
    category: "engagement",
    contextFields: [
      {
        name: "appointmentDate",
        label: "Appointment Date",
        type: "date",
        required: true
      },
      {
        name: "appointmentTime",
        label: "Appointment Time",
        type: "text",
        required: true,
        placeholder: "e.g., 2:00 PM"
      }
    ]
  },
  {
    id: "SEQ-006",
    name: "Insurance Verification",
    description: "Verify insurance information and benefits",
    isAI: false,
    category: "verification",
    contextFields: []
  },
  {
    id: "SEQ-007",
    name: "Follow-up Care",
    description: "Check in with patients after treatment",
    isAI: true,
    category: "follow-up",
    contextFields: []
  },
  {
    id: "SEQ-008",
    name: "Follow Up Appointment Booking",
    description: "Help patients schedule their next appointment",
    isAI: true,
    category: "follow-up",
    contextFields: []
  },
  {
    id: "SEQ-009",
    name: "Feedback Collection",
    description: "Gather patient feedback on their experience",
    isAI: false,
    category: "follow-up",
    contextFields: []
  },
  {
    id: "SEQ-010",
    name: "NPS Survey",
    description: "Net Promoter Score survey for patient satisfaction",
    isAI: false,
    category: "follow-up",
    contextFields: []
  },
  {
    id: "SEQ-011",
    name: "Google Review Request",
    description: "Request patients to leave a Google review",
    isAI: false,
    category: "follow-up",
    contextFields: []
  }
];

export interface ActiveSequence {
  sequenceId: string;
  sequenceName: string;
  enrolledDate: string;
  currentStep: number;
  totalSteps: number;
  status: "active" | "paused" | "completed" | "failed";
  nextAction?: string;
  nextActionDate?: string;
}

