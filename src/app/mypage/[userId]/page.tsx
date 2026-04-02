import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PageIntro from "@/app/components/PageIntro";
import { getAuthSession } from "@/features/auth/session";
import { getProfilePageData } from "@/features/profile/server";
import { getCurrentAppUser } from "@/features/users/server";

type MyPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function MyPage({ params }: MyPageProps) {
  const { userId } = await params;
  const session = await getAuthSession();
  const currentUser = await getCurrentAppUser(session);
  const profile = await getProfilePageData(userId);

  if (!profile) {
    notFound();
  }

  const isOwner = currentUser?.id === profile.user.id;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="My Page"
          title={profile.user.displayName}
          description={
            profile.user.bio ??
            "自己紹介はこれから追加できます。MVP では、プロフィール確認と記事一覧の導線を優先しています。"
          }
          aside={
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Profile ID</p>
                <p className="mt-1">/mypage/{profile.user.slug}</p>
              </div>
              {profile.user.learningGoal ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Learning Goal</p>
                  <p className="mt-1">{profile.user.learningGoal}</p>
                </div>
              ) : null}
            </div>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <article className="rounded-[28px] border border-black/10 bg-white/85 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                状態
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isOwner
                  ? "これはあなたの公開プロフィールです。今後は設定画面や活動記録もここにつなぎます。"
                  : "公開プロフィールとして、記事一覧と学習方針を確認できます。"}
              </p>
            </article>

            {profile.user.githubUrl || profile.user.websiteUrl ? (
              <article className="rounded-[28px] border border-black/10 bg-white/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                  Links
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
                  {profile.user.githubUrl ? (
                    <a href={profile.user.githubUrl} className="underline">
                      GitHub
                    </a>
                  ) : null}
                  {profile.user.websiteUrl ? (
                    <a href={profile.user.websiteUrl} className="underline">
                      Website
                    </a>
                  ) : null}
                </div>
              </article>
            ) : null}
          </aside>

          <section className="space-y-4">
            <div className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Articles
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold text-slate-950">
                    公開されている記事
                  </h2>
                </div>
                {isOwner ? (
                  <Link
                    href="/article/new"
                    className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    新しい記事を作る
                  </Link>
                ) : null}
              </div>
            </div>

            {profile.articles.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-8 text-sm leading-7 text-slate-600">
                まだ公開記事はありません。
              </div>
            ) : (
              profile.articles.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {entry.courseName}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{entry.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{entry.summary}</p>
                    </div>
                    <div className="text-sm text-slate-500">{entry.updatedAtLabel}</div>
                  </div>
                  <div className="mt-5">
                    <Link
                      href={`/article/${entry.id}`}
                      className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      記事詳細へ
                    </Link>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      </div>
    </AppShell>
  );
}
