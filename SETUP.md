# 🚀 SETUP — Guía de Instalación para Editor Pro Max

**Para el equipo TUK Quantum — Linux / macOS / Windows WSL**

---

## ¿Qué es esto?

Editor Pro Max es nuestro motor de producción de vídeo. En lugar de editar en Premiere o CapCut, escribimos composiciones en código (React + TypeScript) y Remotion las renderiza a MP4. Es la base del pipeline **Camaleón** que genera vídeos automáticos para Instagram.

**Lo que puedes hacer:**
- Crear un TikTok/Reel desde cero describiendo lo que quieres
- Añadir subtítulos automáticos a cualquier vídeo (Whisper IA)
- Eliminar silencios de una grabación (jump cuts automáticos)
- Quitar el fondo de un vídeo con IA
- Renderizar para TikTok, Instagram, YouTube o LinkedIn

---

## 1. Requisitos Previos

Antes de empezar, necesitas tener instalado:

### Obligatorio

| Software | Versión | Comando para verificar | Instalación |
|----------|---------|----------------------|-------------|
| **Node.js** | 20+ (LTS) | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 10+ | `npm --version` | Viene con Node.js |
| **Git** | 2.30+ | `git --version` | `sudo apt install git` |
| **FFmpeg** | 6+ | `ffmpeg -version` | `sudo apt install ffmpeg` |

### Recomendado (para funciones avanzadas)

| Software | Para qué | Instalación |
|----------|----------|-------------|
| **CMake + gcc** | Compilar whisper.cpp (subtítulos IA) | `sudo apt install cmake build-essential` |
| **Chrome/Chromium** | Remotion usa Chromium para renderizar | `sudo apt install chromium-browser` |

### En Linux (Ubuntu/Debian) — Instala todo de una vez:

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Herramientas de compilación + FFmpeg
sudo apt install -y git ffmpeg cmake build-essential chromium-browser
```

---

## 2. Clonar el Repositorio

```bash
# Clona el repo
git clone https://github.com/tukquantum-pixel/editor-pro-max.git
cd editor-pro-max

# Instala todas las dependencias (tarda ~2 minutos)
npm install
```

---

## 3. Instalar Whisper.cpp (Subtítulos con IA)

Whisper es el motor de transcripción de OpenAI. Lo usamos para generar subtítulos automáticos palabra por palabra. Es LOCAL — no usa internet ni API.

```bash
# Desde la raíz del proyecto
npx tsx scripts/transcribe-es.ts
# La primera vez descargará e instalará whisper.cpp y el modelo automáticamente
# Después de la primera ejecución, funciona offline
```

> ⚠️ **Nota:** La primera ejecución tarda ~5 minutos porque compila whisper.cpp y descarga el modelo de IA (~150MB). Las siguientes ejecuciones son instantáneas.

---

## 4. Verificar que Funciona

```bash
# Abre Remotion Studio en tu navegador
npm run dev
```

Se abrirá una ventana del navegador con **Remotion Studio**. Verás todas las composiciones disponibles en el panel izquierdo:

| Composición | Qué es | Resolución |
|-------------|--------|------------|
| `TukQuantum` | Vídeo institucional TUK (8 escenas) | 1080×1920 |
| `AITalkingHead` | Sujeto con fondo IA + subtítulos | 1080×1920 |
| `DemoCliente` | Screen recording con subtítulos | 1280×720 |
| `TikTok` | Hook → Body → CTA | 1080×1920 |
| `InstagramReel` | Headline + Subtext | 1080×1920 |
| `Presentation` | Slides animados | 1920×1080 |
| `Testimonial` | Cita + Autor | 1920×1080 |

Si ves esta lista y puedes hacer clic en cualquier composición para previsualizarla, **está funcionando correctamente**.

---

## 5. Cómo Usarlo

### A) Crear un vídeo nuevo desde cero

1. Abre `npm run dev` (Remotion Studio)
2. Elige una composición del panel izquierdo (ej: `TikTok`)
3. Modifica los props en el panel derecho (texto del hook, body, CTA)
4. Preview en tiempo real
5. Para renderizar el vídeo final:

```bash
npx remotion render TikTok out/mi-video.mp4
```

### B) Añadir subtítulos a un vídeo existente

1. Coloca tu vídeo en `public/assets/mi-video.mp4`
2. Extrae el audio:
```bash
npx tsx scripts/extract-audio.ts
```
3. Transcribe con Whisper (genera subtítulos):
```bash
npx tsx scripts/transcribe-es.ts
```
4. Abre Remotion Studio → composición `TalkingHeadEdit` o `PodcastClip`
5. Renderiza:
```bash
npx remotion render TalkingHeadEdit out/video-subtitulado.mp4
```

### C) Renderizar para distintas plataformas

```bash
# TikTok / Instagram Reel (vertical 1080x1920)
npx remotion render TikTok out/tiktok.mp4

# YouTube (horizontal 1920x1080)
npx remotion render Presentation out/youtube.mp4

# Instagram cuadrado (1080x1080)
npx remotion render TikTok out/square.mp4 --width=1080 --height=1080
```

---

## 6. Estructura del Proyecto

```
editor-pro-max/
├── src/
│   ├── Root.tsx                  ← Registro de composiciones
│   ├── compositions/
│   │   ├── TukQuantum/           ← Vídeo institucional (8 escenas)
│   │   ├── AITalkingHead/        ← Sujeto IA + subtítulos (Camaleón)
│   │   └── DemoCliente/          ← Screen recordings
│   ├── templates/                ← TikTok, Reel, Anuncio, Testimonio...
│   ├── components/               ← 25 componentes reutilizables
│   ├── hooks/                    ← Lógica (captions, animation, color)
│   └── presets/                  ← Paletas de colores, fuentes, tamaños
├── scripts/
│   ├── transcribe-es.ts          ← Transcripción Whisper en español
│   ├── cut-silence.js            ← Eliminar silencios de grabación
│   ├── extract-audio.ts          ← Extraer audio de un vídeo
│   ├── analyze-video.ts          ← Metadata del vídeo fuente
│   └── detect-silence.ts         ← Detectar silencios con FFmpeg
├── public/assets/                ← Tus vídeos, audios y assets (NO en git)
├── BIBLIA_EDITOR_PRO_MAX.md      ← Documentación técnica completa
└── SETUP.md                      ← Esta guía
```

---

## 7. Comandos Rápidos

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Abre Remotion Studio (preview en el navegador) |
| `npx remotion render <ID> out/video.mp4` | Renderiza un vídeo a MP4 |
| `npx tsx scripts/transcribe-es.ts` | Genera subtítulos con Whisper |
| `npx tsx scripts/extract-audio.ts` | Extrae el audio de un vídeo |
| `npx tsx scripts/detect-silence.ts` | Detecta silencios en el audio |

---

## 8. Solución de Problemas

| Problema | Solución |
|----------|----------|
| `npm run dev` no abre el navegador | Abre manualmente `http://localhost:3000` |
| Error de compilación TypeScript | Ejecuta `npm run typecheck` para ver los errores |
| Whisper no transcribe bien | Asegúrate de que el audio sea WAV 16kHz mono |
| El render es muy lento | Normal: ~1 min por cada 10 seg de vídeo. Sin GPU |
| FFmpeg no encontrado | `sudo apt install ffmpeg` |
| Chrome/Chromium no se encuentra | `sudo apt install chromium-browser` y configura `PUPPETEER_EXECUTABLE_PATH` |

---

## 9. ¿Qué Assets Necesito?

Los assets (vídeos, audios, fondos) **NO están en el repo** porque pesan mucho. Los puedes conseguir de dos formas:

1. **Desde Google Drive compartido** → Carpeta `SHARED_DRIVE/editor-pro-max-assets/`
2. **Creando los tuyos** → Graba tu vídeo y colócalo en `public/assets/`

La carpeta `public/assets/` debe contener al menos:
- Tu vídeo fuente (`.mp4`, `.webm`)
- El audio narrado si lo separas (`.mp3`, `.wav`)

---

> **Editor Pro Max — TUK Quantum Intelligence Systems**
> *"El mejor vídeo no es el que tiene más efectos. Es el que retiene más atención."*
