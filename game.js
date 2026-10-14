// Two layouts: the landscape spread, and a tall page for phones held upright. All numbers are page pixels.
// stage: the whole page; scene: the picture she stands in; cx/floor: where her feet go; scale: her size;
// spill: where things land when she tips her bag out; seat/bagAt: her shift and her bag's spot on the bus;
// bgX: how far across each photo is centred (%), so its landmark stays in view.
const isPortrait = () => innerWidth / innerHeight < 0.8;
const PORTRAIT = isPortrait();
const LAYOUT = PORTRAIT ? {
  stage: [560, 1180], scene: [560, 780], cx: 280, floor: 772, scale: 0.365, prop: 0.8,
  spill: [[80, 290], [478, 280], [78, 420], [482, 415], [82, 560], [476, 550]],
  seat: [-7, 127], bagAt: [452, 690, 92],
  bgX: { dorm: 40, 'bus-stop': 38, campanile: 78 },
} : {
  stage: [1366, 768], scene: [1366, 768], cx: 683, floor: 762, scale: 0.44, prop: 1,
  spill: [[905, 250], [1050, 240], [1195, 265], [910, 390], [1050, 385], [1195, 410]],
  seat: [-7, 186], bagAt: [868, 652, 118],
  bgX: {},
};
const [STAGE_W, STAGE_H] = LAYOUT.stage, [SCENE_W, SCENE_H] = LAYOUT.scene;

// Everything on her is placed in doll pixels. The art build stands every doll and every outfit
// drawing to the same height (FEET), so she never changes size when she changes clothes.
const SCALE = LAYOUT.scale, FLOOR = LAYOUT.floor, FEET = 1700;
const DOLL = { left: LAYOUT.cx - 228 * SCALE, top: FLOOR - FEET * SCALE, cropLeft: 280 };
const OUTFIT_CROP = { left: 230, height: FEET };
const DOLL_Z = 50, ARMS_LAYER = 8, WORN_Z = 60;
const MOUTH = [508, 398], EAR = [640, 250];

const DOLLS = [
  { id: 'black', name: 'the brunette' },
  { id: 'auburn', name: 'the redhead' },
  { id: 'blonde', name: 'the blonde' },
  { id: 'raven', name: 'straight black hair' },
  { id: 'wavy', name: 'wavy black hair' },
  { id: 'braids', name: 'braids' },
];

// The day, in order. tab is the closet section that opens when she gets there.
// seat: she sits (shifted by [dx, dy]) behind the bus seat; bagAt: where her bag rests instead of in her hand.
const STORY = [
  { place: 'the dorm', bg: 'dorm', tab: 'tops', tag: '8:07 am!', text: 'You have a 9am. Get dressed.' },
  { place: 'the dorm', bg: 'dorm', tab: 'bag', bag: true, tag: "What's in her bag?", text: "Pack your bag — tap what you're bringing." },
  { place: 'the bus stop', bg: 'bus-stop', bag: true, out: true, tag: 'On time?!', text: 'The 51B is actually on time for once. Tap her bag, then tap what falls out.' },
  { place: 'on the bus', bg: 'bus', bag: true, out: true, seat: LAYOUT.seat, bagAt: LAYOUT.bagAt, tag: 'Spotted!', text: 'Headphones in. Tap the earbuds to change the song.' },
  { place: 'sather gate', bg: 'sather-gate', bag: true, out: true, tag: 'Campus #1 pick!', text: 'Dodge the flyers on Sproul. Coffee helps.' },
  { place: 'the campanile', bg: 'campanile', bag: true, out: true, tag: 'Golden hour!', text: 'Made it. Tap the camera.' },
];

const TABS = ['tops', 'bottoms', 'under', 'extras', 'bag'];

// slot: tops, bottoms and the dress swap each other out, so an outfit is always one top + one bottom, or the dress.
// worn: where a loose piece lands on the doll (centre x, top, width, tilt) — fitted clothes get theirs from fits.js.
// nudge: a per-doll correction [x, y, tilt] in doll pixels and degrees, where one girl's face or body sits differently.
// layer: what goes over what. Her arms sit at layer 8, so anything lower hangs behind her hands.
// shop: paste the exact product page here; until then the link searches zara.com for `find`.
const ITEMS = [
  { id: 'jacket', name: 'suede bomber', tab: 'tops', slot: 'top', layer: 10, find: 'suede bomber jacket', shop: 'https://www.zara.com/us/en/faux-suede-bomber-jacket-p03046256.html?v1=594400803' },
  { id: 'sweater', name: 'knit tee', tab: 'tops', slot: 'top', layer: 9, find: 'short sleeve knit sweater', shop: '' },
  { id: 'cami', name: 'lace cami', tab: 'tops', slot: 'top', layer: 6, find: 'lace camisole top', shop: 'https://www.zara.com/us/en/georgette-lace-camisole-p05919720.html?v1=551389613' },
  { id: 'dress', name: 'satin halter dress', tab: 'tops', slot: 'dress', layer: 7, find: 'satin halter mini dress', shop: 'https://www.zara.com/us/en/satin-halter-dress-p08220748.html?v1=583452684' },
  { id: 'jeans', name: 'ripped jeans', tab: 'bottoms', slot: 'bottom', layer: 4, find: 'ripped wide leg jeans', shop: 'https://www.zara.com/us/en/trf-mid-rise-ripped-baggy-folded-jeans-p05252221.html?v1=600958727' },
  { id: 'skirt', name: 'lace skirt', tab: 'bottoms', slot: 'bottom', layer: 5, find: 'asymmetric lace skirt', shop: 'https://www.zara.com/us/en/asymmetric-sequin-tulle-skirt-p07521171.html?v1=545474603' },
  { id: 'boots', name: 'suede boots', tab: 'bottoms', worn: [518, 1286, 198], wornArt: true, layer: 3, find: 'suede heeled boots', shop: 'https://www.zara.com/us/en/suede-gathered-heeled-boots-p11002810.html?v1=595371074' },
  { id: 'bra', name: 'lace bralette', tab: 'under', nudge: { auburn: [0, 23] }, layer: 2, find: 'lace bralette', shop: 'https://www.zara.com/us/en/beaded-lace-triangle-bra-p07521152.html?v1=545474540' },
  { id: 'thong', name: 'lace thong', tab: 'under', layer: 1, find: 'lace thong', shop: 'https://www.zara.com/us/en/mesh-lace-thong-p01500701.html?v1=545465784' },
  { id: 'sunglasses', name: 'sunglasses', tab: 'extras', worn: [502, 216, 252], nudge: { auburn: [0, 24], raven: [10, 2, 6], wavy: [9, 2, 5] }, layer: 13, find: 'cat eye sunglasses', shop: 'https://www.zara.com/us/en/cat-eye-sunglasses-p04646203.html?v1=545494482' },
  { id: 'earrings', name: 'gem earrings', tab: 'extras', worn: [505, 312, 272], nudge: { auburn: [0, 20] }, wornArt: true, layer: 12, find: 'stone drop earrings', shop: 'https://www.zara.com/us/en/resin-and-jewel-piece-earrings-p01856260.html?v1=545494352' },
  { id: 'hairpin', name: 'gold hair pin', tab: 'extras', worn: [610, 95, 50, 25], layer: 14, find: 'metal hair pin', shop: 'https://www.zara.com/us/en/metal-hair-clip-p04736244.html?v1=548982982' },
  { id: 'wallet', name: 'wallet + earbuds', tab: 'bag', size: 92 },
  { id: 'notebook', name: 'journal', tab: 'bag', size: 145 },
  { id: 'camera', name: 'camera', tab: 'bag', size: 92 },
  { id: 'money', name: 'cash', tab: 'bag', size: 105 },
  { id: 'coffee', name: 'coffee', tab: 'bag', size: 110 },
  { id: 'cigarettes', name: 'cigarettes', tab: 'bag', size: 54 },
  { id: 'bag', worn: [700, 1067, 250, -4] },
];
for (const item of ITEMS) item.kind = item.id === 'bag' ? 'bag' : item.tab === 'bag' ? 'prop' : 'wear';

// The cover lines in the corner: three show at a time and they keep changing.
const TEASERS = [
  ['Scoop!', 'Is the 51B EVER on time?'],
  ['Missing!', 'Lost in Dwinelle since Tuesday'],
  ['Inside:', "Karl the Fog's shock return"],
  ['Exposed!', 'The 6: does it even exist?'],
  ['Rush week', 'Who got a bid on Piedmont?'],
  ['Moffitt at 3am', "Who's still in there?"],
  ['Telegraph Ave', 'She bought ANOTHER tote bag'],
  ['Sproul shock!', '14 flyers in one walk'],
  ['Frat row', 'The theme nobody understood'],
  ['Only here:', 'GBC line seen from space'],
  ['Top Dog, 2am', 'Caught. Again.'],
  ['Breaking:', 'CalCentral down on enrollment day'],
  ['Hills alert!', 'She WALKED to Foothill'],
  ['Main Stacks', 'Has anyone seen the sun?'],
  ['Big Game', 'Stanfurd who?'],
];

// where things land when she tips her bag out
const SPILL = LAYOUT.spill;
// the snapshots her camera can take
const FILM = [
  ...[1, 2, 3, 4].map((n) => `assets/film/film-${n}.jpg`),
  ...['dwinelle', 'greek-row', 'telegraph', 'bus-6', 'top-dog', 'main-stacks', 'lower-sproul', 'foothill', 'yogurt-park'].map((place) => `assets/film/place-${place}.jpg`),
];

const $ = (id) => document.getElementById(id);
const make = (tag, props = {}, ...kids) => {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...kids);
  return el;
};
const stage = $('stage'), canvas = $('canvas');
const item = (id) => ITEMS.find((it) => it.id === id);
const bag = item('bag');
const props = ITEMS.filter((it) => it.kind === 'prop');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
let stageScale = 1;
let topZ = 200;
let dollIndex = 0, step = 0;
let outfit = null; // the full drawing she's in right now, if her top + bottom has one
let outfitEl, strideEl;
const outfitArt = {};

function fitStage() {
  const frame = $('frame');
  // turning the phone swaps layouts; simplest to start the page again in the other one
  if (isPortrait() !== PORTRAIT) return location.reload();
  stageScale = Math.min(frame.clientWidth / STAGE_W, frame.clientHeight / STAGE_H) || 1;
  stage.style.transform = `scale(${stageScale}) translate(-50%, -50%)`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

// A small alpha map so taps pass through the empty parts of a cutout.
// Unavailable when the page is opened straight from disk; then the whole box is tappable.
function alphaMap(img) {
  const w = 72, h = Math.max(1, Math.round(72 * img.naturalHeight / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  try {
    return { w, h, data: ctx.getImageData(0, 0, w, h).data };
  } catch {
    return null;
  }
}

const onDoll = ([x, y]) => [DOLL.left + (x - DOLL.cropLeft) * SCALE, DOLL.top + y * SCALE];

function place(it, cx, cy, w, rot) {
  const h = w / it.aspect;
  Object.assign(it, { cx, cy, w, h, rot });
  it.el.style.width = `${w}px`;
  it.el.style.height = `${h}px`;
  it.el.style.transform = `translate(${cx - w / 2}px, ${cy - h / 2}px) rotate(${rot}deg)`;
}

function placeOnDoll(it, shift = [0, 0]) {
  const [srcCx, top, srcW, rot = 0] = it.worn;
  const w = srcW * SCALE;
  const [nx, ny, tilt = 0] = (it.nudge || {})[DOLLS[dollIndex].id] || [0, 0];
  const [x, y] = onDoll([srcCx + nx, top + ny]);
  place(it, x + shift[0], y + shift[1] + w / it.aspect / 2, w, rot + tilt);
}

function pop(it) {
  it.el.animate([{ scale: 0.9 }, { scale: 1.05 }, { scale: 1 }], { duration: 320, easing: 'ease-out' });
}

// How far the whole figure is moved: only ever down into the bus seat.
const figureShift = () => STORY[step].seat || [0, 0];

const wearing = (slot) => ITEMS.find((it) => it.slot === slot && it.isWorn);

function findOutfit() {
  const top = wearing('top'), bottom = wearing('bottom');
  const key = wearing('dress') ? 'dress' : top && bottom ? `${top.id}-${bottom.id}` : null;
  const drawn = key && OUTFITS[DOLLS[dollIndex].id].includes(key);
  return drawn ? { key, src: `assets/dolls/outfit-${DOLLS[dollIndex].id}-${key}.png` } : null;
}

// What's in the scene right now: her outfit, her bag once she's packing, and anything pulled out of it.
function isShown(it) {
  if (it.kind === 'bag') return !!STORY[step].bag;
  if (it.kind === 'prop') return it.where === 'out' && !!STORY[step].out;
  if (!it.isWorn) return false;
  if (!outfit) return true;
  // the drawing already has her top and bottom on, and underwear is underneath
  return !it.slot && it.tab !== 'under';
}

async function refresh() {
  const next = findOutfit();
  if (next && !outfitArt[next.src]) outfitArt[next.src] = await loadImage(next.src);
  outfit = findOutfit(); // she may have changed again while the drawing loaded
  if (outfit && !outfitArt[outfit.src]) return refresh();

  $('figure').classList.toggle('dressed', !!outfit);
  outfitEl.classList.toggle('on', !!outfit);
  if (outfit) outfitEl.src = outfit.src;

  const [dx, dy] = figureShift();
  $('poser').style.transform = `translate(${dx}px, ${dy}px)`;

  // Her boots stand where this drawing's legs are. Below `cut` her own feet are hidden and the boots
  // take over; under jeans that line is the hem, so only the toes show.
  const boots = item('boots');
  const [legsX, legsApart, hem, handX, handY] = STANCE[DOLLS[dollIndex].id][outfit ? outfit.key : 'bare'];
  const bootsW = Math.min(legsApart, 118) / 0.505; // wide-leg jeans spread her feet further than the pair of boots can
  boots.worn = [legsX, FEET + 8 - bootsW / boots.aspect, bootsW];
  boots.cut = hem ? hem + 2 : FEET - 95;
  boots.clipped = !!hem;
  boots.el.style.clipPath = hem ? `inset(${(boots.cut - boots.worn[1]) * SCALE}px 0 0 0)` : '';
  $('figure').style.setProperty('--cut', `${boots.isWorn ? (FEET - boots.cut) * SCALE : 0}px`);

  // the bag's handle loops over the fingers of whichever drawing she's in
  if (handX) bag.worn = [handX + 22, handY - 58, 250, -4];
  const rest = STORY[step].bagAt;
  if (rest) place(bag, rest[0], rest[1], rest[2], 8);
  else placeOnDoll(bag, [dx, dy]);

  for (const it of ITEMS) {
    if (it.kind === 'wear') placeOnDoll(it);
    it.el.classList.toggle('gone', !isShown(it));
    if (it.pick) it.pick.setAttribute('aria-pressed', it.kind === 'wear' ? !!it.isWorn : it.where !== 'dorm');
  }
}

function toggleWear(it) {
  it.isWorn = !it.isWorn;
  if (it.isWorn && it.slot) {
    // one top and one bottom at a time; the dress replaces both
    const clash = (other) => other !== it && other.slot && (other.slot === it.slot || it.slot === 'dress' || other.slot === 'dress');
    ITEMS.filter(clash).forEach((other) => { other.isWorn = false; });
  }
  if (it.isWorn) pop(it);
  refresh();
}

function togglePacked(it) {
  it.where = it.where === 'dorm' ? 'bag' : 'dorm';
  if (STORY[step].bag) pop(bag);
  refresh();
}

function toggleSpill() {
  const out = props.filter((it) => it.where === 'out');
  const inside = props.filter((it) => it.where === 'bag');
  if (!STORY[step].out) return toast('she tips her bag out once she leaves the dorm');
  if (!out.length && !inside.length) return toast('her bag is empty — pack it from the closet');
  pop(bag);
  out.forEach((it) => { it.where = 'bag'; });
  if (!out.length) {
    inside.forEach((it, i) => {
      it.where = 'out';
      place(it, ...SPILL[i % SPILL.length], it.size * LAYOUT.prop, 0);
      it.el.style.zIndex = it.z = ++topZ;
      pop(it);
    });
  }
  refresh();
}

// ---- what the things in her bag do ----

const USES = {
  camera() {
    Sound.shutter();
    $('flash').animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' });
    const pool = FILM.filter((src) => src !== USES.lastShot);
    USES.lastShot = pool[Math.floor(Math.random() * pool.length)];
    const now = new Date();
    const stamp = `'${String(now.getFullYear()).slice(2)} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    setTimeout(() => openSheet(
      make('figure', { className: 'print' },
        make('div', {}, make('img', { src: USES.lastShot, alt: 'A snapshot from around campus' }), make('time', { textContent: stamp })),
        make('figcaption', { textContent: 'berkeley, on film' })),
    ), 250);
  },
  notebook() {
    const page = make('textarea', { placeholder: 'dear diary…', spellcheck: false });
    page.setAttribute('aria-label', 'Journal page');
    try { page.value = localStorage.getItem('berkeley-journal') || ''; } catch { /* private window: just don't keep it */ }
    page.addEventListener('input', () => { try { localStorage.setItem('berkeley-journal', page.value); } catch { /* same */ } });
    openSheet(
      make('h2', { textContent: 'journal' }),
      make('p', { className: 'sub', textContent: `${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · ${STORY[step].place}` }),
      page,
    );
    page.focus();
  },
  wallet: () => nextStation(),
  coffee(it) {
    Sound.sip();
    it.el.animate([{ rotate: '0deg' }, { rotate: '-32deg', offset: 0.35 }, { rotate: '-32deg', offset: 0.7 }, { rotate: '0deg' }], { duration: 900, easing: 'ease-in-out' });
  },
  cigarettes() {
    Sound.exhale();
    const [dx, dy] = figureShift();
    const [x, y] = onDoll(MOUTH);
    for (let i = 0; i < 9; i++) {
      setTimeout(() => {
        const puff = make('i', { className: 'puff' });
        puff.style.cssText = `left:${x + dx}px; top:${y + dy}px; --dx:${60 + Math.random() * 110}px; --dy:${-70 - Math.random() * 110}px`;
        $('sprites').append(puff);
        setTimeout(() => puff.remove(), 2900);
      }, i * 110);
    }
  },
  money: (it) => { pop(it); toast('$1.37. enough for half a boba.'); },
};

let noteTimer;
function nextStation() {
  const list = [...Sound.stations, null];
  const next = list[(list.indexOf(Sound.station) + 1) % list.length];
  clearInterval(noteTimer);
  if (!next) Sound.stop();
  else {
    Sound.play(next);
    // little notes drift up from her earbuds while it plays
    if (!calm) noteTimer = setInterval(() => {
      const [dx, dy] = figureShift();
      const [x, y] = onDoll(EAR);
      const note = make('i', { className: 'note', textContent: Math.random() < 0.5 ? '♪' : '♫' });
      note.style.cssText = `left:${x + dx}px; top:${y + dy}px; --dx:${20 + Math.random() * 50}px`;
      $('sprites').append(note);
      setTimeout(() => note.remove(), 2500);
    }, 900);
  }
  toast(next ? `now playing · ${next}` : 'music off');
}

// ---- the sheet that holds the journal, a photo, or the shopping list ----

function openSheet(...content) {
  $('sheet-body').replaceChildren(...content);
  $('veil').hidden = false;
  $('sheet-close').focus();
}
function closeSheet() {
  $('veil').hidden = true;
}

const shopLink = (it) => it.shop || `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(it.find)}`;

function openShop() {
  const worn = ITEMS.filter((it) => it.kind === 'wear' && it.isWorn);
  const rows = worn.map((it) => make('li', {},
    make('img', { src: it.flat, alt: '' }),
    make('span', { textContent: it.name }),
    make('a', { href: shopLink(it), target: '_blank', rel: 'noopener', textContent: 'find at zara ↗' })));
  openSheet(
    make('h2', { textContent: 'shop the look' }),
    make('p', { className: 'sub', textContent: worn.length ? 'everything she has on right now.' : "she isn't wearing anything from the closet yet." }),
    make('ul', { className: 'look' }, ...rows),
  );
}

// ---- moving through the day ----

function showTab(name) {
  for (const [tab, button] of Object.entries(tabButtons)) button.setAttribute('aria-selected', tab === name);
  let shown = 0;
  for (const it of ITEMS.filter((other) => other.tile)) {
    it.tile.hidden = it.tab !== name;
    if (it.tab !== name) continue;
    // restart the entrance so each section slides in, one tile after the next
    it.tile.style.animation = 'none';
    void it.tile.offsetWidth;
    it.tile.style.animation = '';
    it.tile.style.animationDelay = `${shown++ * 45}ms`;
  }
}

let teaserAt = 0;
function nextTeasers() {
  [...$('teasers').children].forEach((slot, i) => {
    const [kicker, line] = TEASERS[(teaserAt + i) % TEASERS.length];
    // the new line pans in from the right as the old one pans out to the left
    // if the last change hasn't finished (two changes close together, or the tab was in the background), clear it first
    [...slot.children].slice(0, -1).forEach((stale) => stale.remove());
    const old = slot.lastElementChild;
    const next = make('span', {}, make('b', { textContent: kicker }), line);
    slot.append(next);
    if (!old) return;
    if (calm) return old.remove();
    const pan = { duration: 520, delay: i * 90, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'both' };
    old.classList.add('leaving');
    old.animate([{ translate: '0 0' }, { translate: '-115% 0' }], pan);
    setTimeout(() => old.remove(), pan.duration + pan.delay + 60);
    next.animate([{ translate: '115% 0' }, { translate: '0 0' }], pan);
  });
  teaserAt += 3;
}

function goTo(next) {
  const from = STORY[step].bg;
  step = Math.max(0, Math.min(STORY.length - 1, next));
  const scene = STORY[step];
  for (const [name, el] of Object.entries(backdrops)) el.classList.toggle('on', name === scene.bg);
  $('seat').classList.toggle('on', !!scene.seat);
  $('place').textContent = scene.place;
  $('pick').textContent = scene.tag;
  $('caption').textContent = scene.text;
  [...$('dots').children].forEach((dot, i) => dot.classList.toggle('on', i === step));
  $('story-prev').disabled = step === 0;
  $('story-next').disabled = step === STORY.length - 1;
  if (scene.tab) showTab(scene.tab);
  nextTeasers();
  // anything pulled out on location goes back in the bag when she's back in her room
  if (!scene.out) props.filter((it) => it.where === 'out').forEach((it) => { it.where = 'bag'; });
  if (scene.bg !== from) {
    // she walks into each new place, or drops into her seat on the bus
    const walker = $('walker');
    walker.className = '';
    void walker.offsetWidth;
    walker.className = scene.seat ? 'sit' : 'walk';
    if (!scene.seat) stride();
  }
  refresh();
}

// While she walks in, flip between her two walking drawings, if this look has a pair.
// (Add more pairs as walk-<doll>-<look>-a/b.png and they're picked up from fits.js.)
function stride() {
  const doll = DOLLS[dollIndex];
  const bare = !ITEMS.some((it) => it.kind === 'wear' && it.isWorn && (it.slot || it.tab === 'under' || it.id === 'boots'));
  const look = outfit ? outfit.key : bare ? 'bare' : null;
  if (calm || !(WALKS[doll.id] || []).includes(look)) return;
  const frames = ['a', 'b'].map((side) => `assets/dolls/walk-${doll.id}-${look}-${side}.png`);
  let n = 0;
  const show = () => { strideEl.src = frames[n++ % 2]; };
  show();
  strideEl.classList.add('on');
  $('figure').classList.add('striding');
  outfitEl.classList.remove('on');
  const timer = setInterval(show, 200);
  setTimeout(() => {
    clearInterval(timer);
    strideEl.classList.remove('on');
    $('figure').classList.remove('striding');
    refresh();
  }, 1200);
}

function toStage(event) {
  const box = stage.getBoundingClientRect();
  return { x: (event.clientX - box.left) / stageScale, y: (event.clientY - box.top) / stageScale };
}

function hit(it, at, exact) {
  // things she's wearing move with her, so look for them where she's been shifted to
  const [sx, sy] = it.kind === 'wear' ? figureShift() : [0, 0];
  const r = -it.rot * Math.PI / 180;
  const dx = at.x - sx - it.cx, dy = at.y - sy - it.cy;
  const u = (dx * Math.cos(r) - dy * Math.sin(r)) / it.w + 0.5;
  const v = (dx * Math.sin(r) + dy * Math.cos(r)) / it.h + 0.5;
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  if (!exact || !it.alpha) return true;
  // look a little around the point so thin straps and earbuds are still easy to hit
  const map = it.alpha;
  const px = Math.round(u * (map.w - 1)), py = Math.round(v * (map.h - 1));
  for (let y = Math.max(0, py - 2); y <= Math.min(map.h - 1, py + 2); y++) {
    for (let x = Math.max(0, px - 2); x <= Math.min(map.w - 1, px + 2); x++) {
      if (map.data[(y * map.w + x) * 4 + 3] > 40) return true;
    }
  }
  return false;
}

// Exact cutout shape first; failing that, loose props can be grabbed by their box.
function itemAt(at) {
  const stack = ITEMS.filter(isShown).sort((a, b) => b.z - a.z);
  return stack.find((it) => hit(it, at, true)) || stack.find((it) => it.kind === 'prop' && hit(it, at, false));
}

let drag = null;

canvas.addEventListener('pointerdown', (event) => {
  const at = toStage(event);
  const it = itemAt(at);
  if (!it) return;
  canvas.setPointerCapture(event.pointerId);
  drag = { it, start: at, dx: at.x - it.cx, dy: at.y - it.cy, moved: false };
});

canvas.addEventListener('pointermove', (event) => {
  const at = toStage(event);
  if (!drag) {
    const over = itemAt(at);
    canvas.style.cursor = !over ? '' : over.kind === 'prop' ? 'grab' : 'pointer';
    return;
  }
  const { it } = drag;
  if (it.kind !== 'prop') return;
  if (!drag.moved) {
    if (Math.hypot(at.x - drag.start.x, at.y - drag.start.y) < 5) return;
    drag.moved = true;
    canvas.style.cursor = 'grabbing';
    it.el.classList.add('held');
    it.el.style.zIndex = it.z = ++topZ;
  }
  place(it, at.x - drag.dx, at.y - drag.dy, it.w, it.rot);
});

function drop() {
  if (!drag) return;
  const { it, moved } = drag;
  drag = null;
  canvas.style.cursor = '';
  it.el.classList.remove('held');

  if (it.kind === 'bag') return toggleSpill();
  if (it.kind === 'wear') return toggleWear(it);
  const onBag = Math.abs(it.cx - bag.cx) < bag.w / 2 && Math.abs(it.cy - bag.cy) < bag.h / 2;
  if (moved && onBag) {
    it.where = 'bag';
    pop(bag);
    refresh();
  } else if (!moved) {
    USES[it.id](it);
  }
}
canvas.addEventListener('pointerup', drop);
canvas.addEventListener('pointercancel', drop);

function showDoll(index) {
  dollIndex = index;
  DOLLS.forEach((doll, i) => {
    for (const el of [doll.el, doll.armsEl, doll.blinkEl]) el.classList.toggle('on', i === dollIndex);
    doll.button.setAttribute('aria-pressed', i === dollIndex);
  });
  if (outfitEl) refresh();
}

// Every few seconds her eyes close for a beat; now and then she blinks twice.
function blink(again = Math.random() < 0.2) {
  const shut = (on) => DOLLS.forEach((doll) => doll.blinkEl.classList.toggle('shut', on));
  shut(true);
  setTimeout(() => {
    shut(false);
    setTimeout(() => blink(false), again ? 180 : 2600 + Math.random() * 3600);
  }, 130);
}

function startOver() {
  for (const it of ITEMS) {
    it.isWorn = false;
    if (it.kind === 'prop') it.where = 'dorm';
  }
  goTo(0);
}

let toastTimer;
function toast(text) {
  $('toast').textContent = text;
  $('toast').classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('on'), 3200);
}

// ---- pictures: the saved photo and the tabloid cover are both redrawn on a canvas ----

function drawBackdrop(ctx, w, h, top = 0) {
  const scene = STORY[step], bg = backdropImgs[scene.bg];
  const cover = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
  const bw = bg.naturalWidth * cover, bh = bg.naturalHeight * cover;
  ctx.drawImage(bg, (w - bw) * (LAYOUT.bgX[scene.bg] ?? 50) / 100, top + (h - bh) / 2, bw, bh);
}

// Draws her in scene pixels. inPlace: as she is on the page (seated on the bus, things out of her bag around her);
// otherwise just her, standing, with whatever she's wearing and holding.
function drawFigure(ctx, inPlace = true) {
  const scene = STORY[step], doll = DOLLS[dollIndex];
  const [sx, sy] = inPlace ? figureShift() : [0, 0];
  const boots = item('boots');
  const cutY = DOLL.top + sy + boots.cut * SCALE;
  const clip = (from, to) => { ctx.beginPath(); ctx.rect(-SCENE_W, from, SCENE_W * 3, to - from); ctx.clip(); };
  const drawBody = (img, left, height) => () => {
    ctx.save();
    if (boots.isWorn) clip(-SCENE_H, cutY);
    ctx.drawImage(img, left + sx, DOLL.top + sy, height * img.naturalWidth / img.naturalHeight, height);
    ctx.restore();
  };
  const drawItem = (it) => () => {
    ctx.save();
    if (it === boots && boots.clipped) clip(cutY, SCENE_H * 2);
    ctx.shadowColor = 'rgba(20, 4, 4, .38)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.translate(it.cx + (it.kind === 'wear' ? sx : 0), it.cy + (it.kind === 'wear' ? sy : 0));
    ctx.rotate(it.rot * Math.PI / 180);
    ctx.drawImage(it.art, -it.w / 2, -it.h / 2, it.w, it.h);
    ctx.restore();
  };
  const body = outfit
    ? [{ z: DOLL_Z, draw: drawBody(outfitArt[outfit.src], DOLL.left + (OUTFIT_CROP.left - DOLL.cropLeft) * SCALE, OUTFIT_CROP.height * SCALE) }]
    : [{ z: DOLL_Z, draw: drawBody(doll.img, DOLL.left, FEET * SCALE) }, { z: WORN_Z + ARMS_LAYER, draw: drawBody(doll.armsImg, DOLL.left, FEET * SCALE) }];
  const around = (it) => inPlace || it.kind === 'wear' || (it.kind === 'bag' && !scene.bagAt);
  const layers = [...body, ...ITEMS.filter((it) => isShown(it) && around(it)).map((it) => ({ z: it.z, draw: drawItem(it) }))];
  if (inPlace && scene.seat) {
    const seat = $('seat'), h = SEAT.width * seat.naturalHeight / seat.naturalWidth;
    layers.push({ z: 150, draw: () => ctx.drawImage(seat, SEAT.left, SCENE_H - h, SEAT.width, h) });
  }
  layers.sort((a, b) => a.z - b.z).forEach((layer) => layer.draw());
}

function drawTexture(ctx, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = ctx.createPattern(grainImg, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = ctx.createPattern(paperImg, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// The scene as it is on the page, without the panels, at 2x.
function drawPhoto() {
  const out = make('canvas', { width: SCENE_W * 2, height: SCENE_H * 2 });
  const ctx = out.getContext('2d');
  ctx.scale(2, 2);
  drawBackdrop(ctx, SCENE_W, SCENE_H);
  drawFigure(ctx);
  drawTexture(ctx, SCENE_W, SCENE_H);
  return out;
}

// What the cover says. One headline and two side stories are picked at random each time.
const COVER = {
  kickers: ['Only in Cal Girl', 'World exclusive', 'Caught on campus', 'Sources confirm'],
  headlines: [
    ['Late to her', '9am', 'again!'],
    ['Lost in', 'Dwinelle', 'for 3 days'],
    ['She rode', 'the 51B', 'and lived'],
    ['Telegraph', 'Ave', 'spree!'],
    ['Rush week', 'tell-all'],
    ['Moffitt', 'at 3am', 'meltdown'],
    ['From GBC', 'to Sproul', 'in 4 minutes'],
  ],
  bullets: ['What she wore', 'Who saw her', "What's next"],
  // side stories: each one is tied to a picture of the place it's about
  sides: [
    { name: 'Dwinelle', line: 'The maze claims another freshman', photo: 'assets/film/place-dwinelle.jpg' },
    { name: 'Greek row', line: 'Bid day. She has thoughts.', photo: 'assets/film/place-greek-row.jpg' },
    { name: 'Telegraph Ave', line: 'What she REALLY bought', photo: 'assets/film/place-telegraph.jpg' },
    { name: 'The 6', line: 'Witnesses say it never came', photo: 'assets/film/place-bus-6.jpg' },
    { name: 'Top Dog, 2am', line: 'We have the photos', photo: 'assets/film/place-top-dog.jpg' },
    { name: 'Main Stacks', line: "She hasn't seen daylight since", photo: 'assets/film/place-main-stacks.jpg' },
    { name: 'Sproul Plaza', line: 'Flyered into next week', photo: 'assets/film/place-lower-sproul.jpg' },
    { name: 'Foothill', line: 'She walked. Uphill. In those boots.', photo: 'assets/film/place-foothill.jpg' },
    { name: 'Yogurt Park', line: 'Her third cup this week', photo: 'assets/film/place-yogurt-park.jpg' },
    { name: 'Doe Library', line: 'She went in for ONE book', photo: 'assets/film/film-3.jpg' },
    { name: 'Morrison Library', line: 'Asleep on the red couch. Again.', photo: 'assets/film/film-2.jpg' },
    { name: 'Cherry blossoms', line: 'The bike that nearly got her', photo: 'assets/film/film-1.jpg' },
    { name: 'Strawberry Creek', line: 'The shortcut she swears by', photo: 'assets/film/film-4.jpg' },
    { name: 'The 51B', line: 'On time?! We have proof', photo: 'assets/bg/bus-stop.jpg' },
    { name: 'On the bus', line: 'Nobody sat next to her', photo: 'assets/bg/bus.jpg' },
    { name: 'Sather Gate', line: '14 flyers. One walk.', photo: 'assets/bg/sather-gate.jpg' },
    { name: 'The Campanile', line: 'Golden hour, every single day', photo: 'assets/bg/campanile.jpg' },
    { name: 'The dorm', line: '8:07 and still not dressed', photo: 'assets/bg/dorm.jpg' },
  ],
  badge: ['Fabulous', 'Campanile', 'photos', 'inside!'],
  price: '$0.00 · FREE W/ CAL 1 CARD',
};
const COLORS = { pink: '#ec008c', berry: '#a3005c', yellow: '#ffe600', red: '#e2001a', cyan: '#00a9e0', ink: '#161214' };
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

// Tabloid lettering on a canvas: condensed, capitals, outlined. Shrinks to fit maxWidth; returns the size used.
function letter(ctx, text, x, y, size, fill, { stroke = COLORS.ink, weight = 0.1, maxWidth, align = 'left', italic = false } = {}) {
  const font = (px) => `${italic ? 'italic ' : ''}${px}px "HelveticaNeue-CondensedBlack", "Arial Narrow Bold", Impact, sans-serif`;
  text = text.toUpperCase();
  ctx.font = font(size);
  if (maxWidth && ctx.measureText(text).width > maxWidth) {
    size *= maxWidth / ctx.measureText(text).width;
    ctx.font = font(size);
  }
  ctx.textAlign = align;
  ctx.lineJoin = 'round';
  if (stroke) {
    ctx.lineWidth = size * weight * 2;
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  return size;
}

// This week's issue: her, big, on location, with the headlines around her.
async function drawCover() {
  const W = 1200, H = 1600, BAND = 190;
  const out = make('canvas', { width: W, height: H });
  const ctx = out.getContext('2d');

  drawBackdrop(ctx, W, H);
  ctx.fillStyle = 'rgba(22, 18, 20, .12)';
  ctx.fillRect(0, 0, W, H);
  const zoom = (H - BAND - 30) / (FEET * SCALE);
  ctx.save();
  ctx.translate(W / 2 - LAYOUT.cx * zoom, H - 16 - FLOOR * zoom);
  ctx.scale(zoom, zoom);
  drawFigure(ctx, false);
  ctx.restore();

  // masthead: the game's own logo, with the issue details set beside it in the tagline's typeface
  ctx.save();
  ctx.translate(40, 172);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.transform(1, 0, -0.1, 1, 0, 0);
  ctx.font = 'italic 180px "HelveticaNeue-CondensedBlack", "Arial Narrow Bold", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 20;
  ctx.strokeStyle = ctx.fillStyle = COLORS.berry;
  ctx.strokeText('Cal Girl', 10, 12);
  ctx.fillText('Cal Girl', 10, 12);
  ctx.strokeStyle = COLORS.pink;
  ctx.strokeText('Cal Girl', 0, 0);
  ctx.fillStyle = '#fff';
  ctx.fillText('Cal Girl', 0, 0);
  ctx.restore();

  const issue = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const edition = `${STORY[step].place.replace(/\b\w/g, (c) => c.toUpperCase())} edition`;
  ctx.save();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0, 0, 0, .75)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 2;
  [["Berkeley's best-dressed weekly", 31, 92], [issue, 27, 131], [edition, 27, 167]].forEach(([text, size, y]) => {
    ctx.font = `italic 700 ${size}px Georgia, "Times New Roman", serif`;
    ctx.fillText(text, W - 36, y);
  });
  ctx.restore();

  // the big story, down the left
  const left = 36, column = 372;
  ctx.font = '46px "HelveticaNeue-CondensedBlack", "Arial Narrow Bold", Impact, sans-serif';
  const kicker = pickOne(COVER.kickers).toUpperCase();
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(left, 240, Math.min(ctx.measureText(kicker).width, column) + 28, 62);
  letter(ctx, kicker, left + 14, 287, 46, '#fff', { stroke: null, maxWidth: column });
  let y = 330;
  for (const line of pickOne(COVER.headlines)) {
    // find the size that fills the column first, so each line sits right under the one above
    ctx.font = '100px "HelveticaNeue-CondensedBlack", "Arial Narrow Bold", Impact, sans-serif';
    const size = Math.min(210, 100 * column / ctx.measureText(line.toUpperCase()).width);
    y += size * 0.86;
    letter(ctx, line, left, y, size, COLORS.yellow, { weight: 0.05 });
    y += size * 0.06;
  }
  // bullets
  y += 70;
  for (const bullet of COVER.bullets) {
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.arc(left + 12, y - 14, 10, 0, Math.PI * 2);
    ctx.fill();
    letter(ctx, bullet, left + 34, y, 44, '#fff', { weight: 0.07, maxWidth: column - 34 });
    y += 54;
  }

  // two side stories down the right, each a snapshot with a caption bar
  // never the place she's standing in: that's already the cover photo
  const pool = COVER.sides.filter((side) => !side.photo.endsWith(`/${STORY[step].bg}.jpg`));
  for (let i = 0; i < 2; i++) {
    const { name, line, photo } = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const shot = await loadImage(photo);
    const x = 884, top = 236 + i * 372, w = 284, h = 204;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 6, top - 6, w + 12, h + 12);
    const k = Math.max(w / shot.naturalWidth, h / shot.naturalHeight);
    ctx.drawImage(shot, (shot.naturalWidth - w / k) / 2, (shot.naturalHeight - h / k) / 2, w / k, h / k, x, top, w, h);
    ctx.fillStyle = i ? COLORS.pink : COLORS.cyan;
    ctx.fillRect(x - 6, top + h + 6, w + 12, 112);
    letter(ctx, name, x + w / 2, top + h + 52, 44, COLORS.yellow, { stroke: null, align: 'center', maxWidth: w - 10 });
    letter(ctx, line, x + w / 2, top + h + 96, 32, '#fff', { stroke: null, align: 'center', maxWidth: w - 10 });
  }

  // round badge
  ctx.fillStyle = COLORS.cyan;
  ctx.beginPath();
  ctx.arc(1030, 1130, 128, 0, Math.PI * 2);
  ctx.fill();
  COVER.badge.forEach((line, i) => letter(ctx, line, 1030, 1076 + i * 46, 42, i % 2 ? COLORS.yellow : '#fff', { stroke: null, align: 'center', maxWidth: 210 }));

  // what she's wearing, along the bottom
  const worn = ITEMS.filter((it) => it.kind === 'wear' && it.isWorn).map((it) => it.name);
  letter(ctx, worn.length ? 'Get her look:' : 'Scandal!', left, 1440, 64, '#fff', { weight: 0.07 });
  const look = worn.length ? worn.slice(0, 4).join(' · ') : 'She left the dorm like THIS';
  letter(ctx, look, left, 1506, 54, COLORS.yellow, { weight: 0.07, maxWidth: 800 });

  // barcode
  ctx.fillStyle = '#fff';
  ctx.fillRect(884, 1420, 284, 150);
  ctx.fillStyle = COLORS.ink;
  for (let x = 900; x < 1150;) {
    const bar = 2 + Math.floor(Math.random() * 4) * 2;
    ctx.fillRect(x, 1434, bar, 92);
    x += bar + 2 + Math.floor(Math.random() * 3) * 2;
  }
  letter(ctx, COVER.price, 1026, 1558, 24, COLORS.ink, { stroke: null, align: 'center', maxWidth: 264 });

  drawTexture(ctx, W, H);
  return out;
}

function download(canvas, name) {
  try {
    canvas.toBlob((blob) => {
      const link = make('a', { href: URL.createObjectURL(blob), download: name });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      toast('saved to your downloads');
    }, 'image/png');
  } catch {
    toast('saving needs the game opened with start.command — or just screenshot it');
  }
}

// Save: a flash, then this week's cover with her on it. The cover or the plain photo can be downloaded from there.
async function saveLook() {
  Sound.shutter();
  $('flash').animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' });
  const cover = await drawCover();
  let preview = '';
  try { preview = cover.toDataURL('image/jpeg', 0.9); } catch { /* opened straight from disk: no preview or download */ }
  const again = make('button', { textContent: 'New headline' });
  again.addEventListener('click', saveLook);
  const getCover = make('button', { textContent: 'Download cover' });
  getCover.addEventListener('click', () => download(cover, 'cal-girl-cover.png'));
  const getPhoto = make('button', { textContent: 'Photo only' });
  getPhoto.addEventListener('click', () => download(drawPhoto(), `berkeley-dress-up-${STORY[step].bg}.png`));
  openSheet(
    make('h2', { textContent: 'Hot off the press!' }),
    make('figure', { className: 'cover' }, make('img', { src: preview, alt: 'A tabloid cover starring her in this outfit' })),
    make('div', { className: 'press' }, getCover, getPhoto, again),
  );
}

let grainImg, paperImg;
// the bus-seat strip is cut from the 1920x1080 bus photo, so it's laid out exactly as that photo covers the scene
const SEAT = { width: 1920 * Math.max(SCENE_W / 1920, SCENE_H / 1080) };
SEAT.left = (SCENE_W - SEAT.width) / 2;
const backdrops = {}, backdropImgs = {}, tabButtons = {};

function addTile(it) {
  const label = make('span', { textContent: it.name });
  it.pick = make('button', { className: 'pick' }, make('img', { src: it.flat, alt: '' }), label);
  it.pick.addEventListener('click', () => (it.kind === 'wear' ? toggleWear(it) : togglePacked(it)));
  it.tile = make('div', { className: 'tile' }, it.pick);
  if (it.kind === 'wear') {
    const link = make('a', { className: 'shop-link', href: shopLink(it), target: '_blank', rel: 'noopener', textContent: 'shop ↗' });
    link.setAttribute('aria-label', `Shop the ${it.name} at Zara`);
    it.tile.append(link);
  }
  $('tiles').append(it.tile);
}

async function start() {
  stage.classList.toggle('portrait', PORTRAIT);
  Object.assign(stage.style, { width: `${STAGE_W}px`, height: `${STAGE_H}px` });
  stage.style.setProperty('--cx', `${LAYOUT.cx}px`);
  stage.style.setProperty('--floor', `${FLOOR}px`);
  Object.assign($('seat').style, { left: `${SEAT.left}px`, width: `${SEAT.width}px` });
  new ResizeObserver(fitStage).observe($('frame'));

  for (const name of new Set(STORY.map((scene) => scene.bg))) {
    backdrops[name] = make('div');
    backdrops[name].style.backgroundImage = `url(assets/bg/${name}.jpg)`;
    backdrops[name].style.backgroundPosition = `${LAYOUT.bgX[name] ?? 50}% 50%`;
    $('backdrops').append(backdrops[name]);
  }
  $('dots').append(...STORY.map(() => make('i')));

  for (const name of TABS) {
    const button = tabButtons[name] = make('button', { textContent: name });
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => showTab(name));
    $('tabs').append(button);
  }

  const body = (className, src, z, left = DOLL.left, height = FEET * SCALE) => {
    const el = make('img', { className: `doll ${className}`, alt: '' });
    if (src) el.src = src;
    Object.assign(el.style, { left: `${left}px`, top: `${DOLL.top}px`, height: `${height}px`, zIndex: z });
    $('figure').append(el);
    return el;
  };
  DOLLS.forEach((doll, i) => {
    doll.el = body('base', `assets/dolls/doll-${doll.id}.png`, DOLL_Z);
    doll.el.alt = `Doll: ${doll.name}`;
    doll.blinkEl = body('blink', `assets/dolls/blink-${doll.id}.png`, DOLL_Z + 1);
    doll.armsEl = body('arms', `assets/dolls/arms-${doll.id}.png`, WORN_Z + ARMS_LAYER);
    doll.button = make('button', { title: doll.name });
    doll.button.style.backgroundImage = `url(assets/dolls/doll-${doll.id}.png)`; // her face, as the button
    doll.button.setAttribute('aria-label', doll.name);
    doll.button.addEventListener('click', () => showDoll(i));
    $('hair').append(doll.button);
  });
  showDoll(0);
  strideEl = body('stride', '', DOLL_Z, DOLL.left + (OUTFIT_CROP.left - DOLL.cropLeft) * SCALE, OUTFIT_CROP.height * SCALE);
  outfitEl = body('outfit', '', DOLL_Z, DOLL.left + (OUTFIT_CROP.left - DOLL.cropLeft) * SCALE, OUTFIT_CROP.height * SCALE);

  // each piece has a clean flat-lay for its closet tile and, if it's fitted, a separate on-the-body version
  await Promise.all(ITEMS.map(async (it) => {
    it.flat = `assets/items/${it.id}.png`;
    if (FITS[it.id]) it.worn = FITS[it.id];
    const hasWornArt = FITS[it.id] || it.wornArt;
    it.art = await loadImage(hasWornArt ? `assets/items/${it.id}-worn.png` : it.flat);
    it.art.alt = '';
    it.aspect = it.art.naturalWidth / it.art.naturalHeight;
    it.alpha = alphaMap(it.art);
    it.el = make('div', { className: `item ${it.kind} gone` }, it.art);
    if (it.kind === 'prop') it.where = 'dorm';
  }));
  for (const it of ITEMS) {
    if (it.kind !== 'bag') addTile(it);
    if (it.worn) placeOnDoll(it);
    else place(it, 0, 0, it.size * LAYOUT.prop, 0);
    it.el.style.zIndex = it.z = it.kind === 'wear' ? WORN_Z + it.layer : 190;
    // whatever she wears breathes with her; her bag walks with her; things out of the bag sit on the page
    $({ wear: 'figure', bag: 'walker', prop: 'sprites' }[it.kind]).append(it.el);
  }
  goTo(0);
  if (!calm) setTimeout(blink, 1800);
  if (!calm) setInterval(nextTeasers, 9000);

  // kept as Image objects too, for drawing the saved picture
  grainImg = await loadImage('assets/grain.png');
  paperImg = await loadImage('assets/paper.png');
  await Promise.all(Object.keys(backdrops).map(async (name) => { backdropImgs[name] = await loadImage(`assets/bg/${name}.jpg`); }));
  await Promise.all(DOLLS.map(async (doll) => {
    doll.img = await loadImage(doll.el.src);
    doll.armsImg = await loadImage(doll.armsEl.src);
  }));
}

$('story-prev').addEventListener('click', () => goTo(step - 1));
$('story-next').addEventListener('click', () => goTo(step + 1));
$('reset').addEventListener('click', startOver);
$('save').addEventListener('click', saveLook);
$('shop').addEventListener('click', openShop);
$('sheet-close').addEventListener('click', closeSheet);
$('veil').addEventListener('click', (event) => { if (event.target === $('veil')) closeSheet(); });
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') return closeSheet();
  if (!$('veil').hidden) return;
  if (event.key === 'ArrowLeft') goTo(step - 1);
  if (event.key === 'ArrowRight') goTo(step + 1);
});

start();
