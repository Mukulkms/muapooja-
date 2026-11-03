import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DriftWall from './DriftWall.jsx';
import { useGallery } from '../hooks/useGallery.js';
import { SOCIAL } from '../data/site.js';

const MAX_SLIDES = 10; // carousel never shows more than 10 slides

export default function GalleryPreview() {
  const { photos, loading } = useGallery();
  const [cols, setCols] = useState(6);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const on = () => setCols(mq.matches ? 3 : 6);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

    const items = useMemo(() => {
    // max 10 photos on the home page wall
    return photos.slice(0, MAX_SLIDES).map(p => ({ image: p.src, title: p.title || p.tag || 'Makeup look' }));
  }, [photos]);

  return (
    <section id="work">
      <div className="wrap">
        <div className="head"><div className="eyebrow">My work</div><h2>A Gallery of <span className="script">Elegance</span></h2><p className="lead">A glimpse of my work, where beauty meets perfection.</p></div>
      </div>
      {!loading && items.length > 0 && (
        <div className="flexcar" style={{ height: 600 }}>
          <DriftWall
            items={items}
            columns={cols}
            tileWidth={cols === 6 ? 280 : 150}
            tileHeight={cols === 6 ? 220 : 120}
            gap={12}
            radius={11}
            tilt={18}
            turn={-14}
            roll={-8}
            perspective={1800}
            depth={120}
            speed={32}
            direction="down"
            variance={0.3}
            parallax={0.6}
            pauseOnHover={false}
            lift={64}
            fade={0.15}
            dim={1}
            grayscale={false}
            overlayColor="#060010"
          />
        </div>
      )}
      <div className="wrap">
        <div className="center" style={{ marginTop: 44 }}>
          <Link to="/gallery" className="btn btn-copper">View full gallery →</Link>
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-line">Instagram</a>
        </div>
      </div>
    </section>
  );
}