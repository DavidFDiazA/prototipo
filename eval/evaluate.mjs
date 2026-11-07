import { pipeline } from "@huggingface/transformers";
import fs from "node:fs"; import path from "node:path";
const labels = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const root = process.argv[3]; const PER = 20; const OFFS = process.argv[4].split(",").map(Number); const outFile = process.argv[5];
const clf = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32", { dtype: "q8" });
const cand = labels.flatMap((l) => l.prompts); const owner = Object.fromEntries(labels.flatMap((l) => l.prompts.map((p) => [p, l.id])));
const classes = fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory()).sort();
const rows = []; const t0 = Date.now();
for (const c of classes) {
  const all = fs.readdirSync(path.join(root, c)).sort(); const step = Math.floor(all.length / PER);
  for (const off of OFFS) {
    const files = all.filter((_, i) => i % step === off).slice(0, PER);
    for (const f of files) {
      const out = await clf(path.join(root, c, f), cand, { hypothesis_template: "a photo of {}." });
      const sc = {}; for (const o of out) sc[owner[o.label]] = (sc[owner[o.label]] || 0) + o.score;
      const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      rows.push({ cls: c, file: f, off, top: ranked[0][0], score: ranked[0][1], second: ranked[1][0] });
    }
  }
}
fs.writeFileSync(outFile, JSON.stringify({ rows, msPerImg: (Date.now() - t0) / rows.length }));
console.log("done", rows.length, "ms/img", Math.round((Date.now() - t0) / rows.length));
