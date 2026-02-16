import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function isPrimitive(value: JsonValue): value is JsonPrimitive {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (typeof value === "object") {
    const result: JsonObject = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toJsonValue(item);
    }
    return result;
  }

  return String(value);
}

function formatKey(input: string) {
  return input
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function primitiveToText(value: JsonPrimitive) {
  if (value === null) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function isImageDataUrl(value: JsonPrimitive): value is string {
  return typeof value === "string" && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

function PrimitiveValue({ value }: { value: JsonPrimitive }) {
  if (isImageDataUrl(value)) {
    return (
      <img
        src={value}
        alt="API chart"
        className="max-h-[420px] w-auto max-w-full rounded-md border border-border bg-white p-2"
      />
    );
  }

  return <>{primitiveToText(value)}</>;
}

function PrimitiveEntriesTable({ value }: { value: JsonObject }) {
  const primitiveEntries = Object.entries(value).filter(([, item]) => isPrimitive(item));

  if (primitiveEntries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {primitiveEntries.map(([key, item]) => (
        <div key={key} className="rounded-md border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">
            {formatKey(key)}
          </p>
          <div className="mt-1 break-words text-sm text-foreground">
            {isPrimitive(item) ? <PrimitiveValue value={item} /> : "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function ObjectArrayTable({ rows }: { rows: JsonObject[] }) {
  if (rows.length === 0) {
    return null;
  }

  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="rounded-md border border-border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">
            Row {index + 1}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {headers.map((header) => {
              const cell = row[header];
              return (
                <div key={header}>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-300">{formatKey(header)}</p>
                  <div className="mt-1 break-words text-sm text-foreground">
                    {cell === undefined
                      ? "-"
                      : isPrimitive(cell)
                      ? <PrimitiveValue value={cell} />
                      : JSON.stringify(cell)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function JsonNode({ title, value }: { title: string; value: JsonValue }) {
  if (isPrimitive(value)) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <PrimitiveValue value={value} />
        </CardContent>
      </Card>
    );
  }

  if (Array.isArray(value)) {
    const allObjects = value.length > 0 && value.every((item) => isObject(item));
    const allPrimitives = value.every((item) => isPrimitive(item));

    return (
      <Card className="card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.length === 0 ? <p className="text-sm text-neutral-600 dark:text-neutral-300">No data.</p> : null}
          {allPrimitives && value.length > 0 ? (
            <div className="text-sm whitespace-pre-wrap">
              {value.map((item, index) => (
                <div key={index}>{primitiveToText(item as JsonPrimitive)}</div>
              ))}
            </div>
          ) : null}
          {allObjects ? <ObjectArrayTable rows={value as JsonObject[]} /> : null}
          {!allObjects && !allPrimitives ? (
            <div className="space-y-4">
              {value.map((item, index) => (
                <JsonNode key={index} title={`${title} ${index + 1}`} value={item} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const complexEntries = Object.entries(value).filter(([, item]) => !isPrimitive(item));

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PrimitiveEntriesTable value={value} />
        {complexEntries.map(([key, item]) => (
          <JsonNode key={key} title={formatKey(key)} value={item} />
        ))}
      </CardContent>
    </Card>
  );
}

type JsonViewerProps = {
  title: string;
  data: unknown;
};

const JsonViewer = ({ title, data }: JsonViewerProps) => {
  return <JsonNode title={title} value={toJsonValue(data)} />;
};

export default JsonViewer;

