import { Layout } from "@/components/Layout";

export default function Voicemail() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Voicemail</h2>
          <p className="text-muted-foreground mt-1">Listen to and manage voicemail messages</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Voicemail coming soon...
        </div>
      </div>
    </Layout>
  );
}