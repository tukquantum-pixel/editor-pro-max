import {AbsoluteFill, useCurrentFrame} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  loadGoogleFont("Montserrat");

  const text = "¿CUÁNTO TARDA HACER UN ERP?";
  const charsToShow = Math.min(Math.floor(frame / 1.8), text.length);
  const displayText = text.slice(0, charsToShow);
  const cursorBlink = Math.round(frame / 8) % 2 === 0 ? 1 : 0;
  const isTyping = charsToShow < text.length;

  // Ticking visual: pulsing ring
  const tickScale = 1 + Math.sin(frame * 0.6) * 0.05;
  const tickOpacity = 0.3 + Math.sin(frame * 0.6) * 0.2;

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {/* Subtle ticking ring */}
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{
          width: 160, height: 160, borderRadius: "50%",
          border: `2px solid rgba(6,245,208,${tickOpacity})`,
          transform: `scale(${tickScale})`,
          display: "flex", justifyContent: "center", alignItems: "center",
          marginBottom: 80,
        }}>
          <div style={{fontSize: 60}}>⏱️</div>
        </div>
      </AbsoluteFill>

      {/* Main typewriter text */}
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center", marginTop: 160}}>
        <div style={{
          fontSize: 52, fontWeight: 900, color: "#ffffff",
          fontFamily: "'Montserrat', sans-serif",
          textAlign: "center", padding: "0 60px",
          textShadow: "0 2px 20px rgba(0,0,0,0.8)",
        }}>
          {displayText}
          <span style={{
            color: "#06f5d0",
            opacity: isTyping ? cursorBlink : 0,
            fontWeight: 100,
          }}>|</span>
        </div>
      </AbsoluteFill>

      {/* Tick marks at bottom */}
      <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 200}}>
        <div style={{display: "flex", gap: 4}}>
          {Array.from({length: 20}, (_, i) => (
            <div key={i} style={{
              width: 3, height: i % 5 === 0 ? 20 : 10,
              backgroundColor: `rgba(6,245,208,${frame > i * 4 ? 0.6 : 0.1})`,
              borderRadius: 1,
            }} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
