import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Phone, MessageSquare, Clock, Target } from "lucide-react";
import { useUserRole } from "@/contexts/UserRoleContext";

export default function MyPerformance() {
  const { isAgent } = useUserRole();

  if (!isAgent) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent View Only</CardTitle>
              <CardDescription>This page is designed for agent staff to view their personal performance metrics</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Performance</h1>
            <p className="text-muted-foreground">Your personal metrics and achievements</p>
          </div>
        </div>

        {/* Performance Score Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Performance Score</CardTitle>
                <CardDescription>Based on conversion, responsiveness, and quality</CardDescription>
              </div>
              <Badge className="text-2xl px-4 py-2 bg-primary">92/100</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-green-600">+5%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-primary">Top 15%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Progress</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Leads Handled</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-green-600 mt-1">+12 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">68%</div>
              <p className="text-xs text-muted-foreground mt-1">Above team avg (52%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm font-medium">Avg Time to Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23min</div>
              <p className="text-xs text-green-600 mt-1">8min faster than target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">4.8/5.0</div>
              <p className="text-xs text-muted-foreground mt-1">Based on call reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Activity</CardTitle>
              <CardDescription>Your communication breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Calls</p>
                    <p className="text-sm text-muted-foreground">Outbound & inbound</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-xs text-green-600">+15%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Text Messages</p>
                    <p className="text-sm text-muted-foreground">SMS conversations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-green-600">+8%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Leads Closed</p>
                    <p className="text-sm text-muted-foreground">Converted to patients</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">32</p>
                  <p className="text-xs text-green-600">+20%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Milestones and recognitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Award className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Top Performer</p>
                  <p className="text-xs text-muted-foreground">Highest conversion rate this week</p>
                  <p className="text-xs text-primary mt-1">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Streak Achievement</p>
                  <p className="text-xs text-muted-foreground">5 days of 100% response SLA</p>
                  <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Speed Record</p>
                  <p className="text-xs text-muted-foreground">Fastest avg response time (12 min)</p>
                  <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Goals</CardTitle>
            <CardDescription>Your progress toward this month's targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Leads Converted</span>
                <span className="text-sm text-muted-foreground">32 / 40</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
              <p className="text-xs text-green-600 mt-1">80% complete - On track!</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quality Score</span>
                <span className="text-sm text-muted-foreground">4.8 / 4.5</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <p className="text-xs text-green-600 mt-1">Goal exceeded!</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Response Time (under 30 min)</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
              <p className="text-xs text-green-600 mt-1">Above 90% target</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

