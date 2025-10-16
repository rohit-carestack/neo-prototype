# Hierarchical Navigation System Guide

## Overview

The application now features a redesigned accordion-style hierarchical navigation system with **Main Side Tabs** and **Sub-Side Tabs**. Sub-tabs expand inline within the same sidebar, providing better organization and scalability as the application grows.

## Architecture

### Components

1. **`MainSideTab`** (`src/components/MainSideTab.tsx`)
   - Represents top-level navigation categories
   - Shows active state with indicator bar
   - Displays chevron for expandable sections
   - Smooth hover and active animations

2. **`SubSideTab`** (`src/components/SubSideTab.tsx`)
   - Nested navigation items that appear inline when a main tab is expanded
   - Staggered fade-in animation for visual polish
   - Active state with subtle indicator dot on the left border
   - Smaller, more compact styling to fit within accordion

3. **`AppSidebar`** (`src/components/AppSidebar.tsx`)
   - Main navigation controller with accordion functionality
   - Manages expanded/collapsed state
   - Handles localStorage persistence
   - Single sidebar with inline expanding sub-tabs

### Configuration

Navigation is defined in **`src/config/navigationConfig.ts`**:

```typescript
export interface SubTab {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface MainTab {
  id: string;
  title: string;
  icon: LucideIcon;
  subTabs?: SubTab[];
  url?: string; // For tabs without sub-tabs
}
```

## Navigation Structure

### 📞 Call
- Call Logs
- Internal Calls
- Voicemail

### 💬 Messaging
- Text Messages
- Message Logs

### 📠 Fax
*(Direct link - no sub-tabs)*

### 📋 Boards
- Opportunities Board
- Prior Auth Board
- Waitlist Board
- Tasks Board

### 💳 Eligibility and Benefits
*(Direct link - no sub-tabs)*

### 👥 Contacts
- Patients
- Referrers

### 🤖 AI & Insights
- Conversation AI
- Call Analytics
- Message Analytics
- Case Conversion Analytics
- Call Scoring
- Staff Performance

### 📡 Live Status
*(Direct link - no sub-tabs)*

### ⚙️ Configuration
- System Configuration
- Roles & Privacy

## Features

### ✨ Animations
- **Framer Motion** powers all transitions
- Smooth accordion expand/collapse with height animation
- Staggered entry animations for sub-tabs (30ms delay each)
- Spring physics for active indicator dot

### 💾 State Persistence
- Last opened main tab is saved to `localStorage`
- Automatically restores on page reload
- Auto-expands sections that contain the current active page
- Key: `neo-active-main-tab`

### 📱 Responsive Design
- Single sidebar (256px width) works on all screen sizes
- Accordion-style expansion keeps everything in one column
- Touch-friendly tap targets
- Scrollable when content overflows

### 🎨 Visual Hierarchy
- **Main tabs**: Larger, bold, with left-side active indicator bar
- **Sub-tabs**: Indented with left border, smaller text, dot indicator when active
- **Colors**: Primary accent for active states, muted for inactive
- **Spacing**: Compact sub-tabs with clear visual separation

## Adding New Navigation Items

### 1. Add to Configuration

Edit `src/config/navigationConfig.ts`:

```typescript
{
  id: "my-section",
  title: "My Section",
  icon: MyIcon,
  subTabs: [
    {
      id: "subsection-1",
      title: "Subsection 1",
      url: "/my-section/sub1",
      icon: SubIcon,
    },
  ],
}
```

### 2. Create Page Component

Create `src/pages/Subsection1.tsx`:

```typescript
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Subsection1() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Your content */}
      </div>
    </Layout>
  );
}
```

### 3. Add Route

Update `src/App.tsx`:

```typescript
import Subsection1 from "./pages/Subsection1";

// In Routes:
<Route path="/my-section/sub1" element={<Subsection1 />} />
```

## Customization

### Changing Animation Speed

In `AppSidebar.tsx`, adjust the accordion transition:

```typescript
transition={{ duration: 0.2, ease: "easeInOut" }}
```

In `SubSideTab.tsx`, adjust the stagger delay:

```typescript
transition={{ delay: index * 0.03, duration: 0.15 }} // Change 0.03 to adjust stagger
```

### Indentation and Border

Modify the sub-tab container styling in `AppSidebar.tsx`:

```typescript
className="ml-3 pl-3 border-l-2 border-border/50" // Adjust ml-3 and pl-3 for indentation
```

### Styling

- Colors: Tailwind classes in component files
- Spacing: Adjust `px-2`, `py-2`, `ml-3`, etc.
- Border: Change `border-l-2` thickness or `border-border/50` opacity

## Best Practices

1. **Keep main tabs to 8-10 items max** for visual clarity
2. **Limit sub-tabs to 6-8 items** to avoid scrolling
3. **Use descriptive icons** from `lucide-react`
4. **Group related features** under the same main tab
5. **Consider alphabetical or workflow order** for sub-tabs

## Technical Notes

- Uses React Router's `useLocation` for active state detection
- `layoutId` props enable Framer Motion's shared layout animations
- Mobile overlay uses fixed positioning with z-index stacking
- Animation exit cleanup via `AnimatePresence`

## Troubleshooting

**Sub-tabs not appearing?**
- Check that `subTabs` array is defined in config
- Verify the main tab has been clicked to expand it
- Look in browser DevTools for any animation height issues

**Active states not working?**
- Ensure route URLs match exactly in config and router
- Check console for routing errors
- Verify the active detection logic in `getActiveMainTabId()`

**Accordion animation choppy?**
- Adjust `duration` in the accordion transition
- Check for performance issues in browser DevTools
- Ensure `AnimatePresence` mode is set correctly

**Sub-tabs too close together?**
- Adjust `space-y-0.5` in the sub-tab container
- Modify `py-2` padding in SubSideTab component

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and Framer Motion

