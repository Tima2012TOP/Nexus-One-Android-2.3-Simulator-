
// Simple Web Audio API synthesizer for UI sounds
// No external files required

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const ctx = new AudioContext();

const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const playClick = () => {
  // Mechanical click sound
  playTone(800, 'square', 0.05, 0.05);
};

export const playType = () => {
  // Softer typing click
  playTone(600, 'sine', 0.03, 0.05);
};

export const playUnlock = () => {
  // Ascending cheerful sound
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.linearRampToValueAtTime(800, now + 0.2);
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.3);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(now + 0.3);
};

export const playError = () => {
  playTone(150, 'sawtooth', 0.2, 0.1);
};
