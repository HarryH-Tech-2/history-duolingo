// Programmatic manifest builder for the new regions + characters.
// Merges into scripts/asset-manifest.json (keeping any existing entries).
import fs from 'node:fs';
import path from 'node:path';

const STYLE_ICON = (subject) =>
  `A circular game icon illustration of ${subject}. Centered, clear silhouette on an aged-parchment background with subtle gold-leaf accents and a painterly ink border. Hand-painted in the style of an illuminated medieval manuscript crossed with a high-end mobile game icon. Warm torchlight, chiaroscuro, rich colors, tiny visible brush strokes. Square 1:1, the subject fills most of the frame. NO text.`;

const STYLE_Q = (subject) =>
  `A lush, cinematic hand-painted historical illustration of ${subject}. Museum-quality oil-on-canvas feel crossed with an illuminated manuscript, dramatic lighting, filmic composition, rich color, visible brush strokes, painterly realism. Warm earthy palette with gold and deep shadows. Square 1:1. NO text, NO captions, NO modern elements.`;

const STYLE_CHAR = (subject) =>
  `A bust-style oil portrait of ${subject}, painted in the dramatic style of a Renaissance master (Caravaggio, Rembrandt) crossed with an illuminated manuscript miniature. Centered portrait, head and shoulders, strong chiaroscuro, deep shadows, a single shaft of warm light from one side. Aged-parchment-and-gilt circular frame. The face is dignified, iconic, instantly recognizable. Hand-painted, rich textures, visible brush strokes. Square 1:1. NO text.`;

// New regions to generate. Existing ones (italy, greece, china) are not re-added.
const REGIONS = {
  egypt: [
    { id: 'pyramids-giza', icon: 'the Great Pyramid of Giza with the Sphinx at its base',
      questions: [
        'the three Great Pyramids of Giza at sunset with golden light, the Sphinx in the foreground, long shadows across the desert',
        'thousands of ancient Egyptian workers hauling giant limestone blocks up earthen ramps to build a pyramid',
        'a mummification scene inside a dim tomb, priests wrapping a body in linen, canopic jars beside them',
        'Pharaoh Khufu (Cheops) on his throne, commanding a council of architects holding papyrus scrolls',
        'the interior of the Great Pyramid with torchlit passageways leading up to the King\'s Chamber',
      ] },
    { id: 'hieroglyphs', icon: 'an ancient Egyptian hieroglyph cartouche with the Eye of Horus',
      questions: [
        'a scribe in white linen painting colorful hieroglyphs onto a papyrus scroll, oil lamp beside him',
        'the Rosetta Stone black basalt slab with three bands of inscriptions carved into it',
        'Jean-François Champollion in 19th-century coat deciphering hieroglyphs at a candlelit desk',
        'a temple wall covered floor-to-ceiling in brightly painted hieroglyphs and pharaonic reliefs',
        'Thoth, the ibis-headed god of writing, holding a stylus and papyrus',
      ] },
    { id: 'tutankhamun', icon: 'the golden burial mask of Tutankhamun',
      questions: [
        'the dazzling gold burial mask of King Tutankhamun, inlaid with lapis and carnelian',
        'Howard Carter in 1922 holding a lantern at the door of Tutankhamun\'s tomb, "wonderful things" inside',
        'the Valley of the Kings - a sunlit desert canyon with tomb entrances cut into cliffs',
        'a boy pharaoh Tutankhamun on a gilded throne, being crowned by priests',
        'the four golden shrines and the sarcophagus layered like Russian dolls inside the tomb',
      ] },
    { id: 'ramses', icon: 'the colossal statue of Ramses II at Abu Simbel',
      questions: [
        'the four colossal seated statues of Ramses II carved into the cliff of Abu Simbel at sunrise',
        'Ramses II in his war chariot at the Battle of Kadesh, firing a bow, Hittite chariots crashing around him',
        'the vast hypostyle hall of Karnak temple with giant painted columns and shafts of sunlight',
        'the mummy of Ramses the Great lying in state, wrapped in linen, long white hair visible',
        'Ramses II sealing a peace treaty with the Hittite king - the world\'s first known peace treaty',
      ] },
    { id: 'cleopatra', icon: 'Cleopatra VII with a cobra diadem',
      questions: [
        'Cleopatra VII in royal regalia, cobra diadem on her brow, reclining on a gilded throne',
        'Cleopatra arriving to meet Mark Antony on a purple-sailed barge on the Nile',
        'the Library of Alexandria in full glory, scrolls stacked in marble alcoves, scholars reading',
        'the Battle of Actium - Roman and Egyptian fleets clashing, Cleopatra\'s ship turning to flee',
        'Cleopatra in her chamber with an asp (cobra) curling around her wrist in dim torchlight',
      ] },
  ],
  persia: [
    { id: 'cyrus-great', icon: 'Cyrus the Great in winged crown',
      questions: [
        'Cyrus the Great on horseback, bearded and crowned, leading his Persian cavalry across a plain',
        'the Cyrus Cylinder - a clay barrel with cuneiform inscription, often called the first human rights charter',
        'the fall of Babylon - Persian soldiers entering the mighty Ishtar Gate with its blue-glazed lions',
        'the simple stepped stone tomb of Cyrus the Great at Pasargadae, cypresses around it',
        'Cyrus freeing the Jewish exiles from Babylon, a scene of bowing elders receiving scrolls',
      ] },
    { id: 'persepolis', icon: 'a winged bull lamassu from Persepolis',
      questions: [
        'the great terrace of Persepolis with its columned halls, lamassu winged bulls guarding gates',
        'a procession of tribute-bearers on the Apadana staircase relief, each nation with distinctive dress',
        'the Hall of a Hundred Columns at Persepolis, torchlit, richly carpeted',
        'Alexander the Great\'s drunken soldiers setting fire to Persepolis by night',
        'bas-relief of Persian archers in scale armor and fluted tiaras - the Immortals',
      ] },
    { id: 'royal-road', icon: 'a Persian royal messenger galloping on horseback',
      questions: [
        'a Persian royal messenger galloping at full speed down the Royal Road with a leather pouch',
        'a series of relay stations along the Royal Road, fresh horses waiting under torchlight',
        'Darius the Great on his throne issuing royal decrees sealed with clay bullae',
        'a camel caravan carrying silks and spices across arid Persian landscape',
        'merchants from many nations - Greeks, Indians, Egyptians - meeting in a Persian bazaar',
      ] },
    { id: 'xerxes', icon: 'Xerxes I with long curled beard and crown',
      questions: [
        'Xerxes I, the Great King, seated on his throne under a golden canopy',
        'the vast Persian army crossing the Hellespont on a bridge of boats lashed together',
        'Xerxes commanding his soldiers to lash the sea with whips for destroying his bridge',
        'Xerxes watching the Battle of Salamis from a golden throne on a hillside, his fleet in flames',
        'the Immortals elite guard - 10,000 Persian warriors in shimmering scale armor',
      ] },
    { id: 'zoroaster', icon: 'a Zoroastrian fire altar with eternal flame',
      questions: [
        'Zoroaster the prophet in white robes, eyes lifted skyward, holding a staff',
        'a Zoroastrian fire temple on a mountaintop with an eternal flame tended by white-robed priests',
        'the Ahura Mazda symbol - a winged disc with a bearded figure emerging from it',
        'a Magi astrologer reading the stars with an ancient brass astrolabe',
        'a Zoroastrian burial tower (dakhma) on a remote hilltop with ravens circling',
      ] },
  ],
  byzantine: [
    { id: 'constantinople', icon: 'the triple walls of Constantinople with the Golden Horn',
      questions: [
        'the massive triple land walls of Constantinople rising above the sea, banners flying',
        'Emperor Constantine founding Constantinople, consecrating the ground with Christian ceremony',
        'the Golden Horn harbor full of dromons (Byzantine warships), merchants unloading silk and spices',
        'a bustling Constantinople street market with vendors, columns, and the Hagia Sophia dome visible',
        'the Hippodrome with four bronze horses, chariots racing, packed stands cheering',
      ] },
    { id: 'hagia-sophia', icon: 'the domed silhouette of Hagia Sophia',
      questions: [
        'the vast interior of Hagia Sophia with its central dome seeming to float on rings of windows',
        'Emperor Justinian inaugurating Hagia Sophia with a Byzantine liturgy, gold mosaics glittering',
        'Byzantine mosaicists placing tiny glass tesserae to make a gold-leaf mosaic of Christ Pantocrator',
        'the great exterior of Hagia Sophia at golden hour, its dome crowning the skyline',
        'the architects Isidore of Miletus and Anthemius of Tralles studying plans with compass and rule',
      ] },
    { id: 'justinian', icon: 'Emperor Justinian in imperial purple and gold crown',
      questions: [
        'Emperor Justinian I in imperial purple robes and jeweled crown, holding the orb and scepter',
        'the famous Ravenna mosaic of Justinian and his court in gold and purple tesserae',
        'Empress Theodora on her throne in gold and jeweled regalia, advisers around her',
        'Belisarius, Justinian\'s great general, on horseback reclaiming Rome from the Ostrogoths',
        'scribes compiling the Corpus Juris Civilis (Justinian\'s Code) at long tables with scrolls',
      ] },
    { id: 'greek-fire', icon: 'a Byzantine dromon ship spraying green Greek fire',
      questions: [
        'a Byzantine dromon warship blasting green Greek fire from a bronze siphon at enemy ships',
        'a naval battle at sea with Greek fire engulfing an Arab fleet in roaring flames on water',
        'Byzantine engineers in a secret workshop mixing ingredients for Greek fire in bronze cauldrons',
        'a hand grenade of Greek fire clay pot thrown from a city wall onto attackers below',
        'Callinicus of Heliopolis, inventor of Greek fire, demonstrating his creation before the emperor',
      ] },
    { id: 'fall-byzantine', icon: 'the Ottoman cannon outside Constantinople walls',
      questions: [
        'the enormous Ottoman bombard cannon of 1453, being dragged by oxen toward Constantinople',
        'Sultan Mehmed II on a white horse directing the siege of Constantinople, red banners behind',
        'the last Byzantine Emperor Constantine XI Palaiologos defending the walls, sword in hand',
        'Ottoman ships being dragged overland on log rollers to bypass the Golden Horn chain',
        'the fall of Constantinople May 29 1453 - Ottoman soldiers pouring through a breach in the walls',
      ] },
  ],
  vikings: [
    { id: 'longships', icon: 'a Viking longship with dragon-head prow',
      questions: [
        'a Viking longship with a carved dragon-head prow, striped red-and-white sail billowing',
        'Viking shipbuilders laying overlapping oak planks (clinker-built) on a beach',
        'a fleet of longships approaching a misty coast at dawn, shields lined along the gunwales',
        'Vikings rowing through a narrow Norwegian fjord between cliffs with a waterfall',
        'Leif Erikson at the prow of a longship pointing at the coast of Vinland in the distance',
      ] },
    { id: 'lindisfarne', icon: 'the burning Lindisfarne monastery',
      questions: [
        'the 793 CE Viking raid on Lindisfarne - a monastery on a tidal island burning in the night',
        'monks fleeing across the sand bar from Lindisfarne as longships disgorge raiders',
        'a Viking warrior with axe silhouetted against the burning monastery walls',
        'plunder on the beach - gold crucifixes, illuminated gospels, silver chalices piled beside longships',
        'the Lindisfarne Gospels - an illuminated manuscript open to a rich interlace page',
      ] },
    { id: 'norse-gods', icon: 'Thor\'s hammer Mjolnir with lightning',
      questions: [
        'Thor hurling Mjolnir, his mighty hammer, with lightning cracking across a stormy sky',
        'Odin the Allfather on his eight-legged horse Sleipnir with two ravens Huginn and Muninn on his shoulders',
        'the rainbow bridge Bifrost arcing between Midgard (Earth) and the shining halls of Asgard',
        'the great world-tree Yggdrasil, a colossal ash tree with worlds among its roots and branches',
        'Ragnarok - the twilight of the gods, Fenrir the wolf swallowing the sun as warriors battle',
      ] },
    { id: 'erik-red', icon: 'Erik the Red in furs with a broadaxe',
      questions: [
        'Erik the Red, a red-bearded Viking in furs, landing on the icy shore of Greenland',
        'Erik\'s Norse settlement on Greenland - turf-roofed longhouses among ice and sparse grass',
        'Leif Erikson, Erik\'s son, stepping ashore at Vinland (Newfoundland) with his crew',
        'a Viking meeting with Skraeling (indigenous) people at a coastal trading beach',
        'the longhouse at L\'Anse aux Meadows with smoke rising, a longship pulled up on the beach',
      ] },
    { id: 'leif-vinland', icon: 'Leif Erikson pointing at a new coast',
      questions: [
        'Leif Erikson in furs at the prow of his longship, sighting the coast of Vinland',
        'a Norse crew picking wild grapes in Vinland - the reason Leif named it so',
        'a Viking settlement in Vinland with longhouses, smoke, and drying fish racks',
        'Norse and Skraeling warriors clashing on a wooded beach, the Vikings eventually retreating',
        'the reconstructed Norse longhouse at L\'Anse aux Meadows with turf walls and thatched roof',
      ] },
  ],
};

// Historical characters for the avatar picker.
const CHARACTERS = [
  { id: 'caesar', subject: 'Julius Caesar, laurel wreath, Roman general cloak, stern profile' },
  { id: 'cleopatra', subject: 'Cleopatra VII of Egypt, golden cobra diadem, kohl-lined eyes, serene regal gaze' },
  { id: 'confucius', subject: 'Confucius, elder Chinese sage, long white beard, traditional scholar robes, gentle wise expression' },
  { id: 'leonidas', subject: 'King Leonidas of Sparta, bronze Corinthian helmet with red plume, bearded, fierce gaze' },
  { id: 'alexander', subject: 'Alexander the Great, youthful, tousled lion-mane hair, gold diadem, Macedonian cloak, piercing eyes' },
  { id: 'nefertiti', subject: 'Queen Nefertiti of Egypt, tall blue crown, regal swan neck, iconic beauty' },
  { id: 'hannibal', subject: 'Hannibal Barca of Carthage, dark beard, bronze helmet, Phoenician robes, commanding gaze' },
  { id: 'pericles', subject: 'Pericles of Athens, bronze-crested helmet pushed back, beard, calm orator\'s gaze' },
  { id: 'augustus', subject: 'Emperor Augustus, laurel wreath, young imperial Roman, marble-cool expression' },
  { id: 'boudica', subject: 'Queen Boudica of the Iceni, fierce red-haired Celtic warrior queen, torc necklace, war paint' },
  { id: 'joan-arc', subject: 'Joan of Arc, young medieval warrior maid in polished plate armor, cropped hair, halo of divine light, holding a banner' },
  { id: 'ragnar', subject: 'Ragnar Lothbrok, braided Viking warrior chieftain, long braided beard, fur cloak, axe on shoulder' },
];

function buildManifest() {
  const items = [];
  // Existing italy/greece/china icons + questions remain generated.
  // We only add NEW items here; asset-manifest.json is merged with existing.
  for (const [region, lessons] of Object.entries(REGIONS)) {
    for (const lesson of lessons) {
      items.push({
        out: `assets/icons/${lesson.id}.png`,
        prompt: STYLE_ICON(lesson.icon),
      });
      for (let i = 0; i < lesson.questions.length; i++) {
        items.push({
          out: `assets/q/${lesson.id}-${i}.png`,
          prompt: STYLE_Q(lesson.questions[i]),
        });
      }
    }
  }
  for (const c of CHARACTERS) {
    items.push({
      out: `assets/characters/${c.id}.png`,
      prompt: STYLE_CHAR(c.subject),
    });
  }
  return items;
}

const manifestPath = path.resolve('scripts/asset-manifest.json');
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch {}
const existingOuts = new Set(existing.map((e) => e.out));

const fresh = buildManifest();
const added = fresh.filter((it) => !existingOuts.has(it.out));

const merged = [...existing, ...added];
fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));
console.log(`Manifest: ${existing.length} existing + ${added.length} new = ${merged.length} total.`);
console.log(`Wrote ${manifestPath}`);
