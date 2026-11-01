import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data/site.js';

export default function Services() {
  const [active, setActive] = useState(0);
  const cur = SERVICES[active];
  return (
    <section id="services">
      <div className="wrap">
        <div className="head">
          <div className="eyebrow">My services</div>
          <h2>Bridal <span className="script">Services</span></h2>
          <p className="lead">Wedding hairstyles, makeup and much more for the most spectacular events. Convenient on-site services to meet your beauty needs.</p>
        </div>
        <div className="svcwrap">
          <div className="slist">
            {SERVICES.map((s, i) => (
              <Link key={s.name} to="/#pricing" className={'srow' + (i === active ? ' on' : '')}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                <div><h3>{s.name}</h3><p>{s.desc}</p></div>
                <span className="from">{s.from}</span>
                <i className="go">→</i>
              </Link>
            ))}
          </div>
          {/* Preview image changes on hover. Set img in data/site.js SERVICES */}
          <div className="ph spreview" data-label={cur.name} style={cur.img ? { '--img': `url('${cur.img}')` } : undefined}></div>
        </div>
      </div>
    </section>
  );
}
