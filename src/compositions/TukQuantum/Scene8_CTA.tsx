import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  const enter = spring({fps, frame, config: {damping: 12, stiffness: 100}});

  // Fade to black in last 2 seconds (60 frames)
  const fadeOut = interpolate(frame, [90, 150], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  // Logo appears in corner for last 2 seconds
  const logoCorner = interpolate(frame, [90, 110], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <AbsoluteFill style={{
        background: "radial-gradient(circle at 50% 40%, rgba(6,245,208,0.06) 0%, transparent 45%)",
      }} />

      {/* Main CTA content */}
      <AbsoluteFill style={{
        justifyContent: "center", alignItems: "center",
        opacity: fadeOut,
      }}>
        <div style={{
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px)`,
        }}>
          {/* Pointing finger */}
          <div style={{fontSize: 60, marginBottom: 40}}>☝️</div>

          {/* Main text */}
          <div style={{
            fontSize: 54, fontWeight: 900, color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif",
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}>
            SÍGUENOS.
          </div>

          {/* Subtitle lines with delay */}
          <div style={{
            fontSize: 38, fontWeight: 700, color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif", marginTop: 25,
            opacity: interpolate(frame, [20, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
            transform: `translateY(${interpolate(frame, [20, 40], [20, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}px)`,
          }}>
            VAMOS A CAMBIAR
          </div>
          <div style={{
            fontSize: 38, fontWeight: 700, color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif", marginTop: 8,
            opacity: interpolate(frame, [30, 50], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
            transform: `translateY(${interpolate(frame, [30, 50], [20, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}px)`,
          }}>
            LA INDUSTRIA.
          </div>

          {/* Social handles */}
          <div style={{
            fontSize: 18, color: "rgba(255,255,255,0.4)",
            fontFamily: "'Montserrat', sans-serif", marginTop: 50, letterSpacing: 2,
            opacity: interpolate(frame, [45, 65], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            @tukquantum
          </div>
        </div>
      </AbsoluteFill>

      {/* Small logo in corner - appears last 2 seconds */}
      <div style={{
        position: "absolute", bottom: 60, right: 60,
        opacity: logoCorner * fadeOut,
        transform: `scale(${interpolate(logoCorner, [0, 1], [0.5, 1])})`,
      }}>
        <div style={{
          fontSize: 16, fontWeight: 800, color: "#06f5d0",
          fontFamily: "'Montserrat', sans-serif", letterSpacing: 4,
          textShadow: "0 0 20px rgba(6,245,208,0.4)",
        }}>
          TUK
        </div>
        <div style={{
          fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)",
          fontFamily: "'Montserrat', sans-serif", letterSpacing: 2,
        }}>
          QUANTUM
        </div>
      </div>
    </AbsoluteFill>
  );
};
