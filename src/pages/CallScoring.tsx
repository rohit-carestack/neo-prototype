import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function CallScoring() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Call Scoring</h1>
            <p className="text-muted-foreground">AI-powered call quality assessment</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call Quality Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Call scoring interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

