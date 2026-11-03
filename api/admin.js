import crypto from 'node:crypto';
import {
  configured, isAuthed, checkPassword, makeToken,
  readManifest, writeManifest, publicUrl, withUrls, s3, bucket,
  PutObjectCommand, DeleteObjectCommand, getSignedUrl, PREFIX,
} from './_lib/shared.js';

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const clean = (s, n) => String(s || '').trim().slice(0, n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!configured()) return res.status(500).json({ error: 'Server not configured (missing environment variables)' });

  const { action, ...body } = req.body || {};
  try {
    if (action === 'login') {
      if (!checkPassword(body.password || '')) {
        await sleep(700);
        return res.status(401).json({ error: 'Wrong password' });
      }
      return res.status(200).json({ token: makeToken() });
    }

    if (!isAuthed(req)) return res.status(401).json({ error: 'Please log in again' });

    if (action === 'list') {
      return res.status(200).json({ items: await withUrls(await readManifest()) });
    }

    if (action === 'sign') {
      // browser uploads the (compressed JPEG) photo straight to Backblaze with this temporary URL
      const key = `${PREFIX}${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
      const url = await getSignedUrl(
        s3(),
        new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: 'image/jpeg' }),
        { expiresIn: 300 }
      );
      return res.status(200).json({ url, key });
    }

    if (action === 'upload') {
      // fallback: photo comes through this server (no browser CORS needed)
      const key = String(body.key || '');
      if (!key.startsWith(PREFIX) || key.includes('..')) return res.status(400).json({ error: 'Bad key' });
      const buf = Buffer.from(String(body.data || ''), 'base64');
      if (!buf.length) return res.status(400).json({ error: 'Empty image' });
      await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: buf, ContentType: 'image/jpeg' }));
      return res.status(200).json({ ok: true });
    }

    if (action === 'add') {
      const key = String(body.key || '');
      if (!key.startsWith(PREFIX) || key.includes('..')) return res.status(400).json({ error: 'Bad key' });
      const tag = clean(body.tag, 40);
      const cat = slug(body.cat || tag);
      if (!cat) return res.status(400).json({ error: 'Tag is required' });
      const items = await readManifest();
      items.unshift({
        key,
        src: publicUrl(key),
        cat,
        tag: tag || cat,
        title: clean(body.title, 120),
        createdAt: new Date().toISOString(),
      });
      await writeManifest(items);
      return res.status(200).json({ items: await withUrls(items) });
    }

    if (action === 'delete') {
      const key = String(body.key || '');
      if (!key.startsWith(PREFIX) || key.includes('..')) return res.status(400).json({ error: 'Bad key' });
      await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
      const items = (await readManifest()).filter((i) => i.key !== key);
      await writeManifest(items);
      return res.status(200).json({ items: await withUrls(items) });
    }

    if (action === 'deleteMany') {
      const keys = (Array.isArray(body.keys) ? body.keys : []).map(String);
      if (!keys.length || keys.some((k) => !k.startsWith(PREFIX) || k.includes('..'))) return res.status(400).json({ error: 'Bad keys' });
      await Promise.all(keys.map((Key) => s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key }))));
      const items = (await readManifest()).filter((i) => !keys.includes(i.key));
      await writeManifest(items);
      return res.status(200).json({ items: await withUrls(items) });
    }

    if (action === 'update') {
      // edit tag (category) and/or caption of one or many photos
      const keys = (Array.isArray(body.keys) ? body.keys : [body.key]).map(String);
      const tag = body.tag !== undefined ? clean(body.tag, 40) : null;
      const cat = tag ? slug(body.cat || tag) : null;
      if (tag !== null && !cat) return res.status(400).json({ error: 'Tag is required' });
      const items = await readManifest();
      items.forEach((i) => {
        if (!keys.includes(i.key)) return;
        if (tag) { i.tag = tag; i.cat = cat; }
        if (body.title !== undefined) i.title = clean(body.title, 120);
      });
      await writeManifest(items);
      return res.status(200).json({ items: await withUrls(items) });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error: ' + (err.message || 'unknown') });
  }
}
