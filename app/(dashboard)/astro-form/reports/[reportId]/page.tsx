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
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Astro Form Report | WowDash Admin Dashboard",
  description: "Astro Form detailed report.",
};

type PageProps = {
  params: Promise<{ reportId: string }>;
};

type DataMap = Record<string, unknown>;
type DataRow = Record<string, string | number | null | undefined>;

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

const OverviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-border py-3 last:border-b-0">
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-sm text-neutral-700 dark:text-neutral-200">{value}</p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-3 text-lg font-semibold text-primary">{title}</div>
);

const isObject = (value: unknown): value is DataMap =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asObject = (value: unknown): DataMap => (isObject(value) ? value : {});

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const toDisplay = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const toTitle = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const toFixedText = (value: number, digits = 2): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(digits).replace(/\.?0+$/, "");

function parseResponse(raw: string, fallback: unknown): DataMap {
  try {
    const parsed = raw ? JSON.parse(raw) : fallback;
    return asObject(parsed);
  } catch {
    return asObject(fallback);
  }
}

function buildChartRows(chart: DataMap): Array<{ label: string; value: string }> {
  const asc = asObject(chart.ascendant);
  const ayanamsa = asObject(chart.ayanamsa);
  const location = asObject(chart.location);
  const star = asObject(chart.star);
  const rasi = asObject(chart.rasi);

  return [
    { label: "Ascendant", value: `${toDisplay(asc.sign)} (${toDisplay(asc.lord)})` },
    { label: "Ayanamsa", value: `${toDisplay(ayanamsa.type)} (${toDisplay(ayanamsa.value)})` },
    { label: "Balance Dasha", value: toDisplay(chart.balanceDasha) },
    { label: "Julian Day", value: toDisplay(chart.julianDay) },
    { label: "Karan", value: toDisplay(chart.karan) },
    {
      label: "Location",
      value: `${toDisplay(location.latitude)}, ${toDisplay(location.longitude)}`,
    },
    { label: "Sunrise", value: toDisplay(chart.sunrise) },
    { label: "Sunset", value: toDisplay(chart.sunset) },
    { label: "Time of Birth", value: toDisplay(chart.timeOfBirth) },
    { label: "Tithi", value: toDisplay(chart.tithi) },
    { label: "Yoga", value: toDisplay(chart.yoga) },
    {
      label: "Star",
      value: `${toDisplay(star.nakshatra)} (${toDisplay(star.lord)}), Pada ${toDisplay(star.pada)}`,
    },
    { label: "Rasi", value: `${toDisplay(rasi.sign)} (${toDisplay(rasi.lord)})` },
  ];
}

function buildAgeRows(ageCalculations: DataMap): DataRow[] {
  const years = asObject(ageCalculations.year);
  const months = asObject(ageCalculations.month);
  const days = asObject(ageCalculations.day);
  const keys = ["amsayu", "badrayan", "jeevayu", "nisargayu", "pindayu"];

  return keys.map((key) => ({
    Type: toTitle(key),
    Years: toDisplay(years[key]),
    Months: toDisplay(months[key]),
    Days: toDisplay(days[key]),
  }));
}

function buildPlanetPositionRows(planetPositions: DataMap): DataRow[] {
  return Object.entries(planetPositions).map(([planet, details]) => ({
    Planet: planet,
    Details: toDisplay(details),
  }));
}

function buildPlanetaryDetailsRows(fullPositions: DataMap): DataRow[] {
  return Object.entries(fullPositions).map(([name, raw]) => {
    const item = asObject(raw);
    return {
      Name: name,
      C: toDisplay(item.Combust) === "-" ? "-" : toDisplay(item.Combust),
      R: toDisplay(item.Retro) === "-" ? "-" : toDisplay(item.Retro),
      FullName: toDisplay(item.FullName),
      Degree: toDisplay(item.Degree),
      LongitudeDegree: toDisplay(item.LongitudeDegree),
      RasiNo: toDisplay(item.RasiNo),
      Zodiac: toDisplay(item.Zodiac),
      House: toDisplay(item.house ?? item.KP_House),
      Nakshatra: toDisplay(item.Nakshatra),
      NakshatraPada: toDisplay(item.Pada),
    };
  });
}

function buildFriendshipRows(
  fiveFold: DataMap,
  mode: "natural" | "temporary" | "compound"
): DataRow[] {
  return PLANET_ORDER.map((rowPlanet) => {
    const rowData = asObject(fiveFold[rowPlanet]);
    const row: DataRow = { Planet: rowPlanet };

    for (const colPlanet of PLANET_ORDER) {
      const cell = asObject(rowData[colPlanet]);
      row[colPlanet] = toDisplay(cell[mode]);
    }
    return row;
  });
}

function buildShadBalaRows(shadBala: DataMap): DataRow[] {
  const desiredOrder = [
    "SaptavargajaBala",
    "UcchaBala",
    "OjaYugmaBala",
    "KendraBala",
    "DrekkanaBala",
    "TotalSthanBala",
    "TotalDigBala",
    "NathonnathaBala",
    "PakshaBala",
    "TribhagaBala",
    "AbdaBala",
    "MasaBala",
    "VaraBala",
    "HoraBala",
    "AyanaBala",
    "YuddhaBala",
    "TotalKalaBala",
    "ChestaBala",
    "NaisargikaBala",
    "DrigBala",
    "TotalShadBala",
    "ShadBalaInRupas",
    "ShadBalaMinRequired",
    "ShadBalaRatio",
    "ShadBalaRelativeRank",
    "IshtPhal",
    "KashtPhal",
  ];

  return desiredOrder.map((field) => {
    const row: DataRow = { BalaType: toTitle(field) };
    for (const planet of PLANET_ORDER) {
      const source = asObject(shadBala[planet]);
      row[planet] = toDisplay(source[field]);
    }
    return row;
  });
}

function buildBhavaBalRows(bhavbalData: unknown[], chalit: unknown[]): DataRow[] {
  const list = bhavbalData.map((raw) => asObject(raw));
  if (!list.length) return [];

  const looksLikeHouseRows = list.some((item) => item.house !== undefined);

  if (looksLikeHouseRows) {
    const computed = list.map((item) => {
      const pfd = asObject(item.planet_first_diff);
      const pfdDistib = Object.entries(pfd).reduce((sum, [key, raw]) => {
        if (!key.endsWith("_DB")) return sum;
        const value = toNumber(raw);
        return sum + (value ?? 0);
      }, 0);

      const bhavadhapati = toNumber(item.bhavadhapati);
      const bhavaDig = toNumber(item.bhav_digbala);
      const totalDistib =
        toNumber(item.total_distrib_bal) ??
        toNumber(item.total_distib_bal) ??
        (pfdDistib > 0 ? pfdDistib : null);

      const totalBhav =
        toNumber(item.total_bhav_bal) ??
        (bhavadhapati !== null && bhavaDig !== null && totalDistib !== null
          ? bhavadhapati + bhavaDig + totalDistib
          : null);

      const bhavInRupa = toNumber(item.bhav_bal_in_rupa) ?? (totalBhav !== null ? totalBhav / 60 : null);

      return {
        house: toDisplay(item.house),
        firstDeg: toDisplay(item.first),
        midDeg: toDisplay(item.mid),
        lastDeg: toDisplay(item.last),
        bhavadhapatiBal: bhavadhapati !== null ? toFixedText(bhavadhapati) : "-",
        bhavaDigBal: bhavaDig !== null ? toFixedText(bhavaDig) : "-",
        totalDistibBal: totalDistib !== null ? toFixedText(totalDistib) : "-",
        totalBhavBal: totalBhav !== null ? toFixedText(totalBhav) : "-",
        bhavBalInRupa: bhavInRupa !== null ? toFixedText(bhavInRupa) : "-",
        totalBhavNumeric: totalBhav,
      };
    });

    const ranks = [...computed]
      .filter((row) => row.totalBhavNumeric !== null)
      .sort((a, b) => (b.totalBhavNumeric ?? 0) - (a.totalBhavNumeric ?? 0));
    const rankMap = new Map<string, number>();
    ranks.forEach((row, index) => {
      rankMap.set(row.house, index + 1);
    });

    return computed.map((row) => ({
      House: row.house,
      FirstDeg: row.firstDeg,
      MidDeg: row.midDeg,
      LastDeg: row.lastDeg,
      BhavadhapatiBal: row.bhavadhapatiBal,
      BhavaDigBal: row.bhavaDigBal,
      TotalDistibBal: row.totalDistibBal,
      TotalBhavBal: row.totalBhavBal,
      BhavBalInRupa: row.bhavBalInRupa,
      BhavBalRank: rankMap.get(row.house) ?? "-",
    }));
  }

  const chalitRows = buildBhavaDegreeRows([], chalit);
  const chalitByHouse = new Map<string, DataRow>();
  for (const row of chalitRows) {
    chalitByHouse.set(String(row.House), row);
  }

  const numericKeys = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const matrixRows = list.filter((item) => "Planet" in item);

  const findRowByLabel = (needle: string, skip = 0): DataMap | undefined => {
    let count = 0;
    const found = matrixRows.find((row) => {
      const label = String(row.Planet ?? "").toLowerCase();
      if (!label.includes(needle)) return false;
      if (count < skip) {
        count += 1;
        return false;
      }
      return true;
    });
    return found;
  };

  const firstRow = findRowByLabel("first");
  const bhavadhapatiRow = findRowByLabel("bhavadhapati");
  const bhavaBalRow = findRowByLabel("bhava bal");
  const totalDistibRow = findRowByLabel("distib") ?? findRowByLabel("distrib");
  const totalBhavaRow = findRowByLabel("total bhav");
  const rupaRows = matrixRows.filter((row) => String(row.Planet ?? "").toLowerCase().includes("in rupa"));
  const bhavaInRupaRow = rupaRows[0];
  const bhavaRankRow = findRowByLabel("rank") ?? rupaRows[1];

  return numericKeys.map((house) => ({
    House: house,
    FirstDeg: toDisplay(chalitByHouse.get(house)?.FirstDeg ?? firstRow?.[house]),
    MidDeg: toDisplay(chalitByHouse.get(house)?.MidDeg),
    LastDeg: toDisplay(chalitByHouse.get(house)?.LastDeg),
    BhavadhapatiBal: toDisplay(bhavadhapatiRow?.[house]),
    BhavaDigBal: toDisplay(bhavaBalRow?.[house]),
    TotalDistibBal: toDisplay(totalDistibRow?.[house]),
    TotalBhavBal: toDisplay(totalBhavaRow?.[house]),
    BhavBalInRupa: toDisplay(bhavaInRupaRow?.[house]),
    BhavBalRank: toDisplay(bhavaRankRow?.[house]),
  }));
}

type BhavaBalCategoryRow = {
  label: string;
  values: string[];
};

function buildBhavaBalCategoryRows(bhavbalData: unknown[], fullPositions: DataMap): BhavaBalCategoryRow[] {
  const houseRows = bhavbalData
    .map((raw) => asObject(raw))
    .filter((row) => row.house !== undefined)
    .sort((a, b) => (toNumber(a.house) ?? 0) - (toNumber(b.house) ?? 0));

  if (houseRows.length !== 12) {
    return [];
  }

  const houseKeys = Array.from({ length: 12 }, (_, i) => i + 1);
  const fp = asObject(fullPositions);
  const longitudeLabel: Record<string, string> = {
    Sun: toDisplay(asObject(fp.Sun).LongitudeDegree),
    Mars: toDisplay(asObject(fp.Mars).LongitudeDegree),
    Saturn: toDisplay(asObject(fp.Satn).LongitudeDegree),
    Jupiter: toDisplay(asObject(fp.Jupt).LongitudeDegree),
    Venus: toDisplay(asObject(fp.Venu).LongitudeDegree),
    Mercury: toDisplay(asObject(fp.Merc).LongitudeDegree),
    Moon: toDisplay(asObject(fp.Moon).LongitudeDegree),
  };

  const byHouse = (field: string): string[] =>
    houseRows.map((row) => {
      const value = asObject(row.planet_first_diff)[field];
      const num = toNumber(value);
      return num === null ? "-" : toFixedText(num);
    });

  const sumCols = (rows: string[][]): string[] =>
    houseKeys.map((_, idx) => {
      const sum = rows.reduce((acc, row) => acc + (toNumber(row[idx]) ?? 0), 0);
      return toFixedText(sum);
    });

  const firstRow = houseRows.map((row) => toFixedText(toNumber(row.first) ?? 0));

  const sun = byHouse("Sun");
  const sunDb = byHouse("Sun_DB");
  const mars = byHouse("Mars");
  const marsDb = byHouse("Mars_DB");
  const saturn = byHouse("Saturn");
  const saturnDb = byHouse("Saturn_DB");

  const jupiter = byHouse("Jupiter");
  const jupiterDb = byHouse("Jupiter_DB");
  const venus = byHouse("Venus");
  const venusDb = byHouse("Venus_DB");
  const mercury = byHouse("Mercury");
  const mercuryDb = byHouse("Mercury_DB");
  const moon = byHouse("Moon");
  const moonDb = byHouse("Moon_DB");

  const aTotal = sumCols([sunDb, marsDb, saturnDb]);
  const bTotal = sumCols([jupiterDb, venusDb, mercuryDb, moonDb]);
  const totalDistib = houseRows.map((row, idx) => {
    const explicit = toNumber((row as DataMap).total_distib_bal) ?? toNumber((row as DataMap).total_distrib_bal);
    return explicit === null ? toFixedText((toNumber(aTotal[idx]) ?? 0) + (toNumber(bTotal[idx]) ?? 0)) : toFixedText(explicit);
  });
  const bhavadhapati = houseRows.map((row) => toFixedText(toNumber((row as DataMap).bhavadhapati) ?? 0));
  const bhavaBal = houseRows.map((row) => toFixedText(toNumber((row as DataMap).bhav_digbala) ?? 0));
  const totalBhava = houseRows.map((row, idx) => {
    const explicit = toNumber((row as DataMap).total_bhav_bal);
    if (explicit !== null) return toFixedText(explicit);
    return toFixedText(
      (toNumber(bhavadhapati[idx]) ?? 0) + (toNumber(bhavaBal[idx]) ?? 0) + (toNumber(totalDistib[idx]) ?? 0)
    );
  });
  const bhavaInRupa = houseRows.map((row, idx) => {
    const explicit = toNumber((row as DataMap).bhav_bal_in_rupa);
    if (explicit !== null) return toFixedText(explicit);
    return toFixedText((toNumber(totalBhava[idx]) ?? 0) / 60);
  });

  const ranks = [...totalBhava]
    .map((v, idx) => ({ idx, n: toNumber(v) ?? 0 }))
    .sort((a, b) => b.n - a.n);
  const rankValues = Array.from({ length: 12 }, () => "12");
  ranks.forEach((item, rank) => {
    rankValues[item.idx] = String(rank + 1);
  });

  return [
    { label: "FIRST", values: firstRow },
    { label: "__CATEGORY_A__", values: [] },
    { label: "Sun", values: sun },
    { label: longitudeLabel.Sun || "-", values: sunDb },
    { label: "Mars", values: mars },
    { label: longitudeLabel.Mars || "-", values: marsDb },
    { label: "Saturn", values: saturn },
    { label: longitudeLabel.Saturn || "-", values: saturnDb },
    { label: "__CATEGORY_B__", values: [] },
    { label: "Jupiter", values: jupiter },
    { label: longitudeLabel.Jupiter || "-", values: jupiterDb },
    { label: "Venus", values: venus },
    { label: longitudeLabel.Venus || "-", values: venusDb },
    { label: "Mercury", values: mercury },
    { label: longitudeLabel.Mercury || "-", values: mercuryDb },
    { label: "Moon", values: moon },
    { label: longitudeLabel.Moon || "-", values: moonDb },
    { label: "__CATEGORY_A_TOTAL__", values: [] },
    { label: "A Total", values: aTotal },
    { label: "__CATEGORY_B_TOTAL__", values: [] },
    { label: "B Total", values: bTotal },
    { label: "bhavadhapati bal", values: bhavadhapati },
    { label: "Bhava bal", values: bhavaBal },
    { label: "Total Distibal", values: totalDistib },
    { label: "Total Bhav bal", values: totalBhava },
    { label: "Bhav bal in Rupa", values: bhavaInRupa },
    { label: "Bhav bal in Rupa", values: rankValues },
  ];
}

function buildBhavaDegreeRows(bhavbalData: unknown[], chalit: unknown[]): DataRow[] {
  const bhavRows = bhavbalData.map((raw) => asObject(raw));
  const hasDirectDegValues = bhavRows.length > 0 && bhavRows.some((row) => row.house !== undefined);

  if (hasDirectDegValues) {
    return bhavRows.map((row) => ({
      House: toDisplay(row.house),
      FirstDeg: toDisplay(row.first),
      MidDeg: toDisplay(row.mid),
      LastDeg: toDisplay(row.last),
    }));
  }

  const rows = chalit.map((raw) => asObject(raw));
  return rows.map((item, index) => {
    const next = rows[(index + 1) % rows.length] ?? {};
    return {
      House: toDisplay(item.Bhav),
      FirstDeg: toDisplay(item.BhavBegin),
      MidDeg: toDisplay(item.MidBhav),
      LastDeg: toDisplay(next.BhavBegin),
    };
  });
}

const DataTable = ({
  title,
  rows,
  greenHead = false,
}: {
  title: string;
  rows: DataRow[];
  greenHead?: boolean;
}) => {
  if (!rows.length) return null;
  const headers = Object.keys(rows[0]);
  return (
    <Card className="card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className={greenHead ? "bg-green-600 text-white hover:bg-green-600" : ""}>
              {headers.map((header) => (
                <TableHead key={header} className={greenHead ? "text-white" : ""}>
                  {toTitle(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {headers.map((header) => (
                  <TableCell key={header}>{toDisplay(row[header])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AstroFormReportPage = async ({ params }: PageProps) => {
  const { reportId: reportIdParam } = await params;
  const reportId = Number(reportIdParam);
  if (Number.isNaN(reportId)) {
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
      name: true,
      gender: true,
      placeOfBirth: true,
      birthDate: true,
      birthTime: true,
      timezone: true,
      latitudeDeg: true,
      latitudeMin: true,
      latitudeDir: true,
      longitudeDeg: true,
      longitudeMin: true,
      longitudeDir: true,
      chartStyle: true,
      kpHoraryNumber: true,
      apiStatus: true,
      apiJobId: true,
      createdAt: true,
      updatedAt: true,
      responseRaw: true,
      responseJson: true,
    },
  });

  if (!report) {
    notFound();
  }

  const response = parseResponse(report.responseRaw, report.responseJson);
  const chart = asObject(asObject(response.result).chart);
  const ayumilan = asObject(chart.ayumilan_calulation);
  const ayuAge = asObject(ayumilan.age);

  const chartRows = buildChartRows(chart);
  const ageRows = buildAgeRows(asObject(chart.ageCalculations));
  const planetPositionRows = buildPlanetPositionRows(asObject(chart.planetPositions));
  const planetaryRows = buildPlanetaryDetailsRows(asObject(chart.get_full_planet_positions));
  const permanentRows = buildFriendshipRows(asObject(chart.fiveFoldFriendship), "natural");
  const temporalRows = buildFriendshipRows(asObject(chart.fiveFoldFriendship), "temporary");
  const compoundRows = buildFriendshipRows(asObject(chart.fiveFoldFriendship), "compound");
  const shadBalaRows = buildShadBalaRows(asObject(chart.shadBala_calulation));
  const bhavaBalRows = buildBhavaBalRows(asArray(chart.bhavbal_data), asArray(chart.chalit));
  const bhavaBalCategoryRows = buildBhavaBalCategoryRows(
    asArray(chart.bhavbal_data),
    asObject(chart.get_full_planet_positions)
  );
  const bhavaDegreeRows = buildBhavaDegreeRows(asArray(chart.bhavbal_data), asArray(chart.chalit));

  return (
    <>
      <DashboardBreadcrumb title="Astro Form Report" text="Astro Form Report" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/astro-form/reports">Back to Reports</Link>
        </Button>
        <Button asChild>
          <Link href="/astro-form">New Report</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="card">
          <CardHeader>
            <CardTitle>Astro Data Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <OverviewRow label="Name" value={report.name} />
              <OverviewRow label="Gender" value={report.gender} />
              <OverviewRow label="Place of Birth" value={report.placeOfBirth} />
              <OverviewRow label="Birth Date" value={format(report.birthDate, "dd MMM yyyy")} />
              <OverviewRow label="Birth Time" value={report.birthTime} />
              <OverviewRow label="Timezone" value={`UTC${report.timezone >= 0 ? "+" : ""}${report.timezone}`} />
              <OverviewRow label="Latitude" value={`${report.latitudeDeg} deg ${report.latitudeMin} min ${report.latitudeDir}`} />
              <OverviewRow label="Longitude" value={`${report.longitudeDeg} deg ${report.longitudeMin} min ${report.longitudeDir}`} />
              <OverviewRow label="Chart Style" value={report.chartStyle} />
              <OverviewRow label="KP Horary Number" value={String(report.kpHoraryNumber)} />
              <OverviewRow label="API Status" value={report.apiStatus ?? "-"} />
              <OverviewRow label="Job ID" value={report.apiJobId ?? "-"} />
              <OverviewRow label="Created" value={format(report.createdAt, "dd MMM yyyy, hh:mm a")} />
              <OverviewRow label="Updated" value={format(report.updatedAt, "dd MMM yyyy, hh:mm a")} />
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader>
            <SectionHeader title="Chart" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {chartRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-semibold">{row.label}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <DataTable title="Detailed Age Calculations" rows={ageRows} />
        <DataTable title="Planet Positions" rows={planetPositionRows} />
        <Card className="card">
          <CardHeader>
            <CardTitle>Ayumilan Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-green-600 text-white hover:bg-green-600">
                  <TableHead className="text-white">Years</TableHead>
                  <TableHead className="text-white">Months</TableHead>
                  <TableHead className="text-white">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{toDisplay(ayuAge.years)}</TableCell>
                  <TableCell>{toDisplay(ayuAge.months)}</TableCell>
                  <TableCell>{toDisplay(ayuAge.days)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="bg-green-600 text-center font-semibold text-white">
                    LAGNA LORD
                  </TableCell>
                  <TableCell>{toDisplay(ayumilan.lagna_lord)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="bg-green-600 text-center font-semibold text-white">
                    METHOD
                  </TableCell>
                  <TableCell>{toDisplay(ayumilan.method)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="bg-green-600 text-center font-semibold text-white">
                    STRONGEST
                  </TableCell>
                  <TableCell>{toDisplay(ayumilan.strongest)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DataTable title="Planetary Details Table" rows={planetaryRows} greenHead />
        <DataTable title="Permanent (Natural) Friendship" rows={permanentRows} greenHead />
        <DataTable title="Temporal Friendship" rows={temporalRows} greenHead />
        <DataTable title="Five-fold (Compound) Friendship" rows={compoundRows} greenHead />
        <DataTable title="Shad Bala Table" rows={shadBalaRows} greenHead />
        {bhavaBalCategoryRows.length > 0 ? (
          <Card className="card">
            <CardHeader>
              <CardTitle>Bhava Bal Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-600 text-white hover:bg-green-600">
                    <TableHead className="text-white">Planet</TableHead>
                    {Array.from({ length: 12 }, (_, i) => (
                      <TableHead key={i + 1} className="text-white">
                        {i + 1}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bhavaBalCategoryRows.map((row, idx) =>
                    row.label.startsWith("__") ? (
                      <TableRow key={`${row.label}-${idx}`}>
                        <TableCell colSpan={13} className="text-center font-semibold">
                          {row.label
                            .replaceAll("__", "")
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={`${row.label}-${idx}`}>
                        <TableCell>{row.label}</TableCell>
                        {row.values.map((value, col) => (
                          <TableCell key={`${idx}-${col}`}>{value}</TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <DataTable title="Bhava Bal Table" rows={bhavaBalRows} greenHead />
        )}
        <DataTable title="Bhava Degrees Table" rows={bhavaDegreeRows} greenHead />
      </div>
    </>
  );
};

export default AstroFormReportPage;
