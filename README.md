# Only Human

> AI画像を一切排除し、人間の創造性だけが集まる聖域。

C2PA（Content Provenance and Authenticity）規格を核心技術として使用した、Pinterest風のビジュアルプラットフォームです。

## 概要

- **C2PA検証**: アップロード時にC2PAマニフェストを解析し、AI生成コンテンツを自動拒否
- **Pinterest風UI**: メイソンリーレイアウト + ホバーアニメーション
- **月額固定費¥0**: Supabase無料枠 + Vercel無料枠

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [supabase.com](https://supabase.com) でアカウント作成
2. 新規プロジェクトを作成
3. Settings > API から以下を取得:
   - Project URL
   - anon/public key
   - service_role key

### 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、値を入力します:

```bash
cp .env.example .env.local
```

### 4. データベースの初期化（Supabase設定後）

```bash
npx prisma migrate dev --name init
```

### 5. ローカルで起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

---

## C2PA検証について

### 判定フロー

```
画像アップロード
    ↓
C2PAマニフェスト抽出
    ↓
AI フラグあり？ → YES → 拒否（403）
    ↓ NO
有効な人間のプロバンス？ → YES → verified_human バッジ付き
    ↓ NO
C2PAデータなし → no_data（アップロード許可・バッジなし）
```

### ステータス説明

| ステータス | 意味 | バッジ |
|---|---|---|
| `verified_human` | C2PAで人間作成が証明済み | 緑の盾 |
| `no_data` | C2PAデータなし（通常の画像） | なし |
| `rejected_ai` | AI生成として拒否 | 赤い盾 |

### テスト用サンプル画像

- [Content Authenticity Initiative公式サンプル](https://github.com/contentauth/c2pa-rs/tree/main/tests/fixtures)
- Adobe Fireflyで生成した画像（AIフラグテスト用）

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| データベース | Supabase (PostgreSQL) + Prisma v5 |
| 認証 | Supabase Auth |
| ストレージ | Supabase Storage |
| C2PA検証 | c2pa-node (CAI公式SDK) |
| 状態管理 | Zustand |
| アニメーション | Framer Motion |
| デプロイ | Vercel |

---

## デプロイ（ドメイン取得後）

```bash
npx vercel
```

デプロイ後にSupabaseの設定でCallbackURLを更新:
`https://your-domain.com/auth/callback`

---

## 注意事項

- `c2pa-node`はネイティブバインディングを持つため、API Routeに `export const runtime = 'nodejs'` が必要
- `.env.local`はGitにコミットしない（.gitignoreで除外済み）
- 現時点ではC2PA対応カメラ・ソフトが限定的なため、`no_data`画像が多くなる可能性あり
