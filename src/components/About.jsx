import { Link } from 'react-router-dom';
import { ABOUT_TICKS } from '../data/site.js';

export default function About() {
  return (
    <section id="about">
      <div className="wrap about">
        <div className="about-imgs">
          <div className="ph a1" data-label="Pooja portrait"></div>
          <div className="ph a2" data-label="At work"></div>
        </div>
        <div className="left">
          <div className="eyebrow">About Pooja</div>
          <h2>Makeup that matches <span className="script">your vision</span></h2>
          <p>I have been working since 2016 and have adorned 250+ brides so far. I know that you know yourself better, so I am inclined to work with what your heart truly wants.</p>
          <p>I pride myself on my quality of work and flexibility. Every bride deserves makeup that matches her vision of the perfect bridal look, and I personalise each look using expert skills and a mix of conventional as well as new-age techniques.</p>
          <ul className="ticks">
            {ABOUT_TICKS.map(t => <li key={t}>{t}</li>)}
          </ul>
          <Link to="/#contact" className="btn btn-copper">Book now →</Link>
        </div>
      </div>
    </section>
  );
}
