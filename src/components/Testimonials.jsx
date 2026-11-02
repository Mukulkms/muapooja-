import { useCallback, useEffect, useRef, useState } from 'react';
import { TESTIMONIALS } from '../data/site.js';

const DELAY = 4500; // ms between automatic moves

export default function Testimonials() {
  const [list, setList] = useState(TESTIMONIALS);
  const [anim, setAnim] = useState({ tick: 0, dir: 'next' });
  const paused = useRef(false);
  const timer = useRef(0);
  const touchX = useRef(null);

  const go = useCallback(dir => {
    setAnim(a => ({ tick: a.tick + 1, dir }));
    setList(l => (dir === 'next' ? [...l.slice(1), l[0]] : [l[l.length - 1], ...l.slice(0, -1)]));
  }, []);

  // (re)start the auto-move timer
  const start = useCallback(() => {
    clearInterval(timer.current);
    if (TESTIMONIALS.length < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = setInterval(() => {
      if (!paused.current && !document.hidden) go('next');
    }, DELAY);
  }, [go]);

  useEffect(() => {
    start();
    return () => clearInterval(timer.current);
  }, [start]);

  const manual = dir => { go(dir); start(); }; // clicking an arrow restarts the timer

  const pause = () => { paused.current = true; };
  const resume = () => { paused.current = false; };

  const onTouchStart = e => { pause(); touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
    touchX.current = null;
    if (Math.abs(dx) > 40) manual(dx < 0 ? 'next' : 'prev');
    resume();
  };

  return (
    <section>
      <div className="wrap">
        <div className="tbox">
          <div className="head" style={{ marginBottom: 40 }}><div className="eyebrow">Testimonials</div><h2>What my clients say</h2></div>
          <div
            className="tslider"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocus={pause}
            onBlur={resume}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button className="arrow arrow-prev" aria-label="Previous testimonial" onClick={() => manual('prev')}>←</button>
            <div key={anim.tick} className={`tcards${anim.tick ? ` slide-${anim.dir}` : ''}`}>
              {list.map(t => (
                <article key={t.name} className="tcard">
                  <div className="q">“</div>
                  <p>{t.text}</p>
                  <div className="who"><span className="av"></span><div><b>{t.name}</b><small>{t.role}</small></div><span className="stars">★★★★★</span></div>
                </article>
              ))}
            </div>
            <button className="arrow arrow-next" aria-label="Next testimonial" onClick={() => manual('next')}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}