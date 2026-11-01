import { Fragment } from 'react';

// Seamless text marquee: two identical groups, track scrolls -50%.
export default function Marquee({ items, big = false, label }) {
  const group = (hidden) => (
    <div className="mgroup" aria-hidden={hidden || undefined}>
      {items.map((it, i) => {
        const text = typeof it === 'string' ? it : it.text;
        const script = typeof it === 'object' && it.script;
        return (
          <Fragment key={i}>
            <span>{script ? <b className="script">{text}</b> : text}</span>
            <i>✦</i>
          </Fragment>
        );
      })}
    </div>
  );
  return (
    <div className={'marquee' + (big ? ' big' : '')} aria-label={label} aria-hidden={big || undefined}>
      <div className="mtrack">{group(false)}{group(true)}</div>
    </div>
  );
}
