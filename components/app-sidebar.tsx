"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import LogoSidebar from "./shared/logo-sidebar";
import { astroReportData, data } from "./sidebar-data";

const DASHA_TAB_ITEMS = [
  { title: "Vimshottari Dasha", tabKey: "vimshottari-dasha" },
  { title: "Yogini Dasha", tabKey: "yogini-dasha" },
  { title: "Chara Dasha", tabKey: "chara-dasha" },
  { title: "Sthira Dasha", tabKey: "sthira-dasha" },
  { title: "Niryana Shoola Dasha", tabKey: "niryana-shoola-dasha" },
  { title: "Thrikona Dasha", tabKey: "thrikona-dasha" },
  { title: "Ashtottari Dasha", tabKey: "ashtottari-dasha" },
  { title: "Mudda Dasha", tabKey: "mudda-dasha" },
] as const;

type AstroReportSummary = {
  name: string;
  birthDate: string;
  birthTime: string;
  placeOfBirth: string;
  latitudeDeg: number;
  latitudeMin: number;
  latitudeDir: "N" | "S";
  longitudeDeg: number;
  longitudeMin: number;
  longitudeDir: "E" | "W";
  plan: string | null;
  phone: string | null;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isAstroSingleReport = /^\/astro-form\/reports\/[^/]+(\/[^/]+)?$/.test(pathname);
  const reportId = React.useMemo(() => {
    const match = pathname.match(/^\/astro-form\/reports\/(\d+)/);
    return match?.[1] ?? null;
  }, [pathname]);
  const [astroReport, setAstroReport] = React.useState<AstroReportSummary | null>(null);

  React.useEffect(() => {
    if (!reportId) {
      setAstroReport(null);
      return;
    }

    fetch(`/api/astro-form/${reportId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        setAstroReport(payload?.report ?? null);
      })
      .catch(() => {
        setAstroReport(null);
      });
  }, [reportId]);

  const navItems = React.useMemo(() => {
    if (!isAstroSingleReport) return data.navMain;
    const withDetails = astroReportData.navMain.map((item, index) => {
      if (!item.title) return item;

      if (index === 1 && astroReport) {
        const dateText = new Date(astroReport.birthDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        const timeText = astroReport.birthTime.replace(/:/g, " : ");
        const lonText = `${astroReport.longitudeDeg}${astroReport.longitudeDir}${astroReport.longitudeMin}`;
        const latText = `${astroReport.latitudeDeg}${astroReport.latitudeDir}${astroReport.latitudeMin}`;
        return {
          ...item,
          title: `${astroReport.name}'s Kundli`,
          details: [
            `Date : ${dateText}`,
            `Time : ${timeText}`,
            `Place : ${astroReport.placeOfBirth} | ${lonText} | ${latText}`,
          ],
        };
      }

      if (index === 2 && astroReport) {
        return {
          ...item,
          profileCard: {
            plan: astroReport.plan ?? "BASIC PLAN",
            phone: astroReport.phone ?? "-",
            editUrl: "/view-profile?tab=editProfile",
          },
        };
      }

      if (item.title === "Dasha" && reportId) {
        return {
          ...item,
          items: DASHA_TAB_ITEMS.map((dasha) => ({
            title: dasha.title,
            url: `/astro-form/reports/${reportId}/${dasha.tabKey}`,
          })),
        };
      }

      if (item.title === "Edit" && reportId) {
        return {
          ...item,
          items: [
            {
              title: "Edit Chart",
              url: `/astro-form/reports/${reportId}/edit-chart`,
            },
          ],
        };
      }

      return item;
    });
    return withDetails;
  }, [astroReport, isAstroSingleReport, reportId]);

  return (
    <Sidebar collapsible="icon" {...props} className="hidden xl:block">
      <SidebarHeader>
        <LogoSidebar />
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-invisible hover:scrollbar-visible">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
