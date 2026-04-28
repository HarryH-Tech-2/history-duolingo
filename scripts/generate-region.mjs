// Reusable region-map generator.
// Usage: GEMINI_API_KEY=... node scripts/generate-region.mjs <region>
// Regions: italy | greece | china | egypt | persia | byzantine | vikings
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('Set GEMINI_API_KEY');
  process.exit(1);
}

const REGION = process.argv[2];
if (!REGION) {
  console.error('Usage: node scripts/generate-region.mjs <region>');
  process.exit(1);
}

// Shared master aesthetic clause — aims for "dynamic, historic, lifelike".
const MASTER = `Style: a breathtaking, museum-quality, cinematic hand-painted map — as if
lifted from a rare illuminated manuscript, oil on parchment, with the
atmospheric realism of a matte painting by a concept artist for a
blockbuster historical epic. Dramatic god-rays of light breaking through
distant weather, long cast shadows, smoke and mist curling over valleys,
flocks of birds in the sky. Visible brush strokes, rich layered glazes,
impasto highlights on waves and mountain peaks, aged parchment fibers and
tea-stained edges, faint gold-leaf flourishes on cartouches and
compasses, iron-gall ink hand-lettering on rivers. The canvas should feel
alive and inhabited — tiny people going about their lives, banners
flapping, campfires glowing, bustling harbors with ships at anchor,
livestock in fields. High dynamic range between deep shadowed valleys
and sunlit ridges. Painterly, extremely detailed, cinematic composition,
filmic color grading, chiaroscuro. Absolutely NO text labels, NO modern
country borders, NO photo-realism, NO flat vector style, NO black bars
or letterboxing — the art must fill the ENTIRE square canvas corner to
corner. Square 1:1 composition.`;

const PROMPTS = {
  italy: `A living, cinematic hand-painted map of ancient Roman Italy circa 100 BCE.

Composition: the Italian peninsula — the iconic boot shape — dominates the frame, tilted
slightly so it fills the canvas edge to edge. The snow-capped Alps arc across the top in
misty painted ridges catching golden sunset light. Sicily at the bottom-left beside the
toe, Sardinia peeking top-left. The Adriatic runs along the right, the Tyrrhenian on the
left. Roman roads shown as thin dotted gold lines stitching the land together.

On the land, painted as living miniature vignettes (NO text labels):
- Rome: a walled city with seven hills, a forum of marble columns, a winding Tiber river,
  the Senate, tiny togaed citizens in the forum, laurel wreaths floating above
- Vesuvius: a dramatic smoking volcano, glowing lava at the summit, the town of Pompeii
  sprawled at its base with a bay of azure water and fishing boats
- Cannae battlefield (heel of boot): dozens of tiny soldiers in formation, cavalry
  charging, elephants trumpeting, dust clouds, scattered banners
- The Rubicon (north): a winding river with a Roman legion with eagle standards mid-crossing
- Ostia: a busy port with triremes, docks stacked with amphorae, merchants loading grain
- Scattered aqueducts striding across valleys with tiny shepherds below, amphitheaters,
  marching legions, chariots on dirt roads, villas with cypresses, olive groves, vineyards
- Ships: a fleet of triremes and merchant vessels in both seas, oars catching sunlight,
  a white sea-foam wake behind each
- The Apennine mountains running like a painted spine down the peninsula, with bears
  and wolves glimpsed in the high passes
- Corner flourishes: a gold-and-ink compass rose bottom-right, Neptune's head breathing
  winds from top-left, scrollwork cartouches

Palette: midnight-navy sea tipped with gold foil crests, warm ochre and sepia land,
glowing sunset amber, aged bronze mountains, deep shadowed valleys, cinematic chiaroscuro.

${MASTER}`,

  china: `A living, cinematic hand-painted map of Han Dynasty China circa 100 BCE, painted in
the style of a classical Chinese ink-and-gold scroll crossed with an illuminated atlas
and a matte painting from an epic film.

Composition: the Han heartland fills the frame — the Yellow River (Huang He) curving
across the north in a great dragon-loop, the Yangtze across the center-south, the snow
peaks of the Tibetan plateau in the west, the Pacific coast on the east, the Gobi
desert and steppes in the upper-left, Korea peeking on the upper-right.

On the land, painted as living miniature vignettes (NO text labels):
- Chang'an: a vast walled capital with tiered pagoda roofs of cinnabar red and gold,
  wide avenues, imperial palace with dragon banners, tiny officials in silk robes,
  market stalls with bolts of silk
- Luoyang: a second great city with vermillion gate towers, paper lanterns glowing
- A section of the Great Wall snaking across the northern mountains with lit beacon
  fires on watchtowers and tiny helmeted soldiers patrolling
- The Silk Road: a caravan of camels laden with bolts of silk winding through dunes,
  merchants in turbans, with distant oasis towns
- Terracotta soldiers in rigid ranks near Xi'an, half-buried in earth
- Paper-making scholars at wooden frames by a river, bamboo scrolls drying in the sun
- The Yellow River Valley as a golden-tan floodplain with flooded rice paddies catching
  the sky like mirrors, farmers in conical hats
- Bamboo groves with pandas, cherry blossom trees in pink bloom
- A great Chinese dragon coiling through clouds over snowy mountain peaks
- Cormorant fishermen on the Yangtze at dusk, lanterns reflecting in the water
- Xiongnu horsemen raiders galloping on the northern steppes, arrows in flight
- Corner flourishes: a gold compass rose with cardinal directions, a jade bi disc,
  a great bronze cauldron, scrollwork cartouches with dragon motifs

Palette: ink-wash misty mountains (shan shui), warm ochre and cream land with rice-paper
texture, gold-leaf accents on rooftops and compasses, deep midnight-navy rivers with
gold-foil ripples, cinnabar red for imperial architecture, jade green for forests,
cherry-blossom pink, cinematic chiaroscuro.

${MASTER}`,

  greece: `A living, cinematic hand-painted map of ancient Greece circa 450 BCE — the age
of Pericles.

Composition: mainland Greece, the Peloponnese, and the scattered Aegean islands fill
the frame, the coast of Ionia (western Anatolia) peeking on the right. The Aegean is
central, dotted with dozens of tiny islands casting long shadows on the water. Crete
stretches across the bottom. Mount Olympus crowns the top, its peak shrouded in tiny
gods lit by shafts of divine light.

On the land, painted as living miniature vignettes (NO text labels):
- Athens: a city crowned by the Acropolis with the marble Parthenon, Doric columns
  catching sunset light, olive groves terracing down, tiny philosophers in white
  robes arguing in the agora
- Sparta: a warrior encampment of red cloaks and bronze-crested helmets, hoplites in
  phalanx formation, a warrior dragging a training pillar
- Thermopylae: a dramatic narrow mountain pass choked with bodies, a handful of
  red-cloaked Spartans holding back a sea of Persian troops with gleaming armor
- Salamis strait: triremes in crashing naval battle, oars churning foam, a burning
  Persian galley listing to one side
- Delphi: a mountainside temple with smoke rising from a tripod, a robed oracle
  glimpsed inside, pilgrims climbing the path
- Epidaurus: a great stone theater carved into a hillside, an audience seated in
  concentric rings watching a masked play
- Knossos on Crete: a painted labyrinth with a bull-headed figure at its heart, a
  bull-leaper mid-vault on a fresco motif
- Triremes patrolling the Aegean, a sea serpent coiling beneath one, Poseidon's
  trident breaking the waves in one corner
- Olive groves, vineyards, goat herds on rocky hills, amphorae stacked at docks
- Corner flourishes: a gold compass rose with a key-pattern border, Medusa's head
  on a shield motif, scrollwork cartouches

Palette: deep midnight-navy Aegean with gold-foil ripples and white wave crests, warm
ochre islands with parchment texture, aged bronze mountains, olive-green groves,
marble white for temples, rose-gold sunset light, cinematic chiaroscuro.

${MASTER}`,

  egypt: `A living, cinematic hand-painted map of Ancient Egypt circa 1300 BCE — the New
Kingdom era of Ramses II.

Composition: the Nile river is the star — a shimmering blue-gold ribbon running
vertically down the entire canvas from the misty First Cataract at the bottom
(representing the south/Upper Egypt) up to the great fan-shaped Nile Delta at the top
spilling into the Mediterranean. The red desert stretches east and west of the green
river banks in an endless sea of dunes. The Red Sea glints on the far right.

On the land, painted as living miniature vignettes (NO text labels):
- The Great Pyramids of Giza with the Sphinx at their feet, casting immense shadows,
  workers hauling blocks on sleds
- Karnak and Luxor: vast temple complexes with avenues of ram-headed sphinxes,
  towering obelisks, hypostyle halls with painted columns
- The Valley of the Kings: a desolate canyon with hidden tomb entrances, workers
  with torches descending
- A pharaoh's funeral barge on the Nile, oarsmen in white kilts, hieroglyph-painted sails
- Crocodiles basking on sandbanks, hippos half-submerged, ibises wading
- Fields of emerald wheat along the Nile banks with farmers harvesting, water-lifting
  shadufs, date palms heavy with fruit
- Bedouin caravans of camels crossing the dunes with distant mirages
- A sandstorm on the western horizon, a jackal silhouette against the moon
- Ramses II's colossal statues at Abu Simbel carved into a cliff face
- The Lighthouse of (future) Pharos would be too late — instead a busy Memphis harbor
  with reed boats and Nile barges
- Corner flourishes: a gold cartouche with the Eye of Horus, a winged scarab, a
  Anubis-headed compass rose, stylized papyrus borders

Palette: Nile sapphire-turquoise and gold, burning-ochre desert, green lush river banks,
lapis-blue sky, pharaonic gold, cinnabar reds, hieroglyph blue-green, sunset orange.

${MASTER}`,

  persia: `A living, cinematic hand-painted map of the Achaemenid Persian Empire circa
500 BCE — the age of Darius the Great and Xerxes.

Composition: the Iranian plateau dominates the frame, the Zagros mountains arcing from
the northwest, the Persian Gulf glinting in the south, Mesopotamia and the Tigris-
Euphrates plain on the west, the great deserts of central Asia on the east, the Caspian
Sea top-left. Show the vast scale — this is the largest empire the world has ever seen.

On the land, painted as living miniature vignettes (NO text labels):
- Persepolis: the ceremonial capital — a vast terrace of columned halls with
  winged-bull lamassus, rows of tribute-bearers from 28 nations climbing the
  grand staircase in relief-sculpture style
- Susa: a second capital with glazed-brick walls of lions and archers in
  blue, gold, and turquoise
- Pasargadae: the tomb of Cyrus the Great — a stone stepped monument alone on a
  plain, cypresses nearby
- The Royal Road: a painted highway stretching west across the empire, royal
  messenger riders ("the Persian pony express") galloping relay-style with
  leather pouches
- The Immortals: elite Persian infantry in scale armor, wicker shields, and
  fluted tiaras, marching in ordered columns
- Chariot scythes, elephant columns, archers on horseback (Parthian shots mid-arc)
- Zoroastrian fire temples on mountaintops with eternal flames
- Caravans of camels and donkeys laden with lapis, spices, gold, silk
- Persian gardens (the original "paradises") — walled orchards with fountains
  and cypresses
- A great lion hunt with the Great King in a chariot, spearing a lion
- Corner flourishes: a gold winged-lion compass rose, a cuneiform-etched cartouche,
  a faravahar (winged-disc) symbol

Palette: Persian turquoise and lapis blue, saffron gold, crimson and pomegranate reds,
dusty ochre plains, snow-capped Zagros, rich aubergine shadows, warm torch-lit interiors.

${MASTER}`,

  byzantine: `A living, cinematic hand-painted map of the Byzantine Empire circa 550 CE —
the reign of Justinian the Great.

Composition: the eastern Mediterranean dominates — Anatolia fills the right, the Balkans
and Greece on the left, the Aegean between, the Black Sea top-right, Egypt and the
Levant bottom-right, Italy on the far left. Constantinople sits at the hinge between
Europe and Asia, glowing as the brightest point on the map.

On the land, painted as living miniature vignettes (NO text labels):
- Constantinople: a massive triple-walled city on the Golden Horn peninsula, the vast
  gold dome of Hagia Sophia rising above a sea of red-tiled roofs, the Hippodrome
  beside it with chariots frozen mid-race, the Bosphorus crowded with dromons
  (Byzantine warships) breathing Greek fire at an enemy fleet
- Ravenna in Italy: a city of mosaics, tiny glittering walls suggesting Byzantine
  artworks
- Jerusalem: the golden Dome on the Rock (anachronistic but iconic) and the Church
  of the Holy Sepulchre, pilgrims kneeling
- Alexandria: a bustling port with the (already lost) Lighthouse depicted as a
  painted ghost-ruin, books being loaded onto ships
- Mount Athos: a peninsula of cliffside monasteries, monks in black robes climbing
  rope-ladders
- Armies: cataphract heavy cavalry in golden scale armor, Varangian Guard with
  two-handed axes, Byzantine banners with the double-headed eagle
- Mosaics glimpsed in temple interiors, icon-style halos around emperors and saints
- Silk worms on mulberry leaves (the empire's industrial secret)
- A dromon warship unleashing green Greek-fire from a bronze siphon at an enemy
  vessel
- Corner flourishes: a gold double-headed eagle compass rose, icon-framed cartouches
  with halos, purple imperial borders

Palette: Byzantine purple and imperial gold dominating, icon-fresco blues and greens,
terracotta Mediterranean roofs, sea-turquoise, mosaic-tessera shimmer, candlelight
glow, cinematic divine light.

${MASTER}`,

  vikings: `A living, cinematic hand-painted map of the Viking world circa 1000 CE — the
height of the Norse age, when longships ranged from Greenland to Constantinople.

Composition: the North Atlantic fills the canvas. Scandinavia (Norway, Sweden, Denmark)
on the right, the British Isles center-left, Iceland and Greenland top-left, the coast
of Vinland (Newfoundland) peeking at the far left, the Baltic on the bottom-right.
Icy seas with jagged icebergs dominate the north, a towering aurora borealis ripples
across the top sky in greens and violets.

On the land and sea, painted as living miniature vignettes (NO text labels):
- Longships: a dozen painted dragon-prow longships slicing through foamy seas, square
  red-and-white striped sails bellying with wind, oars flashing, crews of horned-helmet
  free peoples (note: historically they didn't wear horns, but the iconography is
  expected — use subtle helmet decorations instead of cartoonish horns)
- Jellinge and Hedeby: Norse trading towns with longhouses of thatched turf roofs,
  smoke curling from central hearths, rune stones standing at crossroads
- Lindisfarne under raid: a burning monastery on an island, monks fleeing, a Viking
  warrior silhouetted against the flames
- York (Jorvik): a bustling Norse-English town with mead halls
- Iceland: a hall on a glacial plain, a volcano smoking in the distance, Thingvellir
  cliffs with a gathered assembly
- Greenland: Erik the Red's farmstead, sheep on green patches between ice
- Vinland: a small Norse settlement beside a longhouse, a native skin-boat offshore
- Ravens circling overhead (Odin's spies), wolves prowling snowy forests, a great
  stag at a spring
- A kraken-like sea monster rising between two longships, tentacles wrapping a mast
- Runestones and carved wooden idols of Thor and Freya scattered on hilltops
- A frost giant silhouette on a distant ice mountain
- Corner flourishes: a gold Mjölnir (Thor's hammer) compass rose, serpent-knot borders
  (Norse interlace), runic cartouches

Palette: icy teal and slate grey seas, deep fjord blues, blood-red sails, birch-bark
cream land, aurora green and violet sky, fire-orange torches and raids, snow white,
forest pine green, copper rune-lettering.

${MASTER}`,
};

const PROMPT = PROMPTS[REGION];
if (!PROMPT) {
  console.error(`Unknown region: ${REGION}. Options: ${Object.keys(PROMPTS).join(', ')}`);
  process.exit(1);
}

// Try Imagen 4 first for 2K output, fall back to Gemini 2.5 Flash Image.
async function tryImagen() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: PROMPT }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '1:1',
      personGeneration: 'allow_adult',
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Imagen HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const pred = json?.predictions?.[0];
  const data = pred?.bytesBase64Encoded || pred?.image?.bytesBase64Encoded;
  if (!data) throw new Error('No image bytes from Imagen: ' + JSON.stringify(json).slice(0, 300));
  return { data, mime: pred?.mimeType || 'image/png', source: 'imagen-4' };
}

async function tryGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error('No image part: ' + JSON.stringify(json).slice(0, 300));
  const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
  const mime = imgPart.inlineData?.mimeType || imgPart.inline_data?.mime_type || 'image/png';
  return { data, mime, source: 'gemini-2.5-flash-image' };
}

let result;
try {
  console.log(`[${REGION}] trying imagen-4...`);
  result = await tryImagen();
  console.log(`  [OK] got ${result.source}`);
} catch (e) {
  console.log(`  imagen failed: ${e.message.slice(0, 200)}`);
  console.log(`[${REGION}] falling back to gemini-2.5-flash-image...`);
  result = await tryGemini();
  console.log(`  [OK] got ${result.source}`);
}

const ext = result.mime.includes('jpeg') ? 'jpg' : 'png';
const outDir = path.resolve('assets');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `map-${REGION}.${ext}`);
fs.writeFileSync(outPath, Buffer.from(result.data, 'base64'));
console.log(`wrote ${outPath} - ${fs.statSync(outPath).size} bytes (${result.source})`);
