import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  course,
  courseArticleAdoption,
  dailyTaskProgress,
  friendActivityRank,
} from "@/server/db/schema";

export type HomeCourseNode = {
  id: string;
  name: string;
  slug: string;
  isLeaf: boolean;
  articleId: string | null;
  children: HomeCourseNode[];
};

export type HomeSidebarStats = {
  dailySolvedCount: number;
  dailyTargetCount: number;
  dailyAchieved: boolean;
  weeklyRank: number | null;
  weeklyScore: number | null;
};

function formatJstDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
  }).format(date);
}

function getJstWeekStartDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  });
  const weekday = formatter.format(date);
  const offsetMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = offsetMap[weekday] ?? 0;

  return formatJstDate(new Date(date.getTime() - offset * 24 * 60 * 60 * 1000));
}

const fallbackCourseTree: HomeCourseNode[] = [
  {
    id: "course-root-programming",
    name: "プログラミング基礎",
    slug: "programming-basics",
    isLeaf: false,
    articleId: null,
    children: [
      {
        id: "course-leaf-js-variables",
        name: "変数とデータ型",
        slug: "js-variables",
        isLeaf: true,
        articleId: "sample-article-variables",
        children: [],
      },
      {
        id: "course-leaf-control-flow",
        name: "条件分岐と繰り返し",
        slug: "control-flow",
        isLeaf: true,
        articleId: "sample-article-control-flow",
        children: [],
      },
    ],
  },
  {
    id: "course-root-web",
    name: "Web 開発",
    slug: "web-development",
    isLeaf: false,
    articleId: null,
    children: [
      {
        id: "course-leaf-http",
        name: "HTTP の基礎",
        slug: "http-basics",
        isLeaf: true,
        articleId: "sample-article-http",
        children: [],
      },
    ],
  },
];

export function getFallbackHomeData() {
  return {
    courseTree: fallbackCourseTree,
    stats: {
      dailySolvedCount: 0,
      dailyTargetCount: 3,
      dailyAchieved: false,
      weeklyRank: null,
      weeklyScore: null,
    } satisfies HomeSidebarStats,
    usedFallback: true,
  };
}

export async function getHomeData(appUserId?: string | null) {
  try {
    const courses = await db
      .select({
        id: course.id,
        parentCourseId: course.parentCourseId,
        name: course.name,
        slug: course.slug,
        isLeaf: course.isLeaf,
        sortOrder: course.sortOrder,
      })
      .from(course)
      .orderBy(course.parentCourseId, course.sortOrder, course.name);

    const leafIds = courses.filter((entry) => entry.isLeaf).map((entry) => entry.id);

    const adoptions =
      leafIds.length > 0
        ? await db
            .select({
              courseId: courseArticleAdoption.courseId,
              articleId: courseArticleAdoption.articleId,
            })
            .from(courseArticleAdoption)
            .where(
              and(
                eq(courseArticleAdoption.isAdopted, true),
                inArray(courseArticleAdoption.courseId, leafIds),
              ),
            )
        : [];

    const adoptionMap = new Map(adoptions.map((entry) => [entry.courseId, entry.articleId]));
    const childrenByParent = new Map<string | null, HomeCourseNode[]>();

    for (const entry of courses) {
      const node: HomeCourseNode = {
        id: entry.id,
        name: entry.name,
        slug: entry.slug,
        isLeaf: entry.isLeaf,
        articleId: adoptionMap.get(entry.id) ?? null,
        children: [],
      };

      const bucket = childrenByParent.get(entry.parentCourseId) ?? [];
      bucket.push(node);
      childrenByParent.set(entry.parentCourseId, bucket);
    }

    const attachChildren = (parentId: string | null): HomeCourseNode[] => {
      const nodes = childrenByParent.get(parentId) ?? [];
      return nodes.map((node) => ({
        ...node,
        children: attachChildren(node.id),
      }));
    };

    let stats: HomeSidebarStats = {
      dailySolvedCount: 0,
      dailyTargetCount: 3,
      dailyAchieved: false,
      weeklyRank: null,
      weeklyScore: null,
    };

    if (appUserId) {
      const today = formatJstDate(new Date());

      const [daily] = await db
        .select({
          solvedQuizCount: dailyTaskProgress.solvedQuizCount,
          targetQuizCount: dailyTaskProgress.targetQuizCount,
          achieved: dailyTaskProgress.achieved,
        })
        .from(dailyTaskProgress)
        .where(
          and(
            eq(dailyTaskProgress.userId, appUserId),
            eq(dailyTaskProgress.taskDateJst, today),
          ),
        )
        .limit(1);

      const weekStart = getJstWeekStartDate(new Date());

      const [rank] = await db
        .select({
          rank: friendActivityRank.rank,
          score: friendActivityRank.score,
        })
        .from(friendActivityRank)
        .where(
          and(
            eq(friendActivityRank.userId, appUserId),
            eq(friendActivityRank.weekStartDateJst, weekStart),
          ),
        )
        .orderBy(desc(friendActivityRank.computedAt))
        .limit(1);

      stats = {
        dailySolvedCount: daily?.solvedQuizCount ?? 0,
        dailyTargetCount: daily?.targetQuizCount ?? 3,
        dailyAchieved: daily?.achieved ?? false,
        weeklyRank: rank?.rank ?? null,
        weeklyScore: rank?.score ?? null,
      };
    }

    return {
      courseTree: attachChildren(null),
      stats,
      usedFallback: courses.length === 0,
    };
  } catch (error) {
    console.warn("Falling back to mock home data.", error);
    return getFallbackHomeData();
  }
}
