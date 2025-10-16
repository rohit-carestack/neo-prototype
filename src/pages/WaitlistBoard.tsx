import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function WaitlistBoard() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Waitlist Board</h1>
            <p className="text-muted-foreground">Manage patient waitlists and scheduling</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Waitlist management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

