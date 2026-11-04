import { useEffect, useRef, useState } from 'react';
import { SERVICES } from '../data/site.js';
import './Services.css';

export default function Services() {
  const [active, setActive] = useState(0);   // row under the mouse -> its photo is shown on the right (desktop)
  const [prev, setPrev] = useState(null);    // photo that was showing before (kept underneath so fades never flash)
  const [open, setOpen] = useState(null);    // phone / tablet: tapped row -> small photo opens under it
  const [wide, setWide] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1101px)').matches)); // desktop layout (big preview visible)
  const [bad, setBad] = useState(() => new Set());  // previews that failed to load -> use the original photo instead
  const [ready, setReady] = useState(false); // true once the section is close to the screen -> photos are preloaded
  const rootRef = useRef(null);

  // desktop or phone layout (same breakpoint as the CSS)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // start downloading every photo a little BEFORE the section is on screen, so hovering is instant
  useEffect(() => {
    const el = rootRef.current;
    if (!el || ready) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setReady(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setReady(true); io.disconnect(); } }, { rootMargin: '1600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  const select = i => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };
  const choose = i => {
    select(i);
    setOpen(o => (o === i ? null : i));
  };
  const onKey = (e, i) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(i);
    }
  };

  const cur = SERVICES[active];

  return (
    <section id="services" ref={rootRef}>
      <div className="wrap">
        <div className="head">
          <div className="eyebrow">My services</div>
          <h2>Bridal <span className="script">Services</span></h2>
          <p className="lead">Wedding hairstyles, makeup and much more for the most spectacular events. Convenient on-site services to meet your beauty needs.</p>
        </div>
        <div className="svcwrap">
          <div className="slist" onPointerEnter={() => setReady(true)}>
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                role="button"
                tabIndex={0}
                aria-expanded={open === i}
                className={'srow' + (i === active ? ' on' : '') + (i === open ? ' open' : '')}
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => choose(i)}
                onKeyDown={e => onKey(e, i)}
              >
                <div className="sinfo"><h3>{s.name}</h3><p>{s.desc}</p></div>
                <span className="from">{s.from}</span>
                {/* phone / tablet only: "Expand" + arrow, the photo opens under the row */}
                <span className="sexpand" aria-hidden="true">
                  <span className="sexpand-txt">Expand</span>
                  <svg className="sexpand-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </span>
                {/* small passport-size photo, only on phones / tablets (tiny files, preloaded) */}
                <span className="sthumb" aria-hidden="true">
                  <span className="sthumb-in">
                    <span className="sthumb-card">
                      {!wide && (ready || i === open) && (s.thumb || s.img) && (
                        <img className="sthumb-img" src={s.thumb || s.img} alt="" draggable={false} decoding="async" />
                      )}
                      <span className="sthumb-meta">
                        <b>{s.name}</b>
                        <em>{s.from}</em>
                      </span>
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Desktop preview: every photo is already loaded and stacked, hovering just fades between them */}
          <div className="ph spreview" role="img" aria-label={cur.name}>
            {wide && SERVICES.map((s, i) => {
              const url = bad.has(i) ? s.img : (s.preview || s.img);
              if (!url || !(ready || i === active)) return null;
              return (
                <div key={s.name} className={'sp-layer' + (i === active ? ' on' : i === prev ? ' prev' : '')}>
                  <img src={url} alt={`${s.name} by Pooja Rajput`} draggable={false} decoding="async" fetchpriority={i === active ? 'high' : 'low'} onError={() => { if (!bad.has(i) && s.img && url !== s.img) setBad(b => new Set(b).add(i)); }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
