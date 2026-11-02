import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { useGallery } from '../hooks/useGallery.js';
import { CATEGORIES } from '../data/categories.js';
import './Gallery.css';

const RATIO = ['r1', 'r2', 'r3', 'r4', 'r3', 'r1', 'r2', 'r3'];

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Full-screen photo viewer: zoom buttons, mouse wheel, double-tap, pinch, drag to pan, swipe to change photo
function Viewer({ open, item, resetKey, caption, pos, total, onClose, onStep, closeRef }) {
  const [view, setView] = useState({ s: 1, x: 0, y: 0, anim: false });
  const [bad, setBad] = useState(false);
  const viewRef = useRef(view);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const ptrs = useRef(new Map());
  const g = useRef({ mode: 'none' });
  const lastTap = useRef(null);

  // new photo / reopened: back to normal size
  useEffect(() => {
    const v = { s: 1, x: 0, y: 0, anim: false };
    viewRef.current = v;
    setView(v);
    setBad(!item?.src);
  }, [resetKey, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const bounds = (s) => {
    const st = stageRef.current;
    const im = imgRef.current;
    if (!st || !im) return { mx: 0, my: 0 };
    return {
      mx: Math.max(0, (im.offsetWidth * s - st.clientWidth) / 2),
      my: Math.max(0, (im.offsetHeight * s - st.clientHeight) / 2),
    };
  };

  const apply = (s, x, y, anim = false) => {
    s = clamp(s, MIN_ZOOM, MAX_ZOOM);
    const { mx, my } = bounds(s);
    const v = { s, x: s === 1 ? 0 : clamp(x, -mx, mx), y: s === 1 ? 0 : clamp(y, -my, my), anim };
    viewRef.current = v;
    setView(v);
  };

  // zoom keeping the point (cx, cy) - measured from the screen centre - under the finger/mouse
  const zoomAt = (ns, cx, cy, anim = false) => {
    const v = viewRef.current;
    ns = clamp(ns, MIN_ZOOM, MAX_ZOOM);
    apply(ns, cx - (ns / v.s) * (cx - v.x), cy - (ns / v.s) * (cy - v.y), anim);
  };

  const fromCentre = (clientX, clientY) => {
    const r = stageRef.current.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };

  const zoomIn = () => zoomAt(viewRef.current.s * 1.5, 0, 0, true);
  const zoomOut = () => zoomAt(viewRef.current.s / 1.5, 0, 0, true);
  const reset = () => apply(1, 0, 0, true);

  // mouse wheel / trackpad pinch
  useEffect(() => {
    const st = stageRef.current;
    if (!open || !st) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const c = fromCentre(e.clientX, e.clientY);
      zoomAt(viewRef.current.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), c.x, c.y, false);
    };
    st.addEventListener('wheel', onWheel, { passive: false });
    return () => st.removeEventListener('wheel', onWheel);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-' || e.key === '_') zoomOut();
      else if (e.key === '0') reset();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { stageRef.current.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = viewRef.current;
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      g.current = {
        mode: 'pinch',
        d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        s0: v.s,
        t0: { x: v.x, y: v.y },
        c0: fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2),
      };
    } else if (ptrs.current.size === 1) {
      g.current = { mode: 'one', x0: e.clientX, y0: e.clientY, t0: { x: v.x, y: v.y }, moved: false, onImg: e.target === imgRef.current };
    }
  };

  const onPointerMove = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const G = g.current;
    if (G.mode === 'pinch' && ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const c = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      const ns = clamp((G.s0 * d) / G.d0, MIN_ZOOM, MAX_ZOOM);
      apply(ns, c.x - (ns / G.s0) * (G.c0.x - G.t0.x), c.y - (ns / G.s0) * (G.c0.y - G.t0.y));
    } else if (G.mode === 'one') {
      const dx = e.clientX - G.x0;
      const dy = e.clientY - G.y0;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) G.moved = true;
      if (viewRef.current.s > 1) apply(viewRef.current.s, G.t0.x + dx, G.t0.y + dy);
    }
  };

  const onPointerUp = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.delete(e.pointerId);
    const G = g.current;
    if (G.mode === 'pinch') {
      g.current = { mode: 'none' };
      if (viewRef.current.s < 1.05) apply(1, 0, 0, true);
      return;
    }
    if (G.mode !== 'one') return;
    g.current = { mode: 'none' };
    if (e.type === 'pointercancel') return;
    const dx = e.clientX - G.x0;
    const dy = e.clientY - G.y0;
    const v = viewRef.current;
    if (G.moved) {
      // swipe to next / previous photo (only when not zoomed in)
      if (v.s === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) onStep(dx < 0 ? 1 : -1);
      return;
    }
    // a tap
    const now = performance.now();
    const lt = lastTap.current;
    if (lt && now - lt.t < 320 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
      lastTap.current = null;
      if (v.s > 1) reset();
      else {
        const c = fromCentre(e.clientX, e.clientY);
        zoomAt(2.5, c.x, c.y, true);
      }
      return;
    }
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    if (!G.onImg && v.s === 1) onClose(); // tap on the dark area closes
  };

  const zoomed = view.s > 1.01;

  return (
    <div className={'pv' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div
        ref={stageRef}
        className="pv-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {item && (bad
          ? <div className="pv-ph ph"></div>
          : (
            <img
              key={resetKey}
              ref={imgRef}
              className={'pv-img' + (view.anim ? ' anim' : '')}
              src={item.src}
              alt={item.title || item.tag || ''}
              draggable={false}
              onError={() => setBad(true)}
              style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})` }}
            />
          ))}
      </div>

      <div className="pv-top">
        <span className="pv-count">{total ? `${pos} / ${total}` : ''}</span>
        <div className="pv-zoom">
          <button type="button" className="pv-btn" aria-label="Zoom out" onClick={zoomOut} disabled={!zoomed}>−</button>
          <button type="button" className="pv-btn pv-pct" aria-label="Reset zoom" onClick={reset}>{Math.round(view.s * 100)}%</button>
          <button type="button" className="pv-btn" aria-label="Zoom in" onClick={zoomIn} disabled={view.s >= MAX_ZOOM - 0.01}>+</button>
        </div>
        <button ref={closeRef} type="button" className="pv-btn pv-x" aria-label="Close" onClick={onClose}>×</button>
      </div>

      <button type="button" className="pv-btn pv-nav pv-prev" aria-label="Previous photo" onClick={() => onStep(-1)}>←</button>
      <button type="button" className="pv-btn pv-nav pv-next" aria-label="Next photo" onClick={() => onStep(1)}>→</button>
      {caption && <div className="pv-cap">{caption}</div>}
    </div>
  );
}

export default function Gallery() {
  const { photos, loading } = useGallery();
  const [filter, setFilter] = useState('all');
  const [cur, setCur] = useState(null); // index into photos, or null when closed
  const lastFocus = useRef(null);
  const closeBtn = useRef(null);
  const isOpen = cur !== null;

  useEffect(() => { document.title = 'Gallery of Elegance – Mua Pooja Rajput'; }, []);

  // filter buttons: label = tag typed in admin (or the preset label)
  const { cats, labels } = useMemo(() => {
    const labels = {};
    photos.forEach(p => {
      if (!labels[p.cat]) {
        labels[p.cat] = p.tag || CATEGORIES.find(c => c.id === p.cat)?.label || p.cat.charAt(0).toUpperCase() + p.cat.slice(1);
      }
    });
    return { cats: ['all', ...Object.keys(labels)], labels };
  }, [photos]);

  const visible = useMemo(
    () => photos.map((p, i) => ({ ...p, i })).filter(p => filter === 'all' || p.cat === filter),
    [photos, filter]
  );

  const open = (i) => { lastFocus.current = document.activeElement; setCur(i); };
  const close = () => { setCur(null); lastFocus.current?.focus(); };
  const step = (d) => {
    if (!visible.length) return;
    const pos = Math.max(0, visible.findIndex(p => p.i === cur));
    setCur(visible[(pos + d + visible.length) % visible.length].i);
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const curItem = isOpen ? photos[cur] : null;
  const pos = isOpen ? visible.findIndex(p => p.i === cur) + 1 : 0;

  return (
    <div className="gpage">
      <Header variant="gallery" />
      <main>
        <div className="wrap">
          <div className="gtop">
            <div className="eyebrow">My work</div>
            <h1>Gallery of <span className="script">Elegance</span></h1>
            <p className="lead">A glimpse of my work, where beauty meets perfection.</p>
            {cats.length > 1 && (
              <div className="chips">
                {cats.map(c => (
                  <button key={c} type="button" className={'chip' + (c === filter ? ' on' : '')} onClick={() => setFilter(c)}>
                    {c === 'all' ? 'All' : labels[c]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {!loading && photos.length === 0 && <p className="lead" style={{ paddingBottom: 80, textAlign: 'center' }}>Photos coming soon.</p>}
          <div className="masonry">
            {visible.map(p => (
              <button key={p.key || p.i} type="button" className={'m ' + RATIO[p.i % RATIO.length]} aria-label={'Open photo: ' + (p.title || p.tag)} onClick={() => open(p.i)}>
                <div className="ph" style={p.src ? { '--img': `url('${p.src}')` } : undefined}></div>
                <span className="cap">{p.title || labels[p.cat]}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="gfoot">
        <div className="wrap gfoot-in">
          <Link to="/">← Back to home</Link>
          <small>© 2026 Pooja Rajput. All rights reserved.</small>
        </div>
      </footer>

      <Viewer
        open={isOpen}
        item={curItem}
        resetKey={cur}
        caption={curItem ? (curItem.title || labels[curItem.cat]) : ''}
        pos={pos}
        total={visible.length}
        onClose={close}
        onStep={step}
        closeRef={closeBtn}
      />
    </div>
  );
}