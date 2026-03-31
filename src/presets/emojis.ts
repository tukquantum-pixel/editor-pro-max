/**
 * Emoji mapping for keyword-triggered pops.
 * Only fires if keyword confidence > 0.85 in Whisper JSON.
 * Keep this as a Preset to avoid hardcoding in components.
 */
export const KEYWORD_EMOJIS: Record<string, string> = {
  // Business / Corporate
  producto: "📦",
  solución: "💡",
  resultado: "📈",
  oferta: "🎯",
  demo: "🖥️",
  contacta: "📞",
  whatsapp: "📱",
  gratis: "🎁",
  descarga: "⬇️",
  link: "🔗",
  enlace: "🔗",

  // Tech / AI
  erp: "⚙️",
  agentes: "🤖",
  ia: "🧠",
  inteligencia: "🧠",
  automatizar: "🔄",
  sistema: "🖧",
  código: "💻",
  software: "💻",
  datos: "📊",
  api: "🔌",

  // Finance
  factura: "🧾",
  stock: "📋",
  dinero: "💰",
  precio: "💲",
  inversión: "📊",
  ahorro: "💸",

  // Energy / Impact
  increíble: "🔥",
  brutal: "💥",
  revolucionario: "🚀",
  nuevo: "✨",
  exclusivo: "⭐",
  escalable: "📐",
  optimizar: "⚡",

  // Actions
  suscríbete: "🔔",
  comenta: "💬",
  comparte: "🔁",
  llama: "📞",
  prueba: "🧪",
} as const;

/** Minimum confidence threshold for emoji pop activation */
export const EMOJI_CONFIDENCE_THRESHOLD = 0.85;
