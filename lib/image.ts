/** Reduce la foto (lado mayor 1024 px, JPEG) para subirla rápido y evitar el límite de 4.5 MB de Vercel. */
export async function downscale(file: Blob, maxSide = 1024, quality = 0.85): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality),
  );
}
