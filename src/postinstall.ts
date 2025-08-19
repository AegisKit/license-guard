import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.cwd(), ".licenserc.json");

if (fs.existsSync(target)) {
  console.log("[license-guard] .licenserc.json already exists, skipping.");
  process.exit(0);
}

const defaultConfig = {
  allow: [
    "MIT",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "Apache-2.0",
    "MPL-2.0",
    "EPL-2.0",
    "CDDL-1.0",
  ],
  deny: [
    "GPL-2.0-only",
    "GPL-2.0-or-later",
    "GPL-3.0-only",
    "GPL-3.0-or-later",
    "AGPL-3.0-only",
    "AGPL-3.0-or-later",
    "LGPL-2.1-only",
    "LGPL-2.1-or-later",
    "LGPL-3.0-only",
    "LGPL-3.0-or-later",
  ],
  ignorePackages: ["@types/*"],
  format: "table",
};

fs.writeFileSync(target, JSON.stringify(defaultConfig, null, 2));
console.log("[license-guard] Created default .licenserc.json");
