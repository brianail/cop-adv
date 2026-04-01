import { slugifyTitle } from './validate.js';

/** Resolves a unique slug for table insert/update. */
export async function allocateSlug(sql, title, slugCustom, excludeId, tableName = 'posts') {
  const base = (slugCustom && slugCustom.length ? slugCustom : slugifyTitle(title)).slice(0, 100) || 'item';
  let candidate = base;
  let n = 0;
  const isEvents = tableName === 'events';

  for (;;) {
    let dup;
    if (isEvents) {
      dup = excludeId != null
        ? await sql`SELECT id FROM events WHERE slug = ${candidate} AND id <> ${excludeId} LIMIT 1`
        : await sql`SELECT id FROM events WHERE slug = ${candidate} LIMIT 1`;
    } else {
      dup = excludeId != null
        ? await sql`SELECT id FROM posts WHERE slug = ${candidate} AND id <> ${excludeId} LIMIT 1`
        : await sql`SELECT id FROM posts WHERE slug = ${candidate} LIMIT 1`;
    }
    if (dup.rows.length === 0) return candidate;
    n += 1;
    candidate = `${base.slice(0, 72)}-${n}`;
  }
}
