import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {ParticleField} from "../../components/backgrounds/ParticleField";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene7Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  // Logo scale 0.8 → 1
  const logoScale = spring({fps, frame, config: {damping: 12, stiffness: 80}});
  const scale = interpolate(logoScale, [0, 1], [0.8, 1]);
  const glowPulse = 0.5 + Math.sin(frame * 0.08) * 0.5;

  return (
    <AbsoluteFill style={{backgroundColor: "#020108"}}>
      <ParticleField count={120} color="rgba(6,245,208,0.15)" speed={0.4} direction="up" />

      {/* Central radial glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 45%, rgba(6,245,208,${0.08 * glowPulse}) 0%, transparent 40%)`,
      }} />

      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{
          textAlign: "center",
          opacity: logoScale,
          transform: `scale(${scale})`,
        }}>
          {/* TUK Logo */}
          <div style={{
            fontSize: 110, fontWeight: 900, color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif", letterSpacing: 18,
            textShadow: `0 0 ${80 * glowPulse}px rgba(6,245,208,0.6), 0 0 160px rgba(6,245,208,0.2)`,
          }}>
            TUK
          </div>

          {/* Divider line */}
          <div style={{
            width: interpolate(frame, [15, 45], [0, 350], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
            height: 2, backgroundColor: "rgba(6,245,208,0.5)",
            margin: "25px auto", boxShadow: "0 0 15px rgba(6,245,208,0.4)",
          }} />

          {/* QUANTUM INTELLIGENCE */}
          <div style={{
            fontSize: 32, fontWeight: 700, color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif", letterSpacing: 8,
            opacity: interpolate(frame, [25, 45], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            QUANTUM INTELLIGENCE
          </div>

          {/* SYSTEMS */}
          <div style={{
            fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.5)",
            fontFamily: "'Montserrat', sans-serif", letterSpacing: 10, marginTop: 8,
            opacity: interpolate(frame, [35, 55], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            SYSTEMS
          </div>

          {/* URL */}
          <div style={{
            fontSize: 22, fontWeight: 600, color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif", marginTop: 50, letterSpacing: 2,
            opacity: interpolate(frame, [50, 70], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            tukquantum.com
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.3)",
            fontFamily: "'Montserrat', sans-serif", marginTop: 30, letterSpacing: 3,
            opacity: interpolate(frame, [70, 90], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            Deep Tech • Zaragoza • IA Cuántica
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
