# 波ログ　セットアップ手順（ぜんぶ無料）

パソコンで進めるのがいちばん楽です（30分くらい）。ボタンの名前は、サービス側の更新で少し違うことがあります。

```
iPhoneのホーム画面の波ログ
   └ アプリ本体 …… GitHub Pages（無料）
   └ 記録・写真 …… Supabase（無料枠・自分だけが見られる）
   └ コーチ …… Gemini API（無料枠）／いつものAI（ChatGPT・Claudeなど）にコピペ
```

---

## ステップ1　Supabase（データの保存場所）を作る

1. https://supabase.com を開き「Start your project」→ GitHubアカウントかメールで登録
2. 「New project」
   - Name：`namilog`
   - Database Password：自動生成でOK（どこかに控えておく）
   - Region：`West US (North California)`（ハワイから一番近い）
   - Plan：**Free**
3. 1〜2分待つ
4. 左メニュー **SQL Editor** →「New query」→ このフォルダの `supabase-setup.sql` の中身を全部貼る →「**Run**」
   - 「Success. No rows returned」と出ればOK
5. 左メニュー **Authentication** → **Sign In / Providers**（または Providers → Email）
   - **Confirm email** をオフにして保存（自分しか使わないので、確認メールは不要）

## ステップ2　鍵を config.js に入れる

1. Supabaseの左下 **Project Settings** → **API**（または「API Keys」）
2. 次の2つをコピー
   - **Project URL**（`https://〇〇〇.supabase.co`）
   - **anon public** キー（または **Publishable key**）
   - ⚠️ `service_role` / `secret` キーは**絶対に使わない**
3. このフォルダの `config.js` をテキストエディタで開き、`''` の中に貼って保存

## ステップ3　GitHub Pagesに置く（アプリの住所を作る）

1. https://github.com でアカウントを作る（ユーザー名がアプリのURLに入ります）
2. 右上「＋」→「**New repository**」
   - Repository name：`namilog`
   - **Public** を選ぶ（無料のGitHub Pagesは公開リポジトリが必要。記録は Supabase にあるので見られません）
   - 「Create repository」
3. 「**uploading an existing file**」のリンクを押し、このフォルダの中身を**全部**ドラッグ＆ドロップ
   - `icons` フォルダごと入れる
   - `index.html` がいちばん上の階層にあればOK
   - 下の「Commit changes」
4. リポジトリの **Settings** → 左の **Pages**
   - Source：**Deploy from a branch**
   - Branch：**main** ／ **/(root)** →「Save」
5. 1〜2分待つと、上に `https://ユーザー名.github.io/namilog/` と出ます。これがアプリの住所です

## ステップ4　iPhoneで開いてアカウントを作る

1. iPhoneの **Safari** で上の住所を開く
2. メールとパスワードを入れて「**はじめて使う（アカウントを作る）**」
3. 入れたら、**Supabaseに戻って**、Authentication → Sign In / Providers → **Allow new users to sign up をオフ**
   - これで他の人はアカウントを作れなくなります
4. （前の記録があれば）波ログの右上 **⚙︎** →「**これまでの記録を取り込む**」にメモを貼る
   - 「AIコーチで変換」または「いつものAIで変換」→ 内容を確認 →「チェックしたものを保存」

## ステップ5　ホーム画面に追加（ここで「アプリ」になる）

1. Safariで波ログを開いたまま、下の **共有ボタン** →「**ホーム画面に追加**」
2. 「**Webアプリとして開く**」がオンになっているのを確認 →「追加」
3. 前に作ったショートカット（my surf log club）は長押しで削除してOK

アイコンを押すと、Safariのバーなしで全画面で起動します。

## ステップ6　AIコーチ（Gemini・無料枠）をつなぐ

1. https://aistudio.google.com を開いてGoogleアカウントでログイン
2. 「**Get API key**」→「**Create API key**」→ 出てきたキー（`AIza…`）をコピー
   - お支払い情報（Billing）は**設定しない**。設定しなければ課金されません
3. 波ログの **⚙︎** →「Gemini API キー」に貼る →「**保存してテスト**」→「✓ つながりました」が出ればOK

使い方：記録の「**保存＋コーチ**」、または各記録の「**AIコーチに聞く**」。
キーがない・混んでいる・回数制限のときは「**いつものAIに聞く**」→ ChatGPT・Claudeなどに貼る → 答えを貼って保存。

---

## 知っておくこと

- **Supabaseの一時停止**：無料枠は1週間アクセスがないとプロジェクトが止まります。Supabaseの画面で「Restore」を押せば、データはそのまま戻ります
- **容量**：写真・動画は合計1GBまで（無料枠）。写真は自動で小さくしています
- **Geminiの無料枠**：送った記録・写真は Google のサービス改善に使われることがあります
- **アプリを直したいとき**：GitHubでファイルを編集 → 保存。`sw.js` の `VERSION` の数字を1つ上げると、iPhoneにすぐ反映されます（反映されないときはアプリを一度閉じて開き直す）

## ファイルの役割

| ファイル | 中身 |
|---|---|
| `index.html` | 画面の骨組みと見た目（CSS） |
| `app.js` | 動き。①〜⑩の日本語コメント付き。①の選択肢を書き換えるのが最初の改造におすすめ |
| `config.js` | Supabaseの鍵 |
| `sw.js` | オフラインでも開けるようにする仕組み |
| `manifest.webmanifest` | アプリ名・アイコン・全画面表示の設定 |
| `supabase-setup.sql` | データベースの準備 |
