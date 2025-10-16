import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function StaffPerformance() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Performance</h1>
            <p className="text-muted-foreground">Track team performance and productivity metrics</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Staff performance dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

