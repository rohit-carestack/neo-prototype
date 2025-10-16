import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio } from "lucide-react";

export default function LiveStatus() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Status</h1>
            <p className="text-muted-foreground">Real-time system and user status monitoring</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Activity Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Live status monitoring coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

