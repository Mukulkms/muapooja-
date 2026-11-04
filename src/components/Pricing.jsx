import { PRICES } from '../data/site.js';

export default function Pricing() {
  return (
    <section id="pricing">
      <div className="wrap">
        <div className="head"><div className="eyebrow">Charges</div><h2>Simple <span className="script">Pricing</span></h2></div>
        <div className="pricing">
          <div>
            {PRICES.map((p, i) => (
              <div key={p.name} className="price" style={i === PRICES.length - 1 ? { border: 0 } : undefined}>
                <div className="price-top"><h3>{p.name}</h3><div className="amt">{p.amt} <small>per function</small></div></div>
                <p>{p.desc}</p>
              </div>
            ))}
            <div className="note">Prices can change with venue, travel and number of people. Message me for an exact quote.</div>
          </div>
          <div className="ph" data-label="Bridal portrait" role="img" aria-label="Bridal portrait" style={{ '--img': "url('/br.jpeg')" }}></div>
        </div>
      </div>
    </section>
  );
}
