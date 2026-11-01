import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import Admin from './pages/Admin.jsx';

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id && document.getElementById(id);
    if (el) el.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <ScrollToHash />
    </>
  );
}
