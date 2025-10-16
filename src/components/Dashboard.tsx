import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ClipboardList,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "urgent";
}

function MetricCard({ title, value, description, trend, icon: Icon, variant = "default" }: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "urgent":
        return "border-urgent/20 bg-urgent/5";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <Card className={`${getVariantStyles()} transition-colors hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
            )}
            <span className={`text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "fax",
      title: "New referral received",
      description: "John Doe - Lower back pain",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "eligibility",
      title: "E&B check completed",
      description: "Sarah Smith - BCBS eligible",
      time: "15 minutes ago",
      status: "completed",
    },
    {
      id: 3,
      type: "sequence",
      title: "Follow-up SMS sent",
      description: "Mike Johnson - Appointment reminder",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 4,
      type: "assignment",
      title: "Lead assigned",
      description: "Emma Davis → Sarah Wilson",
      time: "2 hours ago",
      status: "completed",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-pending/10 text-pending border-pending/20">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest updates across your system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}

function ActionableItems() {
  const items = [
    {
      id: 1,
      title: "SLA Breaches",
      count: 3,
      description: "First-touch deadlines approaching",
      urgency: "urgent",
      action: "Review Now",
    },
    {
      id: 2,
      title: "PA Required",
      count: 7,
      description: "Prior authorizations needed",
      urgency: "warning",
      action: "Process",
    },
    {
      id: 3,
      title: "Unassigned Leads",
      count: 12,
      description: "New leads awaiting assignment",
      urgency: "default",
      action: "Assign",
    },
    {
      id: 4,
      title: "Failed Sequences",
      count: 2,
      description: "Communication sequences need attention",
      urgency: "warning",
      action: "Fix",
    },
  ];

  const getUrgencyButton = (urgency: string, action: string) => {
    switch (urgency) {
      case "urgent":
        return <Button variant="urgent" size="sm">{action}</Button>;
      case "warning":
        return <Button variant="warning" size="sm">{action}</Button>;
      default:
        return <Button variant="outline" size="sm">{action}</Button>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Action Required</CardTitle>
        <CardDescription>Items that need your immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {getUrgencyButton(item.urgency, item.action)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Referrals"
          value={23}
          description="+12% from yesterday"
          trend={{ value: "+12%", isPositive: true }}
          icon={FileText}
          variant="success"
        />
        <MetricCard
          title="Web Leads"
          value={8}
          description="2 hours avg response time"
          trend={{ value: "-5%", isPositive: false }}
          icon={ClipboardList}
        />
        <MetricCard
          title="SLA Breaches"
          value={3}
          description="First-touch violations"
          icon={Clock}
          variant="urgent"
        />
        <MetricCard
          title="Conversion Rate"
          value="68%"
          description="Referral → Eval scheduled"
          trend={{ value: "+3%", isPositive: true }}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          title="PA Pending"
          value={12}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Active Sequences"
          value={45}
          icon={Calendar}
        />
        <MetricCard
          title="Workers' Comp"
          value={6}
          description="3 need authorization"
          icon={Users}
          variant="warning"
        />
        <MetricCard
          title="Today's Evals"
          value={18}
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title="Unassigned"
          value={12}
          icon={Users}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <ActionableItems />
      </div>
    </div>
  );
}