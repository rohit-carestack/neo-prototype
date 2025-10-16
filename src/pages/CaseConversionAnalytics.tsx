import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function CaseConversionAnalytics() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Case Conversion Analytics</h1>
            <p className="text-muted-foreground">Monitor conversion rates and funnel metrics</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Case conversion analytics coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

