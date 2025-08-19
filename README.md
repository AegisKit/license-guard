# license-guard

Validate dependency licenses against `.licenserc.json`.

```bash
npx license-guard --config .licenserc.json --cwd . --format table
```

---

# 4) 事前セルフテスト

```bash
# 依存解決
npm ci

# ビルド
npm run build

# ローカル実行（dist）
node dist/cli.js --cwd . --format table

# npm link でコマンド名の動作確認（任意）
npm link
license-guard --cwd . --format json
```
