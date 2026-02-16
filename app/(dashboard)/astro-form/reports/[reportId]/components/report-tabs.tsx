"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export type ReportTabRow = Record<string, string | number | null | undefined>;

export type ReportTabSection = {
  title: string;
  rows: ReportTabRow[];
};

export type ReportTabsSections = Record<string, ReportTabSection[]>;

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

const toDisplay = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const ReportTabs = ({ sections }: { sections: ReportTabsSections }) => {
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
            <div className="space-y-4">
              {(sections[tab.value] ?? []).map((section) => {
                const headers = Object.keys(section.rows[0] ?? {});
                return (
                  <div
                    key={`${tab.value}-${section.title}`}
                    className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-slate-600 dark:bg-[#273142]"
                  >
                    <h4 className="mb-3 text-base font-semibold text-foreground">{section.title}</h4>
                    {section.rows.length === 0 ? (
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">No data available.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="table-auto border-spacing-0 border-separate">
                          <TableHeader>
                            <TableRow className="border-0">
                              {headers.map((header, index) => (
                                <TableHead
                                  key={header}
                                  className={`px-4 h-11 border-e border-t text-center border-neutral-200 dark:border-slate-600 bg-primary text-primary-foreground ${
                                    index === 0 ? "rounded-tl-lg border-s" : ""
                                  } ${index === headers.length - 1 ? "rounded-tr-lg border-e" : ""}`}
                                >
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.rows.map((row, rowIndex) => (
                              <TableRow key={`${section.title}-${rowIndex}`} className="hover:bg-transparent">
                                {headers.map((header, colIndex) => (
                                  <TableCell
                                    key={`${section.title}-${rowIndex}-${header}`}
                                    className={`py-2.5 px-4 border-e border-b text-center border-neutral-200 dark:border-slate-600 ${
                                      rowIndex % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-neutral-50 dark:bg-slate-900/40"
                                    } ${colIndex === 0 ? "border-s" : ""} ${
                                      rowIndex === section.rows.length - 1 && colIndex === 0 ? "rounded-bl-lg" : ""
                                    } ${
                                      rowIndex === section.rows.length - 1 && colIndex === headers.length - 1
                                        ? "rounded-br-lg border-e"
                                        : ""
                                    }`}
                                  >
                                    {toDisplay(row[header])}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                );
              })}
              {(sections[tab.value] ?? []).length === 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-slate-600 dark:bg-slate-900/30 dark:text-neutral-300">
                  No data configured for this section yet.
                </div>
              ) : null}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportTabs;
