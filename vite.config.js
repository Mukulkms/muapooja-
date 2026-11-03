import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// LOCAL DEV BACKEND (only runs with `npm run dev`, never in production).
// Fakes /api/admin and /api/gallery so you can test /admin without Backblaze or Vercel.
// Photos + list are saved in ./.dev-data/ (git-ignored). Default password: 78955
// (change it with ADMIN_PASSWORD=... in a .env file).
const devApi = (password) => ({
  name: 'dev-api',
  configureServer(server) {
    const dir = path.resolve('.dev-data');
    const manifestFile = path.join(dir, 'gallery.json');
    fs.mkdirSync(path.join(dir, 'files'), { recursive: true });

    const read = () => { try { return JSON.parse(fs.readFileSync(manifestFile, 'utf8')); } catch { return []; } };
    const write = (items) => fs.writeFileSync(manifestFile, JSON.stringify(items, null, 2));
    const send = (res, code, data) => {
      res.statusCode = code;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    const body = (req) => new Promise((resolve) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
    const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    const tokens = new Set();
    const authed = (req) => tokens.has((req.headers.authorization || '').replace(/^Bearer /, ''));

    server.middlewares.use(async (req, res, next) => {
      const url = req.url.split('?')[0];

      // public gallery list (404 when empty -> site uses src/data/gallery.js photos)
      if (url === '/api/gallery') {
        const items = read();
        return items.length ? send(res, 200, { items }) : send(res, 404, {});
      }

      // saved photos
      if (url.startsWith('/dev-files/') && req.method === 'GET') {
        const file = path.join(dir, 'files', path.basename(url));
        if (!fs.existsSync(file)) return send(res, 404, {});
        res.setHeader('Content-Type', 'image/jpeg');
        return fs.createReadStream(file).pipe(res);
      }

      // "upload URL" that replaces the Backblaze signed URL
      if (url.startsWith('/api/dev-upload/') && req.method === 'PUT') {
        const buf = await body(req);
        fs.writeFileSync(path.join(dir, 'files', path.basename(url)), buf);
        return send(res, 200, {});
      }

      if (url === '/api/admin') {
        if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
        let data = {};
        try { data = JSON.parse((await body(req)).toString() || '{}'); } catch { /* ignore */ }
        const { action } = data;

        if (action === 'login') {
          if (data.password !== password) return send(res, 401, { error: 'Wrong password' });
          const t = crypto.randomBytes(16).toString('hex');
          tokens.add(t);
          return send(res, 200, { token: t });
        }
        if (!authed(req)) return send(res, 401, { error: 'Please log in again' });

        if (action === 'list') return send(res, 200, { items: read() });

        if (action === 'sign') {
          const name = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.jpg`;
          return send(res, 200, { url: `/api/dev-upload/${name}`, key: `gallery/${name}` });
        }
        if (action === 'add') {
          const tag = String(data.tag || '').trim().slice(0, 40);
          const cat = slug(data.cat || tag);
          if (!cat) return send(res, 400, { error: 'Tag is required' });
          const items = read();
          items.unshift({
            key: data.key,
            src: `/dev-files/${path.basename(data.key)}`,
            cat, tag: tag || cat,
            title: String(data.title || '').trim().slice(0, 120),
            createdAt: new Date().toISOString(),
          });
          write(items);
          return send(res, 200, { items });
        }
        if (action === 'delete') {
          try { fs.unlinkSync(path.join(dir, 'files', path.basename(String(data.key)))); } catch { /* ok */ }
          const items = read().filter((i) => i.key !== data.key);
          write(items);
          return send(res, 200, { items });
        }
        if (action === 'deleteMany') {
          const keys = (Array.isArray(data.keys) ? data.keys : []).map(String);
          keys.forEach((k) => { try { fs.unlinkSync(path.join(dir, 'files', path.basename(k))); } catch { /* ok */ } });
          const items = read().filter((i) => !keys.includes(i.key));
          write(items);
          return send(res, 200, { items });
        }
        if (action === 'update') {
          const keys = (Array.isArray(data.keys) ? data.keys : [data.key]).map(String);
          const tag = data.tag !== undefined ? String(data.tag).trim().slice(0, 40) : null;
          const cat = tag ? slug(data.cat || tag) : null;
          if (tag !== null && !cat) return send(res, 400, { error: 'Tag is required' });
          const items = read();
          items.forEach((i) => {
            if (!keys.includes(i.key)) return;
            if (tag) { i.tag = tag; i.cat = cat; }
            if (data.title !== undefined) i.title = String(data.title).trim().slice(0, 120);
          });
          write(items);
          return send(res, 200, { items });
        }
        return send(res, 400, { error: 'Unknown action' });
      }

      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), devApi(env.ADMIN_PASSWORD || '78955')] };
});
