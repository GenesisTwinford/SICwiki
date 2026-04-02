import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import PageIntro from "@/app/components/PageIntro";
import { getEditorCourseOptions } from "@/features/articles/server";
import { getAuthSession } from "@/features/auth/session";
import { getCurrentAppUser } from "@/features/users/server";

export default async function NewArticlePage() {
  const session = await getAuthSession();
  const currentUser = await getCurrentAppUser(session);
  const courseOptions = await getEditorCourseOptions();

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="New Article"
          title="記事作成フローの入口"
          description="MVP では、コースを選んでタイトル・概要・セクション草稿を確認できるところまで先に整えています。保存処理は次の実装でつなぎます。"
          aside={
            currentUser ? (
              <div className="space-y-3">
                <p>作成者: {currentUser.displayName}</p>
                <Link href={`/mypage/${currentUser.slug}`} className="inline-block underline">
                  マイページを見る
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p>作成を始めるにはログインが必要です。</p>
                <Link href="/signin" className="inline-block underline">
                  ログインへ
                </Link>
              </div>
            )
          }
        />

        {!currentUser ? (
          <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/85 p-8 text-sm leading-7 text-slate-600">
            ログインすると、作成者情報を引き継いだ状態で記事下書きフローを開始できます。
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form className="space-y-5 rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">コース</label>
                <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none">
                  {courseOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">タイトル</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="例: JavaScript の配列を理解する"
                  defaultValue=""
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">概要</label>
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="このページで何を学べるかを短く書きます。"
                  defaultValue=""
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">最初のセクション</label>
                <textarea
                  className="min-h-48 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="見出しと本文のたたきをここに置けるようにしてあります。"
                  defaultValue=""
                />
              </div>

              <button
                type="button"
                disabled
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white opacity-60"
              >
                保存処理は次の実装で接続します
              </button>
            </form>

            <aside className="space-y-4">
              <article className="rounded-[28px] border border-black/10 bg-white/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                  現在の扱い
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  この画面は、ルート導線と入力項目の骨格を確認するための MVP 版です。
                </p>
              </article>
              <article className="rounded-[28px] border border-black/10 bg-white/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                  次に接続するもの
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  `articles`、`article_sections`、`section_versions` への保存処理をつなぐ予定です。
                </p>
              </article>
            </aside>
          </section>
        )}
      </div>
    </AppShell>
  );
}
