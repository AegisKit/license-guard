import fs from "node:fs";
import path from "node:path";

function getProjectRoot(): string {
  // npm は install 時にプロジェクトルートを INIT_CWD へ入れる
  const initCwd = process.env.INIT_CWD;
  if (initCwd && fs.existsSync(path.join(initCwd, "package.json"))) {
    return initCwd;
  }
  // フォールバック: 近くの package.json を上方向に探す
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      !dir.includes("node_modules")
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  // 最後の手段: 現在地
  return process.cwd();
}

const projectRoot = getProjectRoot();
const target = path.join(projectRoot, ".licenserc.json");

try {
  if (fs.existsSync(target)) {
    console.log(
      "[license-guard] .licenserc.json already exists in project, skipping."
    );
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
  console.log(`[license-guard] Created ${path.relative(projectRoot, target)}`);
} catch (e) {
  console.warn(
    "[license-guard] Failed to create .licenserc.json:",
    (e as Error).message
  );
  process.exit(0);
}
