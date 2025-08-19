export type RowStatus = "ok" | "non-allow" | "deny";

export interface LicenseRow {
  name: string;
  version: string;
  license: string | null;
  status: RowStatus;
}

export type Format = "table" | "json";

function pad(str: string, len: number) {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

export function renderReport(rows: LicenseRow[], format: Format) {
  const totals = {
    total: rows.length,
    ok: rows.filter((r) => r.status === "ok").length,
    nonAllow: rows.filter((r) => r.status === "non-allow").length,
    deny: rows.filter((r) => r.status === "deny").length,
  };

  if (format === "json") {
    return {
      output: JSON.stringify({ totals, items: rows }, null, 2),
      totals,
    };
  }

  // table
  const headers = ["package", "version", "license", "status"];
  const colWidths = [
    Math.max(...[...rows.map((r) => r.name.length), headers[0].length], 10),
    Math.max(...[...rows.map((r) => r.version.length), headers[1].length], 7),
    Math.max(
      ...[...rows.map((r) => (r.license ?? "N/A").length), headers[2].length],
      7
    ),
    Math.max(...[...rows.map((r) => r.status.length), headers[3].length], 6),
  ];

  const line = (cols: string[]) =>
    cols.map((c, i) => pad(c, colWidths[i])).join("  ");

  const lines: string[] = [];
  lines.push(line(headers));
  lines.push(colWidths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) {
    lines.push(line([r.name, r.version, r.license ?? "N/A", r.status]));
  }
  lines.push("");
  lines.push(
    `Totals: ${totals.total} (ok=${totals.ok}, non-allow=${totals.nonAllow}, deny=${totals.deny})`
  );

  return { output: lines.join("\n"), totals };
}
