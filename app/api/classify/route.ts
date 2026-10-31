import { NextResponse } from "next/server";
import { classifyImage } from "@/lib/classify";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel limita el cuerpo a ~4.5 MB

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen (campo 'image')." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es muy pesada (máx. 4 MB)." }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await classifyImage(bytes);
  return NextResponse.json(result);
}
