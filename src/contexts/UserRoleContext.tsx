import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "agent";

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isAgent: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "neo-user-role";

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    // Initialize from localStorage or default to admin
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    return (stored === "admin" || stored === "agent") ? stored : "admin";
  });

  useEffect(() => {
    // Persist role changes to localStorage
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const value = {
    role,
    setRole,
    isAdmin: role === "admin",
    isAgent: role === "agent",
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}

