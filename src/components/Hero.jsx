import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERO_STATS } from '../data/site.js';

// phones / small screens get the portrait video, everything else gets the wide one
const MOBILE_Q = '(max-width: 768px)';
const isMobile = () => typeof window !== 'undefined' && window.matchMedia(MOBILE_Q).matches;

export default function Hero() {
  const vref = useRef(null);
  const [muted, setMuted] = useState(true);
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_Q);
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // a new <video> is created when the source changes, so reset the sound button too
  useEffect(() => {
    setMuted(true);
    const v = vref.current;
    if (v && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.removeAttribute('autoplay');
      v.pause();
    }
  }, [mobile]);

  const toggleSound = () => {
    const v = vref.current;
    v.muted = !v.muted;
    if (!v.muted) v.play();
    setMuted(v.muted);
  };

  return (
    <section className="hero">
      {/* public/main.mp4 = desktop / wide screens, public/mobilemain.mp4 = phones */}
      <video
        key={mobile ? 'mobile' : 'desktop'}
        ref={vref}
        className="hero-video"
        src={mobile ? '/mobilemain.mp4' : '/main.mp4'}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
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
