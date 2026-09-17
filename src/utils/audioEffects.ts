// Web Audio API Synthesizer for live DJ Sound Effects!
// Plays instantly with zero network latency or external asset loading.

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Classic DJ Airhorn (3 staccato blasts)
  playAirhorn() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const playBlast = (time: number, duration: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sawtooth waveforms at dissonance for that loud stadium horn sound
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc3.type = 'sawtooth';

        osc1.frequency.setValueAtTime(466.16, time); // Bb4
        osc2.frequency.setValueAtTime(466.16 * 1.26, time); // Major third up + detune
        osc3.frequency.setValueAtTime(466.16 * 1.5, time);  // Fifth up

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc3.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
        osc3.stop(time + duration);
      };

      playBlast(now, 0.12);
      playBlast(now + 0.14, 0.12);
      playBlast(now + 0.28, 0.45);
    } catch (e) {
      console.warn("AudioContext error playing airhorn", e);
    }
  }

  // 2. Vinyl Scratch (pitch downward sweep + white noise burst)
  playScratch() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Tone sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      osc.frequency.linearRampToValueAtTime(800, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("AudioContext error playing scratch", e);
    }
  }

  // 3. Sub Bass Drop / Boom (808 style low end rumble)
  playSubBoom() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn("AudioContext error playing sub boom", e);
    }
  }

  // 4. Laser Pew Pew (cyberpunk synth sweep)
  playLaser() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const shoot = (start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, start);
        osc.frequency.exponentialRampToValueAtTime(100, start + 0.18);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      };

      shoot(now);
      shoot(now + 0.1);
    } catch (e) {
      console.warn("AudioContext error playing laser", e);
    }
  }

  // 5. Hype Siren (wailing festival siren)
  playHypeSiren() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 1.0;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Siren pitch modulation
      for (let i = 0; i < 4; i++) {
        const t = now + (i * 0.25);
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(880, t + 0.12);
        osc.frequency.linearRampToValueAtTime(400, t + 0.25);
      }

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("AudioContext error playing hype siren", e);
    }
  }

  // 6. Echo Rewind (tape rewind effect)
  playRewind() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("AudioContext error playing rewind", e);
    }
  }
}

export const soundFx = new SoundEffectsEngine();
