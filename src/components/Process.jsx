import { STEPS } from '../data/site.js';

export default function Process() {
  return (
    <section>
      <div className="wrap">
        <div className="head"><div className="eyebrow">How it works</div><h2>Booking in <span className="script">four steps</span></h2></div>
        <div className="steps">
          {STEPS.map(s => (
            <div key={s.title} className="step"><h3>{s.title}</h3><p>{s.text}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
