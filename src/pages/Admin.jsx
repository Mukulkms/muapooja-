import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories.js';
import '../styles/admin.css';

const TOKEN_KEY = 'pr_admin_token';
const NEW_TAG = '__new';

async function api(action, body, token) {
  const r = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify({ action, ...body }),
  });
  let data = {};
  try { data = await r.json(); } catch { /* not json */ }
  if (!r.ok) {
    const err = new Error(data.error || 'Request failed (' + r.status + ')');
    err.status = r.status;
    throw err;
  }
  return data;
}

// Shrinks big phone photos (max 1800px, JPEG) so the site stays fast
async function compress(file, max = 1800, quality = 0.85) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob) throw new Error('Could not read this image');
  return blob;
}

const niceName = (name) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]); // files chosen for upload
  const [tagChoice, setTagChoice] = useState(CATEGORIES[0].id);
  const [newTag, setNewTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const fileInput = useRef(null);

  const [selected, setSelected] = useState(() => new Set()); // keys ticked for bulk actions
  const [editing, setEditing] = useState(null); // { keys: [...], title, tagChoice, newTag } or null

  useEffect(() => { document.title = 'Admin – Gallery'; }, []);

  const logout = (msg = '') => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setItems([]);
    setError(msg);
  };

  const guard = (err) => {
    if (err.status === 401) logout('Session ended. Please log in again.');
    else setError(err.message);
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api('list', {}, token)
      .then((d) => setItems(d.items))
      .catch(guard)
      .finally(() => setLoading(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token: t } = await api('login', { password });
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pick = (fileList) => {
    const next = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        title: '',
        status: 'ready',
      }));
    setRows((r) => [...r, ...next]);
  };

  const patchRow = (id, patch) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id));

  const resolveTag = () => {
    if (tagChoice === NEW_TAG) {
      const label = newTag.trim();
      return { cat: label, tag: label };
    }
    const c = CATEGORIES.find((x) => x.id === tagChoice);
    return { cat: c.id, tag: c.label };
  };

  const upload = async () => {
    setError('');
    const { cat, tag } = resolveTag();
    if (!tag) { setError('Write the new tag name first.'); return; }
    setBusy(true);
    for (const row of rows.filter((r) => r.status !== 'done')) {
      try {
        patchRow(row.id, { status: 'uploading…' });
        let blob = await compress(row.file);
        if (blob.size > 2.8 * 1024 * 1024) blob = await compress(row.file, 1400, 0.7); // keep under Vercel's 4.5MB body limit
        const { url, key } = await api('sign', {}, token);
        let ok = false;
        try {
          // fast path: browser uploads straight to Backblaze (needs the bucket CORS rule)
          const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
          ok = put.ok;
        } catch { /* CORS blocked -> fall back to uploading through our own server */ }
        if (!ok) {
          const data = await new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result).split(',')[1]);
            fr.onerror = () => rej(new Error('Could not read image'));
            fr.readAsDataURL(blob);
          });
          await api('upload', { key, data }, token);
        }
        const d = await api('add', { key, cat, tag, title: row.title.trim() || tag }, token);
        setItems(d.items);
        patchRow(row.id, { status: 'done' });
      } catch (err) {
        if (err.status === 401) { guard(err); break; }
        patchRow(row.id, { status: 'failed: ' + err.message });
      }
    }
    setBusy(false);
    setRows((r) => r.filter((x) => x.status !== 'done'));
    if (fileInput.current) fileInput.current.value = '';
  };

  const toggle = (key) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(key)) n.delete(key); else n.add(key);
    return n;
  });

  const del = async (item) => {
    if (!window.confirm('Delete this photo permanently?')) return;
    setError('');
    try {
      const d = await api('delete', { key: item.key }, token);
      setItems(d.items);
      setSelected((s) => { const n = new Set(s); n.delete(item.key); return n; });
    } catch (err) {
      guard(err);
    }
  };

  const delSelected = async () => {
    const keys = [...selected];
    if (!keys.length) return;
    if (!window.confirm(`Delete ${keys.length} photo${keys.length > 1 ? 's' : ''} permanently?`)) return;
    setError('');
    setBusy(true);
    try {
      const d = await api('deleteMany', { keys }, token);
      setItems(d.items);
      setSelected(new Set());
    } catch (err) {
      guard(err);
    } finally {
      setBusy(false);
    }
  };

  // open the edit box for one photo (title + tag prefilled) or for all ticked photos (tag only)
  const startEdit = (keys) => {
    const one = keys.length === 1 ? items.find((i) => i.key === keys[0]) : null;
    const known = one && (CATEGORIES.some((c) => c.id === one.cat) || items.some((i) => i.cat === one.cat));
    setEditing({
      keys,
      title: one ? one.title || '' : '',
      tagChoice: one && known ? one.cat : CATEGORIES[0].id,
      newTag: '',
      single: Boolean(one),
    });
  };

  const saveEdit = async () => {
    const e = editing;
    let tag; let cat;
    if (e.tagChoice === NEW_TAG) {
      tag = e.newTag.trim();
      cat = tag;
      if (!tag) { setError('Write the new tag name first.'); return; }
    } else {
      const preset = CATEGORIES.find((c) => c.id === e.tagChoice);
      const existing = items.find((i) => i.cat === e.tagChoice);
      tag = preset ? preset.label : existing.tag;
      cat = e.tagChoice;
    }
    setError('');
    setBusy(true);
    try {
      const body = { keys: e.keys, tag, cat };
      if (e.single) body.title = e.title;
      const d = await api('update', body, token);
      setItems(d.items);
      setEditing(null);
      setSelected(new Set());
    } catch (err) {
      guard(err);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- login screen ---------------- */
  if (!token) {
    return (
      <div className="adm adm-login">
        <form onSubmit={login} className="adm-card">
          <h1>Admin login</h1>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus aria-label="Password" />
          {error && <p className="adm-err">{error}</p>}
          <button className="btn btn-copper" type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Log in'}</button>
          <Link to="/" className="adm-back">← Back to site</Link>
        </form>
      </div>
    );
  }

  const tags = [...new Map(items.map((i) => [i.cat, i.tag])).entries()];
  const shown = items.filter((i) => filter === 'all' || i.cat === filter);
  const shownKeys = shown.map((i) => i.key);
  const allShownSelected = shownKeys.length > 0 && shownKeys.every((k) => selected.has(k));
  // tag choices for the edit box: presets + tags already used in the gallery
  const editTags = [
    ...CATEGORIES.map((c) => [c.id, c.label]),
    ...tags.filter(([cat]) => !CATEGORIES.some((c) => c.id === cat)),
  ];

  return (
    <div className="adm">
      <header className="adm-top">
        <h1>Gallery admin</h1>
        <div>
          <Link to="/gallery" className="adm-link">View gallery</Link>
          <button className="adm-link" onClick={() => logout()}>Log out</button>
        </div>
      </header>

      {error && <p className="adm-err">{error}</p>}

      <section className="adm-card">
        <h2>Upload photos</h2>
        <div className="adm-form">
          <label>
            Tag
            <select value={tagChoice} onChange={(e) => setTagChoice(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              <option value={NEW_TAG}>+ New tag…</option>
            </select>
          </label>
          {tagChoice === NEW_TAG && (
            <label>
              New tag name
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. Mehendi Makeup" maxLength={40} />
            </label>
          )}
          <label className="adm-file">
            <input ref={fileInput} type="file" accept="image/*" multiple onChange={(e) => pick(e.target.files)} />
          </label>
        </div>

        {rows.length > 0 && (
          <>
            <ul className="adm-rows">
              {rows.map((r) => (
                <li key={r.id}>
                  <img src={r.preview} alt="" />
                  <div>
                    <input placeholder="Caption (optional)" value={r.title} onChange={(e) => patchRow(r.id, { title: e.target.value })} maxLength={120} disabled={busy} />
                    <small>{r.file.name} · {r.status}</small>
                  </div>
                  {!busy && <button type="button" className="adm-x" onClick={() => removeRow(r.id)} aria-label="Remove">×</button>}
                </li>
              ))}
            </ul>
            <button className="btn btn-copper" onClick={upload} disabled={busy}>
              {busy ? 'Uploading…' : `Upload ${rows.length} photo${rows.length > 1 ? 's' : ''}`}
            </button>
          </>
        )}
      </section>

      <section className="adm-card">
        <div className="adm-head">
          <h2>Photos on the site ({items.length})</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by tag">
            <option value="all">All tags</option>
            {tags.map(([cat, tag]) => <option key={cat} value={cat}>{tag}</option>)}
          </select>
        </div>
        {shown.length > 0 && (
          <div className="adm-bulk">
            <label className="adm-check">
              <input
                type="checkbox"
                checked={allShownSelected}
                onChange={() => setSelected((s) => {
                  const n = new Set(s);
                  shownKeys.forEach((k) => (allShownSelected ? n.delete(k) : n.add(k)));
                  return n;
                })}
              />
              Select all{filter !== 'all' ? ' (this tag)' : ''}
            </label>
            {selected.size > 0 && (
              <>
                <span className="adm-count">{selected.size} selected</span>
                <button type="button" className="adm-btn" onClick={() => startEdit([...selected])} disabled={busy}>Change tag</button>
                <button type="button" className="adm-btn danger" onClick={delSelected} disabled={busy}>Delete selected ({selected.size})</button>
                <button type="button" className="adm-btn" onClick={() => setSelected(new Set())}>Clear</button>
              </>
            )}
          </div>
        )}
        {loading && <p>Loading…</p>}
        {!loading && shown.length === 0 && <p>No photos yet.</p>}
        <div className="adm-grid">
          {shown.map((i) => (
            <figure key={i.key} className={selected.has(i.key) ? 'sel' : ''}>
              <label className="adm-pick" title="Select">
                <input type="checkbox" checked={selected.has(i.key)} onChange={() => toggle(i.key)} aria-label="Select photo" />
              </label>
              <img src={i.src} alt={i.title || i.tag} loading="lazy" onClick={() => toggle(i.key)} />
              <figcaption>
                <b>{i.tag}</b>
                <span>{i.title}</span>
              </figcaption>
              <div className="adm-actions">
                <button type="button" onClick={() => startEdit([i.key])}>Edit</button>
                <button type="button" className="adm-del" onClick={() => del(i)}>Delete</button>
              </div>
            </figure>
          ))}
        </div>
      </section>

      {editing && (
        <div className="adm-modal" role="dialog" aria-modal="true" onClick={(ev) => { if (ev.target === ev.currentTarget && !busy) setEditing(null); }}>
          <div className="adm-card adm-edit">
            <h2>{editing.single ? 'Edit photo' : `Change tag for ${editing.keys.length} photos`}</h2>
            {editing.single && (
              <label>
                Caption
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={120} placeholder="Caption (optional)" />
              </label>
            )}
            <label>
              Tag / category
              <select value={editing.tagChoice} onChange={(e) => setEditing({ ...editing, tagChoice: e.target.value })}>
                {editTags.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                <option value={NEW_TAG}>+ New tag…</option>
              </select>
            </label>
            {editing.tagChoice === NEW_TAG && (
              <label>
                New tag name
                <input value={editing.newTag} onChange={(e) => setEditing({ ...editing, newTag: e.target.value })} maxLength={40} placeholder="e.g. Mehendi Makeup" autoFocus />
              </label>
            )}
            {error && <p className="adm-err">{error}</p>}
            <div className="adm-modal-btns">
              <button type="button" className="adm-btn" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
              <button type="button" className="btn btn-copper" onClick={saveEdit} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
