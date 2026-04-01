import { requireAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';

export const config = { api: { bodyParser: false } };

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(jpeg|png|gif|webp|heic|heif)$/i;

export default async function handler(req, res) {
  applyCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!requireAuth(req, res)) return;

  const len = req.headers['content-length'];
  if (len && Number(len) > MAX_BYTES) {
    return res.status(413).json({ error: 'Arquivo muito grande (máx. 6MB).' });
  }

  const ctype = req.headers['content-type'] || '';
  if (!ALLOWED_TYPES.test(ctype.split(';')[0].trim())) {
    return res.status(400).json({ error: 'Envie uma imagem (JPEG, PNG, WebP ou GIF).' });
  }

  try {
    const cloudinaryModule = await import('cloudinary');
    const cloudinary = cloudinaryModule.v2;

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('upload: Cloudinary env ausente');
      return res.status(500).json({ error: 'Armazenamento não configurado.' });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ error: 'Arquivo muito grande (máx. 6MB).' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cop-blog', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(buffer);
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Erro no upload. Tente outra imagem.' });
  }
}
