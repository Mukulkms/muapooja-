import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERO_STATS } from '../data/site.js';

export default function Hero() {
  const vref = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = vref.current;
    if (v && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.removeAttribute('autoplay');
      v.pause();
    }
  }, []);

  const toggleSound = () => {
    const v = vref.current;
    v.muted = !v.muted;
    if (!v.muted) v.play();
    setMuted(v.muted);
  };

  return (
    <section className="hero">
      {/* Put your video at public/main.mp4 (10–20 sec, under 6 MB) and a poster at public/images/hero-poster.jpg */}
      <video ref={vref} className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="/images/hero-poster.jpg">
        <source src="/main.mp4" type="video/mp4" />
      </video>
      <div className="hero-shade"></div>
      <div className="wrap hero-in">
        <div className="hero-text">
          <div className="tag">Look beautiful · Feel confident</div>
          <h1>Wedding Makeup <span className="script">Artist in Ghaziabad</span></h1>
          <p>I am Pooja, owner of MUA Pooja Rajput, based in Delhi NCR. I work with what your heart truly wants, so you feel like the best version of yourself on your big day.</p>
          <div className="cta-row">
            <Link to="/#contact" className="btn btn-copper">Book now →</Link>
            <Link to="/#work" className="btn btn-line">See my work</Link>
          </div>
        </div>
      </div>
      <button className="vbtn" type="button" onClick={toggleSound}>{muted ? 'Sound on' : 'Sound off'}</button>
      <div className="wrap">
        <div className="hstats">
          {HERO_STATS.map(s => (
            <div key={s.big}><b>{s.big}</b><span>{s.small}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
