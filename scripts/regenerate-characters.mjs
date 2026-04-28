// Regenerate the 12 historical-character avatar portraits with a more
// realistic, museum-quality look. Deletes the existing PNGs first so the
// pipeline actually re-paints them (the normal batch generator skips
// existing files).
//
// Usage: GEMINI_API_KEY=... node scripts/regenerate-characters.mjs [--concurrency=3]

import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('Set GEMINI_API_KEY');
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const CONCURRENCY = parseInt(args.concurrency || '3', 10);

const MODEL = 'gemini-2.5-flash-image';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

// Photoreal, museum-grade portrait style. Heavy on real skin texture,
// natural light, period-accurate costume and reconstruction accuracy.
const STYLE = (subject) =>
  `An ultra-realistic, photorealistic museum-grade forensic reconstruction portrait of ${subject}.
Head-and-shoulders bust composition, centered, subject facing slightly toward camera.
Rendered like a high-end National Geographic historical reconstruction photograph:
flawless skin detail with pores, fine hair strands, natural eye moisture and catchlights,
realistic fabric and metal textures, period-accurate costume, jewelry, and hairstyle.
Cinematic single-source Rembrandt lighting from upper left, soft falloff into deep shadow,
shallow depth of field (85mm f/1.8 look), subtle film grain, warm neutral color grade.
Dark moody atmospheric background suggesting the subject's era (stone, cloth, torchlight).
The face must look like a real living person photographed in studio — NOT a painting,
NOT cartoon, NOT CGI-plastic, NOT illustration.
Square 1:1, high resolution, tack-sharp focus on the eyes.
NO text, NO captions, NO watermark, NO logos, NO frame.`;

// Richly detailed, period-accurate subject descriptions. These push Gemini
// toward a specific, recognisable historical look.
const CHARACTERS = [
  {
    id: 'caesar',
    subject:
      'Julius Caesar, Roman dictator in his early 50s, lean angular face, prominent cheekbones, high forehead with receding dark hair combed forward, clean-shaven, strong aquiline nose, piercing intelligent dark eyes, thin determined mouth. Wearing a pristine white toga with a deep-crimson senatorial stripe, a gilded laurel wreath on his head. Background: dim marble colonnade.',
  },
  {
    id: 'cleopatra',
    subject:
      'Cleopatra VII of Ptolemaic Egypt, woman in her late 20s with warm olive-Mediterranean skin, dark almond eyes lined with kohl, straight dark hair in braided Nubian style, high cheekbones, small straight nose, delicate chin. Wearing a gold cobra uraeus diadem on her brow, a pleated fine-linen sheath, an elaborate golden pectoral collar inlaid with lapis and carnelian. Background: warm torchlit sandstone temple wall with faint hieroglyphs.',
  },
  {
    id: 'confucius',
    subject:
      'Confucius (Kong Fuzi), elderly Chinese sage in his 60s, kind wise expression, warm olive skin, long flowing white beard and white topknot, high forehead, gentle dark eyes with fine wrinkles, small mouth. Wearing traditional Zhou-dynasty dark-indigo hanfu scholar robes with wide sleeves and a black scholar\'s cap. Background: soft ink-wash mountains and bamboo suggested in deep shadow.',
  },
  {
    id: 'leonidas',
    subject:
      'King Leonidas I of Sparta, rugged Greek warrior man in his 40s, weathered sun-tanned Mediterranean skin, full dark brown beard threaded with grey, shoulder-length dark hair, intense grey-blue eyes under heavy brows, broken nose, strong jaw, battle scars. Wearing a bronze Corinthian helmet with a tall transverse crimson horsehair crest pushed back to reveal his face, a red wool himation cloak, and a bronze muscle cuirass visible at the shoulders. Background: cold stone of a mountain pass at dawn.',
  },
  {
    id: 'alexander',
    subject:
      'Alexander the Great of Macedon, handsome youthful man of 25, smooth Mediterranean skin, famously tousled lion-mane of reddish-blond hair parted in the middle (anastole), clean-shaven, pronounced slightly-tilted head, heterochromatic eyes (one blue one brown), fine straight nose, sensitive mouth. Wearing a polished bronze cuirass embossed with the head of Medusa, a deep-purple Macedonian chlamys cloak pinned at the shoulder with a gold clasp, a simple gold diadem. Background: dim torchlit stone wall.',
  },
  {
    id: 'nefertiti',
    subject:
      'Queen Nefertiti of the 18th-Dynasty Egypt, woman in her 30s, warm honey-brown skin, flawless symmetrical face, long graceful swan-neck, high cheekbones, serene almond eyes lined with kohl and malachite, full lips with a soft curve. Wearing the iconic tall flat-topped blue Crown of Nefertiti banded with gold, a broad golden usekh collar inlaid with lapis and carnelian, a fine-linen robe. Background: warm torchlit sandstone.',
  },
  {
    id: 'hannibal',
    subject:
      'Hannibal Barca of Carthage, Phoenician North-African general in his late 30s, olive-bronze sun-weathered skin, dark tightly curled short hair and thick dark beard, intense dark eyes, strong Semitic nose, lean hawk-like face. Wearing a polished bronze Hellenistic muscle cuirass, a dark-red Punic cloak pinned at the shoulder, a gold medallion with a Tanit symbol. An eye-patch or milky-blind left eye (historically blinded in a marsh). Background: stormy Alpine sky.',
  },
  {
    id: 'pericles',
    subject:
      'Pericles of Athens, Greek statesman in his 50s, Mediterranean olive skin, well-groomed full dark beard and wavy dark hair, calm thoughtful dark eyes, straight classical nose, high-domed forehead (he was famously described as onion-headed). Wearing a Corinthian-style bronze helmet pushed back to the top of his head revealing the face, a fine white wool himation with a narrow indigo border draped over the shoulder. Background: pale Athenian marble colonnade in soft shadow.',
  },
  {
    id: 'augustus',
    subject:
      'Emperor Augustus (Octavian), Roman imperator in his early 30s, smooth pale Italic skin, youthful oval face, calm marble-cool expression, sharply cut short wavy dark-blond hair in the Primaporta style, clean-shaven, serene grey-blue eyes, fine straight nose, small firm mouth. Wearing a gilded bronze parade cuirass embossed with mythological reliefs, a deep-purple paludamentum cloak, a golden civic oak-leaf corona civica on his brow. Background: dim imperial-red marble.',
  },
  {
    id: 'boudica',
    subject:
      'Queen Boudica of the Iceni, Celtic warrior queen in her late 30s, pale freckled Northern-European skin, fiery long copper-red hair in loose warrior braids whipping in the wind, fierce blue-green eyes under strong brows, slash of blue woad war-paint across the cheekbones. Wearing a heavy twisted gold torc around her neck, a dyed-tartan cloak of green, russet and ochre pinned with a bronze penannular brooch, chain-mail glinting beneath. Background: stormy grey Iron-Age British sky.',
  },
  {
    id: 'joan-arc',
    subject:
      'Joan of Arc, young French peasant-warrior maid of 17, pale northern European skin, round youthful face with faint freckles, close-cropped dark chestnut hair cut in a boyish bowl, large earnest grey eyes lifted slightly as if in prayer, small pink mouth. Wearing polished silver 15th-century plate-armor pauldrons and breastplate over a padded gambeson, a white linen surcoat with a faint gold fleur-de-lys embroidered on the chest. A subtle faint golden halo-like rimlight behind her head. Background: dim medieval stone chapel interior.',
  },
  {
    id: 'ragnar',
    subject:
      'Ragnar Lothbrok, legendary Viking chieftain in his 40s, weathered wind-burned Nordic skin, piercing pale blue eyes, long dark-blond hair shaved at the sides with the top braided and pulled back, thick forked braided beard with beads woven in, a weathered black Nordic face-tattoo of runes curling along the temple. Wearing a heavy brown bearskin-fur cloak over a coarse undyed linen tunic, a silver Thor\'s-hammer Mjolnir amulet on a leather thong, a single chunky silver ring on his ear. Background: cold grey Norwegian fjord mist.',
  },
];

async function generateOne(c) {
  const outPath = path.resolve(`assets/characters/${c.id}.png`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // Delete any existing file so we truly regenerate.
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

  const body = {
    contents: [{ role: 'user', parts: [{ text: STYLE(c.subject) }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    throw new Error('No image in response: ' + JSON.stringify(json).slice(0, 300));
  }
  const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  return { id: c.id, bytes: fs.statSync(outPath).size };
}

async function runPool(items, concurrency) {
  const queue = [...items];
  let done = 0;
  const results = [];
  const failures = [];
  async function worker() {
    while (queue.length) {
      const c = queue.shift();
      if (!c) return;
      try {
        const r = await generateOne(c);
        done++;
        console.log(`[${done}/${items.length}] ✓ ${c.id} (${r.bytes} bytes)`);
        results.push(r);
      } catch (e) {
        done++;
        console.error(`[${done}/${items.length}] ✗ ${c.id}: ${e.message}`);
        failures.push({ id: c.id, error: e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { results, failures };
}

const { results, failures } = await runPool(CHARACTERS, CONCURRENCY);
console.log(`\nDone. ${results.length} regenerated, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f.id}: ${f.error}`);
  process.exit(1);
}
