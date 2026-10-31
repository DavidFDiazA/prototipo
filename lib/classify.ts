import { WASTE_CATALOG, DEMO_POINTS, type BinColor, type DisposalPoint } from "./waste";

export type ClassifyResult = {
  id: string;
  material: string;
  description: string;
  bin: BinColor;
  tip: string;
  confidence: number; // 0..1
  nearestPoint: DisposalPoint;
  demo: boolean; // true mientras no exista un modelo real
};

/**
 * ============================================================
 *  PUNTO DE ENGANCHE DEL MODELO DE VISIÓN
 * ============================================================
 * Hoy devuelve un resultado DEMO (determinístico según los bytes de la foto).
 * Para conectar el modelo real, reemplaza el cuerpo de esta función:
 *   - API externa (Roboflow, Hugging Face Inference, Google Vision, etc.)
 *   - un modelo propio (entrenado con TrashNet + fotos locales) servido en un endpoint
 *   - Claude con visión (Anthropic API) pidiendo JSON con { id, confidence }
 * Mantén el tipo de retorno `ClassifyResult` y la UI no cambia.
 */
export async function classifyImage(image: Uint8Array): Promise<ClassifyResult> {
  let hash = 0;
  const step = Math.max(1, Math.floor(image.length / 512));
  for (let i = 0; i < image.length; i += step) hash = (hash * 31 + image[i]) >>> 0;

  const item = WASTE_CATALOG[hash % WASTE_CATALOG.length];
  const confidence = 0.78 + ((hash >>> 8) % 20) / 100; // 0.78 – 0.97
  const nearestPoint = DEMO_POINTS[0];

  return { ...item, confidence, nearestPoint, demo: true };
}
