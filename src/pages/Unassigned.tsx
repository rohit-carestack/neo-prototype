import { Layout } from "@/components/Layout";

export default function Unassigned() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Unassigned</h2>
          <p className="text-muted-foreground mt-1">Items that need assignment or review</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Unassigned items coming soon...
        </div>
      </div>
    </Layout>
  );
}