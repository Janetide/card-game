// Ember Duel — sound effects from the Web Audio API only: no audio files, no
// network. Every blip is a short oscillator envelope. Silent until the first
// user gesture, as browsers require.
let context = null;
let enabled = true;
let unlocked = false;

function ensureContext() {
  // Never create the context before a user gesture: browsers refuse it and
  // log a warning for every attempt. Shot mode never unlocks, so it stays
  // silent there too.
  if (!unlocked) return null;
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

/** Unlock audio on the first pointer or key gesture. */
export function unlockAudio() {
  unlocked = true;
  ensureContext();
}

/** Turn sound effects on or off (the mute button). */
export function setSoundEnabled(value) {
  enabled = value;
}

export function soundEnabled() {
  return enabled;
}

function blip(frequency, duration, type, volume) {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

export function playCardSound() {
  blip(660, 0.12, 'triangle', 0.12);
  setTimeout(() => blip(880, 0.1, 'triangle', 0.1), 60);
}

export function hitSound() {
  blip(180, 0.18, 'sawtooth', 0.1);
}

export function turnSound() {
  blip(440, 0.08, 'sine', 0.08);
}

export function winSound() {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    setTimeout(() => blip(frequency, 0.22, 'triangle', 0.12), index * 120);
  });
}

export function loseSound() {
  [392, 330, 262, 196].forEach((frequency, index) => {
    setTimeout(() => blip(frequency, 0.25, 'sawtooth', 0.07), index * 140);
  });
}
