"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import JsonViewer from "./json-viewer";

type LazyResponseViewerProps = {
  reportId: number;
};

const LazyResponseViewer = ({ reportId }: LazyResponseViewerProps) => {
  const [data, setData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/astro-form/${reportId}`, { cache: "no-store" });
      const payload = (await response.json()) as { error?: string; data?: unknown };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load response report.");
      }
      setData(payload.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load response report.");
    } finally {
      setLoading(false);
    }
  }, [loading, reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (data !== null) {
    return <JsonViewer title="Response Report" data={data} />;
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle>Response Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-neutral-600 dark:text-neutral-300">Loading report data...</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {!loading ? (
          <Button type="button" onClick={() => void load()}>
            Retry Load
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default LazyResponseViewer;

