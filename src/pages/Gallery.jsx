import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { useGallery } from '../hooks/useGallery.js';
import { CATEGORIES } from '../data/categories.js';

const RATIO = ['r1', 'r2', 'r3', 'r4', 'r3', 'r1', 'r2', 'r3'];

function LbImage({ p }) {
  const [bad, setBad] = useState(!p.src);
  return bad
    ? <div className="lb-ph ph"></div>
    : <img src={p.src} alt={p.title || p.tag || ''} onError={() => setBad(true)} />;
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

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

      <div className={'lb' + (isOpen ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Photo viewer"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        <button ref={closeBtn} className="lb-x" aria-label="Close" onClick={close}>×</button>
        <button className="lb-p" aria-label="Previous photo" onClick={() => step(-1)}>←</button>
        <div className="lb-stage">
          {curItem && <LbImage key={cur} p={curItem} />}
          {curItem && <div className="lb-cap">{curItem.title || labels[curItem.cat]} · {pos} / {visible.length}</div>}
        </div>
        <button className="lb-n" aria-label="Next photo" onClick={() => step(1)}>→</button>
      </div>
    </div>
  );
}
