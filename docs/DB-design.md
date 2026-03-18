# DB設計（MVP）

## 1. 目的

本書は [requirements.md](./requirements.md) をもとに、MVP実装で必要となるデータ構造を定義するためのDB設計書である。

前回の懸念点を踏まえ、以下を設計上の確定方針とする。

- ユーザー内部IDと公開用 `userId`（slug）は分離する
- 採用記事はコースごとの集計結果として専用テーブルに保持する
- セクション本文と問題集の現行版は、各 version テーブルの `is_current` で表現する
- コメントとリアクションは版ローカルとし、新版へ自動継承しない
- フォロー関係データはMVPで保持するが、操作UIはMVP対象外とする

## 2. 設計方針

- DB は Turso（SQLite系）を前提とする
- 主キーは文字列IDを基本とし、アプリ側の内部IDは ULID を採用する
- better-auth の認証主体とアプリ側ユーザー主体は `users.auth_user_id` で紐づける
- `userId` は公開用slugであり、`users.slug` に保持する
- 記事はコースに属し、1つのコースに複数の記事候補を持てる
- 採用記事判定はアプリケーション側で再計算し、結果を `course_article_adoptions` に保存する
- セクション本文と問題集は破壊的更新を避け、バージョン行を追加して履歴を保持する
- 循環参照を避けるため、親テーブルから現行版IDを直接保持しない
- JST基準の日次・週次集計はアプリケーションまたは定期ジョブで更新する

## 3. エンティティ関連の概要

- `users` と `profiles` は 1:1 関係
- `courses` は自己参照で木構造を表現する
- `courses` と `articles` は 1:N 関係
- `courses` と `course_article_adoptions` は 1:N 関係
- `articles` と `article_sections` は 1:N 関係
- `article_sections` と `section_versions` は 1:N 関係
- `article_sections` と `quiz_versions` は 1:N 関係
- `quiz_versions` と `quiz_blocks` は 1:N 関係
- `quiz_versions` と `quiz_answer_patterns` は 1:N 関係
- `section_versions` と `section_ratings` は 1:N 関係
- `section_versions` と `annotation_comments` は 1:N 関係
- `section_versions` と `frustration_reactions` は 1:N 関係
- `users` と `quiz_submissions` は 1:N 関係
- `users` と `daily_task_progresses` は 1:N 関係
- `users` と `friend_activity_ranks` は 1:N 関係
- `follow_relations` は `users` 間の自己関連を表現する

## 4. テーブル設計

### 4.1 users

アプリケーション上のユーザー主体。内部主キーと公開slugを分離する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 内部ユーザーID（ULID）。PK |
| auth_user_id | text | yes | better-auth の user.id。UNIQUE |
| slug | text | yes | 公開用 `userId`。UNIQUE |
| display_name | text | yes | 表示名 |
| avatar_url | text | no | アイコン画像URL |
| created_at | datetime | yes | 作成日時（UTC） |
| updated_at | datetime | yes | 更新日時（UTC） |

制約・インデックス:

- PK: `id`
- UNIQUE: `auth_user_id`
- UNIQUE: `slug`

### 4.2 profiles

プロフィール詳細。MVPではマイページ表示・編集対象とする。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| user_id | text | yes | `users.id`。PK 兼 FK |
| bio | text | no | 自己紹介 |
| learning_goal | text | no | 学習目標 |
| github_url | text | no | 任意プロフィール項目 |
| website_url | text | no | 任意プロフィール項目 |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK/FK: `user_id -> users.id`

### 4.3 courses

コース階層を表現するテーブル。内部ノードと葉ノードの両方を保持する。葉ノードには複数の記事候補を持てる。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | コースID（ULID）。PK |
| parent_course_id | text | no | 親コースID。自己参照FK |
| name | text | yes | コース名 |
| slug | text | yes | 表示用slug。UNIQUE |
| description | text | no | コース説明 |
| sort_order | integer | yes | 同階層内の表示順 |
| is_leaf | integer | yes | 葉ノードなら1 |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `parent_course_id -> courses.id`
- UNIQUE: `slug`
- INDEX: `(parent_course_id, sort_order)`

### 4.4 articles

記事候補本体。1つのコースに対して複数の記事候補を持てる。MVPの通常導線では採用記事のみ表示する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 記事ID（ULID）。PK |
| course_id | text | yes | 所属コースID |
| author_user_id | text | yes | 初回作成者 |
| title | text | yes | 記事タイトル |
| summary | text | yes | 記事概要 |
| is_public | integer | yes | MVPでは常に1 |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `course_id -> courses.id`
- FK: `author_user_id -> users.id`
- INDEX: `(course_id, updated_at desc)`

### 4.5 course_article_adoptions

同一コース内の記事候補群に対する採用判定結果。採用スコアは永続化し、通常導線は `is_adopted = 1` の記事を参照する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 採用判定ID（ULID）。PK |
| course_id | text | yes | 対象コースID |
| article_id | text | yes | 対象記事ID |
| clarity_avg | real | yes | 現行セクション群のわかりやすさ平均 |
| accuracy_avg | real | yes | 現行セクション群の正確性平均 |
| review_count | integer | yes | レビュー数 |
| normalized_review_count | real | yes | 0-1正規化後レビュー数 |
| adoption_score | real | yes | 採用スコア |
| qualifies | integer | yes | 最低レビュー数を満たすなら1 |
| is_adopted | integer | yes | 現在の採用記事なら1 |
| calculated_at | datetime | yes | 集計日時 |

制約・インデックス:

- PK: `id`
- FK: `course_id -> courses.id`
- FK: `article_id -> articles.id`
- UNIQUE: `(course_id, article_id)`
- INDEX: `(course_id, is_adopted)`
- INDEX: `(course_id, adoption_score desc)`

運用ルール:

- 同一 `course_id` 内で `is_adopted = 1` は高々1件とする
- 採用判定は評価送信時または現行版更新時に再計算する

### 4.6 article_sections

記事内の表示順を持つセクション。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | セクションID（ULID）。PK |
| article_id | text | yes | 所属記事ID |
| sort_order | integer | yes | 記事内の並び順 |
| heading | text | yes | セクション見出し |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `article_id -> articles.id`
- UNIQUE: `(article_id, sort_order)`
- INDEX: `(article_id, sort_order)`

### 4.7 section_versions

セクション本文のバージョン履歴。編集のたびに新規行を追加する。現行版は `is_current = 1` で表現する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | バージョンID（ULID）。PK |
| article_section_id | text | yes | 対象セクションID |
| version_no | integer | yes | 1始まりの版番号 |
| body_md | text | yes | Markdown本文 |
| body_html | text | no | サニタイズ済みHTMLキャッシュ |
| change_summary | text | no | 変更概要 |
| is_current | integer | yes | 現行版なら1 |
| editor_user_id | text | yes | 編集者 |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `article_section_id -> article_sections.id`
- FK: `editor_user_id -> users.id`
- UNIQUE: `(article_section_id, version_no)`
- INDEX: `(article_section_id, is_current)`
- INDEX: `(article_section_id, created_at desc)`

運用ルール:

- 同一 `article_section_id` で `is_current = 1` は高々1件とする

### 4.8 quiz_versions

セクションに紐づく問題集のバージョン履歴。本文と同様に破壊的更新を避ける。現行版は `is_current = 1` で表現する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 問題集バージョンID（ULID）。PK |
| article_section_id | text | yes | 対象セクションID |
| version_no | integer | yes | 1始まりの版番号 |
| prompt_text | text | yes | 問題文 |
| answer_mode | text | yes | `reorder` / `text` / `hybrid` |
| explanation_md | text | no | 解説文 |
| is_current | integer | yes | 現行版なら1 |
| editor_user_id | text | yes | 編集者 |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `article_section_id -> article_sections.id`
- FK: `editor_user_id -> users.id`
- UNIQUE: `(article_section_id, version_no)`
- INDEX: `(article_section_id, is_current)`
- INDEX: `(article_section_id, created_at desc)`

運用ルール:

- 同一 `article_section_id` で `is_current = 1` は高々1件とする

### 4.9 quiz_blocks

コード並べ替え問題のブロック定義。提示順と正解順の両方を保持する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | ブロックID（ULID）。PK |
| quiz_version_id | text | yes | 対象問題集バージョンID |
| source_order | integer | yes | 初期表示順 |
| answer_order | integer | yes | 正解順 |
| block_text | text | yes | コード片 |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `quiz_version_id -> quiz_versions.id`
- UNIQUE: `(quiz_version_id, source_order)`
- UNIQUE: `(quiz_version_id, answer_order)`

### 4.10 quiz_answer_patterns

文字入力問題の正答パターン。正規化後文字列を複数保持できるようにする。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 正答パターンID（ULID）。PK |
| quiz_version_id | text | yes | 対象問題集バージョンID |
| normalized_answer | text | yes | 正規化済み正答 |
| is_primary | integer | yes | 代表解かどうか |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `quiz_version_id -> quiz_versions.id`
- INDEX: `(quiz_version_id)`

### 4.11 section_ratings

セクション評価。評価対象は `section_version_id` とし、版ごとの評価を蓄積する。

スコア定義:

- `audience_score`: 1 = 上級者向け、5 = 初心者向け
- `clarity_score`: 1 = わかりにくい、5 = わかりやすい
- `accuracy_score`: 1 = 不正確、5 = 正確

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 評価ID（ULID）。PK |
| section_version_id | text | yes | 評価対象の本文バージョン |
| user_id | text | yes | 評価者 |
| audience_score | integer | yes | 1-5 |
| clarity_score | integer | yes | 1-5 |
| accuracy_score | integer | yes | 1-5 |
| created_at | datetime | yes | 初回評価日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `section_version_id -> section_versions.id`
- FK: `user_id -> users.id`
- UNIQUE: `(section_version_id, user_id)`
- INDEX: `(section_version_id, clarity_score)`

### 4.12 annotation_comments

文章単位コメント。対象文章の再特定用として、オフセットと引用文字列を保持する。コメントは対象バージョンにのみ紐づき、新版へは自動継承しない。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | コメントID（ULID）。PK |
| section_version_id | text | yes | 対象本文バージョン |
| user_id | text | yes | 投稿者 |
| anchor_start_offset | integer | yes | 本文内の開始位置 |
| anchor_end_offset | integer | yes | 本文内の終了位置 |
| anchor_text | text | yes | 対象文字列のスナップショット |
| body | text | yes | コメント本文 |
| deleted_at | datetime | no | 論理削除日時 |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `section_version_id -> section_versions.id`
- FK: `user_id -> users.id`
- INDEX: `(section_version_id, anchor_start_offset, anchor_end_offset)`

### 4.13 frustration_reactions

挫折箇所リアクション。版ローカルの文章位置単位で1ユーザー1リアクションを基本とする。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | リアクションID（ULID）。PK |
| section_version_id | text | yes | 対象本文バージョン |
| user_id | text | yes | リアクションしたユーザー |
| anchor_start_offset | integer | yes | 本文内の開始位置 |
| anchor_end_offset | integer | yes | 本文内の終了位置 |
| anchor_text | text | yes | 対象文字列のスナップショット |
| reaction_type | text | yes | MVPでは `stuck` 固定 |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `section_version_id -> section_versions.id`
- FK: `user_id -> users.id`
- UNIQUE: `(section_version_id, user_id, anchor_start_offset, anchor_end_offset, reaction_type)`

### 4.14 quiz_submissions

問題採点結果の保存。デイリータスク進捗と週間ランキング集計の元データとする。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 提出ID（ULID）。PK |
| user_id | text | yes | 解答者 |
| quiz_version_id | text | yes | 対象問題集バージョン |
| submitted_answer | text | yes | JSONまたは正規化文字列 |
| is_correct | integer | yes | 正解なら1 |
| score | integer | yes | MVPでは正解1、不正解0 |
| submitted_at | datetime | yes | 採点実行日時 |
| submitted_date_jst | date | yes | JST基準の日次集計用日付 |

制約・インデックス:

- PK: `id`
- FK: `user_id -> users.id`
- FK: `quiz_version_id -> quiz_versions.id`
- INDEX: `(user_id, submitted_date_jst)`
- INDEX: `(user_id, submitted_at desc)`

### 4.15 daily_task_progresses

日次タスク進捗。1日3問以上の解答条件を達成したかを保持する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 進捗ID（ULID）。PK |
| user_id | text | yes | 対象ユーザー |
| task_date_jst | date | yes | JST基準の日付 |
| target_quiz_count | integer | yes | MVPでは3固定 |
| solved_quiz_count | integer | yes | 当日採点実行数 |
| achieved | integer | yes | 達成なら1 |
| achieved_at | datetime | no | 初回達成日時 |
| created_at | datetime | yes | 作成日時 |
| updated_at | datetime | yes | 更新日時 |

制約・インデックス:

- PK: `id`
- FK: `user_id -> users.id`
- UNIQUE: `(user_id, task_date_jst)`

### 4.16 follow_relations

片方向フォロー関係。ランキング母集団の定義に使用する。MVPではデータのみ保持し、操作UIは提供しない。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | 関係ID（ULID）。PK |
| follower_user_id | text | yes | フォローする側 |
| followee_user_id | text | yes | フォローされる側 |
| created_at | datetime | yes | 作成日時 |

制約・インデックス:

- PK: `id`
- FK: `follower_user_id -> users.id`
- FK: `followee_user_id -> users.id`
- UNIQUE: `(follower_user_id, followee_user_id)`

### 4.17 friend_activity_ranks

週間ランキングのスナップショット。表示高速化とランキング履歴保持のために永続化する。

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | text | yes | ランクID（ULID）。PK |
| week_start_date_jst | date | yes | 集計週の開始日（月曜） |
| user_id | text | yes | 対象ユーザー |
| score | integer | yes | 週間スコア |
| rank | integer | yes | 週内順位 |
| computed_at | datetime | yes | 集計実行日時 |

制約・インデックス:

- PK: `id`
- FK: `user_id -> users.id`
- UNIQUE: `(week_start_date_jst, user_id)`
- INDEX: `(week_start_date_jst, rank)`

## 5. better-auth 管理テーブル

認証は better-auth を利用するため、以下の標準テーブル群はライブラリ側の定義に従う。

- `user`
- `account`
- `session`
- `verification`

物理テーブル名は better-auth の設定に従う。アプリケーション側では `users.auth_user_id` によって認証ユーザーと紐づける。

## 6. 採用記事判定の扱い

要件定義の採用ロジックは、以下のフローで扱う。

- 評価送信時または現行版更新時に、同一 `course_id` の記事候補群を再集計する
- 集計対象は、各記事の現行セクション版に紐づく `section_ratings` とする
- `review_count < 3` の記事は `qualifies = 0` とし、採用候補から除外する
- `adoption_score = 0.7 * clarity_avg + 0.3 * normalized_review_count` で採用スコアを算出する
- 同点時は `accuracy_avg`、それでも同点なら `articles.updated_at` が新しい方を優先する
- 最新結果を `course_article_adoptions` に upsert し、採用記事のみ `is_adopted = 1` にする

## 7. 主な参照・更新フロー

### 7.1 ホーム画面

- `courses` を `parent_course_id` と `sort_order` で木構造表示
- 葉コースでは `course_article_adoptions` から `is_adopted = 1` の記事を取得して遷移先を決定
- 右カラムでは `daily_task_progresses` と `friend_activity_ranks` を参照

### 7.2 記事閲覧

- `articles` を取得
- `article_sections` を `sort_order` 順で取得
- 各セクションについて `section_versions.is_current = 1` を参照する
- 問題集は `quiz_versions.is_current = 1` を参照する
- コメントとリアクションは、表示中の `section_version_id` 単位で取得する

### 7.3 記事編集

- 対象 `article_section` に対して `section_versions` を追加する
- 追加前の現行版は `is_current = 0` に更新する
- 新版を `is_current = 1` で保存する
- 問題集変更時は `quiz_versions` でも同様に現行版を切り替える
- `articles.updated_at` を更新する
- 必要に応じて `course_article_adoptions` を再計算する

### 7.4 デイリータスク・週間順位

- 採点実行ごとに `quiz_submissions` を追加する
- 当日分の提出数をもとに `daily_task_progresses` を upsert する
- 週次ジョブで `follow_relations` を母集団として `friend_activity_ranks` を再集計する

## 8. インデックス方針

MVP時点では以下を優先する。

- コース階層表示: `courses(parent_course_id, sort_order)`
- 採用記事取得: `course_article_adoptions(course_id, is_adopted)`
- 記事詳細表示: `article_sections(article_id, sort_order)`
- 現行版取得: `section_versions(article_section_id, is_current)`
- 現行問題取得: `quiz_versions(article_section_id, is_current)`
- 評価集計: `section_ratings(section_version_id)`
- コメント描画: `annotation_comments(section_version_id, anchor_start_offset, anchor_end_offset)`
- 日次集計: `quiz_submissions(user_id, submitted_date_jst)`
- 週間ランキング表示: `friend_activity_ranks(week_start_date_jst, rank)`

## 9. 要件からの補完事項

以下は要件定義だけでは不足するため、DB設計上の前提として補完した。

- ユーザー内部IDと公開slugの分離
- 採用記事保持用 `course_article_adoptions`
- 現行版の表現を親テーブル参照ではなく `is_current` に統一
- 問題集の版管理用 `quiz_versions`
- コード並べ替えのための `quiz_blocks`
- 文字入力判定のための `quiz_answer_patterns`
- 活動量集計元としての `quiz_submissions`
- コメント/リアクションは版ローカルであり、自動継承しない運用

## 10. 破綻チェック結果

今回の修正後、前回の懸念点に対して以下の通り整合を取っている。

- `userId` の変更リスク: 内部IDと公開slugを分離して解消
- 採用記事の循環参照: `courses.adopted_article_id` を廃止し、`course_article_adoptions` に分離して解消
- 現行版参照の循環参照: `current_section_version_id` / `current_quiz_version_id` を廃止し、`is_current` 方式に変更して解消
- コメント・リアクションの版跨ぎ問題: 版ローカル運用に明示して解消
- フォローUIとランキング母集団のねじれ: データ保持はMVP、UIは将来実装と定義して解消
