import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Clock, Target, Download, Filter } from "lucide-react";
import { useUserRole } from "@/contexts/UserRoleContext";

export default function ConversionAnalytics() {
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only administrators can access Conversion Analytics</CardDescription>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Conversion Analytics</h1>
              <p className="text-muted-foreground">Track lead conversion and pipeline performance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">58.3%</div>
              <p className="text-xs text-green-600 mt-1">+4.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Time to Close</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 days</div>
              <p className="text-xs text-green-600 mt-1">0.8 days faster</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$124k</div>
              <p className="text-xs text-muted-foreground mt-1">Active opportunities</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead progression through pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Leads</span>
                <Badge>423</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contacted</span>
                <span className="text-sm text-muted-foreground">387 (91.5%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: "91.5%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ready to Schedule</span>
                <span className="text-sm text-muted-foreground">298 (70.4%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: "70.4%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Scheduled Eval</span>
                <span className="text-sm text-muted-foreground">267 (63.1%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: "63.1%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Converted</span>
                <span className="text-sm text-green-600 font-medium">247 (58.3%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: "58.3%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Source & Staff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion by Source</CardTitle>
              <CardDescription>ROI by lead origin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Web Form</p>
                  <p className="text-xs text-muted-foreground">187 leads</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600">72%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">135 converted</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Phone Inquiry</p>
                  <p className="text-xs text-muted-foreground">124 leads</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-primary">61%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">76 converted</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Referrer</p>
                  <p className="text-xs text-muted-foreground">89 leads</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-500">43%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">38 converted</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Walk-in</p>
                  <p className="text-xs text-muted-foreground">23 leads</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-500">87%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">20 converted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Staff</CardTitle>
              <CardDescription>Individual conversion rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    SW
                  </div>
                  <div>
                    <p className="font-medium">Sarah Wilson</p>
                    <p className="text-xs text-muted-foreground">47 leads handled</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600">68%</Badge>
                  <p className="text-xs text-green-600 mt-1">Top performer</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-medium">
                    JD
                  </div>
                  <div>
                    <p className="font-medium">John Davis</p>
                    <p className="text-xs text-muted-foreground">52 leads handled</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-primary">59%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Above average</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">
                    MB
                  </div>
                  <div>
                    <p className="font-medium">Maria Brown</p>
                    <p className="text-xs text-muted-foreground">38 leads handled</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge>54%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Team average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-based Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Time-Based Metrics</CardTitle>
            <CardDescription>Latency tracking across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Time to Contact</p>
                </div>
                <p className="text-2xl font-bold">28 min</p>
                <p className="text-xs text-green-600 mt-1">12 min faster than target</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Contact → Schedule</p>
                </div>
                <p className="text-2xl font-bold">2.1 days</p>
                <p className="text-xs text-muted-foreground mt-1">Within 3-day target</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Schedule → Eval</p>
                </div>
                <p className="text-2xl font-bold">5.3 days</p>
                <p className="text-xs text-orange-600 mt-1">1.3 days over target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

