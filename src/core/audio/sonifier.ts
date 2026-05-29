type AudioContextCtor = typeof AudioContext;

const resolveCtor = (): AudioContextCtor | null => {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
};

class Sonifier {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private ensure(): AudioContext | null {
    if (!this.ctx) {
      const Ctor = resolveCtor();
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.14;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  resume(): void {
    this.ensure();
  }

  playValues(values: number[], max: number): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || values.length === 0) return;
    const now = ctx.currentTime;
    const voices = values.slice(0, 3);
    for (const value of voices) {
      const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0.5;
      const frequency = 130 + ratio * 1100;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(1, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  }
}

export const sonifier = new Sonifier();
