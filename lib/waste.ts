/**
 * Código de colores de Bogotá (Resolución 2184 de 2019 – MinAmbiente / MinVivienda):
 *   blanco = aprovechables · negro = no aprovechables · verde = orgánicos
 * "especial" = residuos que NO van a la caneca (pilas, bombillos, electrónicos, medicamentos…).
 */

export type BinColor = "blanco" | "negro" | "verde" | "especial";

export const BIN_LABEL: Record<BinColor, string> = {
  blanco: "Caneca blanca (aprovechables)",
  negro: "Caneca negra (no aprovechables)",
  verde: "Caneca verde (orgánicos)",
  especial: "Punto de recolección especial",
};

export const BIN_HEX: Record<BinColor, string> = {
  blanco: "#F4F4F0",
  negro: "#2B2F2D",
  verde: "#1F8A5F",
  especial: "#BF9900",
};

export const BIN_COLORS = Object.keys(BIN_LABEL) as BinColor[];

/** Enlace real a Google Maps (no inventamos puntos ni distancias). */
export const MAPS_SEARCH_URL =
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("punto limpio reciclaje");
