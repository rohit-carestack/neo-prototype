import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function MessageAnalytics() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Message Analytics</h1>
            <p className="text-muted-foreground">Track messaging trends and engagement</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Message Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Message analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

