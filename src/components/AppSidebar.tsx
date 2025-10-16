import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { MainSideTab } from "@/components/MainSideTab";
import { SubSideTab } from "@/components/SubSideTab";
import { navigationConfig } from "@/config/navigationConfig";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Button } from "@/components/ui/button";
import { DialPadModal } from "@/components/DialPadModal";
import { useSidebar } from "@/components/ui/sidebar";

const STORAGE_KEY = "neo-active-main-tab";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isAgent } = useUserRole();
  const { state, toggleSidebar } = useSidebar();
  const [expandedTabId, setExpandedTabId] = useState<string | null>(null);
  const [dialPadOpen, setDialPadOpen] = useState(false);
  const isInitialMount = useRef(true);
  const isCollapsed = state === "collapsed";

  // Filter navigation based on role
  const filteredNavigation = navigationConfig.filter((tab) => {
    if (!tab.roles) return true; // Show if no role restriction
    return tab.roles.includes("both") || tab.roles.includes(role);
  }).map((tab) => {
    // Filter sub-tabs based on role
    if (tab.subTabs) {
      const filteredSubTabs = tab.subTabs.filter((subTab) => {
        if (!subTab.roles) return true;
        return subTab.roles.includes("both") || subTab.roles.includes(role);
      });
      return { ...tab, subTabs: filteredSubTabs };
    }
    return tab;
  });

  // Determine which tab should be active based on current route
  const getActiveMainTabId = () => {
    const currentPath = location.pathname;
    
    // First pass: Check for exact matches in subtabs (higher priority)
    for (const tab of filteredNavigation) {
      if (tab.subTabs) {
        for (const subTab of tab.subTabs) {
          if (currentPath === subTab.url || currentPath.startsWith(subTab.url + "/")) {
            return tab.id;
          }
        }
      }
    }
    
    // Second pass: Check for direct URL matches
    for (const tab of filteredNavigation) {
      if (tab.url && (currentPath === tab.url || currentPath.startsWith(tab.url + "/"))) {
        return tab.id;
      }
    }
    
    return null;
  };

  const activeMainTabId = getActiveMainTabId();

  // Initialize on mount only
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpandedTabId(stored);
      } else if (activeMainTabId) {
        const tab = filteredNavigation.find((t) => t.id === activeMainTabId);
        if (tab?.subTabs && tab.subTabs.length > 0) {
          setExpandedTabId(activeMainTabId);
        }
      }
    } else {
      // After mount: silently expand if navigating to a section with subtabs
      // but don't trigger if already expanded to avoid re-animation
      if (activeMainTabId && activeMainTabId !== expandedTabId) {
        const tab = filteredNavigation.find((t) => t.id === activeMainTabId);
        if (tab?.subTabs && tab.subTabs.length > 0) {
          setExpandedTabId(activeMainTabId);
        }
      }
    }
  }, [activeMainTabId, expandedTabId, filteredNavigation]);

  // Update localStorage when expanded tab changes
  useEffect(() => {
    if (expandedTabId) {
      localStorage.setItem(STORAGE_KEY, expandedTabId);
    }
  }, [expandedTabId]);

  const handleMainTabClick = (tabId: string, tabUrl?: string) => {
    const tab = filteredNavigation.find((t) => t.id === tabId);
    
    if (tab?.subTabs && tab.subTabs.length > 0) {
      // If clicking on a different section, expand it and navigate to first sub-tab
      if (expandedTabId !== tabId) {
        setExpandedTabId(tabId);
        // Navigate to the first sub-tab
        if (tab.subTabs[0]?.url) {
          navigate(tab.subTabs[0].url);
        }
      } else {
        // If clicking on already expanded section, collapse it
        setExpandedTabId(null);
      }
    } else if (tabUrl) {
      // Navigate directly for tabs without subtabs
      // Collapse any open accordion when navigating to a simple tab
      navigate(tabUrl);
      setExpandedTabId(null);
    }
  };

  const getActiveSubTabId = (mainTabId: string) => {
    const currentPath = location.pathname;
    const mainTab = filteredNavigation.find((t) => t.id === mainTabId);
    
    if (!mainTab?.subTabs) return null;
    
    // First pass: Check for exact matches
    for (const subTab of mainTab.subTabs) {
      if (currentPath === subTab.url) {
        return subTab.id;
      }
    }
    
    // Second pass: Check for prefix matches (longest first to avoid false matches)
    const sortedSubTabs = [...mainTab.subTabs].sort((a, b) => b.url.length - a.url.length);
    for (const subTab of sortedSubTabs) {
      if (currentPath.startsWith(subTab.url + "/")) {
        return subTab.id;
      }
    }
    
    return null;
  };

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-3xl font-black italic text-foreground tracking-tight">NEO</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("h-8 w-8", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Dial Pad Button - Only for Agents */}
      {isAgent && !isCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <Button 
            className="w-full h-12 bg-black hover:bg-black/90 text-white gap-2 font-semibold"
            onClick={() => setDialPadOpen(true)}
          >
            <Phone className="h-5 w-5" />
            Dialpad
          </Button>
        </div>
      )}
      
      {/* Dial Pad Icon Button - Collapsed State */}
      {isAgent && isCollapsed && (
        <div className="px-2 pt-4 pb-2">
          <Button 
            variant="ghost"
            size="icon"
            className="w-full h-12 hover:bg-accent"
            onClick={() => setDialPadOpen(true)}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNavigation.map((tab) => (
          <div key={tab.id}>
            {/* Main Tab */}
            <MainSideTab
              tab={tab}
              isActive={activeMainTabId === tab.id}
              isExpanded={expandedTabId === tab.id}
              onClick={() => handleMainTabClick(tab.id, tab.url)}
              isCollapsed={isCollapsed}
            />
            
            {/* Sub-tabs (Accordion Style) - Hidden when sidebar collapsed */}
            {!isCollapsed && (
              <div 
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  expandedTabId === tab.id && tab.subTabs && tab.subTabs.length > 0
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className={cn(
                    "ml-3 pl-3 border-l-2 border-border/50 mt-1 space-y-0.5",
                    "pt-1 pb-2"
                  )}>
                    {tab.subTabs && tab.subTabs.map((subTab, index) => (
                      <SubSideTab
                        key={subTab.id}
                        subTab={subTab}
                        isActive={getActiveSubTabId(tab.id) === subTab.id}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dial Pad Modal */}
      <DialPadModal open={dialPadOpen} onOpenChange={setDialPadOpen} />
    </div>
  );
}
