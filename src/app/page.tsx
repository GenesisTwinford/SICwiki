import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import CourseTree from "@/app/components/CourseTree";
import PageIntro from "@/app/components/PageIntro";
import UserBox from "@/app/components/UserBox";
import { getAuthSession } from "@/features/auth/session";
import { getHomeData } from "@/features/home/server";
import { ensureAppUser } from "@/features/users/server";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </article>
  );
}

export default async function Home() {
  const session = await getAuthSession();

  let syncedUser = null;

  try {
    syncedUser = await ensureAppUser(session);
  } catch (error) {
    console.warn("Unable to sync app user yet.", error);
  }

  const homeData = await getHomeData(syncedUser?.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="Home"
          title="SIC Wiki の MVP 導線"
          description="コースをたどって記事詳細へ移動し、そこからプロフィールや編集画面まで一周できる状態を先に固めています。まずは学習の流れが自然につながることを優先します。"
          aside={
            <div className="space-y-4">
              <p className="text-sm leading-6 text-slate-300">
                今の段階では、見た目の作り込みよりも主要ページがつながることを優先しています。
              </p>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="font-medium text-sky-100">
                  {session
                    ? `ようこそ、${session.user.name || session.user.email} さん`
                    : "ログインして学習の進み具合を同期できます"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {syncedUser ? (
                    <>
                      公開プロフィールは{" "}
                      <Link href={`/mypage/${syncedUser.slug}`} className="underline">
                        /mypage/{syncedUser.slug}
                      </Link>{" "}
                      で確認できます。
                    </>
                  ) : (
                    "ログインするとアプリ用プロフィールを自動で準備します。"
                  )}
                </p>
              </div>
              <UserBox />
            </div>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Course Navigator
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold text-slate-950">
                    コースから記事詳細へ進む
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    葉コースは記事詳細に直接つながります。まだデータが少ない間も、最低限の動線確認ができるようにしています。
                  </p>
                </div>
                <Link
                  href="/article/new"
                  className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  記事作成フローを見る
                </Link>
              </div>
            </div>

            <CourseTree nodes={homeData.courseTree} />

            {homeData.usedFallback ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                まだ DB にホーム用データが無いため、画面確認用のサンプルコースを表示しています。
              </p>
            ) : null}
          </div>

          <aside className="space-y-4">
            <StatCard
              label="Daily Task"
              value={`${homeData.stats.dailySolvedCount}/${homeData.stats.dailyTargetCount}`}
              hint={
                homeData.stats.dailyAchieved
                  ? "今日のデイリー目標は達成済みです。"
                  : "まずは 3 問を目標に、学習の流れを確かめましょう。"
              }
            />
            <StatCard
              label="Weekly Rank"
              value={homeData.stats.weeklyRank === null ? "--" : `#${homeData.stats.weeklyRank}`}
              hint={
                homeData.stats.weeklyScore === null
                  ? "フォロー機能とランキングは後続実装です。今は表示枠だけ先に整えています。"
                  : `今週の活動スコアは ${homeData.stats.weeklyScore} 点です。`
              }
            />
            <article className="rounded-3xl border border-dashed border-slate-300 bg-white/85 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                Next Step
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                次は記事詳細、マイページ、記事編集の各画面を往復できるようにして、MVP の一周導線を固めます。
              </p>
            </article>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
