// One-off generator: calls Gemini 2.5 Flash Image to produce the world map.
// Usage: GEMINI_API_KEY=... node scripts/generate-map.mjs
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('Set GEMINI_API_KEY');
  process.exit(1);
}

const PROMPT = `A richly hand-painted map of the ancient world in the style of an
illuminated medieval atlas crossed with a dark-fantasy video game world map.
CRITICAL: the map must fill the ENTIRE square canvas edge to edge with NO black
borders, NO letterbox bars, NO white margins — land and sea extend fully to all
four edges of the image.

Geographic focus: only the Eastern Hemisphere known to antiquity — southern
Europe, the Mediterranean, North Africa, the Middle East, Persia, India, and
China. Stretch this region to fill the full square frame. Iberia and the
British Isles at the top-left; the Sahara and Nile across the middle-left;
Arabia, Mesopotamia, Persia across the center; the Indian subcontinent right
of center; China and the Yellow River filling the right side.

Aesthetic: deep midnight-navy seas with subtle gold-foil ripples, warm ochre
and sepia landmasses with parchment-paper texture and visible brush strokes,
aged bronze mountain ranges, soft vignette darkening at the corners, a weathered
gold-and-ink compass rose in one sea area, tiny scattered miniature illustrations
of ruins and temples dotted on the continents, one or two sailing ships and a
stylized sea serpent in the seas, delicate cartographic contour lines, wispy
painted cloud edges. Rich texture, hand-painted feel, no photo realism, NO
text labels, NO modern borders, NO country names. Palette: midnight blue,
warm ochre, aged gold, cream, deep sepia. Mood: mysterious, scholarly,
cinematic.`;

const body = {
  contents: [
    {
      role: 'user',
      parts: [{ text: PROMPT }],
    },
  ],
  generationConfig: {
    responseModalities: ['IMAGE'],
  },
};

const MODEL = process.env.MODEL || 'gemini-2.5-flash-image';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

console.log(`Requesting ${MODEL}...`);
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error('HTTP', res.status);
  console.error(await res.text());
  process.exit(1);
}

const json = await res.json();
const parts = json?.candidates?.[0]?.content?.parts || [];
const imgPart = parts.find((p) => p.inlineData || p.inline_data);
if (!imgPart) {
  console.error('No image in response');
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
const mime = imgPart.inlineData?.mimeType || imgPart.inline_data?.mime_type || 'image/png';
const ext = mime.includes('jpeg') ? 'jpg' : 'png';

const outDir = path.resolve('assets');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `world-map.${ext}`);
fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
console.log('Wrote', outPath, '-', fs.statSync(outPath).size, 'bytes');
