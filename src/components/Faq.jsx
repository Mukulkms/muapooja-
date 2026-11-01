import { FAQS } from '../data/site.js';

export default function Faq() {
  return (
    <section>
      <div className="wrap">
        <div className="head"><div className="eyebrow">FAQ</div><h2>Questions <span className="script">brides ask</span></h2></div>
        <div className="faq">
          {FAQS.map(f => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
