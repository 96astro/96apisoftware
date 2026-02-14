import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Calculator | WowDash Admin Dashboard",
  description: "Life Calculator page.",
};

const LifeCalculatorPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Life Calculator" text="Life Calculator" />

      <Card className="card">
        <CardHeader>
          <CardTitle>Life Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-300">
            This page is ready. Add your Life Calculator UI and logic here.
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default LifeCalculatorPage;
