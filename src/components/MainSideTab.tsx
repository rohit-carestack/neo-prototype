import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MainTab } from "@/config/navigationConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MainSideTabProps {
  tab: MainTab;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

export function MainSideTab({
  tab,
  isActive,
  isExpanded,
  onClick,
  isCollapsed = false,
}: MainSideTabProps) {
  const Icon = tab.icon;
  const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;

  const content = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200",
        "hover:bg-accent/50 group relative",
        isActive && "bg-primary/10 text-primary font-medium shadow-sm",
        isCollapsed ? "px-2 justify-center" : "px-3"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeMainTab"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Title - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          <span
            className={cn(
              "flex-1 text-left text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-foreground"
            )}
          >
            {tab.title}
          </span>

          {/* Expand indicator for tabs with subtabs */}
          {hasSubTabs && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex-shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          )}
        </>
      )}
    </button>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {tab.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

