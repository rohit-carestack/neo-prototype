import { useUserRole } from "@/contexts/UserRoleContext";
import { Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSelector() {
  const { role, setRole, isAdmin } = useUserRole();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg">
      <span className="text-xs font-medium text-muted-foreground">View:</span>
      <div className="flex gap-1 bg-background rounded-md p-1">
        <button
          onClick={() => setRole("admin")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all",
            isAdmin
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Shield className="h-3.5 w-3.5" />
          Admin
        </button>
        <button
          onClick={() => setRole("agent")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all",
            !isAdmin
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-3.5 w-3.5" />
          Agent
        </button>
      </div>
    </div>
  );
}

