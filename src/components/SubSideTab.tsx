import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SubTab } from "@/config/navigationConfig";

interface SubSideTabProps {
  subTab: SubTab;
  isActive: boolean;
  index: number;
}

export function SubSideTab({ subTab, isActive }: SubSideTabProps) {
  const Icon = subTab.icon;

  return (
    <NavLink
      to={subTab.url}
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-150",
        "hover:bg-accent group relative text-sm",
        isActive && "bg-primary/10 text-primary font-medium"
      )}
    >
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="activeSubTab"
          className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon (optional) */}
      {Icon && (
        <div
          className={cn(
            "flex-shrink-0 transition-colors",
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Title */}
      <span
        className={cn(
          "flex-1 transition-colors",
          isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {subTab.title}
      </span>
    </NavLink>
  );
}

