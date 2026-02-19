# MissionManagerWeb

ジャンル・ミッション・タスクの3階層でタスクを管理するWebアプリケーション。  
デスクトップ版 [MissionManager](https://github.com/yourusername/MissionManager) のWeb版として開発しています。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Neon)
- **ORM**: Prisma
- **認証**: Auth.js (NextAuth v5) - メール・パスワード認証

## 機能

- ジャンル・ミッション・タスクの CRUD
- 進捗バーによるミッション完了率の可視化
- 期限の設定・表示
- 並び替え（期限が早く・未完了のものを上に表示）
- 右クリックメニュー（名前変更、期限編集、上へ/下へ移動、削除）

## セットアップ

### 必要要件

- Node.js 18+
- PostgreSQL（Neon 推奨）

### 1. リポジトリのクローン・依存関係インストール

```bash
git clone <repository-url>
cd MissionManagerWeb
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、値を設定してください。

```bash
cp .env.example .env
```

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | プール接続URL（Neon の Connection string） |
| `DIRECT_URL` | 直接接続URL（マイグレーション用） |
| `AUTH_SECRET` | `npx auth secret` または `openssl rand -base64 32` で生成 |

### 3. データベースの初期化

```bash
npx prisma generate
npx prisma db push
# またはマイグレーションを使用する場合
# npx prisma migrate dev
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run db:generate` | Prisma クライアント生成 |
| `npm run db:push` | スキーマをDBに反映 |
| `npm run db:studio` | Prisma Studio 起動 |

## ディレクトリ構造

```
MissionManagerWeb/
├── app/                    # Next.js App Router
│   ├── api/                # API ルート
│   │   ├── auth/           # 認証（NextAuth, 新規登録）
│   │   ├── genres/        # ジャンル CRUD
│   │   ├── missions/      # ミッション CRUD
│   │   └── tasks/         # タスク CRUD
│   ├── login/             # ログインページ
│   ├── register/           # 新規登録ページ
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React コンポーネント
│   ├── Header.tsx         # ヘッダー（アカウント表示・ログアウト）
│   ├── PageContent.tsx    # メインコンテンツ
│   ├── GenreSelector.tsx  # ジャンル選択
│   ├── MissionList.tsx    # ミッション一覧
│   ├── MissionCard.tsx    # ミッションカード
│   ├── TaskItem.tsx       # タスク項目
│   ├── Modal.tsx          # モーダルベース
│   ├── EditTextModal.tsx  # テキスト編集モーダル
│   ├── EditDateModal.tsx  # 日付編集モーダル
│   ├── ContextMenu.tsx    # 右クリックメニュー
│   └── Providers.tsx      # SessionProvider 等
├── hooks/
│   └── useGenres.ts       # ジャンル・ミッション取得フック
├── lib/
│   ├── db.ts              # Prisma クライアント
│   └── types.ts           # 型定義・ユーティリティ
├── prisma/
│   ├── schema.prisma      # DB スキーマ
│   └── migrations/        # マイグレーション
├── auth.ts                # Auth.js 設定
├── auth.config.ts         # Auth ミドルウェア設定
└── middleware.ts          # Next.js ミドルウェア（認証ガード）
```

## ライセンス

MIT
