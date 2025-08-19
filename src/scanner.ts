import fg from "fast-glob";
import fs from "fs";
import path from "path";
import picomatch from "picomatch";
import type { LicenseConfig } from "./config";

export interface LicenseItem {
  name: string;
  version: string;
  license: string | null;
  status: "ok" | "non-allow" | "deny";
}

function createIgnore(nameGlobs: string[]) {
  if (!nameGlobs || nameGlobs.length === 0) {
    return () => false;
  }
  // 複数パターンをORで結合
  const matchers = nameGlobs.map((g) => picomatch(g, { nocase: false }));
  return (name: string) => matchers.some((m) => m(name));
}

export async function scanLicenses(
  cwd: string,
  config: LicenseConfig
): Promise<LicenseItem[]> {
  const pkgJsonPaths = await fg(["node_modules/**/package.json"], {
    cwd,
    absolute: true,
    // 二重 node_modules の再帰をある程度抑止
    ignore: ["**/node_modules/**/node_modules/**"],
  });

  const isIgnored = createIgnore(config.ignorePackages);
  const seen = new Set<string>();
  const results: LicenseItem[] = [];

  for (const pkgPath of pkgJsonPaths) {
    try {
      const raw = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(raw);

      const name: string = pkg.name ?? path.basename(path.dirname(pkgPath));
      const version: string = pkg.version ?? "unknown";

      // ignorePackages（グロブ）適用
      if (isIgnored(name)) continue;

      const key = `${name}@${version}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // license 抽出（一般的なパターンをまず網羅）
      let license: string | null = null;
      if (typeof pkg.license === "string") {
        license = pkg.license;
      } else if (
        pkg.license &&
        typeof pkg.license === "object" &&
        typeof pkg.license.type === "string"
      ) {
        license = pkg.license.type;
      } else if (Array.isArray(pkg.licenses)) {
        const types = pkg.licenses
          .map((l: any) => (typeof l?.type === "string" ? l.type : ""))
          .filter(Boolean);
        license = types.length ? types.join(" OR ") : null;
      }

      // シンプル判定（SPDX式の厳密評価は後段で）
      let status: LicenseItem["status"] = "ok";
      if (!license) {
        status = "non-allow";
      } else if (config.deny.includes(license)) {
        status = "deny";
      } else if (config.allow.length > 0 && !config.allow.includes(license)) {
        status = "non-allow";
      }

      results.push({ name, version, license, status });
    } catch {
      // 壊れている package.json はスキップ
    }
  }

  results.sort((a, b) =>
    a.name === b.name
      ? a.version.localeCompare(b.version)
      : a.name.localeCompare(b.name)
  );
  return results;
}
