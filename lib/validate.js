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

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) errors.push('Título é obrigatório.');
  else if (title.length > 200) errors.push('Título muito longo (máx. 200 caracteres).');

  const catRaw = typeof body.cat === 'string' ? body.cat.trim().toLowerCase() : '';
  if (!ALLOWED_CATS.has(catRaw)) errors.push('Categoria inválida.');

  const bodyHtml = typeof body.body === 'string' ? body.body : '';
  const plain = bodyHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (!plain) errors.push('Conteúdo é obrigatório.');
  if (bodyHtml.length > 500_000) errors.push('Conteúdo excede o tamanho máximo permitido.');

  const yt_id = parseYoutubeId(body.yt_id);
  const img = validateImageUrl(body.img);
  if (!img && !yt_id) errors.push('Informe uma imagem de capa ou um vídeo do YouTube.');

  let img_pos = typeof body.img_pos === 'string' ? body.img_pos.trim() : null;
  if (img_pos && !IMG_POS.has(img_pos)) img_pos = 'center';
  if (!img) img_pos = null;

  const data = {
    title,
    cat: catRaw,
    read_time: normReadTime(body.read_time),
    date: normDate(body.date),
    body: bodyHtml,
    img: img || null,
    yt_id: yt_id || null,
    img_pos: img ? img_pos || 'center' : null,
    featured: Boolean(body.featured),
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
