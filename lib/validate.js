export const ALLOWED_CATS = new Set([
  'trabalhista',
  'previdenciario',
  'administrativo',
  'sindical',
  'civel',
  'institucional',
]);

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const IMG_POS = new Set(['center', 'top', 'bottom', 'contain']);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parsePostId(raw) {
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 1 || n > 2147483647) return null;
  return n;
}

/** Extract 11-char YouTube id from string or validate raw id */
export function parseYoutubeId(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  if (YT_ID_RE.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function validateImageUrl(url) {
  if (url == null || url === '') return null;
  if (typeof url !== 'string') return null;
  const t = url.trim();
  if (t.length > 2048) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return t;
  } catch {
    return null;
  }
}

export function slugifyTitle(title) {
  if (!title || typeof title !== 'string') return 'post';
  const s = title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'post';
}

/** Returns normalized slug or null if invalid */
export function normalizeSlugInput(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 120);
  if (!s || !SLUG_RE.test(s)) return null;
  return s;
}

function normReadTime(v) {
  if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 80);
  return '3 min de leitura';
}

function normDate(v) {
  if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 80);
  return null;
}

/**
 * Validates body for POST or full PUT (dashboard always sends full payload).
 */
export function validatePostInput(body) {
  const errors = [];

  const status = body.status === 'draft' ? 'draft' : 'published';

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) errors.push('Título é obrigatório.');
  else if (title.length > 200) errors.push('Título muito longo (máx. 200 caracteres).');

  const catRaw = typeof body.cat === 'string' ? body.cat.trim().toLowerCase() : '';
  if (!ALLOWED_CATS.has(catRaw)) errors.push('Categoria inválida.');

  const bodyHtml = typeof body.body === 'string' ? body.body : '';
  const plain = bodyHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  if (status === 'published') {
    if (!plain) errors.push('Conteúdo é obrigatório.');
  }
  if (bodyHtml.length > 500_000) errors.push('Conteúdo excede o tamanho máximo permitido.');

  const yt_id = parseYoutubeId(body.yt_id);
  const img = validateImageUrl(body.img);

  if (status === 'published') {
    if (!img && !yt_id) errors.push('Informe uma imagem de capa ou um vídeo do YouTube.');
  }

  let img_pos = typeof body.img_pos === 'string' ? body.img_pos.trim() : null;
  if (img_pos && !IMG_POS.has(img_pos)) img_pos = 'center';
  if (!img) img_pos = null;

  let slug_custom = normalizeSlugInput(body.slug);

  let meta_description =
    typeof body.meta_description === 'string' ? body.meta_description.trim().slice(0, 320) : '';
  if (!meta_description) meta_description = null;

  let img_alt = typeof body.img_alt === 'string' ? body.img_alt.trim().slice(0, 220) : '';
  if (!img_alt) img_alt = null;

  const featured = status === 'published' && Boolean(body.featured);

  const data = {
    status,
    title,
    cat: catRaw,
    read_time: normReadTime(body.read_time),
    date: normDate(body.date),
    body: bodyHtml,
    img: img || null,
    yt_id: yt_id || null,
    img_pos: img ? img_pos || 'center' : null,
    featured,
    slug_custom,
    meta_description,
    img_alt,
  };

  return { ok: errors.length === 0, errors, data };
}

export function validateNewsletterEmail(raw) {
  if (typeof raw !== 'string') return null;
  const email = raw.toLowerCase().trim();
  if (email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function normalizeDateOnly(raw) {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function normalizeTimeOnly(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const s = raw.trim();
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  return s;
}

export function validateEventInput(body) {
  const errors = [];
  const status = body.status === 'draft' ? 'draft' : 'published';

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) errors.push('Título do evento é obrigatório.');
  else if (title.length > 200) errors.push('Título muito longo (máx. 200 caracteres).');

  const event_date = normalizeDateOnly(body.event_date);
  if (!event_date) errors.push('Data do evento inválida (use YYYY-MM-DD).');

  const event_time = normalizeTimeOnly(body.event_time);
  const location =
    typeof body.location === 'string' && body.location.trim()
      ? body.location.trim().slice(0, 200)
      : null;

  const img = validateImageUrl(body.img);
  if (status === 'published' && !img) errors.push('Imagem do evento é obrigatória para publicar.');

  const description = typeof body.description === 'string' ? body.description : '';
  const plain = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (status === 'published' && !plain) errors.push('Descrição do evento é obrigatória para publicar.');
  if (description.length > 120_000) errors.push('Descrição muito longa.');

  const slug_custom = normalizeSlugInput(body.slug);
  const meta_description =
    typeof body.meta_description === 'string' && body.meta_description.trim()
      ? body.meta_description.trim().slice(0, 320)
      : null;
  const img_alt =
    typeof body.img_alt === 'string' && body.img_alt.trim()
      ? body.img_alt.trim().slice(0, 220)
      : null;

  return {
    ok: errors.length === 0,
    errors,
    data: {
      title,
      status,
      event_date,
      event_time,
      location,
      img: img || null,
      description,
      slug_custom,
      meta_description,
      img_alt,
    },
  };
}
