
const PHOTOS = [
  { src: '/opt/bridal.webp',       cat: 'bridal',     title: 'Bridal Look' },
  { src: '/opt/s4.webp',           cat: 'airbrush',   title: 'Airbrush Bridal' },
  { src: '/opt/engagements.webp',  cat: 'engagement', title: 'Engagement Look' },
  { src: '/opt/s6.webp',           cat: 'party',      title: 'HD Party Makeup' },
  { src: '/opt/h4.webp',           cat: 'hair',       title: 'Hair Styling' },
  { src: '/opt/simplebride.webp',  cat: 'bridal',     title: 'Simple Bridal Look' },
];

// Placeholder tiles if the list above is ever empty
const FALLBACK = (() => {
  const cc = ['bridal', 'party', 'engagement'];
  const tt = { bridal: 'Bridal Look', party: 'HD Party', engagement: 'Engagement' };
  return Array.from({ length: 12 }, (_, i) => ({ src: '', cat: cc[i % 3], title: tt[cc[i % 3]] }));
})();

export const GALLERY = PHOTOS.length ? PHOTOS : FALLBACK;
