import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buildTabSections } from "../page";
import ReportTabs from "../components/report-tabs";

type PageProps = {
  params: Promise<{ reportId: string; tabKey: string }>;
};

type DataMap = Record<string, unknown>;
type ReportTabRow = Record<string, string | number | null | undefined>;

const TAB_TITLES: Record<string, string> = {
  "vimshottari-dasha": "Vimshottari Dasha",
  ashtakavarga: "Ashtakavarga",
  "yogini-dasha": "Yogini Dasha",
  "chara-dasha": "Chara Dasha",
  "sthira-dasha": "Sthira Dasha",
  "niryana-shoola-dasha": "Niryana Shoola Dasha",
  "thrikona-dasha": "Thrikona Dasha",
  "ashtottari-dasha": "Ashtottari Dasha",
  "mudda-dasha": "Mudda Dasha",
  upagraha: "Upagraha",
  charts: "Charts",
  "kundli-karak-details": "Kundli Karak Details",
  "chalit-details": "Chalit Details",
  "chandra-kundli-details": "Chandra Kundli Details",
  "avakhada-chakra-details": "Avakhada Chakra Details",
  "chara-karkamsha-swamsha": "Chara Karkamsha Swamsha",
  drekkana: "Drekkana",
  "varsha-phal": "Varsha Phal",
  "lagna-saham": "Lagna Saham",
  "sade-sati": "Sade Sati",
  "kp-page": "KP Page",
  "kp-horary-page": "KP Horary Page",
};

const isObject = (value: unknown): value is DataMap =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asObject = (value: unknown): DataMap => (isObject(value) ? value : {});

const toDisplay = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

function parseResponse(raw: string, fallback: unknown): DataMap {
  try {
    const parsed = raw ? JSON.parse(raw) : fallback;
    return asObject(parsed);
  } catch {
    return asObject(fallback);
  }
}

const SectionTable = ({ title, rows }: { title: string; rows: ReportTabRow[] }) => {
  const headers = Object.keys(rows[0] ?? {});
  if (!headers.length) return null;

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
              {rows.map((row, rowIndex) => (
                <TableRow key={`${title}-${rowIndex}`} className="hover:bg-transparent">
                  {headers.map((header, colIndex) => (
                    <TableCell
                      key={`${title}-${rowIndex}-${header}`}
                      className={`py-2.5 px-4 border-e border-b text-center border-neutral-200 dark:border-slate-600 ${
                        rowIndex % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-neutral-50 dark:bg-slate-900/40"
                      } ${colIndex === 0 ? "border-s" : ""} ${
                        rowIndex === rows.length - 1 && colIndex === 0 ? "rounded-bl-lg" : ""
                      } ${
                        rowIndex === rows.length - 1 && colIndex === headers.length - 1 ? "rounded-br-lg border-e" : ""
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
      </CardContent>
    </Card>
  );
};

const AstroFormTabPage = async ({ params }: PageProps) => {
  const { reportId: reportIdParam, tabKey } = await params;
  const reportId = Number(reportIdParam);
  if (Number.isNaN(reportId) || !TAB_TITLES[tabKey]) {
    notFound();
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const report = await prisma.astroFormReport.findFirst({
    where: { id: reportId, userId: session.user.id },
    select: {
      id: true,
      responseRaw: true,
      responseJson: true,
    },
  });

  if (!report) {
    notFound();
  }

  const response = parseResponse(report.responseRaw, report.responseJson);
  const chart = asObject(asObject(response.result).chart);
  const sections = buildTabSections(chart, tabKey);

  return (
    <>
      <DashboardBreadcrumb title={TAB_TITLES[tabKey]} text="Astro Form Tab Report" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/astro-form/reports/${reportId}`}>Back to Main Report</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/astro-form/reports">Back to Reports</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <ReportTabs reportId={report.id} />
        {sections.length === 0 ? (
          <Card className="card">
            <CardContent className="pt-6 text-sm text-neutral-600 dark:text-neutral-300">
              No data available for this section.
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => <SectionTable key={section.title} title={section.title} rows={section.rows} />)
        )}
      </div>
    </>
  );
};

export default AstroFormTabPage;
