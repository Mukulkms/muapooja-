import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SOCIAL } from '../data/site.js';

export default function Header({ variant = 'home' }) {
  const isHome = variant === 'home';
  const location = useLocation();
  const [solid, setSolid] = useState(!isHome);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isHome) { setSolid(true); return; }
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [isHome]);

  useEffect(() => setOpen(false), [location]);

  const links = [
    ['Home', '/#home'],
    ['About', '/#about'],
    ['Services', '/#services'],
    isHome ? ['My work', '/#work'] : ['Gallery', '/gallery'],
    ['Charges', '/#pricing'],
    ['Contact', '/#contact'],
  ];

  return (
    <header className={(solid ? 'solid' : '') + (isHome ? '' : ' sticky')}>
      <div className="wrap nav">
        <Link to="/#home" className="logo">
          <b>R</b>
          <div><span>Pooja Rajput</span><small>Makeup Artist</small></div>
        </Link>
        <nav className={'links' + (open ? ' open' : '')} id="links">
          {links.map(([label, to]) => (
            <Link key={label} to={to} className={to === '/gallery' ? 'on' : undefined}>{label}</Link>
          ))}
        </nav>
        <div className="nav-r">
          <div className="ic">
            <a href={SOCIAL.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></svg></a>
            <a href={SOCIAL.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></svg></a>
          </div>
          <Link to="/#contact" className="btn btn-dark">Book now →</Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><i></i><i></i></button>
        </div>
      </div>
    </header>
  );
}
