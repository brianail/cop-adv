import { slugifyTitle } from './validate.js';

/** Resolves a unique `slug` for insert (`excludeId` null) or update. */
export async function allocateSlug(sql, title, slugCustom, excludeId) {
  const base = (slugCustom && slugCustom.length ? slugCustom : slugifyTitle(title)).slice(0, 100) || 'post';
  let candidate = base;
  let n = 0;
  for (;;) {
    const dup =
      excludeId != null
        ? await sql`SELECT id FROM posts WHERE slug = ${candidate} AND id <> ${excludeId} LIMIT 1`
        : await sql`SELECT id FROM posts WHERE slug = ${candidate} LIMIT 1`;
    if (dup.rows.length === 0) return candidate;
    n += 1;
    candidate = `${base.slice(0, 72)}-${n}`;
  }
}
