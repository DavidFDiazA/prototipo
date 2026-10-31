/**
 * Catálogo de residuos y código de colores de Bogotá.
 * Código de separación (Resolución 2184 de 2019 – MinAmbiente / MinVivienda):
 *   blanco = aprovechables · negro = no aprovechables · verde = orgánicos
 */

export type BinColor = "blanco" | "negro" | "verde" | "especial";

export type WasteItem = {
  id: string;
  material: string;
  description: string;
  bin: BinColor;
  tip: string;
};

export const BIN_LABEL: Record<BinColor, string> = {
  blanco: "caneca blanca (aprovechables)",
  negro: "caneca negra (no aprovechables)",
  verde: "caneca verde (orgánicos)",
  especial: "punto de recolección especial",
};

export const BIN_HEX: Record<BinColor, string> = {
  blanco: "#F4F4F0",
  negro: "#2B2F2D",
  verde: "#1F8A5F",
  especial: "#BF9900",
};

export const WASTE_CATALOG: WasteItem[] = [
  {
    id: "tetrapak",
    material: "Tetrapak",
    description: "Material multicapa: cartón, plástico y aluminio",
    bin: "blanco",
    tip: "Enjuágalo, aplástalo y deposítalo en la caneca blanca o en un punto limpio.",
  },
  {
    id: "plastico",
    material: "Botella de plástico (PET)",
    description: "Plástico tipo PET, aprovechable",
    bin: "blanco",
    tip: "Vacíala, aplástala y ponle la tapa. Va limpia y seca a la caneca blanca.",
  },
  {
    id: "vidrio",
    material: "Vidrio",
    description: "Botellas y frascos de vidrio",
    bin: "blanco",
    tip: "Entrégalo limpio y sin tapa. Si está roto, envuélvelo en papel y márcalo.",
  },
  {
    id: "carton",
    material: "Cartón",
    description: "Cajas y empaques de cartón",
    bin: "blanco",
    tip: "Debe estar seco y limpio. Aplana la caja antes de depositarla.",
  },
  {
    id: "lata",
    material: "Lata de aluminio",
    description: "Metal aprovechable",
    bin: "blanco",
    tip: "Enjuágala y aplástala para ahorrar espacio. Va en la caneca blanca.",
  },
  {
    id: "organico",
    material: "Residuo orgánico",
    description: "Restos de comida y cáscaras",
    bin: "verde",
    tip: "Deposítalo en la caneca verde. Si puedes, úsalo para compostaje.",
  },
  {
    id: "icopor",
    material: "Icopor",
    description: "Poliestireno expandido, no aprovechable",
    bin: "negro",
    tip: "Va en la caneca negra. Evita su uso cuando puedas.",
  },
  {
    id: "pila",
    material: "Pila / batería",
    description: "Residuo peligroso (RESPEL)",
    bin: "especial",
    tip: "No la botes a la basura. Entrégala en un punto de recolección de pilas.",
  },
];

/** Puntos de ejemplo (DEMO). Sustituir por datos reales (UAESP / Datos Abiertos Bogotá). */
export type DisposalPoint = { name: string; distanceM: number };

export const DEMO_POINTS: DisposalPoint[] = [
  { name: "Parque El Lago", distanceM: 350 },
  { name: "Punto Limpio Bosque", distanceM: 780 },
  { name: "Centro de acopio Chapinero", distanceM: 1200 },
];

export function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}
