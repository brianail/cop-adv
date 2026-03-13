import { requireAuth } from '../lib/auth.js';
import cloudinaryPkg from 'cloudinary';
const { v2: cloudinary } = cloudinaryPkg;

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  // lê o body como buffer
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // envia para Cloudinary via upload stream
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'cop-blog', resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });

  res.status(200).json({ url: result.secure_url });
}