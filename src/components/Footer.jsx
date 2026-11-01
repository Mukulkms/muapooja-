import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <Link to="/#home" className="logo"><b>R</b><div><span>Pooja Rajput</span><small>Makeup Artist</small></div></Link>
        <div className="tagline">Be Beautiful. Be You. ♡</div>
        <div className="fr">
          <nav>
            <Link to="/#home">Home</Link><Link to="/#about">About</Link><Link to="/#services">Services</Link><Link to="/#work">My work</Link><Link to="/#pricing">Charges</Link><Link to="/#contact">Contact</Link>
          </nav>
          <small>© 2026 Pooja Rajput. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
