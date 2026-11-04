import { CONTACT, PHONE } from '../data/site.js';
import LoopVideo from './LoopVideo.jsx';

export default function Contact() {
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const msg = [
      'Hi Pooja, I want to book.',
      'Name: ' + f.get('n'),
      'Phone: ' + f.get('p'),
      'Date: ' + (f.get('d') || 'not decided'),
      'Service: ' + f.get('s'),
      'Message: ' + f.get('m'),
    ].join('\n');
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <section id="contact">
      <div className="wrap book">
        <LoopVideo src="/queen.mp4" className="book-img" label="Bridal makeup video" />
        <div className="left">
          <div className="eyebrow">Book an appointment</div>
          <h2>Let’s plan your <span className="script">perfect look</span></h2>
          <form className="form" onSubmit={submit}>
            <div className="frow"><input name="n" placeholder="Your name" required aria-label="Your name" /><input name="p" type="tel" placeholder="Phone number" required aria-label="Phone" /></div>
            <div className="frow">
              <input name="d" type="date" aria-label="Event date" />
              <select name="s" aria-label="Service">
                <option>Bridal Makeup</option><option>Airbrush Bridal Makeup</option><option>Engagement Makeup</option><option>HD Party Makeup</option><option>Hair Styling</option>
              </select>
            </div>
            <textarea name="m" placeholder="Venue, number of people, anything else…" aria-label="Message"></textarea>
            <button className="btn btn-copper" type="submit" style={{ justifySelf: 'start' }}>Send on WhatsApp →</button>
          </form>
          <div className="contact">
            <div><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>{CONTACT.phone}</div>
            <div><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></svg>{CONTACT.email}</div>
            <div><svg viewBox="0 0 24 24"><path d="M12 22s7-6.500 7-12a7 7 0 0 0-14 0c0 5.500 7 12 7 12z" /><circle cx="12" cy="10" r="2.500" /></svg>{CONTACT.place}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
