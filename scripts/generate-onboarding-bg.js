// Generates an onboarding background image via Gemini 2.5 Flash Image (nano-banana).
// Usage: node scripts/generate-onboarding-bg.js
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCNDEhUkgQ6TW6kD2AujQxLIPfeSPnFAas';
const MODEL = 'gemini-2.5-flash-image';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const prompt = `A dark, minimalist, cinematic vertical mobile background for a history learning app's onboarding screen.

Composition: roughly 75% deep black void filling the upper portion, transitioning gently to reveal a single low-detail silhouette of an ancient classical artifact in the lower third — for example, a single weathered Greek/Roman marble column, or a partial broken statue head, or a lone Doric pillar — rendered almost entirely as a dark silhouette with just a soft rim of warm golden light catching one edge from a hidden light source off-frame. A faint, dusty volumetric god-ray or two of pale amber light cutting through the darkness.

Color palette: black (#050507) and very deep charcoal-navy (#0A0F1A) dominating. ONLY accent color is muted antique gold rim-light (#C9A24A, #E8C974) — used sparingly on edges. NO blue. NO bright colors. NO saturated tones.

Style: museum-quality cinematic photography, like a chiaroscuro Caravaggio painting or a still from a Denis Villeneuve film. Soft film grain. Painterly. Editorial. Expensive. Mysterious.

Strict rules — these will get the image rejected if violated:
- ABSOLUTELY NO TEXT. No letters, words, labels, captions, numbers, symbols, constellation names, watermarks, or typography of any kind anywhere in the image.
- NO logos, UI elements, frames, borders, or vignette text.
- NO people, no faces, no figures (a headless statue silhouette is fine).
- NO sky full of stars, NO moon, NO constellations.
- Just darkness, one quiet ancient silhouette, and a hint of golden rim-light.

Tall 9:16 portrait mobile aspect ratio.`;

(async () => {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('HTTP', res.status, txt);
    process.exit(1);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline?.data) {
    console.error('No image returned. Full response:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const out = path.join(__dirname, '..', 'assets', 'onboarding', 'bg.png');
  fs.writeFileSync(out, Buffer.from(inline.data, 'base64'));
  const stat = fs.statSync(out);
  console.log(`Wrote ${out} (${(stat.size / 1024).toFixed(1)} KB)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
