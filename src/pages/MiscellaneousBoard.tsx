import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, CheckCircle2, Clock, User, Tag } from "lucide-react";
import { useUserRole } from "@/contexts/UserRoleContext";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  category: "insurance" | "supplies" | "training" | "patient" | "admin" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  stage: "todo" | "in_progress" | "review" | "completed";
  createdAt: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Call insurance for claim clarification",
    description: "Claim #12345 - Blue Cross Blue Shield needs additional documentation",
    assignedTo: "Sarah Wilson",
    createdBy: "Admin",
    dueDate: "2024-01-16",
    category: "insurance",
    priority: "high",
    stage: "todo",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Order clinic supplies",
    description: "Therapy bands, hot packs, and exercise balls",
    assignedTo: "Mike Thompson",
    createdBy: "Sarah Wilson",
    dueDate: "2024-01-18",
    category: "supplies",
    priority: "medium",
    stage: "in_progress",
    createdAt: "2024-01-14"
  },
  {
    id: "3",
    title: "Schedule team training",
    description: "New EMR features walkthrough for all staff",
    assignedTo: "Admin",
    createdBy: "Admin",
    dueDate: "2024-01-20",
    category: "training",
    priority: "medium",
    stage: "todo",
    createdAt: "2024-01-13"
  },
  {
    id: "4",
    title: "Follow up with John Smith",
    description: "Check insurance verification status and confirm appointment",
    assignedTo: "Lisa Chen",
    createdBy: "Lisa Chen",
    dueDate: "2024-01-15",
    category: "patient",
    priority: "urgent",
    stage: "in_progress",
    createdAt: "2024-01-14"
  },
  {
    id: "5",
    title: "Review new patient intake forms",
    description: "3 forms pending review and approval",
    assignedTo: "Sarah Wilson",
    createdBy: "Admin",
    dueDate: "2024-01-17",
    category: "admin",
    priority: "medium",
    stage: "review",
    createdAt: "2024-01-15"
  },
  {
    id: "6",
    title: "Update clinic website",
    description: "Add new therapist bio and update service hours",
    assignedTo: "Mike Thompson",
    createdBy: "Admin",
    dueDate: "2024-01-14",
    category: "admin",
    priority: "low",
    stage: "completed",
    createdAt: "2024-01-10"
  },
  {
    id: "7",
    title: "Verify patient eligibility batch",
    description: "Run E&B checks for 5 patients scheduled next week",
    assignedTo: "Tom Rogers",
    createdBy: "Sarah Wilson",
    dueDate: "2024-01-17",
    category: "insurance",
    priority: "high",
    stage: "todo",
    createdAt: "2024-01-15"
  }
];

const stages = [
  { key: "todo", label: "To Do", color: "bg-muted" },
  { key: "in_progress", label: "In Progress", color: "bg-primary/10" },
  { key: "review", label: "Review", color: "bg-warning/10" },
  { key: "completed", label: "Completed", color: "bg-success/10" }
];

function TaskCard({ task }: { task: Task }) {
  const getPriorityColor = () => {
    switch (task.priority) {
      case "urgent": return "bg-urgent text-urgent-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = () => {
    switch (task.category) {
      case "insurance": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "supplies": return "bg-green-500/10 text-green-700 border-green-200";
      case "training": return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "patient": return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "admin": return "bg-gray-500/10 text-gray-700 border-gray-200";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.stage !== "completed";
  const isDueToday = task.dueDate === new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className={getPriorityColor()}>
              {task.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={getCategoryColor()}>
              <Tag className="h-3 w-3 mr-1" />
              {task.category}
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-foreground text-sm mb-1">{task.title}</h4>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Assigned to: {task.assignedTo}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className={`h-3 w-3 ${isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "text-muted-foreground"}`} />
            <span className={isOverdue ? "text-destructive font-medium" : isDueToday ? "text-warning font-medium" : "text-muted-foreground"}>
              Due: {task.dueDate}
              {isOverdue && " (Overdue)"}
              {isDueToday && " (Today)"}
            </span>
          </div>
        </div>

        {task.stage === "completed" && (
          <div className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, tasks }: { stage: typeof stages[0]; tasks: Task[] }) {
  const stageTasks = tasks.filter(t => t.stage === stage.key);

  return (
    <div className="w-80 min-w-80 bg-accent/30 rounded-lg p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{stage.label}</h3>
          <Badge variant="outline" className="text-xs">
            {stageTasks.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 h-[600px] overflow-y-auto">
        {stageTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {stageTasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No tasks in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export default function MiscellaneousBoard() {
  const { isAdmin, isAgent } = useUserRole();
  const [tasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignedTo === assigneeFilter;
    
    // Agents only see tasks assigned to them
    if (isAgent) {
      return matchesSearch && matchesCategory && matchesAssignee && task.assignedTo === "Sarah Wilson"; // Mock current user
    }
    
    return matchesSearch && matchesCategory && matchesAssignee;
  });

  return (
    <Layout>
      <div className="flex-1 p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Tasks & To-Do</h2>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Team-wide operational tasks" : "Your personal task list"}
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                <SelectItem value="Mike Thompson">Mike Thompson</SelectItem>
                <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                <SelectItem value="Tom Rogers">Tom Rogers</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredTasks.length}</div>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Total Tasks" : "My Tasks"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {filteredTasks.filter(t => new Date(t.dueDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && t.stage !== "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Due Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredTasks.filter(t => new Date(t.dueDate) < new Date() && t.stage !== "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredTasks.filter(t => t.stage === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[650px] w-full">
          {stages.map(stage => (
            <StageColumn key={stage.key} stage={stage} tasks={filteredTasks} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
