import { useEffect } from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import About from '../components/About.jsx';
import LoopBand from '../components/LoopBand.jsx';
import Services from '../components/Services.jsx';
import Pricing from '../components/Pricing.jsx';
import Process from '../components/Process.jsx';
import GalleryPreview from '../components/GalleryPreview.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Faq from '../components/Faq.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import FloatingButtons from '../components/FloatingButtons.jsx';
import { SERVICE_MARQUEE, BIG_MARQUEE } from '../data/site.js';

export default function Home() {
  useEffect(() => {
    document.title = 'Mua Pooja Rajput – Bridal Makeup Artist in Ghaziabad & Delhi NCR';
  }, []);
  return (
    <>
      <Header variant="home" />
      <main id="home">
        <Hero />
        <Marquee items={SERVICE_MARQUEE} label="Services" />
        <About />
        <LoopBand />
        <Services />
        <GalleryPreview />
        <Pricing />
        <Process />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Marquee items={BIG_MARQUEE} big />
      <Footer />
      <FloatingButtons />
    </>
  );
}
