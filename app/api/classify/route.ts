import { NextResponse } from "next/server";
import { classifyImage, ClassifierNotConfigured } from "@/lib/classify";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel limita el cuerpo a ~4.5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen (campo 'image')." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es muy pesada (máx. 4 MB)." }, { status: 413 });
  }
  try {
    const result = await classifyImage(new Uint8Array(await file.arrayBuffer()), file.type);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ClassifierNotConfigured) {
      return NextResponse.json(
        { error: "El reconocimiento aún no está configurado en este servidor." },
        { status: 503 },
      );
    }
    console.error("classify error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "No se pudo identificar el residuo. Intenta de nuevo." }, { status: 502 });
  }
}
