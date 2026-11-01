import { useEffect, useState } from 'react';
import { GALLERY as FALLBACK } from '../data/gallery.js';

// Loads photos from /api/gallery (Backblaze). If the API is not available
// (e.g. plain `npm run dev`), it falls back to src/data/gallery.js.
export function useGallery() {
  const [state, setState] = useState({ photos: [], loading: true });

  useEffect(() => {
    let off = false;
    fetch('/api/gallery')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('api'))))
      .then((d) => {
        if (off) return;
        const photos = (d.items || []).map((i) => ({ key: i.key, src: i.src, cat: i.cat, tag: i.tag, title: i.title || '' }));
        setState({ photos, loading: false });
      })
      .catch(() => {
        if (!off) setState({ photos: FALLBACK, loading: false });
      });
    return () => { off = true; };
  }, []);

  return state;
}
