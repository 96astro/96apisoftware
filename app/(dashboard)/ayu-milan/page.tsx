import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import AyuMilanForm from "@/app/(dashboard)/ayu-milan/components/ayu-milan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayu Milan | WowDash Admin Dashboard",
  description: "Ayu Milan page.",
};

const AyuMilanPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Ayu Milan" text="Ayu Milan" />

      <Card className="card">
        <CardHeader>
          <CardTitle>Ayu Milan</CardTitle>
        </CardHeader>
        <CardContent>
          <AyuMilanForm />
        </CardContent>
      </Card>
    </>
  );
};

export default AyuMilanPage;
