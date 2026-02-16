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
import ReportTabs from "./components/report-tabs";
import type { ReportTabRow, ReportTabsSections } from "./components/report-tabs";

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
const TABLE_HEAD_BG = "bg-primary text-primary-foreground";

const OverviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">{label}</p>
    <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
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

function buildVimshottariSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const dashaList = asArray(chart.vimshottariDasha).map(asObject);
  if (!dashaList.length) return [];

  const mahaRows: ReportTabRow[] = dashaList.map((item, idx) => ({
    No: idx + 1,
    Mahadasha: toDisplay(item.mahadasha),
    Start: toDisplay(item.start),
    End: toDisplay(item.end),
    Duration: toDisplay(item.duration),
    BalanceStart: toDisplay(item.balance_start),
    MahaFullYears: toDisplay(item.maha_full_years),
    MahaRemainingYears: toDisplay(item.maha_remaining_years),
  }));

  const antarRows: ReportTabRow[] = [];
  const pratyantarRows: ReportTabRow[] = [];

  dashaList.forEach((md, mdIndex) => {
    const mdName = toDisplay(md.mahadasha);
    asArray(md.antar_dashas).map(asObject).forEach((ad, adIndex) => {
      const adName = toDisplay(ad.antar_dasha);
      antarRows.push({
        No: antarRows.length + 1,
        MahaNo: mdIndex + 1,
        Mahadasha: mdName,
        Antardasha: adName,
        Start: toDisplay(ad.start),
        End: toDisplay(ad.end),
        Duration: toDisplay(ad.duration),
        DurationYears: toDisplay(ad.duration_years),
        IsBalance: toDisplay(ad.is_balance_antar),
      });

      asArray(ad.pratyantra_dashas)
        .map(asObject)
        .forEach((pd) => {
          pratyantarRows.push({
            No: pratyantarRows.length + 1,
            MahaNo: mdIndex + 1,
            AntarNo: adIndex + 1,
            Mahadasha: mdName,
            Antardasha: adName,
            Pratyantra: toDisplay(pd.pratyantra_dasha),
            Start: toDisplay(pd.start),
            End: toDisplay(pd.end),
            Duration: toDisplay(pd.duration),
            DurationYears: toDisplay(pd.duration_years),
          });
        });
    });
  });

  return [
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
    { title: "Pratyantra Timeline", rows: pratyantarRows },
  ];
}

function buildAshtakavargaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const ashtakavarga = asObject(chart.ashtakavarga);
  const bhinna = asObject(ashtakavarga.bhinnashtakavarga);
  const sarva = asObject(ashtakavarga.sarvashtakavarga);
  const houseLabels = Array.from({ length: 12 }, (_, i) => `H${i + 1}`);

  const bhinnaRows: ReportTabRow[] = Object.entries(bhinna).map(([planet, raw]) => {
    const item = asObject(raw);
    const signTotals = asArray(item.sign_totals);
    const row: ReportTabRow = {
      Planet: planet,
      TargetSign: toDisplay(item.target_sign_name),
      TotalPoints: toDisplay(item.total_points),
    };
    houseLabels.forEach((key, idx) => {
      row[key] = toDisplay(signTotals[idx]);
    });
    return row;
  });

  const bySign = asArray(sarva.by_sign);
  const perSign = asObject(sarva.per_sign);
  const sarvaRows: ReportTabRow[] = houseLabels.map((house, idx) => ({
    House: idx + 1,
    TotalPoints: toDisplay(bySign[idx]),
    Sign: toDisplay(Object.keys(perSign)[idx]),
  }));

  const summaryRows: ReportTabRow[] = [
    {
      GrandTotal: toDisplay(sarva.grand_total),
      AveragePerHouse:
        toNumber(sarva.grand_total) !== null
          ? toFixedText((toNumber(sarva.grand_total) as number) / 12)
          : "-",
    },
  ];

  return [
    { title: "Bhinnashtakavarga (Planet-wise)", rows: bhinnaRows },
    { title: "Sarvashtakavarga (House-wise)", rows: sarvaRows },
    { title: "Sarvashtakavarga Summary", rows: summaryRows },
  ];
}

function buildYoginiSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const yogini = asObject(chart.yogin_result);
  const meta = asObject(yogini.meta);
  const cycles = asObject(yogini.cycles_json);

  const metaRows: ReportTabRow[] = Object.keys(meta).length
    ? [
        {
          StartDasha: toDisplay(meta.start_dasha),
          Balance: toDisplay(meta.balance),
          BalanceYears: toDisplay(meta.balance_years),
          CyclesGenerated: toDisplay(meta.cycles_generated),
          NakshatraNumber: toDisplay(meta.nakshatra_number),
          MoonLongitude: toDisplay(meta.moon_longitude),
        },
      ]
    : [];

  const cycleSummaryRows: ReportTabRow[] = [];
  const mahaRows: ReportTabRow[] = [];
  const antarRows: ReportTabRow[] = [];

  Object.entries(cycles)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cycleKey, rawCycle], cycleIdx) => {
      const cycle = asObject(rawCycle);
      const cycleLabel = toDisplay(cycle.cycle ?? cycleKey);
      const mdList = asArray(cycle.mahadashas).map(asObject);
      cycleSummaryRows.push({
        Cycle: cycleLabel,
        StartDasha: toDisplay(cycle.start_dasha),
        Start: toDisplay(cycle.start),
        End: toDisplay(cycle.end),
        TotalYears: toDisplay(cycle.total_years_nominal),
      });

      mdList.forEach((md, mdIdx) => {
        const mdName = toDisplay(md.mahadasha);
        mahaRows.push({
          No: mahaRows.length + 1,
          Cycle: cycleLabel,
          MahaNo: mdIdx + 1,
          Mahadasha: mdName,
          Lord: toDisplay(md.lord),
          Start: toDisplay(md.start),
          End: toDisplay(md.end),
          Duration: toDisplay(md.duration),
          DurationDays: toDisplay(md.duration_days),
        });

        asArray(md.antardashas)
          .map(asObject)
          .forEach((ad, adIdx) => {
            antarRows.push({
              No: antarRows.length + 1,
              Cycle: cycleLabel,
              MahaNo: mdIdx + 1,
              AntarNo: adIdx + 1,
              Mahadasha: mdName,
              Antardasha: toDisplay(ad.antardasha),
              Lord: toDisplay(ad.lord),
              Start: toDisplay(ad.start),
              End: toDisplay(ad.end),
              Duration: toDisplay(ad.duration),
            });
          });
      });
    });

  return [
    { title: "Yogini Meta", rows: metaRows },
    { title: "Cycle Summary", rows: cycleSummaryRows },
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildCharaDashaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const chara = asObject(chart.chara_dasha_jaimini);
  const mdList = asArray(chara.mahadashas).map(asObject);

  const metaRows: ReportTabRow[] = [
    {
      AscSign: toDisplay(chara.asc_sign),
      AscLord: toDisplay(chara.asc_lord),
      AscSignIndex: toDisplay(chara.asc_sign_index),
      AntarRule: toDisplay(chara.antar_rule),
      BirthDateTime: toDisplay(chara.birth_datetime),
      Timezone: toDisplay(chara.timezone),
    },
  ];

  const mahaRows: ReportTabRow[] = mdList.map((md, idx) => ({
    No: idx + 1,
    Sign: toDisplay(md.sign),
    Start: toDisplay(md.begin),
    End: toDisplay(md.end),
    Years: toDisplay(md.years),
    NinthFromLagna: toDisplay(md.maha_ninth_from_lagna),
    Orientation: toDisplay(md.maha_order_orientation),
  }));

  const antarRows: ReportTabRow[] = [];
  mdList.forEach((md, idx) => {
    const sign = toDisplay(md.sign);
    asArray(md.antardashas)
      .map(asObject)
      .forEach((ad, adIdx) => {
        antarRows.push({
          No: antarRows.length + 1,
          MahaNo: idx + 1,
          MahaSign: sign,
          AntarNo: adIdx + 1,
          AntarSign: toDisplay(ad.antar_sign),
          Start: toDisplay(ad.begin),
          End: toDisplay(ad.end),
          DurationDays: toDisplay(ad.duration_days),
          DurationYears: toDisplay(ad.duration_years_equiv),
          RuleBasis: toDisplay(ad.antar_rule_basis),
          Orientation: toDisplay(ad.antar_order_orientation),
        });
      });
  });

  return [
    { title: "Chara Dasha Meta", rows: metaRows },
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildSthiraDashaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const sthira = asObject(chart.sthira_dasha);
  const mdList = asArray(sthira.mahadashas).map(asObject);
  const metaRows: ReportTabRow[] = [
    {
      AscSign: toDisplay(sthira.asc_sign),
      AscLord: toDisplay(sthira.asc_lord),
      StartSign: toDisplay(sthira.start_sign),
      Direction: toDisplay(sthira.direction),
      BirthDateTime: toDisplay(sthira.birth_datetime),
      Timezone: toDisplay(sthira.timezone),
    },
  ];
  const mahaRows: ReportTabRow[] = mdList.map((md, idx) => ({
    No: idx + 1,
    Sign: toDisplay(md.sign),
    Start: toDisplay(md.begin),
    End: toDisplay(md.end),
    Duration: toDisplay(md.duration),
    DurationDays: toDisplay(md.duration_days),
    YearsNominal: toDisplay(md.years_nominal),
  }));
  const antarRows: ReportTabRow[] = [];
  mdList.forEach((md, idx) => {
    const sign = toDisplay(md.sign);
    asArray(md.antardashas)
      .map(asObject)
      .forEach((ad, adIdx) => {
        antarRows.push({
          No: antarRows.length + 1,
          MahaNo: idx + 1,
          MahaSign: sign,
          AntarNo: adIdx + 1,
          AntarSign: toDisplay(ad.antar_sign),
          Start: toDisplay(ad.begin),
          End: toDisplay(ad.end),
          DurationDays: toDisplay(ad.duration_days),
        });
      });
  });
  return [
    { title: "Sthira Dasha Meta", rows: metaRows },
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildNiryanaShoolaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const niryana = asObject(chart.niryana_shoola_dasha);
  const mdList = asArray(niryana.mahadashas).map(asObject);
  const mahaRows: ReportTabRow[] = mdList.map((md, idx) => ({
    No: idx + 1,
    Sign: toDisplay(md.sign),
    Start: toDisplay(md.begin),
    End: toDisplay(md.end),
    Duration: toDisplay(md.duration),
    DurationDays: toDisplay(md.duration_days),
    YearsNominal: toDisplay(md.years_nominal),
    StrongerHouse: toDisplay(md.stronger_house),
  }));
  const antarRows: ReportTabRow[] = [];
  mdList.forEach((md, idx) => {
    const sign = toDisplay(md.sign);
    asArray(md.antardashas)
      .map(asObject)
      .forEach((ad, adIdx) => {
        antarRows.push({
          No: antarRows.length + 1,
          MahaNo: idx + 1,
          MahaSign: sign,
          AntarNo: adIdx + 1,
          AntarSign: toDisplay(ad.antar_sign),
          Start: toDisplay(ad.begin),
          End: toDisplay(ad.end),
          DurationDays: toDisplay(ad.duration_days),
          StrongerHouse: toDisplay(ad.stronger_house),
        });
      });
  });
  return [
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildThrikonaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const thrikona = asObject(chart.thrikona_dasha);
  const meta = asObject(thrikona.meta);
  const table = asArray(thrikona.table).map(asObject);
  const order = asArray(thrikona.order).map((o) => toDisplay(o));

  const metaRows: ReportTabRow[] = [
    {
      StartSign: toDisplay(meta.start_sign),
      Direction: toDisplay(meta.direction),
      Source: toDisplay(meta.source),
      Order: order.join(" -> "),
    },
  ];

  const mahaRows: ReportTabRow[] = table.map((row, idx) => ({
    No: idx + 1,
    Sign: toDisplay(row.sign),
    Start: toDisplay(row.start),
    End: toDisplay(row.end),
    Years: toDisplay(row.years),
  }));

  const antarRows: ReportTabRow[] = [];
  table.forEach((md, idx) => {
    const sign = toDisplay(md.sign);
    asArray(md.antardasha)
      .map(asObject)
      .forEach((ad, adIdx) => {
        antarRows.push({
          No: antarRows.length + 1,
          MahaNo: idx + 1,
          MahaSign: sign,
          AntarNo: adIdx + 1,
          AntarSign: toDisplay(ad.sign),
          Start: toDisplay(ad.start),
          End: toDisplay(ad.end),
          Years: toDisplay(ad.years),
        });
      });
  });

  return [
    { title: "Thrikona Dasha Meta", rows: metaRows },
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildAshtottariSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const ashtottari = asObject(chart.ashtottari_dasha);
  if (!Object.keys(ashtottari).length) return [];

  const metaRows: ReportTabRow[] = [
    {
      Eligible: toDisplay(ashtottari.eligible),
      StartLord: toDisplay(ashtottari.start_lord),
      Group: toDisplay(ashtottari.group),
      FirstBalanceYears: toDisplay(ashtottari.first_balance_years),
      Lagna: toDisplay(ashtottari.lagna),
      Moon: toDisplay(ashtottari.moon),
      Rahu: toDisplay(ashtottari.rahu),
      Reasons: toDisplay(ashtottari.reasons),
    },
  ];

  const mahaRows = asArray(ashtottari.mahadashas).map(asObject).map((row, idx) => ({
    No: idx + 1,
    Level: toDisplay(row.level),
    Lord: toDisplay(row.lord),
    Start: toDisplay(row.start_utc),
    End: toDisplay(row.end_utc),
    Years: toDisplay(row.years),
  }));

  const antarRows = asArray(ashtottari.antardashas).map(asObject).map((row, idx) => ({
    No: idx + 1,
    Level: toDisplay(row.level),
    Parent: toDisplay(row.parent),
    Lord: toDisplay(row.lord),
    Start: toDisplay(row.start_utc),
    End: toDisplay(row.end_utc),
    Years: toDisplay(row.years),
  }));

  return [
    { title: "Ashtottari Meta", rows: metaRows },
    { title: "Mahadasha Timeline", rows: mahaRows },
    { title: "Antardasha Timeline", rows: antarRows },
  ];
}

function buildMuddaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const mudda = asObject(chart.mudda_dasha);
  if (!Object.keys(mudda).length) return [];
  const meta = asObject(mudda.meta);

  const summaryRows: ReportTabRow[] = [
    {
      Year: toDisplay(mudda.year),
      Start: toDisplay(mudda.start),
      End: toDisplay(mudda.end),
      RunningVimMD: toDisplay(meta.running_vim_md),
      RunningVimAD: toDisplay(meta.running_vim_ad),
      ResolveMethod: toDisplay(meta.md_resolve_method),
      UsedSolarReturn: toDisplay(meta.used_solar_return),
      ApproximateSolarReturn: toDisplay(meta.approximate_solar_return),
    },
  ];

  const periods = asArray(mudda.periods).map(asObject);
  const periodRows: ReportTabRow[] = periods.map((row, idx) => ({
    No: idx + 1,
    Lord: toDisplay(row.lord),
    Start: toDisplay(row.start),
    End: toDisplay(row.end),
    Days: toDisplay(row.days),
  }));

  const antarRows: ReportTabRow[] = [];
  periods.forEach((period, periodIdx) => {
    const lord = toDisplay(period.lord);
    asArray(period.antardasha)
      .map(asObject)
      .forEach((ad, adIdx) => {
        antarRows.push({
          No: antarRows.length + 1,
          PeriodNo: periodIdx + 1,
          PeriodLord: lord,
          AntarNo: adIdx + 1,
          Lord: toDisplay(ad.lord),
          Start: toDisplay(ad.start),
          End: toDisplay(ad.end),
          Days: toDisplay(ad.days),
        });
      });
  });

  return [
    { title: "Mudda Dasha Summary", rows: summaryRows },
    { title: "Mudda Periods", rows: periodRows },
    { title: "Mudda Antardasha", rows: antarRows },
  ];
}

function buildUpagrahaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const upagraha = asObject(chart.upagraha_result);
  if (!Object.keys(upagraha).length) return [];
  const rows: ReportTabRow[] = Object.entries(upagraha).map(([name, raw]) => {
    const item = asObject(raw);
    return {
      Name: name,
      Sign: toDisplay(item.sign),
      SignIndex: toDisplay(item.sign_index),
      Longitude: toDisplay(item.lon),
      Deg: toDisplay(item.deg),
      Min: toDisplay(item.min),
      Sec: toDisplay(item.sec),
    };
  });
  return [{ title: "Upagraha Details", rows }];
}

function buildChartsSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const rows: ReportTabRow[] = Object.entries(chart)
    .filter(([key]) => key.endsWith("_chart"))
    .map(([key, raw]) => {
      if (Array.isArray(raw)) {
        return {
          Chart: toTitle(key),
          Type: "House Data",
          HasImage: "No",
          Rows: raw.length,
        };
      }
      const item = asObject(raw);
      return {
        Chart: toTitle(key),
        Type: "Image + House Data",
        HasImage: item.base64_image ? "Yes" : "No",
        Rows: asArray(item.data).length,
      };
    });

  const d1 = asObject(chart.d1_lagna_chart);
  const d1Rows = asArray(d1.data).map(asObject).map((row) => ({
    House: toDisplay(row.house),
    Sign: toDisplay(row.sign),
    SignNo: toDisplay(row.sign_no),
    Planets: asArray(row.planets)
      .map((p) => toDisplay(asObject(p).name))
      .join(", ") || "-",
  }));

  return [
    { title: "Available Chart Images", rows },
    { title: "D1 Lagna Chart Houses", rows: d1Rows },
  ];
}

function buildKundliKarakSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const karakRows = asArray(chart.kundli_karak).map(asObject).map((row, idx) => ({
    No: idx + 1,
    Karaka: toDisplay(row.karaka),
    Chara: toDisplay(row.chara),
    Sthir: toDisplay(row.sthir),
    DegreeWithinSign: toDisplay(row.degree_within_sign),
    TotalLongitude: toDisplay(row.total_longitude),
  }));

  const avasthaRows = Object.entries(asObject(chart.kundli_avastha)).map(([planet, raw]) => {
    const item = asObject(raw);
    return {
      Planet: planet,
      Sign: toDisplay(item.sign),
      Degree: toDisplay(item.degree),
      Nakshatra: toDisplay(item.nakshatra),
      Baladi: toDisplay(item.baladi),
      Deeptadi: toDisplay(item.deeptadi),
      Jagrut: toDisplay(item.jagrut),
      GradeOfResults: toDisplay(item.grade_of_results),
    };
  });

  return [
    { title: "Kundli Karak", rows: karakRows },
    { title: "Kundli Avastha", rows: avasthaRows },
  ];
}

function buildChalitSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const chalitRows = asArray(chart.chalit).map(asObject).map((row) => ({
    Bhav: toDisplay(row.Bhav),
    BhavBegin: toDisplay(row.BhavBegin),
    MidBhav: toDisplay(row.MidBhav),
    RashiBegin: toDisplay(row.RashiBegin),
    RashiMid: toDisplay(row.RashiMid),
  }));
  return [{ title: "Chalit Details", rows: chalitRows }];
}

function buildChandraKundliSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const rows = Object.entries(asObject(chart.chandra_kundali)).map(([planet, raw]) => {
    const item = asObject(raw);
    return {
      Planet: planet,
      ChandraHouse: toDisplay(item.chandra_house),
      Sign: toDisplay(item.sign),
      Degree: toDisplay(item.degree),
      Nakshatra: toDisplay(item.nakshatra),
    };
  });
  return [{ title: "Chandra Kundli Details", rows }];
}

function buildAvakhadaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const avakhada = asObject(chart.avakhada_chakra);
  if (!Object.keys(avakhada).length) return [];

  const positions = Object.entries(asObject(avakhada.avakhada_positions)).map(([planet, raw]) => {
    const item = asObject(raw);
    return {
      Planet: planet,
      AvakhadaHouse: toDisplay(item.avakhada_house),
      OriginalHouse: toDisplay(item.original_house),
      OriginalSign: toDisplay(item.original_sign),
      Degree: toDisplay(item.degree),
      Nakshatra: toDisplay(item.nakshatra),
      Pada: toDisplay(item.pada),
      Retro: toDisplay(item.retro),
      Combust: toDisplay(item.combust),
    };
  });

  const houseSigns = Object.entries(asObject(avakhada.house_signs))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([house, sign]) => ({
      House: house,
      Sign: toDisplay(sign),
      Occupants: asArray(asObject(avakhada.house_occupancy)[house]).map(toDisplay).join(", ") || "-",
    }));

  return [
    { title: "Avakhada Positions", rows: positions },
    { title: "House Mapping", rows: houseSigns },
  ];
}

function buildCharaKarkamshaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const cks = asObject(chart.chara_karkamsha_swamsha);
  if (!Object.keys(cks).length) return [];

  const summaryRows: ReportTabRow[] = [
    {
      AK: toDisplay(cks.ak),
      AKDebug: toDisplay(cks.ak_debug),
      AscSign: toDisplay(cks.asc_sign),
      KarkamshaSign: toDisplay(cks.karkamsha_sign),
      SwamshaSign: toDisplay(cks.swamsha_sign),
      ArudhaLagnaSign: toDisplay(cks.arudha_lagna_sign),
      UpapadaSign: toDisplay(cks.upapada_sign),
    },
  ];

  const longitudeRows = Object.entries(asObject(cks.longitudes)).map(([planet, value]) => ({
    Planet: planet,
    Longitude: toDisplay(value),
  }));

  return [
    { title: "Chara Karkamsha Swamsha Summary", rows: summaryRows },
    { title: "Planetary Longitudes", rows: longitudeRows },
  ];
}

function buildDrekkanaSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const drekk = asObject(chart.drekkana_result);
  if (!Object.keys(drekk).length) return [];
  const rows = Object.entries(drekk).map(([key, raw]) => {
    const item = asObject(raw);
    const d3 = asObject(item.d3);
    const d3_22 = asObject(item.d3_22nd);
    return {
      Point: key,
      RasiSign: toDisplay(item.rasi_sign),
      DegInSign: toDisplay(item.deg_in_sign),
      D3Sign: toDisplay(d3.sign),
      D3Lord: toDisplay(d3.lord),
      D322Sign: toDisplay(d3_22.sign),
      D322Lord: toDisplay(d3_22.lord),
    };
  });
  return [{ title: "Drekkana Result", rows }];
}

function buildVarshaPhalSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const candidates = ["varsha_phal", "varsha_phal", "varsha_phal_overview", "varshaPhal"];
  for (const key of candidates) {
    const v = chart[key];
    if (Array.isArray(v)) {
      const rows = v.map(asObject).map((row, idx) => ({ No: idx + 1, ...row })) as ReportTabRow[];
      return [{ title: "Varsha Phal Overview", rows }];
    }
    if (isObject(v)) {
      const rows = Object.entries(v).map(([k, val]) => ({ Field: toTitle(k), Value: toDisplay(val) }));
      return [{ title: "Varsha Phal Overview", rows }];
    }
  }
  return [];
}

function buildLagnaSahamSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const ls = asObject(chart.lagna_saham);
  if (!Object.keys(ls).length) return [];

  const summaryRows: ReportTabRow[] = [
    {
      AscendantLongitude: toDisplay(ls.ascendant),
      IsDayChart: toDisplay(ls.is_day_chart),
      SahamCount: Object.keys(asObject(ls.sahams)).length,
    },
  ];

  const sahamsRows = Object.entries(asObject(ls.sahams_detail)).map(([name, raw]) => {
    const item = asObject(raw);
    return {
      Saham: name,
      Longitude: toDisplay(item.longitude),
      DMS: toDisplay(item.dms),
      Sign: toDisplay(item.sign),
      SignLord: toDisplay(item.sign_lord),
      SignLordAbbr: toDisplay(item.sign_lord_abbr),
    };
  });

  const cuspRows = Object.entries(asObject(ls.house_cusps))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([house, value]) => ({
      House: house,
      CuspLongitude: toDisplay(value),
    }));

  return [
    { title: "Lagna Saham Summary", rows: summaryRows },
    { title: "Saham Details", rows: sahamsRows },
    { title: "House Cusps", rows: cuspRows },
  ];
}

function buildSadeSatiSections(chart: DataMap): Array<{ title: string; rows: ReportTabRow[] }> {
  const sade = asObject(chart.sade_sati);
  if (!Object.keys(sade).length) return [];

  const summaryRows: ReportTabRow[] = [
    {
      BirthYear: toDisplay(sade.birth_year),
      MoonRasi: toDisplay(sade.moon_rasi),
      MoonRasiNo: toDisplay(sade.moon_rasi_no),
      MoonLongitude: toDisplay(sade.moon_longitude),
      ScanStartYear: toDisplay(sade.scan_start_year),
      ScanEndYear: toDisplay(sade.scan_end_year),
      SmallPanotiThresholdDays: toDisplay(sade.small_panoti_threshold_days),
    },
  ];

  const periodRows = asArray(sade.sade_sati_periods).map(asObject).map((row, idx) => ({
    No: idx + 1,
    Phase: toDisplay(row.phase),
    SaturnSign: toDisplay(row.saturn_sign),
    TransitMoonRasi: toDisplay(row.transit_moon_rasi),
    MurtiType: toDisplay(row.murti_type),
    Element: toDisplay(row.element),
    Auspicious: toDisplay(row.is_auspicious),
    Start: toDisplay(row.start),
    End: toDisplay(row.end),
    DurationDays: toDisplay(row.duration_days),
    Note: toDisplay(row.note),
  }));

  const degreeRows = asArray(sade.sade_sati_by_degree).map(asObject).map((row, idx) => ({
    No: idx + 1,
    Note: toDisplay(row.note),
    Start: toDisplay(row.start),
    End: toDisplay(row.end),
    DurationDays: toDisplay(row.duration_days),
    StartLongitude: toDisplay(row.katwe_start_longitude),
    EndLongitude: toDisplay(row.katwe_end_longitude),
    CenterMoonLongitude: toDisplay(row.katwe_center_moon_longitude),
  }));

  return [
    { title: "Sade Sati Summary", rows: summaryRows },
    { title: "Sade Sati Periods", rows: periodRows },
    { title: "Degree Based Sade Sati", rows: degreeRows },
  ];
}

function buildKpSections(chart: DataMap, title: string): Array<{ title: string; rows: ReportTabRow[] }> {
  const kp = asObject(chart.kp_chart);
  if (!Object.keys(kp).length) return [];

  const summaryRows: ReportTabRow[] = [
    {
      HasChartImage: kp.base64_image ? "Yes" : "No",
      Houses: asArray(kp.data).length,
    },
  ];

  const rows = asArray(kp.data).map(asObject).map((row) => ({
    House: toDisplay(row.house),
    Sign: toDisplay(row.sign),
    SignNo: toDisplay(row.sign_no),
    Planets: asArray(row.planets)
      .map((p) => toDisplay(asObject(p).name))
      .join(", ") || "-",
  }));

  return [
    { title: `${title} Summary`, rows: summaryRows },
    { title: `${title} Houses`, rows },
  ];
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
  const headBase =
    "px-4 h-12 border-e last:border-e-0 text-center border-t border-neutral-200 first:border-s last:border-e dark:border-slate-600";
  const cellBase =
    "py-3 px-4 border-e last:border-e-0 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600";
  const headTone = `${TABLE_HEAD_BG}`;

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="table-auto border-spacing-0 border-separate">
          <TableHeader>
            <TableRow className="border-0">
              {headers.map((header, index) => (
                <TableHead
                  key={header}
                  className={`${headBase} ${headTone} ${index === 0 ? "rounded-tl-lg" : ""} ${
                    index === headers.length - 1 ? "rounded-tr-lg" : ""
                  }`}
                >
                  {toTitle(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-transparent">
                {headers.map((header, colIdx) => (
                  <TableCell
                    key={header}
                    className={`${cellBase} ${idx % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-neutral-50 dark:bg-slate-900/40"} ${
                      idx === rows.length - 1 && colIdx === 0 ? "rounded-bl-lg" : ""
                    } ${idx === rows.length - 1 && colIdx === headers.length - 1 ? "rounded-br-lg" : ""}`}
                  >
                    {toDisplay(row[header])}
                  </TableCell>
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
  const tabSections: ReportTabsSections = {
    "vimshottari-dasha": buildVimshottariSections(chart),
    ashtakavarga: buildAshtakavargaSections(chart),
    "yogini-dasha": buildYoginiSections(chart),
    "chara-dasha": buildCharaDashaSections(chart),
    "sthira-dasha": buildSthiraDashaSections(chart),
    "niryana-shoola-dasha": buildNiryanaShoolaSections(chart),
    "thrikona-dasha": buildThrikonaSections(chart),
    "ashtottari-dasha": buildAshtottariSections(chart),
    "mudda-dasha": buildMuddaSections(chart),
    upagraha: buildUpagrahaSections(chart),
    charts: buildChartsSections(chart),
    "kundli-karak-details": buildKundliKarakSections(chart),
    "chalit-details": buildChalitSections(chart),
    "chandra-kundli-details": buildChandraKundliSections(chart),
    "avakhada-chakra-details": buildAvakhadaSections(chart),
    "chara-karkamsha-swamsha": buildCharaKarkamshaSections(chart),
    drekkana: buildDrekkanaSections(chart),
    "varsha-phal": buildVarshaPhalSections(chart),
    "lagna-saham": buildLagnaSahamSections(chart),
    "sade-sati": buildSadeSatiSections(chart),
    "kp-page": buildKpSections(chart, "KP Page"),
    "kp-horary-page": buildKpSections(chart, "KP Horary"),
  };

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
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
              <CardTitle className="text-white">Astro Data Overview</CardTitle>
            </div>
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
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader>
            <SectionHeader title="Chart" />
          </CardHeader>
          <CardContent>
            <Table className="table-auto border-spacing-0 border-separate">
              <TableBody>
                {chartRows.map((row, idx) => (
                  <TableRow key={row.label} className="hover:bg-transparent">
                    <TableCell className="py-3 px-4 border border-neutral-200 dark:border-slate-600 font-semibold bg-neutral-100 dark:bg-slate-700">
                      {row.label}
                    </TableCell>
                    <TableCell className="py-3 px-4 border border-neutral-200 dark:border-slate-600">
                      {row.value}
                    </TableCell>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white dark:border-slate-600">
                <p className="text-sm opacity-90">Years</p>
                <p className="mt-1 text-3xl font-semibold">{toDisplay(ayuAge.years)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white dark:border-slate-600">
                <p className="text-sm opacity-90">Months</p>
                <p className="mt-1 text-3xl font-semibold">{toDisplay(ayuAge.months)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white dark:border-slate-600">
                <p className="text-sm opacity-90">Days</p>
                <p className="mt-1 text-3xl font-semibold">{toDisplay(ayuAge.days)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">Lagna Lord</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{toDisplay(ayumilan.lagna_lord)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">Method</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{toDisplay(ayumilan.method)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">Strongest</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{toDisplay(ayumilan.strongest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <DataTable title="Planetary Details Table" rows={planetaryRows} greenHead />
        <DataTable title="Permanent (Natural) Friendship" rows={permanentRows} greenHead />
        <DataTable title="Temporal Friendship" rows={temporalRows} greenHead />
        <DataTable title="Five-fold (Compound) Friendship" rows={compoundRows} greenHead />
        <DataTable title="Shad Bala Table" rows={shadBalaRows} greenHead />
        <DataTable title="Bhava Bal Table" rows={bhavaBalRows} greenHead />
        {bhavaBalCategoryRows.length > 0 ? (
          <Card className="card">
            <CardHeader>
              <CardTitle>Bhava Bal Category View</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="table-auto border-spacing-0 border-separate">
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className={`px-4 h-12 border-e text-center border-t border-neutral-200 dark:border-slate-600 rounded-tl-lg ${TABLE_HEAD_BG}`}>
                      Planet
                    </TableHead>
                    {Array.from({ length: 12 }, (_, i) => (
                      <TableHead
                        key={i + 1}
                        className={`px-4 h-12 border-e text-center border-t border-neutral-200 dark:border-slate-600 ${TABLE_HEAD_BG} ${
                          i === 11 ? "rounded-tr-lg" : ""
                        }`}
                      >
                        {i + 1}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bhavaBalCategoryRows.map((row, idx) =>
                    row.label.startsWith("__") ? (
                      <TableRow key={`${row.label}-${idx}`} className="hover:bg-transparent">
                        <TableCell colSpan={13} className="py-2 px-4 border border-neutral-200 dark:border-slate-600 text-center font-semibold bg-neutral-100 dark:bg-slate-800">
                          {row.label
                            .replaceAll("__", "")
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={`${row.label}-${idx}`} className="hover:bg-transparent">
                        <TableCell className="py-3 px-4 border border-neutral-200 dark:border-slate-600 text-center">
                          {row.label}
                        </TableCell>
                        {row.values.map((value, col) => (
                          <TableCell key={`${idx}-${col}`} className="py-3 px-4 border border-neutral-200 dark:border-slate-600 text-center">
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
        <DataTable title="Bhava Degrees Table" rows={bhavaDegreeRows} greenHead />
        <ReportTabs sections={tabSections} />
      </div>
    </>
  );
};

export default AstroFormReportPage;
