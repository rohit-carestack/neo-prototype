import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function BotAssistedCalls() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bot-Assisted Calls</h1>
            <p className="text-muted-foreground">AI-powered call assistance and automation</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bot-Assisted Call Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Bot-assisted calling interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

