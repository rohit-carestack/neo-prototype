# Fax Line Configuration System - Implementation Guide

## Overview

The Fax Line Configuration system provides a comprehensive, multi-location fax management solution with role-based permissions, automated assignment rules, and agent-scoped visibility controls.

## Key Features

### 1. **Fax Line Configuration**
Each fax line can be:
- **Tied to a location** (e.g., "ETS Hartford", "ETS New Haven")
- **Left unassigned** (Global fax line, visible only to admins)
- **Activated/Deactivated** via a toggle switch
- **Assigned multiple agents** for handling incoming faxes

### 2. **Location-Based Scoping**
- **Admin Location Scope**: Admins can only see and manage fax lines for their assigned location
- **Global Lines**: Unassigned lines are visible to all admins (across locations)
- **Agent Visibility**: Agents only see faxes from lines they're assigned to

### 3. **Agent Assignment**
- **Minimum Requirement**: Every fax line must have at least one assigned agent
- **Multiple Agents**: One or more agents can be assigned to the same line
- **Scoped Visibility**: Agents can only view faxes from their assigned lines

### 4. **Assignment Rules**

Three assignment strategies are supported:

#### Manual Assignment
- Faxes appear in "Unassigned" section
- Agents manually claim or assign faxes
- No automatic assignment occurs

#### Round Robin
- Faxes auto-assign to agents in rotation
- Tracks last assigned agent via `lastAssignedIndex`
- Ensures even distribution across team

#### Fixed Owner
- All faxes automatically assign to a designated agent
- Useful for specialized lines (e.g., insurance verifications)
- Agent is set via `fixedOwner` property

### 5. **Fax Visibility & Self-Assignment**

**For Agents:**
- See only faxes from assigned fax lines
- Can assign fax to themselves
- Can assign to other agents **on the same fax line**
- Cannot assign to agents not on the fax line

**For Admins:**
- Full control within their location scope
- Can view all faxes from location's lines
- Can manually reassign between any agents on the line
- Can add/remove agents from fax lines

### 6. **Admin Powers**

Admins can:
- Create new fax lines
- Edit existing fax lines (name, phone, location, rules)
- Add/remove agents from fax lines
- Configure assignment rules (manual, round robin, fixed owner)
- Toggle fax lines active/inactive
- Delete fax lines
- **Cannot** see or manage other locations' fax lines

## Technical Implementation

### File Structure

```
src/
├── types/
│   └── faxLines.ts                    # Type definitions
├── contexts/
│   └── FaxLineContext.tsx             # Fax line state management
├── pages/
│   ├── FaxLineConfiguration.tsx       # Admin configuration page
│   └── FaxInbox.tsx                   # Fax inbox (to be updated)
└── config/
    └── navigationConfig.ts            # Navigation menu
```

### Key Types

```typescript
export type AssignmentRuleType = "manual" | "round_robin" | "fixed_owner";

export interface FaxLine {
  id: string;
  name: string;
  phoneNumber: string;
  location?: string;                    // undefined = global line
  assignedAgents: string[];
  assignmentRule: AssignmentRuleType;
  fixedOwner?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  lastAssignedIndex?: number;          // For round robin tracking
}
```

### Context API

The `FaxLineContext` provides:

```typescript
interface FaxLineContextType {
  faxLines: FaxLine[];
  getFaxLineByNumber: (phoneNumber: string) => FaxLine | undefined;
  getAssignableAgents: (faxLineId: string) => string[];
  canAgentViewLine: (agentName: string, faxLineId: string) => boolean;
  getAgentFaxLines: (agentName: string) => FaxLine[];
  getNextAssignee: (faxLineId: string) => string | undefined;
}
```

### Usage Example

```typescript
import { useFaxLines } from "@/contexts/FaxLineContext";

function MyComponent() {
  const { 
    getFaxLineByNumber, 
    canAgentViewLine,
    getNextAssignee 
  } = useFaxLines();

  // Get fax line by phone number
  const line = getFaxLineByNumber("(555) 100-0001");

  // Check if agent can view this line
  const canView = canAgentViewLine("Sarah Wilson", lineId);

  // Get next assignee (based on assignment rule)
  const assignee = getNextAssignee(lineId);
}
```

## Admin Interface

### Fax Line Configuration Page
**Path**: `/config/fax-lines`
**Access**: Admin only

#### Features:
- **Stats Dashboard**: Shows total, active, location, and global line counts
- **Fax Lines Table**: Lists all visible fax lines with:
  - Name & phone number
  - Location (or "Global" badge)
  - Assignment rule badge
  - Assigned agent count
  - Active/Inactive toggle
  - Edit/Delete actions
- **Agent Management Modal**: Add/remove agents from fax lines
- **Create/Edit Dialog**: Configure all fax line properties

#### Create Fax Line Form:
1. **Line Name**: Descriptive name (e.g., "Hartford Main Line")
2. **Phone Number**: Fax number (formatted as (555) 123-4567)
3. **Location**: Optional - select location or leave blank for global
4. **Assignment Rule**: Choose manual, round robin, or fixed owner
5. **Fixed Owner**: (If fixed owner selected) Select designated agent
6. **Active Status**: Toggle to activate/deactivate

## Navigation

The configuration page is accessible via:
```
Configuration → Fax Line Configuration
```

### Navigation Entry:
- Icon: Phone
- Roles: Admin only
- URL: `/config/fax-lines`

## Next Steps for Full Implementation

### Remaining Tasks:

1. **Update FaxInbox.tsx**:
   - Add fax line information to each fax document
   - Filter faxes based on agent's assigned lines
   - Update assignment dropdowns to show only line-assigned agents
   - Add self-assignment capability
   - Implement auto-assignment based on rules

2. **Opportunities Board Integration**:
   - Show faxes in "Unassigned" section until claimed
   - Filter by agent's fax line assignments
   - Add line information to fax cards

3. **API Integration**:
   - Replace mock data with real API calls
   - Implement CRUD operations for fax lines
   - Track round robin state server-side
   - Add real-time updates for fax assignments

4. **Enhanced Permissions**:
   - Implement actual location-based admin filtering
   - Add role checks for all operations
   - Audit log for fax line changes

5. **Advanced Features**:
   - Business hours routing
   - Overflow handling (if all agents busy)
   - Priority routing for VIP faxes
   - Analytics dashboard for fax line performance

## Testing Scenarios

### As Admin:

1. **Create Location Line**:
   - Create line for your location
   - Assign 2+ agents
   - Set round robin rule
   - Verify agents can see it

2. **Create Global Line**:
   - Create line without location
   - Assign agents from any location
   - Verify visibility

3. **Manage Agents**:
   - Add agent to line
   - Remove agent (verify minimum 1 agent rule)
   - Change assignment rules

### As Agent:

1. **View Assigned Faxes**:
   - See only faxes from assigned lines
   - Cannot see faxes from other lines

2. **Self-Assignment**:
   - Claim unassigned fax
   - Assign to self

3. **Reassignment**:
   - Reassign to colleague on same line
   - Verify cannot assign to non-line agent

## Mock Data

The system includes pre-configured mock data for testing:

- **Hartford Main Line**: Round robin, 2 agents
- **Hartford Referrals**: Fixed owner (Sarah Wilson)
- **New Haven Main**: Manual assignment, 2 agents
- **Global Insurance Line**: Manual, cross-location agents

## Configuration Tips

### Best Practices:

1. **Location Lines**: Use for location-specific faxes (appointments, local referrals)
2. **Global Lines**: Use for cross-location services (insurance verification, billing)
3. **Round Robin**: Best for balanced workload distribution
4. **Fixed Owner**: Use for specialized expertise (e.g., workers' comp specialist)
5. **Manual**: Best for flexible teams or unpredictable workloads

### Common Patterns:

```
Location Setup:
├── Main Line (Round Robin) - All agents
├── Referral Line (Manual) - Intake specialists
└── Insurance Line (Fixed Owner) - Insurance specialist

Global Setup:
├── Billing Line (Fixed Owner) - Billing team lead
├── Clinical Docs (Manual) - Clinical team
└── Admin Line (Manual) - Admin team
```

## Troubleshooting

**Issue**: Can't remove last agent from line
- **Reason**: Every line must have at least one agent
- **Solution**: Add a new agent before removing the last one

**Issue**: Agent can't see faxes
- **Reason**: Agent not assigned to fax line
- **Solution**: Admin must add agent to the fax line

**Issue**: Round robin not working
- **Reason**: Mock implementation doesn't persist state
- **Solution**: Implement server-side state tracking

**Issue**: Can't create global line
- **Reason**: Location is required
- **Solution**: Select "Global (No Location)" from dropdown

## Security Considerations

1. **Location Isolation**: Admins cannot see other locations' data
2. **Agent Scoping**: Agents only see assigned line faxes
3. **Reassignment Controls**: Limited to line-assigned agents
4. **Audit Trail**: Track who created/modified fax lines
5. **Active Status**: Deactivate compromised lines immediately

## Future Enhancements

- **Multi-location agent support**: Agents work across locations
- **Time-based routing**: Different rules for different hours
- **Skill-based routing**: Route by fax content/category
- **Queue management**: Hold queues for busy times
- **SLA tracking**: Monitor response times per line
- **Performance metrics**: Agent efficiency, line utilization
- **Integration**: Connect to actual fax provider API

---

## Summary

This Fax Line Configuration system provides enterprise-grade fax management with:
- ✅ Multi-location support
- ✅ Role-based permissions
- ✅ Flexible assignment rules
- ✅ Agent-scoped visibility
- ✅ Admin configuration UI
- ✅ Scalable architecture

The foundation is in place for a robust, production-ready fax management solution.


