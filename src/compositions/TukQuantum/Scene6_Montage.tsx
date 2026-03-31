import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

const panels = [
  {title: "Dashboard", icon: "📊", desc: "Métricas en tiempo real", color: "#3b82f6", gridBg: "#0c1a3a"},
  {title: "Pipeline", icon: "🔄", desc: "Datos fluyendo", color: "#06f5d0", gridBg: "#0a1a1a"},
  {title: "Clientes", icon: "👤", desc: "Gestión completa", color: "#8b5cf6", gridBg: "#1a0a2a"},
  {title: "Móvil", icon: "📱", desc: "100% responsive", color: "#f59e0b", gridBg: "#1a1408"},
];

const sectors = [
  {icon: "☀️", text: "ENERGÍAS RENOVABLES", color: "#f59e0b"},
  {icon: "🚛", text: "LOGÍSTICA", color: "#3b82f6"},
  {icon: "🏭", text: "INDUSTRIA", color: "#06f5d0"},
];

export const Scene6Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  // Which panel is active (4 panels across 150 frames)
  const panelDuration = 37;
  const activePanelIdx = Math.min(3, Math.floor(frame / panelDuration));

  // Sector labels at bottom
  const sectorDelay = [60, 90, 120];

  return (
    <AbsoluteFill style={{backgroundColor: "#050510"}}>
      {/* Animated data grid background */}
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(rgba(6,245,208,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,245,208,0.04) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `0 ${-frame * 0.8}px`,
      }} />

      {/* Active panel - quick cut mockup */}
      {panels.map((panel, i) => {
        const isActive = activePanelIdx === i;
        const panelFrame = frame - i * panelDuration;
        const enterScale = isActive ? spring({fps, frame: Math.max(0, panelFrame), config: {damping: 12, stiffness: 180}}) : 0;

        if (!isActive) return null;
        return (
          <AbsoluteFill key={i} style={{justifyContent: "center", alignItems: "center"}}>
            <div style={{
              width: 900, height: 600, borderRadius: 20,
              backgroundColor: panel.gridBg, border: `2px solid ${panel.color}30`,
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              gap: 20, opacity: enterScale,
              transform: `scale(${interpolate(enterScale, [0, 1], [0.9, 1])})`,
              boxShadow: `0 0 60px ${panel.color}20, inset 0 0 60px ${panel.color}05`,
            }}>
              <div style={{fontSize: 80}}>{panel.icon}</div>
              <div style={{
                fontSize: 40, fontWeight: 800, color: panel.color,
                fontFamily: "'Montserrat', sans-serif",
              }}>{panel.title}</div>
              <div style={{
                fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.5)",
                fontFamily: "'Montserrat', sans-serif",
              }}>{panel.desc}</div>

              {/* Fake data bars */}
              <div style={{display: "flex", gap: 8, marginTop: 10}}>
                {[0.7, 0.5, 0.9, 0.6, 0.8].map((h, j) => (
                  <div key={j} style={{
                    width: 40, height: h * 80,
                    backgroundColor: `${panel.color}60`, borderRadius: 4,
                    transform: `scaleY(${interpolate(Math.max(0, panelFrame - 5), [0, 15], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})})`,
                    transformOrigin: "bottom",
                  }} />
                ))}
              </div>
            </div>
          </AbsoluteFill>
        );
      })}

      {/* Sector labels at bottom */}
      <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 120}}>
        <div style={{display: "flex", flexDirection: "column", gap: 12, alignItems: "center"}}>
          {sectors.map(({icon, text, color}, i) => {
            const s = spring({fps, frame: Math.max(0, frame - sectorDelay[i]), config: {damping: 12, stiffness: 100}});
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                backgroundColor: "rgba(0,0,0,0.7)", padding: "8px 24px",
                borderRadius: 30, border: `1px solid ${color}40`,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}>
                <div style={{fontSize: 22}}>{icon}</div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color,
                  fontFamily: "'Montserrat', sans-serif", letterSpacing: 2,
                }}>{text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
