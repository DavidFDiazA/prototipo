import { BIN_COLORS, type BinColor } from "./waste";

export type ClassifyResult = {
  recognized: boolean; // false si no es un residuo o no se alcanza a distinguir
  material: string;
  description: string;
  bin: BinColor;
  tip: string;
  confidence: number; // 0..1, AUTO-REPORTADA por el modelo (no calibrada)
};

export class ClassifierNotConfigured extends Error {}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const BASE_URL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";

const SYSTEM = `Eres el motor de reconocimiento de EcoLens, una app de Bogotá (Colombia) que le dice a la gente en qué caneca va un residuo.
Mira la foto e identifica el objeto o residuo principal. Responde SOLO con un objeto JSON, sin texto adicional ni markdown:
{"recognized": boolean, "material": string, "description": string, "bin": "blanco"|"negro"|"verde"|"especial", "tip": string, "confidence": number}

Reglas:
- "material": nombre corto en español del objeto/material (ej. "Botella de plástico (PET)", "Tetrapak", "Lata de aluminio").
- "description": una frase corta sobre de qué está hecho.
- "bin" según el código de colores de Bogotá (Resolución 2184 de 2019):
  · "blanco": aprovechables limpios y secos: plástico, vidrio, metal, papel, cartón y envases multicapa (tetrapak).
  · "negro": no aprovechables: papel higiénico, servilletas o envases sucios/grasosos, icopor, colillas, barrido.
  · "verde": orgánicos: restos de comida, cáscaras, residuos de jardín.
  · "especial": NO van a la caneca: pilas, bombillos, aparatos electrónicos, medicamentos, aceite usado, llantas.
- "tip": una instrucción práctica corta para dejarlo bien (enjuagar, aplastar, quitar la tapa, etc.).
- "confidence": entre 0 y 1, qué tan seguro estás de la identificación y de la caneca.
- Si la foto no muestra un residuo, está borrosa o no puedes distinguirlo, responde recognized=false, confidence baja, y en "tip" pide una foto más clara y cercana.
- No inventes. Si dudas entre dos categorías, baja la confianza.`;

export async function classifyImage(image: Uint8Array, mediaType: string): Promise<ClassifyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClassifierNotConfigured("ANTHROPIC_API_KEY no está configurada");

  const res = await fetch(`${BASE_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: Buffer.from(image).toString("base64") },
            },
            { type: "text", text: "¿Qué residuo es y en qué caneca va?" },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`El servicio de visión respondió ${res.status}`);
  const data = await res.json();
  const text: string = (data.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("Respuesta del modelo no válida");

  const raw = JSON.parse(json);
  const bin: BinColor = BIN_COLORS.includes(raw.bin) ? raw.bin : "negro";
  return {
    recognized: raw.recognized !== false,
    material: String(raw.material ?? "Sin identificar"),
    description: String(raw.description ?? ""),
    bin,
    tip: String(raw.tip ?? ""),
    confidence: Math.min(1, Math.max(0, Number(raw.confidence) || 0)),
  };
}
