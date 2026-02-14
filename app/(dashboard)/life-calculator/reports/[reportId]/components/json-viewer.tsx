import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function PrimitiveEntriesTable({ value }: { value: JsonObject }) {
  const primitiveEntries = Object.entries(value).filter(([, item]) => isPrimitive(item));

  if (primitiveEntries.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {primitiveEntries.map(([key, item]) => (
          <TableRow key={key}>
            <TableCell className="font-medium">{formatKey(key)}</TableCell>
            <TableCell>{isPrimitive(item) ? primitiveToText(item) : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{formatKey(header)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {headers.map((header) => {
              const cell = row[header];
              return (
                <TableCell key={header}>
                  {cell === undefined
                    ? "-"
                    : isPrimitive(cell)
                    ? primitiveToText(cell)
                    : JSON.stringify(cell)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function JsonNode({ title, value }: { title: string; value: JsonValue }) {
  if (isPrimitive(value)) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{primitiveToText(value)}</CardContent>
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
