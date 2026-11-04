import { useEffect, useState } from 'react';
import { PHONE } from '../data/site.js';

export default function FloatingButtons() {
  const [show, setShow] = useState(false);
  const [bar, setBar] = useState(false);
  useEffect(() => {
    const on = () => { setShow(window.scrollY > 600); setBar(window.scrollY > 300); };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      {/* phones only: always-visible Call + WhatsApp bar (hidden on larger screens by CSS) */}
      <div className={'mbar' + (bar ? ' show' : '')}>
        <a className="mbar-call" href={'tel:+' + PHONE}>Call now</a>
        <a className="mbar-wa" href={'https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Hi Pooja, I want to check availability for my date.')} target="_blank" rel="noopener noreferrer">Check date on WhatsApp</a>
      </div>
      <a className="fab wa" href={'https://wa.me/' + PHONE} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.500 15.300L2 22l4.800-1.500A10 10 0 1 0 12 2zm5.300 14.100c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.100-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.200.1.400 0 .5l-.4.600c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.4.100.6-.1l.8-1c.2-.3.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.800-.1 1.300z" /></svg></a>
      <button className={'fab totop' + (show ? ' show' : '')} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </>
  );
}
