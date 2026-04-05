import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestampNow = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const user = sqliteTable("user", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(timestampNow)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(timestampNow)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const appUser = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    authUserId: text("auth_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_auth_user_id_unique").on(table.authUserId),
    uniqueIndex("users_slug_unique").on(table.slug),
  ],
);

export const profile = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => appUser.id, { onDelete: "cascade" }),
  bio: text("bio"),
  learningGoal: text("learning_goal"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(timestampNow)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(timestampNow)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const course = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    parentCourseId: text("parent_course_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isLeaf: integer("is_leaf", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("courses_slug_unique").on(table.slug),
    index("courses_parent_sort_idx").on(table.parentCourseId, table.sortOrder),
  ],
);

export const article = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("articles_course_updated_idx").on(table.courseId, table.updatedAt)],
);

export const courseArticleAdoption = sqliteTable(
  "course_article_adoptions",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    clarityAvg: real("clarity_avg").notNull().default(0),
    accuracyAvg: real("accuracy_avg").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    normalizedReviewCount: real("normalized_review_count").notNull().default(0),
    adoptionScore: real("adoption_score").notNull().default(0),
    qualifies: integer("qualifies", { mode: "boolean" }).notNull().default(false),
    isAdopted: integer("is_adopted", { mode: "boolean" }).notNull().default(false),
    calculatedAt: integer("calculated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
  },
  (table) => [
    uniqueIndex("course_article_adoptions_course_article_unique").on(
      table.courseId,
      table.articleId,
    ),
    index("course_article_adoptions_course_adopted_idx").on(table.courseId, table.isAdopted),
  ],
);

export const articleSection = sqliteTable(
  "article_sections",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    heading: text("heading").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("article_sections_article_sort_unique").on(table.articleId, table.sortOrder),
    index("article_sections_article_sort_idx").on(table.articleId, table.sortOrder),
  ],
);

export const sectionVersion = sqliteTable(
  "section_versions",
  {
    id: text("id").primaryKey(),
    articleSectionId: text("article_section_id")
      .notNull()
      .references(() => articleSection.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    bodyMd: text("body_md").notNull(),
    bodyHtml: text("body_html"),
    changeSummary: text("change_summary"),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
    editorUserId: text("editor_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
  },
  (table) => [
    uniqueIndex("section_versions_section_version_unique").on(
      table.articleSectionId,
      table.versionNo,
    ),
    index("section_versions_section_current_idx").on(table.articleSectionId, table.isCurrent),
  ],
);

export const quizVersion = sqliteTable(
  "quiz_versions",
  {
    id: text("id").primaryKey(),
    articleSectionId: text("article_section_id")
      .notNull()
      .references(() => articleSection.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    promptText: text("prompt_text").notNull(),
    answerMode: text("answer_mode").notNull(),
    explanationMd: text("explanation_md"),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
    editorUserId: text("editor_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
  },
  (table) => [
    uniqueIndex("quiz_versions_section_version_unique").on(table.articleSectionId, table.versionNo),
    index("quiz_versions_section_current_idx").on(table.articleSectionId, table.isCurrent),
  ],
);

export const sectionRating = sqliteTable(
  "section_ratings",
  {
    id: text("id").primaryKey(),
    sectionVersionId: text("section_version_id")
      .notNull()
      .references(() => sectionVersion.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    audienceScore: integer("audience_score").notNull(),
    clarityScore: integer("clarity_score").notNull(),
    accuracyScore: integer("accuracy_score").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("section_ratings_version_user_unique").on(table.sectionVersionId, table.userId),
    index("section_ratings_version_clarity_idx").on(table.sectionVersionId, table.clarityScore),
  ],
);

export const dailyTaskProgress = sqliteTable(
  "daily_task_progresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    taskDateJst: text("task_date_jst").notNull(),
    targetQuizCount: integer("target_quiz_count").notNull().default(3),
    solvedQuizCount: integer("solved_quiz_count").notNull().default(0),
    achieved: integer("achieved", { mode: "boolean" }).notNull().default(false),
    achievedAt: integer("achieved_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("daily_task_progresses_user_date_unique").on(table.userId, table.taskDateJst),
  ],
);

export const followRelation = sqliteTable(
  "follow_relations",
  {
    id: text("id").primaryKey(),
    followerUserId: text("follower_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    followeeUserId: text("followee_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
  },
  (table) => [
    uniqueIndex("follow_relations_pair_unique").on(table.followerUserId, table.followeeUserId),
  ],
);

export const friendActivityRank = sqliteTable(
  "friend_activity_ranks",
  {
    id: text("id").primaryKey(),
    weekStartDateJst: text("week_start_date_jst").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    rank: integer("rank").notNull(),
    computedAt: integer("computed_at", { mode: "timestamp_ms" })
      .default(timestampNow)
      .notNull(),
  },
  (table) => [
    uniqueIndex("friend_activity_ranks_week_user_unique").on(table.weekStartDateJst, table.userId),
    index("friend_activity_ranks_week_rank_idx").on(table.weekStartDateJst, table.rank),
  ],
);

export const authUserRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  appUser: one(appUser, {
    fields: [user.id],
    references: [appUser.authUserId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const appUserRelations = relations(appUser, ({ one, many }) => ({
  authUser: one(user, {
    fields: [appUser.authUserId],
    references: [user.id],
  }),
  profile: one(profile, {
    fields: [appUser.id],
    references: [profile.userId],
  }),
  authoredArticles: many(article),
  sectionRatings: many(sectionRating),
  dailyTaskProgresses: many(dailyTaskProgress),
  friendActivityRanks: many(friendActivityRank),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(appUser, {
    fields: [profile.userId],
    references: [appUser.id],
  }),
}));

export const courseRelations = relations(course, ({ one, many }) => ({
  parent: one(course, {
    relationName: "courseHierarchy",
    fields: [course.parentCourseId],
    references: [course.id],
  }),
  children: many(course, {
    relationName: "courseHierarchy",
  }),
  articles: many(article),
  adoptions: many(courseArticleAdoption),
}));

export const articleRelations = relations(article, ({ one, many }) => ({
  course: one(course, {
    fields: [article.courseId],
    references: [course.id],
  }),
  author: one(appUser, {
    fields: [article.authorUserId],
    references: [appUser.id],
  }),
  sections: many(articleSection),
  adoptions: many(courseArticleAdoption),
}));

export const articleSectionRelations = relations(articleSection, ({ one, many }) => ({
  article: one(article, {
    fields: [articleSection.articleId],
    references: [article.id],
  }),
  versions: many(sectionVersion),
  quizzes: many(quizVersion),
}));

export const sectionVersionRelations = relations(sectionVersion, ({ one, many }) => ({
  articleSection: one(articleSection, {
    fields: [sectionVersion.articleSectionId],
    references: [articleSection.id],
  }),
  editor: one(appUser, {
    fields: [sectionVersion.editorUserId],
    references: [appUser.id],
  }),
  ratings: many(sectionRating),
}));

export const quizVersionRelations = relations(quizVersion, ({ one }) => ({
  articleSection: one(articleSection, {
    fields: [quizVersion.articleSectionId],
    references: [articleSection.id],
  }),
  editor: one(appUser, {
    fields: [quizVersion.editorUserId],
    references: [appUser.id],
  }),
}));

export const sectionRatingRelations = relations(sectionRating, ({ one }) => ({
  sectionVersion: one(sectionVersion, {
    fields: [sectionRating.sectionVersionId],
    references: [sectionVersion.id],
  }),
  user: one(appUser, {
    fields: [sectionRating.userId],
    references: [appUser.id],
  }),
}));

export const courseArticleAdoptionRelations = relations(courseArticleAdoption, ({ one }) => ({
  course: one(course, {
    fields: [courseArticleAdoption.courseId],
    references: [course.id],
  }),
  article: one(article, {
    fields: [courseArticleAdoption.articleId],
    references: [article.id],
  }),
}));

export const dailyTaskProgressRelations = relations(dailyTaskProgress, ({ one }) => ({
  user: one(appUser, {
    fields: [dailyTaskProgress.userId],
    references: [appUser.id],
  }),
}));

export const friendActivityRankRelations = relations(friendActivityRank, ({ one }) => ({
  user: one(appUser, {
    fields: [friendActivityRank.userId],
    references: [appUser.id],
  }),
}));

export type SelectAppUser = typeof appUser.$inferSelect;
