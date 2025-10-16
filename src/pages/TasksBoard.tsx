import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseMedical } from "lucide-react";

export default function TasksBoard() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BriefcaseMedical className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks Board</h1>
            <p className="text-muted-foreground">Track and manage tasks across teams</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Task management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

