import { slugifyTitle } from './validate.js';

/** Resolves a unique slug for table insert/update. */
export async function allocateSlug(sql, title, slugCustom, excludeId, tableName = 'posts') {
  const base = (slugCustom && slugCustom.length ? slugCustom : slugifyTitle(title)).slice(0, 100) || 'item';
  let candidate = base;
  let n = 0;
  for (;;) {
    const table = tableName === 'events' ? 'events' : 'posts';
    const dup =
      excludeId != null
        ? await sql.unsafe(`SELECT id FROM ${table} WHERE slug = $1 AND id <> $2 LIMIT 1`, [candidate, excludeId])
        : await sql.unsafe(`SELECT id FROM ${table} WHERE slug = $1 LIMIT 1`, [candidate]);
    if (dup.rows.length === 0) return candidate;
    n += 1;
    candidate = `${base.slice(0, 72)}-${n}`;
  }
}
