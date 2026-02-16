"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ReportTabs = () => {
  const defaultTab = REPORT_TABS[0]?.value ?? "vimshottari-dasha";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-slate-600 dark:bg-[#273142]">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Advanced Sections</h3>

      <Tabs defaultValue={defaultTab} className="gap-0">
        <div className="pb-2">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 dark:bg-transparent">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="!flex-none h-10 rounded-lg border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition-colors data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none dark:border-slate-600 dark:text-slate-100 dark:data-[state=active]:bg-primary"
                >
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Icon className="size-4" />
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {REPORT_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/30">
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Selected tab: <span className="font-semibold">{tab.label}</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-300">
                Share what to display for this tab and I will wire the exact data section next.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportTabs;
