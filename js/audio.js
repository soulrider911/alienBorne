export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.musicPlaying = false;
    this._musicPattern = [220, 261, 329, 440, 329, 261, 220, 174];
    this._musicStep = 0;
    this._musicInterval = null;
    this.muted = false;
  }

  _init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  _noiseBuffer() {
    const frames = Math.floor(this.ctx.sampleRate * 0.5);
    const buf = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  resume() {
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playShot() {
    if (this.muted) return;
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playExplosion(volume = 0.5) {
    if (this.muted) return;
    this._init();
    const t = this.ctx.currentTime;
    const duration = 0.15 + volume * 0.35;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400 + volume * 600;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t);
    src.stop(t + duration + 0.01);
  }

  playAlienDrop() {
    if (this.muted) return;
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(440, t + 0.08);
    osc.frequency.setValueAtTime(110, t + 0.15);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  playAlienLand() {
    if (this.muted) return;
    this._init();
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.connect(g1); g1.connect(this.ctx.destination);
    osc1.start(t); osc1.stop(t + 0.11);

    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.value = 1200;
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc2.connect(g2); g2.connect(this.ctx.destination);
    osc2.start(t); osc2.stop(t + 0.04);
  }

  playHit() {
    if (this.muted) return;
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  toggleMusic() {
    if (this.musicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  startMusic() {
    if (this.musicPlaying) return;
    this._init();
    this.musicPlaying = true;
    this._musicStep = 0;

    const playNote = () => {
      if (!this.musicPlaying || this.muted) return;
      const t = this.ctx.currentTime;
      const freq = this._musicPattern[this._musicStep % this._musicPattern.length];
      this._musicStep++;

      const makeVoice = (f, vol) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.45);
      };

      makeVoice(freq, 0.06);
      makeVoice(freq * 1.5, 0.04);
      makeVoice(freq * 2, 0.03);
    };

    playNote();
    this._musicInterval = setInterval(playNote, 500);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this._musicInterval) {
      clearInterval(this._musicInterval);
      this._musicInterval = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
  }
}
