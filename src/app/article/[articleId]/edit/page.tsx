import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PageIntro from "@/app/components/PageIntro";
import { getArticleEditorData } from "@/features/articles/server";
import { getAuthSession } from "@/features/auth/session";
import { getCurrentAppUser } from "@/features/users/server";

type EditArticlePageProps = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { articleId } = await params;
  const session = await getAuthSession();
  const currentUser = await getCurrentAppUser(session);
  const editorData = await getArticleEditorData(articleId);

  if (!editorData?.article) {
    notFound();
  }

  const canEdit = currentUser?.id === editorData.article.authorUserId;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="Edit Article"
          title="記事編集フローの骨格"
          description="現行版では、既存記事の内容を読み込み、タイトル・概要・セクション本文を編集対象として確認できます。保存と版管理の接続は次の段階で行います。"
          aside={
            <div className="space-y-3">
              <p>{canEdit ? "このページはあなたの編集対象です。" : "閲覧用の編集骨格です。"}</p>
              <Link href={`/article/${editorData.article.id}`} className="inline-block underline">
                記事詳細へ戻る
              </Link>
            </div>
          }
        />

        {!canEdit ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            現在は本人以外の保存操作を受け付けない前提で、画面確認用に読み取り中心の形にしています。
          </p>
        ) : null}

        {editorData.isFallback ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            このページはサンプル記事を元にした編集ビューです。
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form className="space-y-5 rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">コース</label>
              <select
                defaultValue={editorData.article.courseId}
                disabled={!canEdit}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none disabled:bg-slate-50"
              >
                {editorData.courseOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">タイトル</label>
              <input
                defaultValue={editorData.article.title}
                disabled={!canEdit}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">概要</label>
              <textarea
                defaultValue={editorData.article.summary}
                disabled={!canEdit}
                className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-4">
              {editorData.article.sections.map((sectionRow, index) => (
                <div key={sectionRow.id} className="rounded-3xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Section {index + 1}
                  </p>
                  <input
                    defaultValue={sectionRow.heading}
                    disabled={!canEdit}
                    className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
                  />
                  <textarea
                    defaultValue={sectionRow.bodyMd}
                    disabled={!canEdit}
                    className="mt-3 min-h-40 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </div>
              ))}
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
                MVP の到達点
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                記事詳細から編集画面へ遷移し、現在の本文を読み込める状態までを先に整えています。
              </p>
            </article>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
