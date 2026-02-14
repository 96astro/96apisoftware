import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
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
          <p className="text-neutral-600 dark:text-neutral-300">
            This page is ready. Add your Ayu Milan UI and logic here.
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default AyuMilanPage;
