import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PageIntro from "@/app/components/PageIntro";
import { getAuthSession } from "@/features/auth/session";
import { getArticlePageData } from "@/features/articles/server";
import { getCurrentAppUser } from "@/features/users/server";

type ArticlePageProps = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = await params;
  const session = await getAuthSession();
  const currentUser = await getCurrentAppUser(session);
  const article = await getArticlePageData(articleId);

  if (!article) {
    notFound();
  }

  const canEdit = currentUser?.id === article.author.id;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={article.course.name}
          title={article.title}
          description={article.summary}
          aside={
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Author</p>
                <Link href={`/mypage/${article.author.slug}`} className="mt-1 inline-block underline">
                  {article.author.displayName}
                </Link>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Updated</p>
                <p className="mt-1">{article.updatedAtLabel}</p>
              </div>
              {canEdit ? (
                <Link
                  href={`/article/${article.id}/edit`}
                  className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                >
                  編集画面へ
                </Link>
              ) : null}
            </div>
          }
        />

        {article.isFallback ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            これはサンプル記事です。実データが入ると自動で置き換わります。
          </p>
        ) : null}

        <section className="space-y-5">
          {article.sections.map((sectionRow, index) => (
            <article
              key={sectionRow.id}
              className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Section {index + 1}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {sectionRow.heading}
                  </h2>
                </div>
                {sectionRow.changeSummary ? (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                    {sectionRow.changeSummary}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                <p className="whitespace-pre-wrap">{sectionRow.bodyMd}</p>
              </div>

              {sectionRow.quiz ? (
                <div className="mt-5 rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-800">
                    Quiz
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-900">
                    {sectionRow.quiz.promptText}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    回答形式: {sectionRow.quiz.answerMode}
                  </p>
                  {sectionRow.quiz.explanationMd ? (
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      解説: {sectionRow.quiz.explanationMd}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
