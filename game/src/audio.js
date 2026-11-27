// Original synthesized sound for Turkey Run 3D: every effect and the music
// loop are built from WebAudio oscillators and noise, so the game ships no
// audio files and loads nothing over the network.
export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicOn = false;
  }

  /** Create the audio context on the first user gesture. */
  unlock() {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.context.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
  }

  tone(frequency, duration, type, volume, slideTo) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(volume || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  noise(duration, volume, lowpass) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1200;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(now);
  }

  click() { this.tone(660, 0.07, 'triangle', 0.18); }
  jump() { this.noise(0.16, 0.12, 2400); this.tone(320, 0.16, 'sine', 0.14, 640); }
  dash() { this.noise(0.22, 0.2, 3200); this.tone(220, 0.2, 'sawtooth', 0.08, 520); }
  collect() { this.tone(880, 0.09, 'triangle', 0.2); this.tone(1318, 0.12, 'triangle', 0.16); }
  feather() { this.tone(1046, 0.1, 'sine', 0.2); this.tone(1568, 0.16, 'sine', 0.18); }
  hit() { this.noise(0.25, 0.3, 700); this.tone(140, 0.25, 'square', 0.16, 70); }
  alarm() { this.tone(520, 0.12, 'square', 0.12, 780); this.tone(780, 0.12, 'square', 0.12, 520); }

  /** A two-note gobble: the turkey's own squawk, built from quick pitch drops. */
  squawk() {
    if (!this.context || this.muted) return;
    const notes = [420, 360, 480, 330];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.09, 'sawtooth', 0.14, frequency * 0.7), index * 70);
    });
  }

  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.22, 'triangle', 0.2), index * 130);
    });
  }

  lose() {
    const notes = [392, 330, 262, 196];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.28, 'triangle', 0.18), index * 160);
    });
  }

  // A lazy autumn bassline: one soft pluck per beat while the run is on.
  // The music stays quiet on menus and stops when the run ends.
  updateMusic(playing) {
    if (playing === this.musicOn) return;
    this.musicOn = playing;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (!playing) return;
    const line = [110, 0, 130.8, 0, 98, 0, 146.8, 0, 110, 0, 164.8, 0, 130.8, 0, 98, 0];
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      const frequency = line[this.musicStep % line.length];
      this.musicStep += 1;
      if (frequency > 0) this.tone(frequency, 0.22, 'triangle', 0.07);
    }, 240);
  }
}
