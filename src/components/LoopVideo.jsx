import { useEffect, useRef, useState } from 'react';
import './LoopVideo.css';

// Muted video that loops forever. The file starts downloading only when the
// section is close to the screen, and it pauses while it is off screen.
export default function LoopVideo({ src, className = '', label }) {
  const boxRef = useRef(null);
  const vidRef = useRef(null);
  const [load, setLoad] = useState(false);
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setLoad(true); return undefined; }
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLoad(true); near.disconnect(); }
    }, { rootMargin: '800px 0px' });
    const view = new IntersectionObserver(([e]) => {
      const v = vidRef.current;
      if (!v) return;
      if (e.isIntersecting && !reduced) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.2 });
    near.observe(el);
    view.observe(el);
    return () => { near.disconnect(); view.disconnect(); };
  }, [reduced]);

  return (
    <div ref={boxRef} className={'ph loopvid ' + className} role="img" aria-label={label}>
      {load && (
        <video
          ref={vidRef}
          src={reduced ? src + '#t=0.1' : src}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
        />
      )}
    </div>
  );
}
