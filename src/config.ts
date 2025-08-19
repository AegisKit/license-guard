import fs from "fs";
import path from "path";
import { z } from "zod";

const ConfigSchema = z.object({
  allow: z.array(z.string()).default([]),
  deny: z.array(z.string()).default([]),
  ignorePackages: z.array(z.string()).default([]),
  format: z.enum(["table", "json"]).default("table"),
});

export type LicenseConfig = z.infer<typeof ConfigSchema>;

export async function loadConfig(
  cwd: string,
  configPath?: string
): Promise<LicenseConfig> {
  const target = configPath
    ? path.resolve(configPath)
    : path.join(cwd, ".licenserc.json");

  if (!fs.existsSync(target)) {
    throw new Error(`Config file not found: ${target}`);
  }

  const raw = fs.readFileSync(target, "utf-8");
  const parsed = JSON.parse(raw);

  return ConfigSchema.parse(parsed);
}
