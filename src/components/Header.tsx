import { Bell, Search, User, LogOut, UserCircle, Users, Building2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RoleSelector } from "@/components/RoleSelector";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  userRole?: string;
  userName?: string;
}

const searchData = [
  { type: "patient", id: "1", name: "John Smith", detail: "DOB: 03/15/1985 • Blue Cross Blue Shield", phone: "(555) 123-4567", path: "/patients" },
  { type: "patient", id: "2", name: "Sarah Johnson", detail: "DOB: 07/22/1990 • Aetna", phone: "(555) 234-5678", path: "/patients" },
  { type: "patient", id: "3", name: "Michael Chen", detail: "DOB: 11/08/1978 • UnitedHealthcare", phone: "(555) 345-6789", path: "/patients" },
  { type: "patient", id: "4", name: "Emily Rodriguez", detail: "DOB: 05/30/1995 • Cigna", phone: "(555) 456-7890", path: "/patients" },
  { type: "patient", id: "5", name: "David Williams", detail: "DOB: 09/12/1982 • Medicare", phone: "(555) 567-8901", path: "/patients" },
  { type: "lead", id: "1", name: "Jennifer Martinez", detail: "Web Lead • High Priority", path: "/opportunities" },
  { type: "lead", id: "2", name: "Robert Thompson", detail: "Call Lead • Medium Priority", path: "/opportunities" },
  { type: "referrer", id: "1", name: "Dr. James Anderson", detail: "Primary Care • 42 referrals", path: "/referrers" },
  { type: "referrer", id: "2", name: "Dr. Lisa Chen", detail: "Orthopedic Surgery • 38 referrals", path: "/referrers" },
];

export function Header({ userRole = "Intake Coordinator", userName = "Sarah Wilson" }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (path: string, id?: string) => {
    setSearchOpen(false);
    if (id) {
      navigate(`${path}?id=${id}`);
    } else {
      navigate(path);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "patient": return UserCircle;
      case "lead": return Users;
      case "referrer": return Building2;
      default: return UserCircle;
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="h-9 w-9" />
        
        <div className="flex-1 flex items-center gap-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative max-w-md flex-1 cursor-pointer">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Input
                  placeholder="Search patients, leads, referrers..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
                  readOnly
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search patients, leads, referrers..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Patients">
                    {searchData.filter(item => item.type === "patient").map((item, idx) => {
                      const Icon = getIcon(item.type);
                      return (
                        <CommandItem
                          key={`patient-${idx}`}
                          onSelect={() => handleSelect(item.path, item.id)}
                          className="cursor-pointer"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.detail}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandGroup heading="Leads">
                    {searchData.filter(item => item.type === "lead").map((item, idx) => {
                      const Icon = getIcon(item.type);
                      return (
                        <CommandItem
                          key={`lead-${idx}`}
                          onSelect={() => handleSelect(item.path, item.id)}
                          className="cursor-pointer"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.detail}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandGroup heading="Referrers">
                    {searchData.filter(item => item.type === "referrer").map((item, idx) => {
                      const Icon = getIcon(item.type);
                      return (
                        <CommandItem
                          key={`referrer-${idx}`}
                          onSelect={() => handleSelect(item.path, item.id)}
                          className="cursor-pointer"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.detail}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Selector */}
          <RoleSelector />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-urgent text-urgent-foreground text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}