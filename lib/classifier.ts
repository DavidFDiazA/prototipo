/**
 * Reconocimiento de residuos EN EL NAVEGADOR (sin servidor ni llaves de API).
 * MODO DEMOSTRACIÓN: solo distingue "papel" de "no papel" (el catálogo completo de 14 categorías está en labels.completo.json).
 * Modelo: CLIP (Xenova/clip-vit-base-patch32, cuantizado) con clasificación "zero-shot":
 * se compara la foto contra las descripciones de lib/labels.json y gana la más parecida.
 *
 * La librería y el modelo (~150 MB la primera vez) se descargan desde jsDelivr / Hugging Face
 * y quedan en la caché del navegador. Para cambiar de modelo, reemplaza `getPipeline()`.
 */
import labelsJson from "./labels.json";
import type { BinColor } from "./waste";

type Label = {
  id: string; prompts: string[]; material: string; description: string;
  bin: BinColor; tip: string; none?: boolean;
};
const LABELS = labelsJson as Label[];

export type ClassifyResult = {
  recognized: boolean;
  material: string;
  description: string;
  bin: BinColor;
  tip: string;
  score: number; // 0..1: peso de la opción ganadora entre todas las posibles (NO es una probabilidad de acierto)
  alternative?: { material: string; score: number };
};

const MODEL_ID = "Xenova/clip-vit-base-patch32";
const MIN_SCORE = 0.5; // modo solo-papel: se exige que "papel" pese al menos 0.5 (ajustado con TrashNet, ver eval/)

const CANDIDATES = LABELS.flatMap((l) => l.prompts);
const OWNER: Record<string, string> = Object.fromEntries(LABELS.flatMap((l) => l.prompts.map((p) => [p, l.id])));

/* eslint-disable @typescript-eslint/no-explicit-any */
let pipePromise: Promise<any> | null = null;
let progressListeners = new Set<(pct: number) => void>();

export function onModelProgress(fn: (pct: number) => void) {
  progressListeners.add(fn);
  return () => progressListeners.delete(fn);
}

function getPipeline(): Promise<any> {
  if (pipePromise) return pipePromise;
  const files: Record<string, { loaded: number; total: number }> = {};
  pipePromise = (async () => {
    // @ts-expect-error: import desde URL (CDN), no hay tipos
    const tf: any = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js");
    tf.env.allowLocalModels = false;
    return tf.pipeline("zero-shot-image-classification", MODEL_ID, {
      dtype: "q8",
      progress_callback: (p: any) => {
        if (p.status !== "progress" || !p.total) return;
        files[p.file] = { loaded: p.loaded, total: p.total };
        const all = Object.values(files);
        const pct = all.reduce((a, f) => a + f.loaded, 0) / all.reduce((a, f) => a + f.total, 0);
        progressListeners.forEach((fn) => fn(Math.min(100, Math.round(pct * 100))));
      },
    });
  })();
  pipePromise.catch(() => { pipePromise = null; }); // permite reintentar
  return pipePromise;
}

/** Empieza a descargar el modelo (úsalo al entrar a la cámara para que esté listo al disparar). */
export function warmup(): Promise<void> {
  return getPipeline().then(() => undefined);
}

export async function classify(imageUrl: string): Promise<ClassifyResult> {
  const pipe = await getPipeline();
  const out: { label: string; score: number }[] = await pipe(imageUrl, CANDIDATES, {
    hypothesis_template: "a photo of {}.",
  });

  // Suma las puntuaciones de las descripciones de cada categoría.
  const byId: Record<string, number> = {};
  for (const o of out) byId[OWNER[o.label]] = (byId[OWNER[o.label]] || 0) + o.score;
  const ranked = Object.entries(byId).sort((a, b) => b[1] - a[1]);
  const [topId, topScore] = ranked[0];
  const top = LABELS.find((l) => l.id === topId)!;

  if (top.none || topScore < MIN_SCORE) {
    return {
      recognized: false, material: "", description: "", bin: "negro", score: topScore,
      tip: "No identifiqué papel en la foto (esta versión solo reconoce papel). Acércate, centra la hoja y usa buena luz.",
    };
  }
  const second = ranked.find(([id]) => id !== topId && !LABELS.find((l) => l.id === id)!.none);
  const alt = second && second[1] >= 0.2 ? LABELS.find((l) => l.id === second[0])! : null;
  return {
    recognized: true, material: top.material, description: top.description, bin: top.bin, tip: top.tip,
    score: topScore,
    alternative: alt ? { material: alt.material, score: second![1] } : undefined,
  };
}
