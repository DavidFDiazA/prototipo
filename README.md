# EcoLens — prototipo

Web app (mobile-first) que identifica qué residuo es a partir de una foto y dice en qué caneca va (código de colores de Bogotá) y cuál es el punto de reciclaje más cercano.
Proyecto académico — Universidad Libre, Metodología de la Investigación.

> **Estado:** el flujo completo funciona (Inicio → Captura → Resultado, con cámara real o galería), pero la clasificación es una **demo** (`lib/classify.ts`). Aún no hay modelo de visión conectado.

## Correr local

```bash
npm install
npm run dev      # http://localhost:3000
```

La cámara en vivo solo funciona en `https://` o `localhost` (Vercel ya da https).

## Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new) → **Import** el repo → **Deploy** (Vercel detecta Next.js solo, no hay que configurar nada).

O con la CLI: `npx vercel` (te pide login la primera vez) y luego `npx vercel --prod`.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `components/EcoLensApp.tsx` | Las pantallas y el flujo (cámara, galería, resultado) |
| `app/api/classify/route.ts` | Endpoint `POST /api/classify` (recibe campo `image`) |
| `lib/classify.ts` | **Aquí se conecta el modelo real** (hoy devuelve un resultado demo) |
| `lib/waste.ts` | Catálogo de residuos, canecas (blanco/negro/verde/especial) y puntos de ejemplo |
| `lib/image.ts` | Reduce la foto a 1024 px antes de subirla |

## Cómo darle funcionalidad (siguientes pasos)

1. **Modelo de visión**: reemplazar el cuerpo de `classifyImage()` en `lib/classify.ts`. Debe seguir devolviendo `ClassifyResult` (`id`, `confidence`, etc.). Opciones: modelo propio entrenado con TrashNet + fotos locales servido en una API, Roboflow / Hugging Face Inference, o un modelo de visión por API. Las llaves van en variables de entorno de Vercel (nunca en el código).
2. **Puntos de reciclaje reales**: `DEMO_POINTS` en `lib/waste.ts` son de ejemplo. Cambiar por datos reales (UAESP / Datos Abiertos Bogotá) y ordenar por distancia con `navigator.geolocation`.
3. **Más residuos**: agregar items a `WASTE_CATALOG` en `lib/waste.ts`.
4. **Medición para la investigación**: guardar (con consentimiento) aciertos/errores para calcular la *accuracy* del modelo y aplicar la encuesta Likert.
