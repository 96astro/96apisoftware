import { gunzipSync, gzipSync } from "zlib";

export function compressToBase64(input: string): string {
  return gzipSync(Buffer.from(input, "utf8")).toString("base64");
}

export function decompressFromBase64(input: string): string {
  return gunzipSync(Buffer.from(input, "base64")).toString("utf8");
}

export function splitTextBySize(input: string, chunkSize: number): string[] {
  if (chunkSize <= 0) {
    return [input];
  }

  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(input.slice(i, i + chunkSize));
  }

  return chunks;
}

export function joinChunks(chunks: string[]): string {
  return chunks.join("");
}
