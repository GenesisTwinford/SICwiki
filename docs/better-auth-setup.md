# Better Auth セットアップガイド

## Google OAuth設定手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動

### 2. OAuth同意画面の設定

1. 「OAuth同意画面」タブをクリック
2. ユーザータイプを選択（開発中は「外部」でOK）
3. 基本情報を入力：
   - アプリ名: SICwiki
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
4. 「保存して次へ」をクリック
5. スコープは追加せずに「保存して次へ」
6. テストユーザーを追加（開発中のみ必要）

### 3. OAuth 2.0クライアントIDの作成

1. 「認証情報」タブに戻る
2. 「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類: 「ウェブ アプリケーション」を選択
4. 名前: 「SICwiki Web Client」など
5. **承認済みのリダイレクト URI** に以下を追加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   本番環境では:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. 「作成」をクリック
7. **クライアントIDとクライアントシークレット**をコピー

### 4. 環境変数の設定

`.env.local`ファイルに以下を設定：

```env
GOOGLE_CLIENT_ID=あなたのクライアントID
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
```

### 5. 開発サーバーの再起動

```bash
pnpm dev
```

## 使用方法

### ログイン画面

- `/signin` - ログインページ
- Googleボタンをクリックしてログイン
- またはメールアドレスとパスワードでログイン

### 新規登録画面

- `/signup` - 新規登録ページ
- Googleボタンをクリックして登録
- またはメールアドレスとパスワードで登録

### ログアウト

- ログインボタンコンポーネントの「ログアウト」ボタンをクリック

## トラブルシューティング

### "redirect_uri_mismatch" エラー

Google Cloud Consoleで設定したリダイレクトURIが正しいか確認してください：

```
http://localhost:3000/api/auth/callback/google
```

### "Access blocked: Authorization Error"

OAuth同意画面でテストユーザーを追加してください。

### データベースエラー

```bash
pnpm db:push
```

を実行してデータベーススキーマを更新してください。

## セキュリティ注意事項

⚠️ **重要**:

- `.env.local`ファイルは絶対にGitにコミットしないでください
- `BETTER_AUTH_SECRET`は本番環境では必ず変更してください
- Google OAuth設定の本番環境用リダイレクトURIを適切に設定してください
