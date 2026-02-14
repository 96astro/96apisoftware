import { gunzipSync, gzipSync } from "zlib";

export function compressToBase64(input: string): string {
  return gzipSync(Buffer.from(input, "utf8")).toString("base64");
}

export function decompressFromBase64(input: string): string {
  return gunzipSync(Buffer.from(input, "base64")).toString("utf8");
}
