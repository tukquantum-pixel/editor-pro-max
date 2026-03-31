import {
  AbsoluteFill,
  Video,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  interpolate,
} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

type Caption = {startMs: number; endMs: number; text: string};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const typedCaptions: Caption[] = require("../../../public/captions-cut.json");

// Visual callouts during specific features of the demo
const featureHighlights = [
  {startMs: 2000, endMs: 8000, text: "📋 Formulario inteligente", icon: "✨", color: "#06f5d0"},
  {startMs: 15000, endMs: 21000, text: "📊 Datos auto-rellenados", icon: "⚡", color: "#3b82f6"},
  {startMs: 42000, endMs: 48000, text: "🎯 Listo en segundos", icon: "🚀", color: "#f59e0b"},
];

export const DemoCliente: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  const currentTimeMs = (frame / fps) * 1000;
  const totalDurationMs = 52700; // 52.7 seconds

  // Find the active caption
  const activeCaption = typedCaptions.find(
    (c) => currentTimeMs >= c.startMs && currentTimeMs < c.endMs
  );

  // Find active callout (can appear regardless of captions now)
  const activeCallout = featureHighlights.find(
    (c) => currentTimeMs >= c.startMs && currentTimeMs < c.endMs
  );

  // Progress through callout for animations
  const calloutProgress = activeCallout
    ? (currentTimeMs - activeCallout.startMs) /
      (activeCallout.endMs - activeCallout.startMs)
    : 0;

  // Zoom pulse happens all the time now (very subtly) to keep it dynamic
  const zoomPulse = 1 + Math.sin(frame * 0.03) * 0.005;

  // Corner badge pulse
  const badgePulse = 0.7 + Math.sin(frame * 0.08) * 0.3;

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {/* Video layer with subtle zoom during silence */}
      <Video
        src={staticFile("out/demo-final.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${zoomPulse})`,
        }}
      />

      {/* Audio narration layer */}
      <Audio src={staticFile("assets/narration-cut.mp3")} />

      {/* TUK Quantum badge - top left */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "8px 16px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1px solid rgba(6,245,208,${badgePulse * 0.3})`,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#06f5d0",
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: 2,
          }}
        >
          TUK
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          QUANTUM
        </div>
      </div>

      {/* Progress bar - bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(currentTimeMs / totalDurationMs) * 100}%`,
            backgroundColor: "#06f5d0",
            boxShadow: "0 0 10px rgba(6,245,208,0.5)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Silent moment callouts — animated badges */}
      {activeCallout && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "flex-end",
            paddingRight: 30,
            paddingBottom: 120,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: "14px 22px",
              borderRadius: 12,
              borderLeft: `3px solid ${activeCallout.color}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: interpolate(
                calloutProgress,
                [0, 0.1, 0.85, 1],
                [0, 1, 1, 0]
              ),
              transform: `translateX(${interpolate(
                calloutProgress,
                [0, 0.1, 0.85, 1],
                [40, 0, 0, 40]
              )}px)`,
              backdropFilter: "blur(8px)",
              boxShadow: `0 0 20px ${activeCallout.color}20`,
            }}
          >
            <div style={{fontSize: 28}}>{activeCallout.icon}</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {activeCallout.text}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Subtitles overlay - enhanced with animation */}
      {activeCaption && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: "14px 28px",
              borderRadius: 10,
              maxWidth: "90%",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(6,245,208,0.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: 1.5,
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              {activeCaption.text}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
