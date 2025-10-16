# Role-Based Navigation & Board System Implementation

## 🎯 Overview

Successfully implemented a comprehensive role-based system with Admin and Agent views, featuring hierarchical navigation and specialized boards for healthcare intake and opportunities management.

---

## ✅ What's Been Implemented

### 1. Global Role Management System

**UserRoleContext** (`src/contexts/UserRoleContext.tsx`)
- Two roles: `admin` and `agent`
- Persistent role selection via localStorage
- Helper properties: `isAdmin`, `isAgent`
- Global state management across entire application

**RoleSelector Component** (`src/components/RoleSelector.tsx`)
- Toggle between Admin and Agent views
- Located in header for easy access
- Smooth visual feedback with icons
- Immediate UI updates on role change

### 2. Enhanced Navigation System

**Role-Based Filtering**
- Navigation automatically filters based on selected role
- Items marked with `roles: ["admin"]`, `roles: ["agent"]`, or `roles: ["both"]`
- Sub-tabs inherit role restrictions
- Seamless transition when switching roles

**Navigation Structure**
```
📞 Call (Both)
  ├─ Call Logs (Both)
  ├─ Internal Calls (Both)
  ├─ Voicemail (Both)
  └─ Bot-Assisted Calls (Both)

💬 Messaging (Both)
  ├─ Text Messages (Both)
  └─ Message Logs (Both)

📠 Fax (Both)

🌐 Web Leads (Admin Only)

📋 Boards (Both)
  ├─ Opportunities Board (Both - filtered by assignment)
  ├─ Prior Auth Board (Both)
  ├─ Future Opportunities (Admin Only)
  ├─ Fallen-Off Care (Admin Only)
  ├─ Waitlist Board (Both)
  └─ Tasks & To-Do (Both)

💳 Eligibility and Benefits (Both)

👥 Contacts (Both)
  ├─ Patients (Both)
  └─ Referrers (Admin Only)

📊 Analytics & Insights (Admin Only)
  ├─ Conversion Analytics
  ├─ Call Analytics
  ├─ Message Analytics
  └─ Staff Performance

🏆 My Performance (Agent Only)

📡 Live Status (Admin Only)

⚙️ Configuration (Admin Only)
  ├─ System Configuration
  └─ Roles & Privacy
```

### 3. New Board Pages

#### **Future Opportunities Board** (`src/pages/FutureOpportunitiesBoard.tsx`)
- **Purpose**: Re-engage discharged patients for future care
- **Admin Only**: Strategic oversight required
- **Features**:
  - Automated EMR discharge report pulling
  - Manual review prompts before adding patients
  - Filter unhappy or irrelevant discharges
  - Track: Patient Name, Discharge Date, Diagnosis, Therapist, Notes
  - Success metrics: ~50% conversion potential on viable candidates

**Key Workflow**:
1. System fetches discharge reports from EMR (Prompt, Raintree, etc.)
2. Prompts: "Move this discharged patient to Future Opportunities?"
3. Filter and queue viable reactivation candidates
4. Manual follow-up or automated campaigns

#### **Fallen-Off Care Board** (`src/pages/FallenOffCareBoard.tsx`)
- **Purpose**: Detect and reactivate under-scheduled or dropped patients
- **Admin Only**: Requires full patient oversight
- **Detection Rules**:
  - **High Risk**: Missed 2+ appointments without rescheduling
  - **Medium Risk**: >14 days since last visit, no upcoming appointments
  - **Watch**: Authorized visits remaining but none scheduled >7 days
- **Data Source**: EMR scheduling system with daily sync
- **Quick Actions**: Call to reschedule, automated SMS campaigns

#### **Miscellaneous Board** (`src/pages/MiscellaneousBoard.tsx`)
- **Purpose**: Lightweight task management for operational items
- **Both Roles**: Admin assigns tasks, Agent sees personal tasks
- **Use Cases**:
  - Insurance claim follow-ups
  - Supply ordering
  - Team training reminders
  - Patient intake review
- **Features**: Task assignment, labels, due dates, completion tracking
- **Value**: Keeps everyone in one system instead of HubSpot/spreadsheets

### 4. Analytics & Performance

#### **Conversion Analytics** (`src/pages/ConversionAnalytics.tsx`)
- **Admin Only**: Full business intelligence dashboard
- **Key Metrics**:
  - Overall conversion rate (58.3%)
  - Leads closed per period
  - Avg time to close (4.2 days)
  - Pipeline value tracking
- **Conversion Funnel**: Visual pipeline from new leads → converted
- **Performance Breakdown**:
  - Conversion by source (Web, Phone, Referrer, Walk-in)
  - Performance by staff member
  - Time-based latency metrics

#### **My Performance** (`src/pages/MyPerformance.tsx`)
- **Agent Only**: Personal performance dashboard
- **Metrics Shown**:
  - Overall performance score (92/100)
  - Leads handled (47)
  - Conversion rate (68%)
  - Avg time to contact (23 min)
  - Quality score (4.8/5.0)
- **Features**:
  - Activity breakdown (calls, texts, conversions)
  - Recent achievements and milestones
  - Monthly goal progress tracking
  - Gamification elements for motivation

---

## 🎨 Design Philosophy

### Admin View
- **Full Visibility**: See all data across locations, users, and boards
- **Strategic Tools**: Analytics, configuration, staff management
- **Advanced Features**: EMR automation, custom workflows, reporting
- **Purpose**: Oversight, optimization, and business intelligence

### Agent View
- **Focused Interface**: Only assigned tasks, leads, and patients
- **Quick Actions**: Call, text, mark complete workflows
- **Personal Metrics**: Individual performance tracking
- **Simplified UI**: Decluttered, action-oriented

---

## 🔧 Technical Implementation

### State Management
```typescript
// UserRoleContext provides global role state
const { role, setRole, isAdmin, isAgent } = useUserRole();

// Automatic filtering in AppSidebar
const filteredNavigation = navigationConfig.filter((tab) => {
  if (!tab.roles) return true;
  return tab.roles.includes("both") || tab.roles.includes(role);
});
```

### Access Control Pattern
```typescript
// Page-level protection
if (!isAdmin) {
  return <AccessDenied message="Only administrators can access this page" />;
}
```

### Navigation Role Schema
```typescript
export interface MainTab {
  id: string;
  title: string;
  icon: LucideIcon;
  roles?: ("admin" | "agent" | "both")[];
  subTabs?: SubTab[];
  url?: string;
}
```

---

## 📊 Metrics & Reporting Framework

### Core Principle
**Focus on conversion and latency metrics that directly impact performance**

### Key Reports

| Metric | Definition | Use Case |
|--------|-----------|----------|
| **Lead Closed** | Whether a lead converted (Yes/No) | Core success metric |
| **Time to Contact** | Lead created → first outreach | Responsiveness |
| **Time per Lane** | Duration in each pipeline stage | Identify bottlenecks |
| **Leads per Source** | Volume by referral, web, etc. | Marketing insight |
| **Conversion by Source** | Close % per source | ROI tracking |
| **Workload by User** | Leads handled per staff | Staffing efficiency |
| **SLA Breaches** | Leads aging beyond limits | Accountability |

### Dashboards by Role

**Admins**:
- Full analytics across all users
- Conversion funnels and trends
- Staff performance comparison
- Source ROI analysis

**Agents**:
- Personal performance metrics only
- Individual conversion rate
- Time to contact averages
- Goal progress tracking

---

## 🚀 Features Ready for Development

### Automated Data Integration
1. **EMR Sync**: Discharge reports, scheduling data
   - Supported systems: Prompt, Raintree, WebPT
   - Frequency: Daily sync or real-time integration
   - Method: RPA/browser automation or API

2. **CSV Upload Fallback**: Manual data import with auto-parsing

### Workflow Automation
- Automated SMS campaigns for fallen-off patients
- Email reminders for future opportunities
- Task assignment based on lead routing rules

### SLA Tracking
- Color-coded indicators when leads age beyond thresholds
- Automated alerts for SLA breaches
- Performance impact tracking

---

## 📝 Next Steps (Future Enhancements)

### 1. Opportunity Board Swim lanes (Pending)
Redesign the Opportunities Board with drag-and-drop kanban functionality:

**Default Swim lanes**:
1. Unassigned
2. Assigned
3. Contacted
4. Ready to Schedule
5. Scheduled Eval
6. Verified Benefits
7. Financial Conversation Done
8. Arrived for Appointment

**Features Needed**:
- Manual drag-and-drop between lanes
- SLA indicators (color changes, timer badges)
- Timeline view on card click (calls, texts, notes, insurance status)
- Custom lane creation with analytics mapping
- Real-time updates and collaborative editing

### 2. Data Automation
- EMR integration setup wizard
- Automated discharge report ingestion
- Real-time scheduling sync
- Patient reactivation workflows

### 3. Advanced Analytics
- Predictive conversion modeling
- Cohort analysis
- A/B testing framework for outreach methods
- Revenue attribution by source

---

## 🎯 User Experience Highlights

### Role Switching
- Instant UI transformation
- No page reload required
- Persistent across sessions
- Visible role indicator in header

### Permission System
- Graceful access denial messages
- Clear role requirements
- No broken links or 404 errors
- Contextual help text

### Navigation Flow
- Auto-collapse/expand based on current page
- Persistent state via localStorage
- Smooth transitions
- Mobile-responsive accordion

---

## 📦 Files Created/Modified

### New Files
- `src/contexts/UserRoleContext.tsx`
- `src/components/RoleSelector.tsx`
- `src/pages/FutureOpportunitiesBoard.tsx`
- `src/pages/FallenOffCareBoard.tsx`
- `src/pages/MiscellaneousBoard.tsx`
- `src/pages/MyPerformance.tsx`
- `src/pages/ConversionAnalytics.tsx`

### Modified Files
- `src/config/navigationConfig.ts` - Added role-based filtering
- `src/components/AppSidebar.tsx` - Implemented role filtering logic
- `src/components/Header.tsx` - Added RoleSelector
- `src/App.tsx` - Wrapped in UserRoleProvider, added new routes

---

## 🎉 Impact Summary

**For Admins**:
- Complete visibility into all operations
- Data-driven decision making
- Staff performance insights
- Automated patient reactivation workflows

**For Agents**:
- Cleaner, focused interface
- Personal performance tracking
- Clear task assignments
- Motivation through metrics

**For the Organization**:
- Improved conversion rates through better tracking
- Faster lead response times
- Reduced patient drop-off
- Higher reactivation success
- Unified system (no more spreadsheets/HubSpot juggling)

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and Framer Motion

