// serverから受け取った情報を整理し、appに流す。

import LoginButton from "@/app/components/LoginButton";
import UserBox from "@/app/components/UserBox";
import CourseTree from "@/app/components/CourseTree";
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f9ff_0%,#fff7ed_55%,#ffffff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
            <aside className="space-y-4 rounded-[28px] bg-slate-950 p-6 text-white">
              <div className="space-y-3">
                <p className="text-sm leading-6 text-slate-300">
                  コース全体像と現在の進み具合を、1画面で追えるようにした MVP の骨組みです。
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm font-medium text-sky-100">
                  {session ? `こんにちは、${session.user.name || session.user.email} さん` : "ようこそ"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {syncedUser
                    ? `公開プロフィールID は /mypage/${syncedUser.slug} で使う想定です。`
                    : "ログインするとアプリ用プロフィールを自動で準備します。"}
                </p>
              </div>

              <div className="space-y-3">
                <UserBox />
                <LoginButton />
              </div>
            </aside>

            <section className="space-y-5">
              <div className="rounded-[28px] border border-black/10 bg-white/80 p-6">
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                    SIC Wiki
                </h1>
              </div>

              <CourseTree nodes={homeData.courseTree} />

              {homeData.usedFallback ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  まだ DB にホーム用データが無いため、画面確認用のサンプルコースを表示しています。
                </p>
              ) : null}
            </section>

            <aside className="space-y-4">
              <StatCard
                label="Daily Task"
                value={`${homeData.stats.dailySolvedCount}/${homeData.stats.dailyTargetCount}`}
                hint={
                  homeData.stats.dailyAchieved
                    ? "今日のタスクは達成済みです。"
                    : "3問正解でデイリー達成になります。"
                }
              />
              <StatCard
                label="Weekly Rank"
                value={
                  homeData.stats.weeklyRank === null ? "--" : `#${homeData.stats.weeklyRank}`
                }
                hint={
                  homeData.stats.weeklyScore === null
                    ? "フォロー関係とランキングが入るとここに表示されます。"
                    : `今週の活動量スコアは ${homeData.stats.weeklyScore} 点です。`
                }
              />
              <article className="rounded-3xl border border-dashed border-slate-300 bg-white/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                  Next Step
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  次は `courses`, `articles`, `course_article_adoptions` に実データを入れると、ホームが
                  モック表示から卒業できます。
                </p>
              </article>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
