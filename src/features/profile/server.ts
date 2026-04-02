import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { appUser, article, course, profile } from "@/server/db/schema";

export type ProfilePageData = {
  user: {
    id: string;
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    learningGoal: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
  };
  articles: Array<{
    id: string;
    title: string;
    summary: string;
    courseName: string;
    updatedAtLabel: string;
  }>;
};

function formatDateLabel(value: Date | number | null) {
  if (!value) {
    return "更新日時なし";
  }

  const date = typeof value === "number" ? new Date(value) : value;

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

export async function getProfilePageData(slug: string): Promise<ProfilePageData | null> {
  try {
    const rows = await db
      .select({
        id: appUser.id,
        slug: appUser.slug,
        displayName: appUser.displayName,
        avatarUrl: appUser.avatarUrl,
        bio: profile.bio,
        learningGoal: profile.learningGoal,
        githubUrl: profile.githubUrl,
        websiteUrl: profile.websiteUrl,
      })
      .from(appUser)
      .leftJoin(profile, eq(profile.userId, appUser.id))
      .where(eq(appUser.slug, slug))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return null;
    }

    const articlesByUser = await db
      .select({
        id: article.id,
        title: article.title,
        summary: article.summary,
        updatedAt: article.updatedAt,
        courseName: course.name,
      })
      .from(article)
      .innerJoin(course, eq(article.courseId, course.id))
      .where(eq(article.authorUserId, user.id))
      .orderBy(desc(article.updatedAt));

    return {
      user: {
        id: user.id,
        slug: user.slug,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        learningGoal: user.learningGoal,
        githubUrl: user.githubUrl,
        websiteUrl: user.websiteUrl,
      },
      articles: articlesByUser.map((entry) => ({
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        courseName: entry.courseName,
        updatedAtLabel: formatDateLabel(entry.updatedAt),
      })),
    };
  } catch (error) {
    console.warn("Unable to load profile page data.", error);
    return null;
  }
}
