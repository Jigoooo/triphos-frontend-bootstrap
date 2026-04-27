import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const TRACE_DIR = ".triphos/traces";
const NOISE_PREFIXES = [
  "Triphos repository verification failed.",
  "Run pnpm verify:repo manually after fixing the reported issues.",
];

export function extractFailureSignature(stderr, stdout) {
  const haystack = [stdout, stderr].filter(Boolean).join("\n");
  if (!haystack) return "unparsed";

  const lines = haystack.split("\n").map((line) => line.trimEnd());
  const detailIndex = lines.findIndex((line) => /^-\s+\S/.test(line.trim()));
  if (detailIndex <= 0) return "unparsed";

  const detail = lines[detailIndex].trim().replace(/^-\s+/, "").slice(0, 200);

  let header = "";
  for (let i = detailIndex - 1; i >= 0; i -= 1) {
    const candidate = lines[i].trim();
    if (!candidate) continue;
    if (NOISE_PREFIXES.includes(candidate)) continue;
    if (candidate.startsWith(">")) continue;
    header = candidate.replace(/[.:]\s*$/, "");
    break;
  }

  if (!header) return `unparsed: ${detail}`;
  return `${header}: ${detail}`;
}

export function buildTraceEntry({ surface, exitStatus, verifyCommand, changedFiles, stderr, stdout, now = new Date() }) {
  return {
    ts: now.toISOString(),
    surface,
    exitStatus,
    verifyCommand,
    changedFiles: Array.isArray(changedFiles) ? changedFiles : [],
    failureSignature: extractFailureSignature(stderr, stdout),
  };
}

export function recordFailureTrace(cwd, entry) {
  try {
    const dir = join(cwd, TRACE_DIR);
    mkdirSync(dir, { recursive: true });
    const safeTs = entry.ts.replace(/[:.]/g, "-");
    const suffix = randomBytes(2).toString("hex");
    const file = join(dir, `${safeTs}-${suffix}.jsonl`);
    writeFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
    return file;
  } catch {
    return null;
  }
}

export function readRecentFailures(cwd, limit) {
  try {
    const dir = join(cwd, TRACE_DIR);
    const files = readdirSync(dir).filter((name) => name.endsWith(".jsonl")).sort();
    const recent = files.slice(-Math.max(limit, 0));
    return recent
      .map((name) => {
        try {
          const raw = readFileSync(join(dir, name), "utf8").trim();
          if (!raw) return null;
          return JSON.parse(raw.split("\n", 1)[0]);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && typeof entry === "object");
  } catch {
    return [];
  }
}

export function summarizeRecentFailures(cwd, limit = 5) {
  const entries = readRecentFailures(cwd, limit);
  if (entries.length === 0) return "";

  const counts = new Map();
  const order = [];
  for (const entry of entries) {
    const sig = entry.failureSignature || "unparsed";
    if (!counts.has(sig)) order.push(sig);
    counts.set(sig, (counts.get(sig) ?? 0) + 1);
  }

  const header = `Recent verifier failures (last ${entries.length}):`;
  const lines = order.map((sig) => `- ${sig}  ×${counts.get(sig)}`);
  const footer = "Avoid repeating the same failure. Run pnpm verify:repo before declaring done.";
  return [header, ...lines, footer].join("\n");
}
