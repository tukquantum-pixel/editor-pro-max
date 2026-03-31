import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene3Nosotros: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  const enter = spring({fps, frame: Math.max(0, frame - 15), config: {damping: 8, stiffness: 200}});

  // RGB Glitch effect: offset channels
  const glitchActive = frame > 15 && frame < 40;
  const glitchOffset = glitchActive ? Math.sin(frame * 3) * 6 : 0;
  const glitchOffset2 = glitchActive ? Math.cos(frame * 4) * 4 : 0;

  // Scanline effect
  const scanlineY = (frame * 8) % 1920;

  return (
    <AbsoluteFill style={{backgroundColor: "#050510"}}>
      {/* Screen glow */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 60%, rgba(6,245,208,0.06) 0%, transparent 50%)",
      }} />

      {/* Subtle scanline */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: scanlineY, height: 2,
        backgroundColor: "rgba(6,245,208,0.08)",
      }} />

      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{textAlign: "center"}}>
          {/* People icons */}
          <div style={{
            fontSize: 70, marginBottom: 40,
            opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: "clamp"}),
          }}>
            👨‍💻 👨‍💻
          </div>

          {/* "NOSOTROS?" with RGB glitch */}
          <div style={{position: "relative", height: 120}}>
            {/* Red channel */}
            {glitchActive && (
              <div style={{
                position: "absolute", width: "100%",
                fontSize: 90, fontWeight: 900, color: "rgba(255,0,0,0.6)",
                fontFamily: "'Montserrat', sans-serif",
                transform: `translate(${glitchOffset}px, ${-glitchOffset2}px)`,
                mixBlendMode: "screen",
              }}>
                NOSOTROS?
              </div>
            )}
            {/* Blue channel */}
            {glitchActive && (
              <div style={{
                position: "absolute", width: "100%",
                fontSize: 90, fontWeight: 900, color: "rgba(0,100,255,0.6)",
                fontFamily: "'Montserrat', sans-serif",
                transform: `translate(${-glitchOffset}px, ${glitchOffset2}px)`,
                mixBlendMode: "screen",
              }}>
                NOSOTROS?
              </div>
            )}
            {/* Main text */}
            <div style={{
              position: "relative",
              fontSize: 90, fontWeight: 900, color: "#ffffff",
              fontFamily: "'Montserrat', sans-serif",
              opacity: enter,
              transform: `scale(${interpolate(enter, [0, 1], [0.5, 1])})`,
              textShadow: "0 0 40px rgba(6,245,208,0.3)",
            }}>
              NOSOTROS?
            </div>
          </div>

          {/* Beat indicator */}
          <div style={{
            width: interpolate(frame, [40, 60], [0, 300], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
            height: 3, backgroundColor: "#06f5d0",
            margin: "40px auto 0",
            boxShadow: "0 0 20px rgba(6,245,208,0.5)",
          }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
