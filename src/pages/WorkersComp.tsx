import { Layout } from "@/components/Layout";

export default function WorkersComp() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Workers' Compensation</h2>
          <p className="text-muted-foreground mt-1">Manage workers' compensation cases and authorization</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Workers' Comp management coming soon...
        </div>
      </div>
    </Layout>
  );
}