import Link from "next/link";
import type { HomeCourseNode } from "@/features/home/server";

type CourseTreeProps = {
  nodes: HomeCourseNode[];
};

function CourseTreeNode({ node }: { node: HomeCourseNode }) {
  const href = node.articleId ? `/article/${node.articleId}` : "#";

  return (
    <li className="space-y-3">
      <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
              {node.isLeaf ? "Article" : "Course"}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{node.name}</h3>
          </div>

          {node.isLeaf ? (
            node.articleId ? (
              <Link
                href={href}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                記事へ
              </Link>
            ) : (
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
                準備中
              </span>
            )
          ) : (
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900">
              展開中
            </span>
          )}
        </div>
      </div>

      {node.children.length > 0 ? (
        <ul className="ml-4 space-y-3 border-l border-dashed border-slate-300 pl-4">
          {node.children.map((child) => (
            <CourseTreeNode key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function CourseTree({ nodes }: CourseTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
        まだコースが登録されていません。`courses` テーブルにデータを入れるとここに表示されます。
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {nodes.map((node) => (
        <CourseTreeNode key={node.id} node={node} />
      ))}
    </ul>
  );
}
