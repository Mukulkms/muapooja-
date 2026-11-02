import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './BrushCursor.css';

const SIZE = 50;
const TIP_X = SIZE * 0.89; // bristle tip inside the 64px image
const TIP_Y = SIZE * 0.18;
const DUST = ['#ff7fb5', '#ffb3d1', '#f6c177', '#fff1e6', '#d98d78'];
const INTERACTIVE = 'a,button,[role="button"],summary,label,select,.btn,[data-cc-index]';
const TEXT_FIELD = 'input,textarea,select,[contenteditable="true"]';

export default function BrushCursor() {
  const { pathname } = useLocation();
  const ref = useRef(null);
  const enabled = !pathname.startsWith('/admin');

  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const el = ref.current;
    if (!enabled || !fine || !el) return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    document.documentElement.classList.add('brush-cursor-on');

    const mouse = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let tilt = 0;
    let raf = 0;
    let seen = false;

    const frame = () => {
      const k = reduced ? 1 : 0.28; // smoothing
      const dx = mouse.x - pos.x;
      pos.x += dx * k;
      pos.y += (mouse.y - pos.y) * k;
      const target = reduced ? 0 : Math.max(-28, Math.min(28, dx * 1.6)) - 6;
      tilt += (target - tilt) * 0.2;
      el.style.transform = `translate3d(${pos.x - TIP_X}px, ${pos.y - TIP_Y}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onMove = e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        seen = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        el.setAttribute('data-show', '');
      }
      const t = e.target;
      const field = t.closest?.(TEXT_FIELD);
      if (field) el.removeAttribute('data-show');
      else if (seen) el.setAttribute('data-show', '');
      if (t.closest?.(INTERACTIVE)) el.setAttribute('data-hover', '');
      else el.removeAttribute('data-hover');
    };
    const onDown = e => {
      el.setAttribute('data-down', '');
      if (reduced || e.target.closest?.(TEXT_FIELD)) return;
      for (let i = 0; i < 9; i++) {
        const s = document.createElement('span');
        s.className = 'brush-dust';
        const a = Math.random() * Math.PI * 2;
        const d = 18 + Math.random() * 30;
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        s.style.background = DUST[i % DUST.length];
        s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
        s.style.setProperty('--dy', `${Math.sin(a) * d - 8}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 700);
      }
    };
    const onUp = () => el.removeAttribute('data-down');
    const onLeave = () => el.removeAttribute('data-show');
    const onEnter = () => seen && el.setAttribute('data-show', '');

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('brush-cursor-on');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="brush-cursor" aria-hidden="true">
      <img className="brush-cursor__img" src="/brush-cursor.png" alt="" draggable={false} />
    </div>
  );
}
