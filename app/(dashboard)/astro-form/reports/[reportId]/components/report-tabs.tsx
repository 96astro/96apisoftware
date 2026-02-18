"use client";

import Link from "next/link";
import {
  Activity,
  Aperture,
  Atom,
  ChartColumn,
  CircleGauge,
  Compass,
  FileText,
  Gem,
  Globe,
  Grid2x2,
  MoonStar,
  Orbit,
  Radar,
  Route,
  ScanText,
  ShieldHalf,
  Sparkles,
  Star,
  Sun,
  Telescope,
  Waves,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ReportTab = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const REPORT_TABS: ReportTab[] = [
  { value: "vimshottari-dasha", label: "Vimshottari Dasha", icon: Orbit },
  { value: "ashtakavarga", label: "Ashtakavarga", icon: Grid2x2 },
  { value: "yogini-dasha", label: "Yogini Dasha", icon: Sparkles },
  { value: "chara-dasha", label: "Chara Dasha", icon: Route },
  { value: "sthira-dasha", label: "Sthira Dasha", icon: Radar },
  { value: "niryana-shoola-dasha", label: "Niryana Shoola Dasha", icon: ShieldHalf },
  { value: "thrikona-dasha", label: "Thrikona Dasha", icon: Aperture },
  { value: "ashtottari-dasha", label: "Ashtottari Dasha", icon: Atom },
  { value: "mudda-dasha", label: "Mudda Dasha", icon: Waves },
  { value: "upagraha", label: "Upagraha", icon: Activity },
  { value: "charts", label: "Charts", icon: ChartColumn },
  { value: "kundli-karak-details", label: "Kundli Karak Details", icon: FileText },
  { value: "chalit-details", label: "Chalit Details", icon: ScanText },
  { value: "chandra-kundli-details", label: "Chandra Kundli Details", icon: MoonStar },
  { value: "avakhada-chakra-details", label: "Avakhada Chakra Details", icon: Globe },
  { value: "chara-karkamsha-swamsha", label: "Chara Karkamsha Swamsha", icon: Workflow },
  { value: "drekkana", label: "Drekkana", icon: Compass },
  { value: "varsha-phal", label: "Varsha Phal", icon: Sun },
  { value: "lagna-saham", label: "Lagna Saham", icon: CircleGauge },
  { value: "sade-sati", label: "Sade Sati", icon: Star },
  { value: "kp-page", label: "KP Page", icon: Telescope },
  { value: "kp-horary-page", label: "KP-Horary Page", icon: Gem },
];

const ReportTabs = ({ reportId }: { reportId: number }) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-slate-600 dark:bg-[#273142]">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Advanced Sections</h3>
      <div className="flex flex-wrap gap-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.value}
              href={`/astro-form/reports/${reportId}/${tab.value}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100"
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ReportTabs;

