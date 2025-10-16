import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function ConversationAI() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conversation AI</h1>
            <p className="text-muted-foreground">AI-powered conversation insights and automation</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Conversation Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Conversation AI interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

