import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene2Traditional: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  // Desaturated brownish overlay
  const shake = Math.sin(frame * 1.2) * (frame > 70 ? 3 : 1);

  const stats = [
    {text: "6 MESES", delay: 8, icon: "📅"},
    {text: "20 DESARROLLADORES", delay: 22, icon: "👥"},
    {text: "500.000€", delay: 38, icon: "💸"},
  ];

  // Buzzer flash at end
  const buzzerFlash = frame > 75 ? interpolate(frame, [75, 80, 85, 90], [0, 0.4, 0, 0], {extrapolateRight: "clamp"}) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: "#1a1208"}}>
      {/* Desaturated warm overlay */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(180,140,60,0.12) 0%, transparent 70%)",
      }} />

      {/* Buzzer red flash */}
      <AbsoluteFill style={{backgroundColor: `rgba(239,68,68,${buzzerFlash})`}} />

      <AbsoluteFill style={{
        justifyContent: "center", alignItems: "flex-start",
        paddingLeft: 80, paddingTop: 400,
        transform: `translateX(${shake}px)`,
      }}>
        {/* Office icons */}
        <div style={{fontSize: 50, marginBottom: 40, opacity: 0.7}}>🏢 💼 ☕ 😤</div>

        {/* Stats cascading from left */}
        {stats.map(({text, delay, icon}, i) => {
          const s = spring({fps, frame: Math.max(0, frame - delay), config: {damping: 10, stiffness: 180}});
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              marginBottom: 28,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-120, 0])}px)`,
            }}>
              <div style={{fontSize: 36}}>{icon}</div>
              <div style={{
                fontSize: 52, fontWeight: 900, color: "#ef4444",
                fontFamily: "'Montserrat', sans-serif",
                textShadow: "0 2px 15px rgba(239,68,68,0.4), 0 2px 4px rgba(0,0,0,0.8)",
              }}>
                {text}
              </div>
            </div>
          );
        })}

        {/* Subtext */}
        <div style={{
          fontSize: 24, color: "rgba(255,255,255,0.4)",
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
          marginTop: 20, fontStyle: "italic",
          opacity: interpolate(frame, [55, 70], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
        }}>
          Modelo consultora tradicional
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
