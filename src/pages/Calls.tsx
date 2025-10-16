import { Layout } from "@/components/Layout";

export default function Calls() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Calls</h2>
          <p className="text-muted-foreground mt-1">Call logs and voicemail management</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Call management coming soon...
        </div>
      </div>
    </Layout>
  );
}