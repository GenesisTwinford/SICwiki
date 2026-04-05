// 記事の情報をDBから取得

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  appUser,
  article,
  articleSection,
  course,
  quizVersion,
  sectionVersion,
} from "@/server/db/schema";

type ArticleSectionBlock = {
  id: string;
  heading: string;
  bodyMd: string;
  changeSummary: string | null;
  quiz:
    | {
        id: string;
        promptText: string;
        answerMode: string;
        explanationMd: string | null;
      }
    | null;
};

export type ArticlePageData = {
  id: string;
  title: string;
  summary: string;
  course: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    displayName: string;
    slug: string;
  };
  sections: ArticleSectionBlock[];
  updatedAtLabel: string;
  isFallback: boolean;
};

export type EditorCourseOption = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleEditorData = {
  article:
    | {
        id: string;
        title: string;
        summary: string;
        courseId: string;
        authorUserId: string;
        sections: Array<{
          id: string;
          heading: string;
          bodyMd: string;
          changeSummary: string | null;
        }>;
      }
    | null;
  courseOptions: EditorCourseOption[];
  isFallback: boolean;
};

const fallbackCourseOptions: EditorCourseOption[] = [
  { id: "course-leaf-js-variables", name: "変数とデータ型", slug: "js-variables" },
  { id: "course-leaf-control-flow", name: "条件分岐と繰り返し", slug: "control-flow" },
  { id: "course-leaf-http", name: "HTTP の基本", slug: "http-basics" },
];

const fallbackArticles: Record<string, ArticlePageData> = {
  "sample-article-variables": {
    id: "sample-article-variables",
    title: "JavaScript の変数とデータ型",
    summary:
      "変数宣言の役割、文字列や数値の扱い、再代入で気をつけるポイントを短くつかめるサンプル記事です。",
    course: {
      id: "course-leaf-js-variables",
      name: "変数とデータ型",
      slug: "js-variables",
    },
    author: {
      id: "sample-author",
      displayName: "SIC Sample Author",
      slug: "sic-sample-author",
    },
    sections: [
      {
        id: "sample-section-variables-1",
        heading: "最初に押さえること",
        bodyMd:
          "変数は値に名前を付けて、あとから参照しやすくするための仕組みです。`const` を基本にして、再代入が必要な場面だけ `let` を使う方針にすると迷いにくくなります。",
        changeSummary: "サンプル構成",
        quiz: {
          id: "sample-quiz-variables-1",
          promptText: "再代入しない値を宣言するときに基本として使うのはどちらですか。",
          answerMode: "text",
          explanationMd: "`const` を基本にすると、意図しない再代入を減らせます。",
        },
      },
      {
        id: "sample-section-variables-2",
        heading: "型の違いを見る",
        bodyMd:
          "数値と文字列は見た目が似ていても別の型です。たとえば `42` と `'42'` は同じではありません。値の型を意識すると、比較や計算で起きる混乱を減らせます。",
        changeSummary: null,
        quiz: null,
      },
    ],
    updatedAtLabel: "サンプル記事",
    isFallback: true,
  },
  "sample-article-control-flow": {
    id: "sample-article-control-flow",
    title: "条件分岐と繰り返し",
    summary: "if 文とループをどう使い分けるかを、短い流れで確認するためのサンプル記事です。",
    course: {
      id: "course-leaf-control-flow",
      name: "条件分岐と繰り返し",
      slug: "control-flow",
    },
    author: {
      id: "sample-author",
      displayName: "SIC Sample Author",
      slug: "sic-sample-author",
    },
    sections: [
      {
        id: "sample-section-control-1",
        heading: "if 文の役割",
        bodyMd:
          "条件分岐は、入力や状態によって処理の道筋を変えるために使います。条件を文章で言い換えられるなら、コードでも整理しやすくなります。",
        changeSummary: "サンプル構成",
        quiz: null,
      },
    ],
    updatedAtLabel: "サンプル記事",
    isFallback: true,
  },
  "sample-article-http": {
    id: "sample-article-http",
    title: "HTTP の基本",
    summary: "ブラウザとサーバーがどうやり取りするかを、リクエストとレスポンスの視点で確認します。",
    course: {
      id: "course-leaf-http",
      name: "HTTP の基本",
      slug: "http-basics",
    },
    author: {
      id: "sample-author",
      displayName: "SIC Sample Author",
      slug: "sic-sample-author",
    },
    sections: [
      {
        id: "sample-section-http-1",
        heading: "やり取りの流れ",
        bodyMd:
          "ブラウザはサーバーにリクエストを送り、サーバーはレスポンスを返します。URL、HTTP メソッド、ステータスコードを見ると全体像を追いやすくなります。",
        changeSummary: "サンプル構成",
        quiz: null,
      },
    ],
    updatedAtLabel: "サンプル記事",
    isFallback: true,
  },
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

export async function getArticlePageData(articleId: string): Promise<ArticlePageData | null> {
  try {
    const rows = await db
      .select({
        id: article.id,
        title: article.title,
        summary: article.summary,
        updatedAt: article.updatedAt,
        courseId: course.id,
        courseName: course.name,
        courseSlug: course.slug,
        authorId: appUser.id,
        authorName: appUser.displayName,
        authorSlug: appUser.slug,
      })
      .from(article)
      .innerJoin(course, eq(article.courseId, course.id))
      .innerJoin(appUser, eq(article.authorUserId, appUser.id))
      .where(eq(article.id, articleId))
      .limit(1);

    const base = rows[0];

    if (!base) {
      return fallbackArticles[articleId] ?? null;
    }

    const sections = await db
      .select({
        id: articleSection.id,
        heading: articleSection.heading,
      })
      .from(articleSection)
      .where(eq(articleSection.articleId, articleId))
      .orderBy(asc(articleSection.sortOrder));

    const sectionIds = sections.map((sectionRow) => sectionRow.id);

    const versions =
      sectionIds.length === 0
        ? []
        : await db
            .select({
              id: sectionVersion.id,
              articleSectionId: sectionVersion.articleSectionId,
              bodyMd: sectionVersion.bodyMd,
              changeSummary: sectionVersion.changeSummary,
            })
            .from(sectionVersion)
            .where(
              and(
                eq(sectionVersion.isCurrent, true),
                inArray(sectionVersion.articleSectionId, sectionIds),
              ),
            );

    const quizzes =
      sectionIds.length === 0
        ? []
        : await db
            .select({
              id: quizVersion.id,
              articleSectionId: quizVersion.articleSectionId,
              promptText: quizVersion.promptText,
              answerMode: quizVersion.answerMode,
              explanationMd: quizVersion.explanationMd,
            })
            .from(quizVersion)
            .where(
              and(eq(quizVersion.isCurrent, true), inArray(quizVersion.articleSectionId, sectionIds)),
            );

    const versionMap = new Map(versions.map((entry) => [entry.articleSectionId, entry]));
    const quizMap = new Map(quizzes.map((entry) => [entry.articleSectionId, entry]));

    return {
      id: base.id,
      title: base.title,
      summary: base.summary,
      course: {
        id: base.courseId,
        name: base.courseName,
        slug: base.courseSlug,
      },
      author: {
        id: base.authorId,
        displayName: base.authorName,
        slug: base.authorSlug,
      },
      sections: sections.map((sectionRow) => {
        const currentVersion = versionMap.get(sectionRow.id);
        const currentQuiz = quizMap.get(sectionRow.id);

        return {
          id: sectionRow.id,
          heading: sectionRow.heading,
          bodyMd: currentVersion?.bodyMd ?? "このセクション本文はまだ登録されていません。",
          changeSummary: currentVersion?.changeSummary ?? null,
          quiz: currentQuiz
            ? {
                id: currentQuiz.id,
                promptText: currentQuiz.promptText,
                answerMode: currentQuiz.answerMode,
                explanationMd: currentQuiz.explanationMd,
              }
            : null,
        };
      }),
      updatedAtLabel: formatDateLabel(base.updatedAt),
      isFallback: false,
    };
  } catch (error) {
    console.warn("Unable to load article data.", error);
    return fallbackArticles[articleId] ?? null;
  }
}

export async function getEditorCourseOptions(): Promise<EditorCourseOption[]> {
  try {
    const rows = await db
      .select({
        id: course.id,
        name: course.name,
        slug: course.slug,
      })
      .from(course)
      .where(eq(course.isLeaf, true))
      .orderBy(asc(course.name));

    return rows.length > 0 ? rows : fallbackCourseOptions;
  } catch (error) {
    console.warn("Unable to load course options.", error);
    return fallbackCourseOptions;
  }
}

export async function getArticleEditorData(articleId: string): Promise<ArticleEditorData | null> {
  const pageData = await getArticlePageData(articleId);
  const courseOptions = await getEditorCourseOptions();

  if (!pageData) {
    return null;
  }

  return {
    article: {
      id: pageData.id,
      title: pageData.title,
      summary: pageData.summary,
      courseId: pageData.course.id,
      authorUserId: pageData.author.id,
      sections: pageData.sections.map((sectionRow) => ({
        id: sectionRow.id,
        heading: sectionRow.heading,
        bodyMd: sectionRow.bodyMd,
        changeSummary: sectionRow.changeSummary,
      })),
    },
    courseOptions,
    isFallback: pageData.isFallback,
  };
}
