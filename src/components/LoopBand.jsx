import TextLoop from './TextLoop.jsx';
import './LoopBand.css';

// Flowing ribbon of text shown just above the Bridal Services section
export default function LoopBand() {
  return (
    <div className="loopband">
      <div className="loopband-in">
        <TextLoop
          text="Bridal Makeup ✦ HD Makeup ✦ Hairstyling ✦ Mua Pooja Rajput"
          shape="wave"
          speed={70}
          direction="forward"
          separator="✦"
          curviness={55}
          tilt={0}
          fontSize={38}
          fontWeight={500}
          letterSpacing={5}
          uppercase
          ribbon
          ribbonColor="#b4604b"
          ribbonWidth={84}
          color="#ffffff"
          cross
          crossColor="#f2bfb4"
          crossAngle={14}
          edgeFade={0}
          pauseOnHover
        />
      </div>
    </div>
  );
}
