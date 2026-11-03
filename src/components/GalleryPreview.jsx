import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DriftWall from './DriftWall.jsx';
import { useGallery } from '../hooks/useGallery.js';
import { SOCIAL } from '../data/site.js';

const MAX_SLIDES = 10; // home wall never shows more than 10 photos

export default function GalleryPreview() {
  const { photos, loading } = useGallery();
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const on = () => setCols(mq.matches ? 2 : 4);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const items = useMemo(
    () => photos.slice(0, MAX_SLIDES).map(p => ({ image: p.src, title: p.title || p.tag || 'Makeup look' })),
    [photos]
  );

  return (
    <section id="work">
      <div className="wrap">
        <div className="head"><div className="eyebrow">My work</div><h2>A Gallery of <span className="script">Elegance</span></h2><p className="lead">A glimpse of my work, where beauty meets perfection.</p></div>
      </div>
      {!loading && items.length > 0 && (
        <div className="flexcar">
          <DriftWall
            items={items}
            columns={cols}
            tileWidth={cols === 2 ? 150 : 220}
            tileHeight={cols === 2 ? 200 : 290}
            gap={16}
            radius={14}
            tilt={14}
            turn={-12}
            perspective={1200}
            depth={100}
            speed={34}
            direction="up"
            variance={0.4}
            parallax={0.5}
            pauseOnHover
            lift={50}
            fade={0.6}
            dim={0.7}
            overlayColor="#fbe4dd"
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