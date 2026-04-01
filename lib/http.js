export function jsonError(res, status, message, details = undefined) {
  const body = { error: message };
  if (details && process.env.NODE_ENV !== 'production') body.details = details;
  return res.status(status).json(body);
}

/** Message from a failed `fetch` Response (expects JSON `{ error }`). */
export async function parseFetchError(response) {
  try {
    const j = await response.json();
    if (j && typeof j.error === 'string') return j.error;
  } catch {
    /* ignore */
  }
  return `Erro ${response.status}`;
}
