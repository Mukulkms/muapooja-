import { configured, readManifest, withUrls } from './_lib/shared.js';

// Public: returns the photo list for the website
export default async function handler(req, res) {
  if (!configured()) return res.status(200).json({ items: [], configured: false });
  try {
    const items = await withUrls(await readManifest());
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=30');
    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load gallery' });
  }
}
