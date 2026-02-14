const { PrismaClient } = require("@prisma/client");
const { gunzipSync } = require("zlib");

const prisma = new PrismaClient();

function isCompressedBase64(input) {
  return typeof input === "string" && input.startsWith("H4sI");
}

function maybeDecode(input) {
  if (!input) return input;
  if (!isCompressedBase64(input)) return input;
  return gunzipSync(Buffer.from(input, "base64")).toString("utf8");
}

async function backfillLife() {
  const reports = await prisma.lifeCalculatorReport.findMany({
    include: {
      responseChunks: {
        orderBy: { chunkIndex: "asc" },
      },
    },
  });

  for (const report of reports) {
    let full = report.responseRaw || "";
    if (report.responseChunks.length > 0) {
      full = report.responseChunks.map((item) => item.data).join("");
    }
    full = maybeDecode(full);

    await prisma.$transaction(async (tx) => {
      await tx.lifeCalculatorReport.update({
        where: { id: report.id },
        data: { responseRaw: full },
      });
      if (report.responseChunks.length > 0) {
        await tx.lifeCalculatorResponseChunk.deleteMany({ where: { reportId: report.id } });
      }
    });
  }
}

async function backfillAyu() {
  const reports = await prisma.ayuMilanReport.findMany({
    include: {
      responseChunks: {
        orderBy: { chunkIndex: "asc" },
      },
    },
  });

  for (const report of reports) {
    let full = report.responseRaw || "";
    if (report.responseChunks.length > 0) {
      full = report.responseChunks.map((item) => item.data).join("");
    }
    full = maybeDecode(full);

    await prisma.$transaction(async (tx) => {
      await tx.ayuMilanReport.update({
        where: { id: report.id },
        data: { responseRaw: full },
      });
      if (report.responseChunks.length > 0) {
        await tx.ayuMilanResponseChunk.deleteMany({ where: { reportId: report.id } });
      }
    });
  }
}

(async () => {
  try {
    await backfillLife();
    await backfillAyu();
    console.log("SINGLE_RECORD_BACKFILL_OK");
  } catch (error) {
    console.error("SINGLE_RECORD_BACKFILL_ERR", error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
