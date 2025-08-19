#!/usr/bin/env node
import { cac } from "cac";
import { resolve } from "node:path";
import { loadConfig } from "./config.js";
import { scanLicenses } from "./scanner.js";
import { renderReport, type Format } from "./reporter.js";

const cli = cac("license-check");

cli
  .option("--cwd <path>", "Project root to scan", { default: process.cwd() })
  .option("--config <path>", "Path to config file (.licenserc.json)")
  .option("--format <format>", "Output format (table|json)", {
    default: "table",
  });

cli.help();
cli.version("0.1.0");

(async () => {
  const parsed = cli.parse();
  const opts = parsed.options as {
    cwd: string;
    config?: string;
    format: Format;
  };

  try {
    const cwd = resolve(opts.cwd);
    const config = await loadConfig(cwd, opts.config);
    const items = await scanLicenses(cwd, config);

    const fmt: Format = opts.format ?? (config.format as Format);
    const { output, totals } = renderReport(items, fmt);
    console.log(output);

    if (totals.deny > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
})();
