import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { createAppId, slugify } from "@/features/users/id";
import { appUser, profile, type SelectAppUser } from "@/server/db/schema";

type AuthSession = Awaited<ReturnType<typeof import("@/features/auth/session").getAuthSession>>;

async function findAvailableSlug(baseSlug: string) {
  const taken = await db
    .select({ slug: appUser.slug })
    .from(appUser)
    .where(eq(appUser.slug, baseSlug))
    .limit(1);

  if (taken.length === 0) {
    return baseSlug;
  }

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const candidate = `${baseSlug}-${attempt}`;
    const existing = await db
      .select({ slug: appUser.slug })
      .from(appUser)
      .where(eq(appUser.slug, candidate))
      .limit(1);

    if (existing.length === 0) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
}

export async function ensureAppUser(session: AuthSession) {
  if (!session?.user) {
    return null;
  }

  const existing = await db
    .select()
    .from(appUser)
    .where(eq(appUser.authUserId, session.user.id))
    .limit(1);

  if (existing[0]) {
    await db
      .update(appUser)
      .set({
        displayName: session.user.name || existing[0].displayName,
        avatarUrl: session.user.image ?? existing[0].avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(appUser.id, existing[0].id));

    return {
      ...existing[0],
      displayName: session.user.name || existing[0].displayName,
      avatarUrl: session.user.image ?? existing[0].avatarUrl,
    };
  }

  const baseSlug = slugify(session.user.name || session.user.email.split("@")[0] || "learner");
  const slug = await findAvailableSlug(baseSlug);
  const userId = createAppId();

  await db.insert(appUser).values({
    id: userId,
    authUserId: session.user.id,
    slug,
    displayName: session.user.name || "SIC Learner",
    avatarUrl: session.user.image,
  });

  await db.insert(profile).values({
    userId,
    bio: "プロフィールはこれから整えていきます。",
    learningGoal: "まずはMVPを触りながら、学習の流れを確認していきます。",
  });

  const created = await db.select().from(appUser).where(eq(appUser.id, userId)).limit(1);

  return created[0] ?? null;
}

export async function getCurrentAppUser(session: AuthSession): Promise<SelectAppUser | null> {
  if (!session?.user) {
    return null;
  }

  const users = await db
    .select()
    .from(appUser)
    .where(eq(appUser.authUserId, session.user.id))
    .limit(1);

  return users[0] ?? null;
}
