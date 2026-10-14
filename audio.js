// The game's sound. Her earbuds play the songs in TRACKS; if a file is missing, a little loop made in
// the browser plays instead. The coffee, cigarette and camera effects are made in the browser too.
const TRACKS = {
  'my way — olivia rodrigo': 'assets/music/my-way.mp3',
  'prom song gone wrong': 'assets/music/prom-song-gone-wrong.mp3',
  'nicole kidman — adéla': 'assets/music/nicole-kidman.mp3',
};

const Sound = (() => {
  let ctx, master, noiseBuffer, timer = null, track = null, station = null, fallback = null, step = 0, nextTime = 0;
  const midi = (n) => 440 * 2 ** ((n - 69) / 12);

  function wake() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const soften = ctx.createBiquadFilter();
      soften.type = 'lowpass';
      soften.frequency.value = 6500;
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(soften).connect(ctx.destination);
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(t, note, dur, { type = 'triangle', vol = 0.2, attack = 0.008, glide = 0 } = {}) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(midi(note + glide), t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(midi(note), t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function hiss(t, dur, vol, type, freq, q = 1) {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    src.buffer = noiseBuffer;
    src.loop = true;
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
    return { filter, gain };
  }

  function kick(t, vol = 0.8) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // The stand-in loops: tempo, steps per bar, and what happens on a given step of a given bar.
  const STATIONS = {
    jazz: {
      bpm: 124, steps: 12, // triplet grid, so the ride cymbal swings
      walk: [[38, 41, 45, 48], [43, 47, 50, 53], [48, 52, 55, 59], [45, 49, 52, 55]],
      chords: [[60, 65, 69], [59, 65, 69], [59, 64, 67], [61, 64, 67]],
      scale: [62, 65, 67, 69, 72, 74, 77],
      play(s, bar, t) {
        const b = bar % 4;
        if (s % 3 === 0 || s === 5 || s === 11) hiss(t, 0.16, s % 3 === 0 ? 0.07 : 0.045, 'highpass', 7000);
        if (s === 3 || s === 9) hiss(t, 0.05, 0.08, 'bandpass', 3200, 2);
        if (s % 3 === 0) tone(t, this.walk[b][s / 3], 0.42, { type: 'sine', vol: 0.42 });
        if (s === 5 || (s === 0 && bar % 2)) this.chords[b].forEach((n) => tone(t, n, 0.3, { vol: 0.07 }));
        if ((s % 3 === 0 || s % 3 === 2) && Math.random() < 0.28) {
          tone(t, this.scale[Math.floor(Math.random() * this.scale.length)] + 12, 0.7, { type: 'sine', vol: 0.13 });
        }
      },
    },
    afrobeats: {
      bpm: 104, steps: 16,
      roots: [45, 41, 48, 43],
      riff: [[0, 76], [3, 72], [6, 69], [8, 72], [11, 76], [14, 79]],
      play(s, bar, t) {
        const root = this.roots[bar % 4];
        if (s === 0 || s === 8 || s === 11) kick(t);
        if (s === 4 || s === 12) hiss(t, 0.11, 0.16, 'bandpass', 1900, 1.2);
        if ([3, 6, 10, 12, 15].includes(s)) tone(t, 86, 0.05, { type: 'square', vol: 0.045 });
        hiss(t, 0.04, s % 4 === 2 ? 0.07 : 0.03, 'highpass', 8000);
        if ([0, 3, 6, 10].includes(s)) tone(t, root, 0.3, { type: 'sine', vol: 0.5, glide: 5 });
        const note = this.riff.find(([at]) => at === s);
        if (note) tone(t, note[1] + (bar % 4 === 1 ? -4 : bar % 4 === 3 ? -2 : 0), 0.2, { vol: 0.13 });
      },
    },
    classical: {
      bpm: 72, steps: 8,
      // the Pachelbel progression, as broken chords under a slow top line
      chords: [[50, 57, 66], [45, 57, 64], [47, 59, 66], [42, 57, 61], [43, 59, 62], [38, 57, 62], [43, 59, 62], [45, 57, 64]],
      play(s, bar, t) {
        const [root, mid, top] = this.chords[bar % 8];
        if (s === 0) tone(t, root - 12, 3.2, { type: 'sine', vol: 0.22, attack: 0.05 });
        tone(t, [root, mid, top, mid, root + 12, mid, top, mid][s], 0.9, { vol: 0.12, attack: 0.012 });
        if (s === 0 || s === 4) {
          tone(t, (s ? mid : top) + 12, 1.9, { type: 'sine', vol: 0.11, attack: 0.18 });
          tone(t, (s ? mid : top) + 12.06, 1.9, { vol: 0.045, attack: 0.25 });
        }
      },
    },
  };

  function schedule() {
    const now = STATIONS[fallback];
    const stepLength = 60 / now.bpm * 4 / now.steps;
    while (nextTime < ctx.currentTime + 0.2) {
      now.play(step % now.steps, Math.floor(step / now.steps), nextTime);
      nextTime += stepLength;
      step++;
    }
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (track) track.pause();
    track = null;
    station = null;
  }

  function loop() {
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    timer = setInterval(schedule, 60);
  }

  return {
    stations: Object.keys(TRACKS),
    get station() { return station; },
    play(name) {
      wake();
      stop();
      station = name;
      fallback = Object.keys(STATIONS)[Object.keys(TRACKS).indexOf(name) % 3];
      track = new Audio(TRACKS[name]);
      track.loop = true;
      track.volume = 0.7;
      // file missing: play a built-in loop instead
      track.addEventListener('error', () => { if (station === name && !timer) loop(); }, { once: true });
      track.play().catch(() => {});
    },
    stop,
    sip() {
      wake();
      const t = ctx.currentTime;
      const { filter, gain } = hiss(t, 0.55, 0.0001, 'bandpass', 500, 7);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
      gain.gain.cancelScheduledValues(t);
      for (let i = 0; i <= 11; i++) gain.gain.linearRampToValueAtTime(i === 11 ? 0.0001 : i % 2 ? 0.34 : 0.12, t + 0.03 + i * 0.045);
      tone(t + 0.62, 52, 0.18, { type: 'sine', vol: 0.1, glide: 4 });
    },
    exhale() {
      wake();
      const t = ctx.currentTime;
      const { gain } = hiss(t, 1.5, 0.0001, 'lowpass', 1100);
      gain.gain.cancelScheduledValues(t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    },
    shutter() {
      wake();
      const t = ctx.currentTime;
      hiss(t, 0.03, 0.4, 'highpass', 3000);
      hiss(t + 0.09, 0.05, 0.3, 'highpass', 2000);
      tone(t, 88, 0.03, { type: 'square', vol: 0.05 });
    },
  };
})();
