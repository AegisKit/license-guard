# @kaito_takemoto/license-guard

<p align="center">
  <img src="https://img.shields.io/npm/v/%40kaito_takemoto%2Flicense-guard.svg" alt="npm version">
  <img src="https://img.shields.io/npm/l/%40kaito_takemoto%2Flicense-guard.svg" alt="license">
  <img src="https://img.shields.io/node/v/%40kaito_takemoto%2Flicense-guard.svg" alt="node">
</p>

<p align="center">
  設定ファイル（<code>.licenserc.json</code>）に基づいて、<b>依存関係のライセンスを一括検証</b>する CLI。<br/>
  <i>商用利用OK／NGの初期ポリシー付き・postinstallで自動生成・CI連携も一発</i>
</p>

---

## ✨ 特長

- **設定ベース**：`.licenserc.json` のポリシーに沿って判定
- **トランジティブ対応**：依存の依存まで含めて `node_modules/**` をフルスキャン
- **重複排除**：同一 `name@version` は 1 回だけ集計
- **除外ルール**：`ignorePackages` に `@types/*` などのグロブを設定可能
- **出力切替**：`table` / `json`
- **終了コード**：違反があれば非 0 で終了 → CI で検出可能
- **postinstall**：インストール時にデフォルトの `.licenserc.json` を自動生成

---

## 🚀 インストール

```bash
npm i -D @kaito_takemoto/license-guard
# or
pnpm add -D @kaito_takemoto/license-guard
# or
yarn add -D @kaito_takemoto/license-guard
```

> 初回インストール時、プロジェクト直下に `.licenserc.json` を自動生成します（既存があればスキップ）。

---

## 🧪 クイックスタート

```bash
# テーブル出力（デフォルト）
npx license-guard --cwd .

# JSON 出力
npx license-guard --cwd . --format json
```

違反（deny）が 1 つでもあれば **exit code = 1** で終了します。

---

## 📦 設定ファイル：`.licenserc.json`

デフォルトで以下が自動生成されます（商用利用 OK 寄りの初期値）：

```json
{
  "allow": [
    "MIT",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "Apache-2.0",
    "MPL-2.0",
    "EPL-2.0",
    "CDDL-1.0"
  ],
  "deny": [
    "GPL-2.0-only",
    "GPL-2.0-or-later",
    "GPL-3.0-only",
    "GPL-3.0-or-later",
    "AGPL-3.0-only",
    "AGPL-3.0-or-later",
    "LGPL-2.1-only",
    "LGPL-2.1-or-later",
    "LGPL-3.0-only",
    "LGPL-3.0-or-later"
  ],
  "ignorePackages": ["@types/*"],
  "format": "table"
}
```

### フィールド仕様

| フィールド       | 型                  | 必須   | 説明                                           |
| ---------------- | ------------------- | ------ | ---------------------------------------------- |
| `allow`          | `string[]`          | いいえ | 許可する SPDX ライセンス ID                    |
| `deny`           | `string[]`          | いいえ | 禁止ライセンス ID                              |
| `ignorePackages` | `string[]`          | いいえ | パッケージ名に対するグロブ（例：`"@types/*"`） |
| `format`         | `"table" \| "json"` | いいえ | 出力形式（CLI の `--format` が優先）           |

---

## 🧰 CLI

```bash
npx license-guard [options]
```

**Options**

| オプション                 | 説明                                          |
| -------------------------- | --------------------------------------------- |
| `--cwd <path>`             | スキャン対象のプロジェクトルート              |
| `--config <path>`          | 設定ファイル（既定：`<cwd>/.licenserc.json`） |
| `--format <table \| json>` | 出力形式（既定：`table`）                     |

**Exit Codes**

- `0` : 違反なし
- `1` : `deny`が存在
- `>1` : 実行時エラー（設定読み込み失敗など）

**ステータスの意味**

- `ok`：`allow` に含まれる
- `deny`：`deny` に含まれる
- `non-allow`：`allow` に一致しない（またはライセンス不明）

---

## 🔎 仕組み

1. `node_modules/**/package.json` を再帰的に探索
2. `license` / `licenses` フィールドを抽出（`{ type: "MIT" }` にも対応）
3. `ignorePackages` のグロブに一致するパッケージを除外
4. 同一 `name@version` は重複排除
5. `allow` / `deny` に照合してステータス付与
6. `table` or `json` でレポート出力 & 違反があれば非 0 終了

---

## 🧷 使い方例

**CI**

```yaml
name: license-check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx license-guard --cwd . --format table
```

**npm scripts**

```json
{ "scripts": { "license:check": "license-guard --cwd . --format table" } }
```

---

## 📄 License

MIT © Kaito Takemoto
