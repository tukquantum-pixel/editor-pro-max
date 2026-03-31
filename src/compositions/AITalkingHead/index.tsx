import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Video,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {Watermark} from "../../components/overlays/Watermark";
import {BRAND} from "../../presets/brand";

// --- Types ---
type Segment = {
  start: number;
  end: number;
  text: string;
  mood: string;
  keywords: string[];
  words?: {start: number; end: number; word: string}[];
};

type AssetSegment = {
  start: number;
  end: number;
  bg: {type: string; colors: string[]; direction: string};
  overlay: string;
  mood: string;
  lighting: {color: string; intensity: number};
  label: string;
};

type AssetsMap = {
  segments: AssetSegment[];
  defaults: {crossfadeDurationFrames: number; particleOpacity: number; glowRadius: number};
};

type GuionData = {
  segments: Segment[];
  captions: {startMs: number; endMs: number; text: string}[];
};

// --- Load JSONs ---
// eslint-disable-next-line @typescript-eslint/no-var-requires
const guionData: GuionData = require("../../../public/assets/guion_con_timestamps.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assetsMap: AssetsMap = require("../../../public/assets/assets_map.json");

// Load B-Roll map dynamically
let brollsMap: { start: number; end: number; path: string; keyword: string }[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  brollsMap = require("../../../public/assets/brolls_map.json");
} catch (e) {
  // Graceful fallback if no B-rolls exist yet
}

// Load Backgrounds map dynamically
let backgroundsMap: { start: number; end: number; path: string; mood: string; segment_index: number }[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  backgroundsMap = require("../../../public/assets/backgrounds_map.json");
} catch (e) {
  // Graceful fallback — will use CSS gradients
}

// --- Background with dark overlay for visual hierarchy (Fix #1) ---
const CinematicBackground: React.FC<{
  colors: string[];
  direction: string;
  nextColors?: string[];
  crossfadeProgress: number;
  glowColor: string;
}> = ({colors, direction, nextColors, crossfadeProgress, glowColor}) => {
  const frame = useCurrentFrame();

  // Very subtle hue drift — alive but not distracting
  const hueShift = Math.sin(frame * 0.003) * 2;

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${direction}, ${colors.join(", ")})`,
          filter: `hue-rotate(${hueShift}deg)`,
          opacity: nextColors ? 1 - crossfadeProgress : 1,
        }}
      />
      {/* Crossfade to next segment */}
      {nextColors && crossfadeProgress > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${direction}, ${nextColors.join(", ")})`,
            filter: `hue-rotate(${hueShift}deg)`,
            opacity: crossfadeProgress,
          }}
        />
      )}
      {/* FIX #1: Dark vignette overlay — kills visual competition */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)`,
        }}
      />
      {/* Additional darkening layer so subject ALWAYS pops */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />
      {/* Ambient light bleed from below — subtle environmental feel */}
      <div
        style={{
          position: "absolute",
          bottom: "22%", // Safe Zone: Moved up to avoid TikTok/Reels bottom UI interference
          left: 0,
          right: "15%", // Safe Zone: Avoid right-side interaction buttons
          display: "flex",
          background: `radial-gradient(ellipse at bottom, ${glowColor}15 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// --- Glitch Transition Effect (CSS-only, no GPU) ---
const GlitchTransition: React.FC<{progress: number; glowColor: string}> = ({progress, glowColor}) => {
  if (progress <= 0 || progress >= 1) return null;

  // Glitch intensity peaks in the middle of the transition
  const intensity = Math.sin(progress * Math.PI);
  const glitchShift = Math.sin(progress * 47) * 8 * intensity;
  const colorShift = Math.sin(progress * 31) * 4 * intensity;

  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 50}}>
      {/* Horizontal glitch bars */}
      {[0.15, 0.35, 0.6, 0.8].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${pos * 100}%`,
            left: 0,
            right: 0,
            height: `${2 + intensity * 6}px`,
            backgroundColor: `${glowColor}${Math.round(intensity * 60).toString(16).padStart(2, "0")}`,
            transform: `translateX(${glitchShift * (i % 2 === 0 ? 1 : -1)}px)`,
            mixBlendMode: "screen",
          }}
        />
      ))}
      {/* RGB split overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, 
            rgba(255,0,0,${intensity * 0.08}) 0%, 
            transparent 33%, 
            rgba(0,255,0,${intensity * 0.06}) 50%, 
            transparent 66%, 
            rgba(0,0,255,${intensity * 0.08}) 100%)`,
          transform: `translateX(${colorShift}px)`,
          mixBlendMode: "screen",
        }}
      />
      {/* Flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: intensity > 0.8 ? (intensity - 0.8) * 0.3 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// --- Caption Overlay v3: Studio Grade Triple-Layer Typography ---
const CaptionBlock: React.FC<{segment: Segment; currentTimeS: number; fps: number}> = ({segment, currentTimeS, fps}) => {
  if (!segment.words || segment.words.length === 0) return null;

  // Spring entrance (slide up from below)
  const segmentFrame = Math.max(0, (currentTimeS - segment.start) * fps);
  const enterSpring = spring({
    frame: segmentFrame,
    fps,
    durationInFrames: 20,
    config: {damping: 18, stiffness: 160},
  });

  const exitProgress = interpolate(
    currentTimeS,
    [segment.end - 0.2, segment.end],
    [1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const slideY = interpolate(enterSpring, [0, 1], [30, 0]);
  const visibility = enterSpring * exitProgress;
  const motionBlur = interpolate(enterSpring, [0, 0.5, 1], [4, 1, 0]);

  // Split words into: context (non-keyword) and keyword
  const keywordSet = new Set((segment.keywords || []).map(k => k.toLowerCase()));
  const contextWords: string[] = [];
  const keywordWords: string[] = [];
  const bannerWords: string[] = [];
  let hitKeyword = false;
  let afterKeyword = false;

  segment.words.forEach((w) => {
    const isKW = Array.from(keywordSet).some(k => w.word.toLowerCase().includes(k));
    if (isKW && !afterKeyword) {
      hitKeyword = true;
      keywordWords.push(w.word);
    } else if (hitKeyword && !isKW && keywordWords.length > 0 && !afterKeyword) {
      afterKeyword = true;
      bannerWords.push(w.word);
    } else if (afterKeyword) {
      bannerWords.push(w.word);
    } else {
      contextWords.push(w.word);
    }
  });

  // Keyword spring scale
  const kwFrame = keywordWords.length > 0
    ? Math.max(0, segmentFrame - 5) // Slight delay for impact
    : 0;
  const kwSpring = spring({
    frame: kwFrame,
    fps,
    durationInFrames: 25,
    config: {damping: 12, stiffness: 200},
  });
  const kwScale = interpolate(kwSpring, [0, 1], [0.3, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "32%", // FIX #1 SAFE AREA: Was 15% — hidden by Instagram/TikTok UI. 32% = above the danger zone
        left: "50%",
        transform: `translateX(-50%) translateY(${slideY}px)`,
        opacity: visibility,
        width: "90%",
        textAlign: "center",
        filter: motionBlur > 0.5 ? `blur(${motionBlur}px)` : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 30,
      }}
    >
      {/* Layer 1: Context words — emphasis-aware per-word rendering */}
      {contextWords.length > 0 && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            fontFamily: "'Montserrat', sans-serif",
            color: "rgba(255,255,255,0.85)",
            fontStyle: "italic",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            letterSpacing: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 5px",
          }}
        >
          {segment.words
            .filter(w => !Array.from(keywordSet).some(k => w.word.toLowerCase().includes(k)))
            .filter(w => contextWords.includes(w.word))
            .map((w, idx) => {
              const isEmphasized = (w as any).emphasis === true;
              const pitchRatio = (w as any).pitch_ratio || 1.0;
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: isEmphasized ? 30 : 24,
                    fontWeight: isEmphasized ? 800 : 500,
                    color: isEmphasized ? "#FFD700" : "rgba(255,255,255,0.85)",
                    textShadow: isEmphasized
                      ? "0 0 15px rgba(255,215,0,0.5), 0 2px 12px rgba(0,0,0,0.8)"
                      : "0 2px 12px rgba(0,0,0,0.8)",
                    transform: isEmphasized ? `scale(${1 + (pitchRatio - 1) * 0.3})` : "none",
                    display: "inline-block",
                    transition: "all 0.1s",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
        </div>
      )}

      {/* Layer 2: KEYWORD GIGANTE */}
      {keywordWords.length > 0 && (
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            fontFamily: "'Montserrat', sans-serif",
            color: "#00f5d0",
            textTransform: "uppercase",
            letterSpacing: 4,
            textShadow: "0 0 20px rgba(0,245,208,0.6), 0 0 60px rgba(0,245,208,0.3), 0 4px 20px rgba(0,0,0,0.8)",
            transform: `scale(${kwScale})`,
            lineHeight: 1.0,
          }}
        >
          {keywordWords.join(" ")}
        </div>
      )}

      {/* Layer 3: Banner de contraste (naranja) */}
      {bannerWords.length > 0 && (
        <div
          style={{
            backgroundColor: "#FF6B00",
            padding: "8px 28px",
            borderRadius: 6,
            marginTop: 4,
            boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              fontFamily: "'Montserrat', sans-serif",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: 2,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {bannerWords.join(" ")}
          </span>
        </div>
      )}

      {/* Fallback: If no keyword split happened, show all words classic style */}
      {keywordWords.length === 0 && contextWords.length === 0 && (
        <div
          style={{
            fontSize: "clamp(38px, 4.8vw, 64px)",
            fontWeight: 800,
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {segment.words.map((w, i) => {
            const isActive = currentTimeS >= w.start && currentTimeS <= w.end;
            const isPast = currentTimeS > w.end;
            return (
              <span
                key={i}
                style={{
                  color: isActive ? "#06f5d0" : isPast ? "#ffffff" : "rgba(255,255,255,0.4)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  textShadow: isActive ? "0 0 8px rgba(6,245,208,0.5)" : "none",
                  fontWeight: 700,
                  display: "inline-block",
                  transition: "transform 0.1s ease",
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Keyword CTA Callout ---
const KeywordCallout: React.FC<{keyword: string; color: string}> = ({keyword, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({frame, fps, durationInFrames: 45, config: {damping: 12}});

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 16,
        backgroundColor: "rgba(0,0,0,0.75)",
        padding: "8px 14px",
        borderRadius: 6,
        borderLeft: `3px solid ${color}`,
        opacity: interpolate(frame, [0, 10, 60, 80], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateX(${interpolate(progress, [0, 1], [30, 0])}px)`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        🔑 {keyword}
      </div>
    </div>
  );
};

// --- Floating Keyword (behind subject, Ali Abdaal style) ---
const FloatingKeyword: React.FC<{keyword: string; color: string; fps: number}> = ({keyword, color, fps}) => {
  const frame = useCurrentFrame();

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: 30,
    config: {damping: 18, stiffness: 100},
  });

  const scale = interpolate(enterSpring, [0, 1], [0.5, 1]);
  const opacity = interpolate(frame, [0, 15, 70, 90], [0, 0.25, 0.25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale}) skewY(-3deg)`,
        fontSize: 72,
        fontWeight: 900,
        fontFamily: "'Montserrat', sans-serif",
        color,
        opacity,
        textTransform: "uppercase",
        letterSpacing: 6,
        textShadow: `0 0 40px ${color}30`,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 10, // Behind subject (Z:20), in front of background (Z:0)
      }}
    >
      {keyword}
    </div>
  );
};

// --- Hook Headline (first 3 seconds — stops the scroll) ---
const HookHeadline: React.FC<{text: string; fps: number}> = ({text, fps}) => {
  const frame = useCurrentFrame();

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: 20,
    config: {damping: 14, stiffness: 200},
  });

  // Visible for ~3 seconds (90 frames at 30fps)
  const opacity = interpolate(frame, [0, 8, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideY = interpolate(enterSpring, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: "12%", // Safe area — above Instagram UI
        left: "8%",
        right: "8%",
        textAlign: "center",
        opacity,
        transform: `translateY(${slideY}px)`,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "'Montserrat', sans-serif",
          color: "#ffffff",
          textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.4)",
          lineHeight: 1.3,
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// --- B-Roll Component (with controlled degradation for visual cohesion) ---
const BRollOverlay: React.FC<{ broll: any, durationInFrames: number }> = ({ broll, durationInFrames }) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  
  // Quick fade in/out
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [0, 0.65, 0.65, 0], // FIX: Was 1.0 — now semi-transparent overlay, not full-screen takeover
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle continuous zoom
  const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.15]);

  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen" }}> {/* FIX: blend mode so B-roll lives INSIDE the visual universe */}
      <Video 
        src={staticFile(broll.path)} 
        muted 
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          // FIX: Controlled degradation — matches AI-processed subject texture
          filter: "brightness(0.7) contrast(1.15) saturate(0.7) blur(1.5px)",
        }}
        playbackRate={1.5}
      />
      {/* Grain overlay for texture cohesion */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)`,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// --- Sprint 3: Insert Overlay (Full-screen keyword card with neon frame) ---
const InsertOverlay: React.FC<{keyword: string; durationInFrames: number; color: string}> = ({keyword, durationInFrames, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Scale entrance
  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: 20,
    config: {damping: 14, stiffness: 180},
  });
  const scale = interpolate(enterSpring, [0, 1], [0.6, 1]);

  // Fade out — safe for short durations (prevents non-monotonic inputRange crash)
  const fadeIn = Math.min(8, Math.floor(durationInFrames * 0.2));
  const fadeOut = Math.min(10, Math.floor(durationInFrames * 0.2));
  const opacity = interpolate(
    frame,
    [0, fadeIn, Math.max(fadeIn + 1, durationInFrames - fadeOut), durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  // Glitch scanlines
  const glitchOffset = Math.sin(frame * 3.7) * 2;

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,10,0.92)",
        zIndex: 45,
      }}
    >
      {/* Neon frame border */}
      <div
        style={{
          position: "absolute",
          inset: "8%",
          border: `2px solid ${color}`,
          borderRadius: 12,
          boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}20`,
          opacity: 0.8,
        }}
      />

      {/* Main keyword text */}
      <div
        style={{
          transform: `scale(${scale}) translateX(${glitchOffset}px)`,
          textAlign: "center",
          padding: "0 10%",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "'Montserrat', sans-serif",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: 6,
            textShadow: `0 0 30px ${color}, 0 0 60px ${color}50, 0 4px 20px rgba(0,0,0,0.9)`,
            lineHeight: 1.1,
          }}
        >
          {keyword}
        </div>
      </div>

      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 8px)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// --- Sprint 4: Particle Field (floating geometric shapes) ---
const ParticleField: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();

  // Generate 12 deterministic particles
  const particles = Array.from({length: 12}, (_, i) => {
    const seed = (i * 7919 + 1) % 100; // Deterministic pseudo-random
    const x = (seed * 3.7) % 100;
    const baseY = (seed * 5.3 + 20) % 100;
    const size = 10 + (seed % 20);
    const speed = 0.3 + (seed % 5) * 0.15;
    const rotation = frame * speed * (i % 2 === 0 ? 1 : -1);
    const floatY = baseY + Math.sin(frame * 0.02 + i) * 8;
    const particleOpacity = 0.15 + (seed % 3) * 0.08;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${floatY}%`,
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          opacity: particleOpacity,
          transform: `rotate(${rotation}deg)`,
          filter: `drop-shadow(0 0 ${size / 3}px ${color}40)`,
          pointerEvents: "none",
        }}
      />
    );
  });

  return (
    <AbsoluteFill style={{zIndex: 15, pointerEvents: "none"}}>
      {particles}
    </AbsoluteFill>
  );
};

// --- Sprint 6: CTA Endcard (last 3 seconds — drives engagement) ---
const CTAEndCard: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: 25,
    config: {damping: 14, stiffness: 160},
  });

  const scale = interpolate(enterSpring, [0, 1], [0.5, 1]);
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bouncing arrow animation
  const arrowBounce = Math.sin(frame * 0.3) * 12;

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: 50,
        paddingBottom: "20%", // Safe Zone: TikTok/IG Bottom Caption UI
        paddingRight: "15%",  // Safe Zone: TikTok/IG Right Button UI
      }}
    >
      {/* Main CTA text */}
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: "'Montserrat', sans-serif",
            color: "rgba(255,255,255,0.7)",
            marginBottom: 12,
            letterSpacing: 2,
          }}
        >
          ¿Te ha servido?
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontFamily: "'Montserrat', sans-serif",
            color,
            textTransform: "uppercase",
            letterSpacing: 4,
            textShadow: `0 0 30px ${color}, 0 0 60px ${color}40`,
            lineHeight: 1.1,
          }}
        >
          SÍGUEME
        </div>
      </div>

      {/* Animated arrow */}
      <div
        style={{
          marginTop: 24,
          transform: `translateY(${arrowBounce}px)`,
          fontSize: 48,
          color,
          filter: `drop-shadow(0 0 12px ${color})`,
        }}
      >
        ↓
      </div>
    </AbsoluteFill>
  );
};

// --- Main Composition v2 ---
export const AITalkingHead: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Montserrat");

  const currentTimeS = frame / fps;

  // Find current asset segment
  const currentAsset = assetsMap.segments.find(
    (s) => currentTimeS >= s.start && currentTimeS < s.end
  ) ?? assetsMap.segments[assetsMap.segments.length - 1];

  const currentIdx = assetsMap.segments.indexOf(currentAsset);
  const nextAsset = assetsMap.segments[currentIdx + 1];

  // FIX #3: Longer crossfade (30 frames = 1 second) for imperceptible transitions
  const crossfadeFrames = 30;
  const segmentEndFrame = currentAsset.end * fps;
  const crossfadeProgress = nextAsset
    ? interpolate(
        frame,
        [segmentEndFrame - crossfadeFrames, segmentEndFrame],
        [0, 1],
        {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
      )
    : 0;

  // Find active caption segment
  const activeSegment = guionData.segments.find(
    (s) => currentTimeS >= s.start && currentTimeS <= s.end
  );

  // Keyword detection
  const activeKeywordSegment = guionData.segments.find(
    (s) => currentTimeS >= s.start && currentTimeS <= s.end && s.keywords.length > 0
  );

  // FIX #2: Dynamic glow that responds to the segment
  const glowColor = currentAsset.lighting.color;
  const glowIntensity = currentAsset.lighting.intensity;

  // FIX #5: Micro-interaction — glow pulses when there's a keyword
  const hasKeyword = activeKeywordSegment && currentTimeS >= activeKeywordSegment.start;
  const glowPulse = hasKeyword
    ? 1 + Math.sin(frame * 0.15) * 0.3
    : 1;
  const effectiveGlowRadius = 6 * glowIntensity * glowPulse;

  // === PRO EFFECT 1: Slow Zoom (100% → 108% per segment for cinematic depth) ===
  const segmentProgress = interpolate(
    currentTimeS,
    [currentAsset.start, currentAsset.end],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const slowZoom = 1 + segmentProgress * 0.08;

  // === PRO EFFECT 1.5: Breathing Zoom (Sine Wave micro-motion — FIX #3) ===
  // Eliminates the "estatua" effect by adding constant ±1.5% scale breathing
  const breathingZoom = 1 + Math.sin(frame * 0.06) * 0.015; // ±1.5% every ~100 frames // 1.0 → 1.08

  // === PRO EFFECT 2: Keyword Punch-In Zoom ===
  // damping: 20 = smooth, professional movement (not "saltarín")
  const keywordZoomFrame = hasKeyword
    ? Math.max(0, (currentTimeS - activeKeywordSegment!.start) * fps)
    : 0;
  const keywordZoom = hasKeyword
    ? spring({
        frame: keywordZoomFrame,
        fps,
        durationInFrames: 30,
        config: {damping: 20, stiffness: 100},
      })
    : 0;
  const punchInScale = 1 + keywordZoom * 0.12; // 1.0 → 1.12 on keyword

  // Combined scale — used for proportional blur compensation
  const totalScale = slowZoom * breathingZoom * punchInScale; // FIX #3: Added breathing zoom

  // === PRO EFFECT 3: Transitions — Glitch ONLY on mood changes, crossfade otherwise ===
  // FIX: Glitch overuse "kills retention" — reserved for mood shifts only
  const currentMood = currentAsset.mood || "neutral";
  const nextMood = nextAsset?.mood || currentMood;
  const isMoodChange = currentMood !== nextMood;
  const glitchProgress = isMoodChange ? crossfadeProgress : 0; // Only glitch on mood transitions
  // Clean crossfade for same-mood transitions happens via CinematicBackground's own crossfade

  // === PRO EFFECT 4: Alternating zoom pacing (~2s rhythm) ===
  // === PRO EFFECT 4: Alternating zoom pacing (~2s rhythm) ===
  // Jump cuts on every other segment to force visual reset (1.0 vs 1.15)
  const activeSegmentIndex = guionData.segments.findIndex(
    s => currentTimeS >= s.start && currentTimeS <= s.end
  );
  const jumpCutScale = (activeSegmentIndex !== -1 && activeSegmentIndex % 2 !== 0) ? 1.15 : 1.0;
  
  // Subtle sine wave movement to prevent 100% static holding between cuts
  const pacingZoom = 1 + Math.sin(currentTimeS * Math.PI * 0.5) * 0.02; // ±2% subtle

  // === PRO EFFECT 5: Shake on energetic mood ===
  const isEnergetic = currentAsset.mood === "energetic";
  const shakeX = isEnergetic ? Math.sin(frame * 1.7) * 2 : 0;
  const shakeY = isEnergetic ? Math.cos(frame * 2.3) * 1.5 : 0;

  // === HOOK: Visual Disruptor (0-1s) ===
  // Aggressive initial punch-in to stop the scroll
  const hookZoom = interpolate(frame, [0, 8, 20, 90], [1.25, 1.25, 1.08, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Brightness flash at frame 0→10 to grab attention
  const hookFlash = interpolate(frame, [0, 10], [1.5, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isHookPhase = frame < 90;
  const hookScale = isHookPhase ? hookZoom : 1.0;

  // Get first segment text for hook headline
  const hookText = guionData.segments[0]?.text?.split(" ").slice(0, 8).join(" ") || "";



  return (
    <AbsoluteFill style={{
      backgroundColor: "#000",
      // GLOBAL LUT: Unifies chromatic universe (subject + background + stock)
      // sepia(0.08) warms everything slightly, saturate(1.15) adds vibrancy
      filter: "saturate(1.15) contrast(1.05) sepia(0.08)",
    }}>
      {/* Layer 0: Cinematic background with dark overlay + vignette */}
      <CinematicBackground
        colors={currentAsset.bg.colors}
        direction={currentAsset.bg.direction}
        nextColors={nextAsset?.bg.colors}
        crossfadeProgress={crossfadeProgress}
        glowColor={glowColor}
      />

      {/* Layer 0.3: Pexels Themed Video Background (replaces gradients when available) */}
      {backgroundsMap.length > 0 && (() => {
        const activeBg = backgroundsMap.find(
          bg => currentTimeS >= bg.start && currentTimeS < bg.end
        );
        if (!activeBg) return null;
        const bgStartFrame = Math.floor(activeBg.start * fps);
        const bgDuration = Math.ceil((activeBg.end - activeBg.start) * fps);
        return (
          <Sequence from={bgStartFrame} durationInFrames={bgDuration}>
            <AbsoluteFill style={{ zIndex: 1 }}>
              <Video
                src={staticFile(activeBg.path)}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.45) contrast(1.2) saturate(1.3)",
                }}
              />
              {/* Dark vignette overlay for subject pop */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })()}

      {/* Layer 0.5: Glitch transition overlay on segment boundaries */}
      <GlitchTransition progress={glitchProgress} glowColor={glowColor} />

      {/* Layer 0.8: Floating Keyword BEHIND subject (Z:10, Ali Abdaal style) */}
      {activeKeywordSegment && activeKeywordSegment.keywords.length > 0 && (
        <Sequence
          from={Math.floor(activeKeywordSegment.start * fps)}
          durationInFrames={Math.floor((activeKeywordSegment.end - activeKeywordSegment.start) * fps)}
        >
          <FloatingKeyword
            keyword={activeKeywordSegment.keywords[0]}
            color={glowColor}
            fps={fps}
          />
        </Sequence>
      )}

      {/* Layer 1: Subject with ZOOM + PUNCH-IN + HOOK + PACING (Z:20) */}
      <AbsoluteFill style={{zIndex: 20}}>
        {/* Projected shadow BEHIND subject (toward the ground) */}
        <div
          style={{
            position: "absolute",
            bottom: "4%",
            left: "20%",
            right: "20%",
            height: "8%",
            background: `radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)`,
            filter: "blur(25px)",
          }}
        />
        {/* Subject container — all zoom effects combined */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "95%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            filter: `
              drop-shadow(0 0 ${effectiveGlowRadius}px ${glowColor})
              drop-shadow(0 0 ${effectiveGlowRadius * 0.4}px ${glowColor})
              drop-shadow(0 8px 20px rgba(0,0,0,0.6))
              saturate(0.88)
              brightness(${1.05 * (isHookPhase ? hookFlash : 1.0)})
              contrast(${1.02 * (isHookPhase ? hookFlash : 1.0)})
              blur(${(totalScale - 1) * 8}px)
            `,
            // Combined: slow zoom × keyword punch-in × hook zoom × pacing × jumpCut × shake
            transform: `translateZ(0) scale(${totalScale * hookScale * pacingZoom * jumpCutScale}) translate(${shakeX}px, ${shakeY}px)`,
            transformOrigin: "center 70%",
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <OffthreadVideo
            src={staticFile("assets/sujeto_transparente.webm")}
            transparent
            style={{
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Layer 1.3: Neon Outline (body contour glow — Sprint 4) */}
      {/* Layer 1.3: Neon Outline (body contour glow — Sprint 4) - DISABLED PER V5 AUDIT */}
      {/* <NeonOutline color={glowColor} isActive={hasKeyword ?? false} /> */}

      {/* Layer 1.5: B-ROLL AUTOMATION (Pexels Overlay) - Z:15 (Behind subject Z:20) */}
      <AbsoluteFill style={{ zIndex: 15, pointerEvents: "none" }}>
        {brollsMap.map((broll, index) => {
          const startFrame = Math.floor(broll.start * fps);
          const durationInFrames = Math.ceil((broll.end - broll.start) * fps);

          return (
            <Sequence key={`broll-${index}`} from={startFrame} durationInFrames={durationInFrames}>
              <BRollOverlay broll={broll} durationInFrames={durationInFrames} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Layer 1.6: Insert Overlays between segments (Sprint 3) */}
      {guionData.segments.map((seg, i) => {
        // Create a 1.5-second insert between segments when there's a keyword
        const nextSeg = guionData.segments[i + 1];
        if (!nextSeg || !seg.keywords || seg.keywords.length === 0) return null;
        const gapStart = seg.end;
        const gapEnd = Math.min(seg.end + 1.5, nextSeg.start);
        if (gapEnd - gapStart < 0.3) return null; // Skip tiny gaps
        
        const insertStartFrame = Math.floor(gapStart * fps);
        const insertDuration = Math.ceil((gapEnd - gapStart) * fps);

        return (
          <Sequence key={`insert-${i}`} from={insertStartFrame} durationInFrames={insertDuration}>
            <InsertOverlay
              keyword={seg.keywords[0]}
              durationInFrames={insertDuration}
              color={glowColor}
            />
          </Sequence>
        );
      })}

      {/* Layer 2: Original Audio */}
      <Audio src={staticFile("assets/audio_original.mp3")} volume={0.9} />
      
      {/* Layer 2.1: Audio Peak (Hook disruptor — whoosh/pop sound at 0s) */}
      <Sequence from={0} durationInFrames={30}>
        {/* Usamos un silencio como placeholder si el archivo no existe aún 
            Para prod, el autor debe soltar un whoosh.mp3 en assets/ */}
        <Audio src={staticFile("assets/audio_original.mp3")} volume={0.0} /> 
        {/* Reemplazar arriba con: <Audio src={staticFile("assets/whoosh.mp3")} volume={0.7} /> */}
      </Sequence>

      {/* Layer 3: Word-by-word captions (Z:30) — HIDDEN during hook phase for visual hierarchy */}
      {!isHookPhase && activeSegment && (
        <CaptionBlock segment={activeSegment} currentTimeS={currentTimeS} fps={fps} />
      )}

      {/* Layer 3.5: Emoji Pop OR Floating Keyword (EXCLUSIVE — never both at once) */}
      {/* DISABLED EMOJIPOP PER V5 AUDIT (Estático sobre la cara) */}
      {/* activeKeywordSegment && activeEmoji ? (
        <Sequence
          from={Math.floor(activeKeywordSegment.start * fps)}
          durationInFrames={Math.floor((activeKeywordSegment.end - activeKeywordSegment.start) * fps)}
        >
          <EmojiPop emoji={activeEmoji} fps={fps} />
        </Sequence>
      ) : */}
      {activeKeywordSegment ? (
        <Sequence
          from={Math.floor(activeKeywordSegment.start * fps)}
          durationInFrames={Math.floor((activeKeywordSegment.end - activeKeywordSegment.start) * fps)}
        >
          <FloatingKeyword
            keyword={activeKeywordSegment.keywords[0]}
            color={glowColor}
            fps={fps}
          />
        </Sequence>
      ) : null}

      {/* Layer 3.6: Particle Field (floating triangles — Sprint 4) */}
      <ParticleField color={glowColor} />

      {/* Layer 3.7: Hook Headline (first 3 seconds — stops the scroll) */}
      {hookText && (
        <Sequence from={0} durationInFrames={90}>
          <HookHeadline text={hookText} fps={fps} />
        </Sequence>
      )}

      {/* Layer 4: Keyword CTA callouts */}
      {activeKeywordSegment && activeKeywordSegment.keywords.length > 0 && (
        <Sequence
          from={Math.floor(activeKeywordSegment.start * fps)}
          durationInFrames={Math.floor((activeKeywordSegment.end - activeKeywordSegment.start) * fps)}
        >
          <KeywordCallout
            keyword={activeKeywordSegment.keywords[0]}
            color={glowColor}
          />
        </Sequence>
      )}

      {/* Layer 5: TUK badge — minimal, not distracting */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "5px 12px",
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          gap: 5,
          border: `1px solid ${glowColor}20`,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: glowColor,
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: 2,
            opacity: 0.8,
          }}
        >
          TUK
        </div>
        <div
          style={{
            fontSize: 8,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          QUANTUM
        </div>
      </div>

      {/* Layer 6: Progress bar */}
      <ProgressBar color={glowColor} height={2} />

      {/* Layer 7: Watermark */}
      <Watermark
        text={BRAND.handle}
        corner="topRight"
        opacity={0.3}
        fontSize={11}
        color="#ffffff"
        margin={56} // FIX #1 SAFE AREA: Was 14px — hidden by iOS status bar / TikTok UI
      />

      {/* Layer 8: CTA Endcard (last 3 seconds — Sprint 6) */}
      <Sequence from={Math.max(0, Math.floor((guionData.segments[guionData.segments.length - 1]?.end ?? 24) * fps) - 90)} durationInFrames={90}>
        <CTAEndCard color={glowColor} fps={fps} />
      </Sequence>

      {/* Layer 9: Background Music with ducking (Sprint 5, optional) */}
      {/* To activate: place bgm.mp3 in assets/music/, run audio_duck.py, then uncomment below */}
      {/* <Audio src={staticFile("assets/audio_ducked.mp3")} volume={0.4} /> */}

      {/* GLOBAL: Film Grain overlay for texture cohesion (top of everything) */}
      <AbsoluteFill style={{ zIndex: 99, pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.04 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </AbsoluteFill>

      {/* GLOBAL: Vignette for depth (force eyes to center) */}
      <AbsoluteFill style={{ zIndex: 98, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 200px rgba(0,0,0,0.45)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
