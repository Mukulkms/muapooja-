// Edit THIS file to change the photos on the home-page gallery AND on /gallery.
// src   = path to your photo (put photos in public/images/ and use '/images/name.jpg')
// cat   = bridal | engagement | party   (used for the filter buttons)
// title = small caption shown on hover / in the viewer
const PHOTOS = [
  { src: '/images/look1.jpg',  cat: 'bridal',     title: 'Bridal Look' },
  { src: '/images/look2.jpg',  cat: 'party',      title: 'HD Party Makeup' },
  { src: '/images/look3.jpg',  cat: 'engagement', title: 'Engagement Look' },
  { src: '/images/look4.jpg',  cat: 'bridal',     title: 'Airbrush Bridal' },
  { src: '/images/look5.jpg',  cat: 'bridal',     title: 'Bridal Look' },
  { src: '/images/look6.jpg',  cat: 'party',      title: 'HD Party Makeup' },
  { src: '/images/look7.jpg',  cat: 'engagement', title: 'Engagement Look' },
  { src: '/images/look8.jpg',  cat: 'bridal',     title: 'Bridal Look' },
  { src: '/images/look9.jpg',  cat: 'party',      title: 'HD Party Makeup' },
  { src: '/images/look10.jpg', cat: 'engagement', title: 'Engagement Look' },
  { src: '/images/look11.jpg', cat: 'bridal',     title: 'Bridal Look' },
  { src: '/images/look12.jpg', cat: 'party',      title: 'HD Party Makeup' },
];

// Placeholder tiles if the list above is ever empty
const FALLBACK = (() => {
  const cc = ['bridal', 'party', 'engagement'];
  const tt = { bridal: 'Bridal Look', party: 'HD Party', engagement: 'Engagement' };
  return Array.from({ length: 12 }, (_, i) => ({ src: '', cat: cc[i % 3], title: tt[cc[i % 3]] }));
})();

export const GALLERY = PHOTOS.length ? PHOTOS : FALLBACK;
