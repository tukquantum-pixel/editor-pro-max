# 🎬 BIBLIA DEL EDITOR PRO MAX
## Sistema de Producción de Video Programático con IA
**by @soyenriquerocha — TUK Quantum Pixel**
**Última actualización: 30 Marzo 2026**

---

## 1. QUÉ ES EDITOR PRO MAX

Un **framework de edición de video programático** construido sobre Remotion que permite crear videos profesionales desde código TypeScript. No es un editor con timeline — es una **fábrica de video** donde las composiciones son funciones y los efectos son componentes React.

**Stack**: Remotion 4.0.440 | React 19 | TypeScript | FFmpeg  
**Ubicación**: `/home/berraco/Escritorio/SistemaFractalIA/editor-pro-max/`

---

## 2. ARQUITECTURA

```
editor-pro-max/
├── src/
│   ├── Root.tsx               ← Registro de todas las composiciones
│   ├── compositions/          ← Videos completos (5 tipos)
│   ├── templates/             ← Plantillas parametrizadas (8)
│   ├── components/            ← Componentes reutilizables (25+)
│   ├── hooks/                 ← Hooks custom (6)
│   ├── presets/               ← Design tokens (5 archivos)
│   ├── schemas/               ← Validación Zod (4 archivos)
│   └── utils/                 ← Utilidades
├── public/assets/             ← Assets de video, audio, JSON
└── package.json               ← Remotion 4.0.440
```

---

## 3. COMPOSICIONES (Videos Completos)

Cada composición es un video renderizable con `npx remotion render <ID> output.mp4`.

### Organizadas por Folder en Root.tsx

| Folder | ID | Componente | Resolución | Duración | Uso |
|:---|:---|:---|:---:|:---:|:---|
| **Examples** | `Showcase` | ShowcaseComposition | 1920×1080 | 10s | Demo de componentes |
| **Social** | `TikTok` | TikTokVideo | 1080×1920 | 9s | Hook → Body → CTA |
| **Social** | `InstagramReel` | InstagramReel | 1080×1920 | 8s | Headline + Subtext |
| **Social** | `YouTubeShort` | YouTubeShort | 1080×1920 | 10s | Title + Subtitle |
| **Content** | `Presentation` | Presentation | 1920×1080 | 15s | Slides animados |
| **Content** | `Testimonial` | Testimonial | 1920×1080 | 6s | Quote + Author |
| **Promo** | `Announcement` | Announcement | 1920×1080 | 10s | Pre-título → CTA |
| **Promo** | `BeforeAfter` | BeforeAfterDemo | 1920×1080 | 6s | Comparativa visual |
| **TUK** | `TukQuantum` | TukQuantumVideo | 1080×1920 | 30s | Institucional 8 escenas |
| **TUK** | `DemoCliente` | DemoCliente | 1280×720 | 53s | Screen recording + subs |
| **TUK** | `AITalkingHead` | AITalkingHead | 1080×1920 | 30s | Sujeto IA + fondo + FX |
| **Editing** | `TalkingHeadEdit` | TalkingHeadEdit | 1920×1080 | 30s | Edición con captions |
| **Editing** | `PodcastClip` | PodcastClip | 1080×1920 | 30s | Clip de podcast |

### AITalkingHead (La Estrella — Pipeline Camaleón)
La composición más avanzada. Integra:
- ✅ Sujeto recortado con alpha (`OffthreadVideo transparent`)
- ✅ Fondos dinámicos por mood (gradientes con crossfade)
- ✅ Subtítulos word-level con spring entrance
- ✅ **Slow zoom** (100%→108% por segmento)
- ✅ **Keyword punch-in zoom** (spring 1.12x, damping 20)
- ✅ **Glitch transitions** (CSS RGB split en boundaries)
- ✅ **Motion blur** simulado en subtítulos
- ✅ **Keywords en gold** (#ffcc00, fontWeight 900)
- ✅ Blur proporcional al zoom (compensa bordes de máscara)
- ✅ CTA callouts en keywords
- ✅ ProgressBar + Watermark

### TukQuantum (Institucional — 8 Escenas)
| Escena | Componente | Tema |
|:---|:---|:---|
| 1 | Scene1_Hook | Gancho inicial |
| 2 | Scene2_Traditional | Lo tradicional |
| 3 | Scene3_Nosotros | Presentación |
| 4 | Scene4_Agents | Agentes IA |
| 5 | Scene5_BeatDrop | Momento clave |
| 6 | Scene6_Montage | Montaje |
| 7 | Scene7_Logo | Logo |
| 8 | Scene8_CTA | Call to Action |

---

## 4. COMPONENTES REUTILIZABLES (25+)

### Backgrounds (4)
| Componente | Función |
|:---|:---|
| `ColorWash` | Overlay de color con blending |
| `GradientBackground` | Gradiente configurable |
| `GridPattern` | Patrón de rejilla (tech) |
| `ParticleField` | Campo de partículas animadas |

### Layout (3)
| Componente | Función |
|:---|:---|
| `PictureInPicture` | Video pequeño sobre video grande |
| `SafeArea` | Márgenes seguros para redes |
| `SplitScreen` | Pantalla dividida (A/B) |

### Media (6)
| Componente | Función |
|:---|:---|
| `AudioTrack` | Pista de audio con control |
| `FitImage` | Imagen responsive |
| `FitVideo` | Video responsive (`OffthreadVideo`) |
| `ImageOverlay` | Imagen superpuesta con posición |
| `JumpCut` | Corte con transición |
| `Slideshow` | Presentación de imágenes |
| `VideoClip` | Clip de video con trim |

### Overlays (4)
| Componente | Función |
|:---|:---|
| `CallToAction` | Botón CTA animado |
| `CountdownTimer` | Temporizador visual |
| `ProgressBar` | Barra de progreso del video |
| `Watermark` | Marca de agua configurable |

### Text (5)
| Componente | Función |
|:---|:---|
| `AnimatedTitle` | Título con animación de entrada |
| `CaptionOverlay` | Subtítulos overlay |
| `LowerThird` | Tercios inferiores (nombre/cargo) |
| `TypewriterText` | Efecto máquina de escribir |
| `WordByWordCaption` | Subtítulos palabra por palabra |

### Transitions (1)
| Componente | Función |
|:---|:---|
| `TransitionPresets` | Presets de transición (fade, slide, etc.) |

---

## 5. HOOKS CUSTOM (6)

| Hook | Función | Input | Output |
|:---|:---|:---|:---|
| `useAnimation` | Animaciones con spring/interpolate | config | progress, scale, opacity |
| `useCaptions` | Subtítulos sincronizados | JSON path | segments, activeWord |
| `useColorScheme` | Esquema de colores por mood | mood string | palette, gradient |
| `useSilenceSegments` | Detección de silencios | audio data | silent regions, active |
| `useTranscription` | Transcripción Whisper | audio path | words[], segments[] |
| `useVideoMetadata` | Info del video fuente | video path | duration, fps, size |

---

## 6. DESIGN SYSTEM (Presets)

### Brand Identity
```typescript
BRAND = {
  name: "Editor Pro Max",
  handle: "@soyenriquerocha",
  colors: { primary: "#8b5cf6", secondary: "#6366f1", bg: "#0a0a0a" }
}
```

### 7 Paletas de Color
| Paleta | Bg | Accent | Uso |
|:---|:---|:---|:---|
| `dark` | #0a0a0a | #6366f1 | Default, tech |
| `light` | #ffffff | #3b82f6 | Corporativo claro |
| `vibrant` | #0f0f23 | #f43f5e | Energético, promos |
| `warm` | #1c1917 | #f59e0b | Testimonials |
| `cool` | #0c1222 | #06b6d4 | SaaS, producto |
| `neon` | #000000 | #00ff88 | Gaming, tech |
| `brand` | #0a0a0a | #8b5cf6 | TUK Quantum |

### 8 Gradientes
`sunset` `ocean` `forest` `purple` `fire` `midnight` `aurora` `rainbow`

### Tipografía
| Familia | Uso | Fuente |
|:---|:---|:---|
| `heading` | Títulos | Inter |
| `body` | Texto | Inter |
| `display` | Impacto | Poppins |
| `elegant` | Premium | Playfair Display |
| `mono` | Código | JetBrains Mono |

### 9 Plataformas
```
TikTok       1080×1920  30fps    Instagram Reel  1080×1920  30fps
YouTube      1920×1080  30fps    YT Short        1080×1920  60fps
Instagram    1080×1080  30fps    LinkedIn        1920×1080  30fps
Twitter/X    1080×1080  30fps    Facebook        1080×1080  30fps
Instagram Story 1080×1920 30fps
```

### 5 Aspect Ratios
`landscape` (16:9) | `portrait` (9:16) | `square` (1:1) | `cinematic` (2.4:1) | `ultrawide`

---

## 7. TEMPLATES PARAMETRIZADOS

### Social (3)
| Template | Props | Formato |
|:---|:---|:---:|
| `TikTokVideo` | hook, body, cta | 9:16 |
| `InstagramReel` | headline, subtext, brandName | 9:16 |
| `YouTubeShort` | title, subtitle | 9:16 |

### Content (2)
| Template | Props | Formato |
|:---|:---|:---:|
| `Presentation` | slides[{title, body}] | 16:9 |
| `Testimonial` | quote, author, role | 16:9 |

### Promo (2)
| Template | Props | Formato |
|:---|:---|:---:|
| `Announcement` | preTitle, title, subtitle, cta | 16:9 |
| `BeforeAfter` | (visual comparison) | 16:9 |

### Editing (2)
| Template | Props | Formato |
|:---|:---|:---:|
| `TalkingHeadEdit` | videoSrc, showCaptions, captionPreset, removeSilence | 16:9 |
| `PodcastClip` | videoSrc, clipStart/End, showCaptions, captionPreset | 9:16 |

---

## 8. SCHEMAS (Validación)

| Schema | Función |
|:---|:---|
| `common.schema.ts` | Tipos compartidos (colores, dimensiones) |
| `editing.schema.ts` | Props de templates de edición |
| `media.schema.ts` | Tipos de media (video, audio, imagen) |
| `text.schema.ts` | Tipos de texto y captions |

---

## 9. PIPELINE DE USO

### Render Manual
```bash
# Ver en Remotion Studio
npm run dev

# Renderizar composición específica
npx remotion render AITalkingHead output.mp4

# Con props custom
npx remotion render TikTok output.mp4 --props='{"hook":"¿Sabías esto?","body":"La IA edita videos","cta":"Sígueme"}'

# Para otra plataforma
npx remotion render Presentation slides.mp4 --width=1920 --height=1080
```

### Pipeline Camaleón (Automatizado)
```
1. transcribe.py   → guion_con_timestamps.json (public/assets/)
2. extract_subject  → sujeto_transparente.webm   (public/assets/)
3. assets_map.json  → fondos/mood por escena     (public/assets/)
4. remotion render AITalkingHead → video_final.mp4
```

---

## 10. INTEGRACIÓN CON PIPELINE CAMALEÓN

```
┌───────────────────────────────────────────────────────────┐
│                 CAMALEÓN (Python IA Layer)                 │
│  Silence pre-cut → Whisper → EfficientTAM → Validation    │
│  Output: JSON + WebM + audio                              │
└───────────────────────┬──────────────────────────────────┘
                        │ public/assets/
                        ▼
┌───────────────────────────────────────────────────────────┐
│               EDITOR PRO MAX (Remotion Layer)             │
│  AITalkingHead → Background + Subject + Captions + FX     │
│  Output: MP4 final listo para redes                       │
└───────────────────────────────────────────────────────────┘
```

### Assets que consume AITalkingHead
| Asset | Generado por | Formato |
|:---|:---|:---|
| `guion_con_timestamps.json` | `transcribe.py` | Whisper JSON |
| `assets_map.json` | Manual/generado | Fondos + moods |
| `sujeto_transparente.webm` | `extract_subject.py` | WebM VP9 alpha |
| `audio_original.mp3` | FFmpeg extract | Audio puro |

---

## 11. DEPENDENCIAS

| Paquete | Versión | Función |
|:---|:---:|:---|
| `remotion` | 4.0.440 | Core del framework |
| `@remotion/cli` | 4.0.440 | CLI para render |
| `@remotion/captions` | 4.0.440 | Sistema de subtítulos |
| `@remotion/transitions` | 4.0.440 | Transiciones |
| `@remotion/noise` | 4.0.440 | Generación de ruido |
| `@remotion/shapes` | 4.0.440 | Formas SVG animadas |
| `@remotion/player` | 4.0.440 | Player embebible |
| `@remotion/media-utils` | 4.0.440 | Utilidades de media |
| `@remotion/install-whisper-cpp` | 4.0.440 | Instalador Whisper |
| `@imgly/background-removal-node` | 1.4.5 | Remoción de fondo (Node) |
| `fluent-ffmpeg` | 2.1.3 | Wrapper FFmpeg |
| `sharp` | 0.34.5 | Procesamiento de imágenes |
| `react` | 19.0.0 | UI library |

---

## 12. COMANDOS

| Comando | Función |
|:---|:---|
| `npm run dev` | Abrir Remotion Studio en Chrome |
| `npm run build` | Bundle para producción |
| `npm run render` | Render de composición |
| `npm run lint` | TypeScript check |
| `npm run typecheck` | Validar tipos |

---

## 13. FILOSOFÍA DE DISEÑO

1. **Composición = Función**: Cada video es un componente React puro, sin estado externo
2. **Props = Configuración**: Todo es parametrizable via JSON/CLI
3. **Components = LEGO**: Backgrounds, overlays, text son bloques intercambiables
4. **Presets = Consistencia**: Paletas, fuentes y dimensiones centralizadas
5. **Hooks = Lógica**: La lógica de negocio (captions, timing, color) vive en hooks
6. **Zero-GPU**: Todo se renderiza en Chromium (Puppeteer), sin necesidad de GPU

### Convenciones de código
- Componentes: PascalCase (`GlitchTransition`)
- Hooks: camelCase con `use` prefix (`useCaptions`)
- Presets: SCREAMING_SNAKE (`PALETTES`, `BRAND`)
- Props tipados con TypeScript estricto
- Schemas validados con Zod

---

> *"El mejor video no es el que tiene más efectos. Es el que retiene más atención."*
> — Editor Pro Max, 2026
