import {AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const Scene4Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  loadGoogleFont("Montserrat");

  // Agents spawn from center, expand outward
  const agentCount = Math.min(700, Math.floor(frame * 15));
  const expansionProgress = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{backgroundColor: "#020108"}}>
      {/* Central glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 50%, rgba(6,245,208,${0.15 * (1 - expansionProgress * 0.5)}) 0%, transparent 40%)`,
      }} />

      {/* Agent particles - fractal network */}
      <svg width={width} height={height} style={{position: "absolute"}}>
        {/* Connection lines first (behind particles) */}
        {Array.from({length: Math.min(200, agentCount)}, (_, i) => {
          const cx = width / 2 + (seededRandom(i * 7 + 1) - 0.5) * width * expansionProgress;
          const cy = height / 2 + (seededRandom(i * 7 + 2) - 0.5) * height * expansionProgress;
          const j = (i * 7 + 3) % Math.max(1, agentCount);
          const cx2 = width / 2 + (seededRandom(j * 7 + 1) - 0.5) * width * expansionProgress;
          const cy2 = height / 2 + (seededRandom(j * 7 + 2) - 0.5) * height * expansionProgress;
          const dist = Math.sqrt((cx2 - cx) ** 2 + (cy2 - cy) ** 2);
          if (dist > 180) return null;
          return (
            <line key={`l${i}`} x1={cx} y1={cy} x2={cx2} y2={cy2}
              stroke="rgba(6,245,208,0.06)" strokeWidth={0.5} />
          );
        })}

        {/* Particles */}
        {Array.from({length: agentCount}, (_, i) => {
          const targetX = seededRandom(i * 7 + 1) * width;
          const targetY = seededRandom(i * 7 + 2) * height;
          const cx = interpolate(expansionProgress, [0, 1], [width / 2, targetX]);
          const cy = interpolate(expansionProgress, [0, 1], [height / 2, targetY]);
          const size = 1 + seededRandom(i * 7 + 3) * 2.5;
          const pulse = Math.sin(frame * 0.12 + i * 0.05) * 0.3 + 0.7;
          const hue = 160 + seededRandom(i * 7 + 4) * 30;

          return (
            <circle key={i}
              cx={cx + Math.sin(frame * 0.06 + i) * 2}
              cy={cy + Math.cos(frame * 0.06 + i) * 2}
              r={size} fill={`hsla(${hue}, 85%, 60%, ${pulse * 0.75})`}
            />
          );
        })}
      </svg>

      {/* Counter + text overlay */}
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{textAlign: "center"}}>
          <div style={{
            fontSize: 110, fontWeight: 900, color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif",
            textShadow: "0 0 80px rgba(6,245,208,0.6), 0 0 160px rgba(6,245,208,0.2)",
            letterSpacing: -2,
          }}>
            {agentCount}
          </div>
          <div style={{
            fontSize: 34, fontWeight: 800, color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif", marginTop: 10,
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            opacity: interpolate(frame, [20, 35], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            AGENTES DE IA
          </div>
          <div style={{
            fontSize: 26, fontWeight: 600, color: "rgba(6,245,208,0.7)",
            fontFamily: "'Montserrat', sans-serif", marginTop: 8,
            letterSpacing: 3,
            opacity: interpolate(frame, [30, 45], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}>
            TRABAJANDO EN PARALELO
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
