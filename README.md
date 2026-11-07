# EcoLens — prototipo

Web app (mobile-first) que identifica qué residuo es a partir de una foto y dice en qué caneca va (código de colores de Bogotá) y cuál es el punto de reciclaje más cercano.
Proyecto académico — Universidad Libre, Metodología de la Investigación.

> **Estado:** reconocimiento real, **sin servidor ni llaves de API**. El modelo (CLIP, clasificación *zero-shot*) corre en el navegador del usuario: compara la foto contra las descripciones de `lib/labels.json` y gana la más parecida. La primera vez descarga ~150 MB (queda en caché); abre la app una vez con buen WiFi antes de una demo.
>
> **Precisión medida** (240 fotos de TrashNet no usadas para ajustar las descripciones, 40 por clase): material correcto **60.8 %** (IC 95 %: 54.5–66.8) · caneca correcta **70.4 %** (64.4–75.8) · el sistema responde en el 87.1 % de las fotos; entre las que responde, material 69.9 % y caneca 80.9 %. Azar entre 6 clases: 16.7 %. TrashNet son fotos sobre fondo claro, así que en uso real puede ser menor. El "nivel de seguridad" que muestra la app es el peso de la opción ganadora entre todas, **no** una probabilidad de acierto. No hay modelo propio entrenado todavía.
>
> Reproducir la evaluación: ver `eval/` (script, resultados por imagen y cálculo de métricas).

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
| `lib/classifier.ts` | Carga el modelo en el navegador y clasifica la foto. **Aquí se cambia por un modelo propio** |
| `lib/labels.json` | Categorías de residuos: descripciones para el modelo, caneca y consejo |
| `lib/waste.ts` | Canecas (blanco/negro/verde/especial) y enlace a Google Maps |
| `lib/image.ts` | Reduce la foto a 1024 px antes de analizarla |

## Cómo mejorar el reconocimiento

- **Etiquetas**: edita `lib/labels.json` (descripciones en inglés para el modelo, nombre/caneca/consejo en español). Más descripciones por categoría = mejor resultado. Para medir cambios, evalúa contra TrashNet antes de publicar.
- **Modelo propio**: entrenar con TrashNet + fotos locales y reemplazar `getPipeline()` en `lib/classifier.ts` (mismo `ClassifyResult`).
- **Puntos de reciclaje reales**: hoy el botón abre una búsqueda en Google Maps. Cambiar por datos reales (UAESP / Datos Abiertos Bogotá) ordenados por distancia con `navigator.geolocation`.
- **Medición para la investigación**: guardar (con consentimiento) aciertos/errores para calcular la *accuracy* y aplicar la encuesta Likert.
