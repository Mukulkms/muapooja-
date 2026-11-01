import { useState } from 'react';
import { TESTIMONIALS } from '../data/site.js';

export default function Testimonials() {
  const [list, setList] = useState(TESTIMONIALS);
  const next = () => setList(l => [...l.slice(1), l[0]]);
  const prev = () => setList(l => [l[l.length - 1], ...l.slice(0, -1)]);
  return (
    <section>
      <div className="wrap">
        <div className="tbox">
          <div className="head" style={{ marginBottom: 40 }}><div className="eyebrow">Testimonials</div><h2>What my clients say</h2></div>
          <div className="tslider">
            <button className="arrow" aria-label="Previous" onClick={prev}>←</button>
            <div className="tcards">
              {list.map(t => (
                <article key={t.name} className="tcard">
                  <div className="q">“</div>
                  <p>{t.text}</p>
                  <div className="who"><span className="av"></span><div><b>{t.name}</b><small>{t.role}</small></div><span className="stars">★★★★★</span></div>
                </article>
              ))}
            </div>
            <button className="arrow" aria-label="Next" onClick={next}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
