import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CircularCarousel from './CircularCarousel.jsx';
import { useGallery } from '../hooks/useGallery.js';
import { SOCIAL } from '../data/site.js';

export default function GalleryPreview() {
  const { photos, loading } = useGallery();

  // the cylinder needs a few cards to look right, so repeat short lists
  const items = useMemo(() => {
    let list = photos.map(p => ({ src: p.src, alt: p.title || p.tag || 'Makeup look', title: p.title || p.tag }));
    if (!list.length) return list;
    const base = list;
    while (list.length < 8) list = list.concat(base);
    return list;
  }, [photos]);

  return (
    <section id="work">
      <div className="wrap">
        <div className="head"><div className="eyebrow">My work</div><h2>A Gallery of <span className="script">Elegance</span></h2><p className="lead">A glimpse of my work, where beauty meets perfection.</p></div>
      </div>
      {!loading && items.length > 0 && (
        <div className="flexcar">
          <CircularCarousel
            items={items}
            preset="cylinder"
            intro="rise"
            cardWidth={220}
            aspectRatio={1}
            speed={14}
            captions={false}
            gap={25}
            tilt={-5}
            curve={1}
            perspective={2500}
            autoplay="drift"
            interval={3}
            direction="left"
            momentum={0.6}
            snap
            pauseOnHover
            focusOnClick
            draggable
            parallax={0.3}
            stretch={0.5}
            fadeColor="#fbe4dd"
            depthFade={0.55}
            innerShade={0.6}
            cornerRadius={12}
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
