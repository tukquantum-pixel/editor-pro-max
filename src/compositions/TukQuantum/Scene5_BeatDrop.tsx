import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export const Scene5BeatDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  // Beat drop white flash
  const flash = interpolate(frame, [0, 3, 12], [0.9, 1, 0], {extrapolateRight: "clamp"});

  // Reveal effect: text slides up from behind a mask
  const revealMain = spring({fps, frame: Math.max(0, frame - 5), config: {damping: 8, stiffness: 200}});
  const revealSub = spring({fps, frame: Math.max(0, frame - 14), config: {damping: 10, stiffness: 150}});

  // Line decorations
  const lineWidth = interpolate(frame, [5, 30], [0, 500], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {/* Flash overlay */}
      <AbsoluteFill style={{backgroundColor: `rgba(255,255,255,${flash})`}} />

      {/* Radial pulse from center */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 50%, rgba(6,245,208,${0.1 * revealMain}) 0%, transparent 50%)`,
      }} />

      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{textAlign: "center"}}>
          {/* Top accent line */}
          <div style={{
            width: lineWidth, height: 3, backgroundColor: "#06f5d0",
            margin: "0 auto 50px", boxShadow: "0 0 20px rgba(6,245,208,0.6)",
          }} />

          {/* "3 DÍAS." - reveal effect */}
          <div style={{overflow: "hidden", height: 130}}>
            <div style={{
              fontSize: 120, fontWeight: 900, color: "#ffffff",
              fontFamily: "'Montserrat', sans-serif",
              transform: `translateY(${interpolate(revealMain, [0, 1], [130, 0])}px)`,
              textShadow: "0 0 80px rgba(6,245,208,0.4), 0 4px 0 rgba(6,245,208,0.2)",
              letterSpacing: -2,
            }}>
              3 DÍAS.
            </div>
          </div>

          {/* "ERP USABLE." - delayed reveal */}
          <div style={{overflow: "hidden", height: 65, marginTop: 10}}>
            <div style={{
              fontSize: 52, fontWeight: 700, color: "#06f5d0",
              fontFamily: "'Montserrat', sans-serif",
              transform: `translateY(${interpolate(revealSub, [0, 1], [65, 0])}px)`,
              letterSpacing: 4,
            }}>
              ERP USABLE.
            </div>
          </div>

          {/* Bottom accent line */}
          <div style={{
            width: lineWidth, height: 3, backgroundColor: "#06f5d0",
            margin: "50px auto 0", boxShadow: "0 0 20px rgba(6,245,208,0.6)",
          }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
