class AudioHaptics {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClick(type: 'number' | 'operator' | 'action' | 'clear' = 'number') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      let freq = 600;
      let duration = 0.025;
      let volume = 0.04;

      if (type === 'operator') {
        freq = 850;
        duration = 0.03;
        volume = 0.05;
      } else if (type === 'action') {
        freq = 1100;
        duration = 0.04;
        volume = 0.06;
      } else if (type === 'clear') {
        freq = 420;
        duration = 0.04;
        volume = 0.05;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);

      // Mobile vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(type === 'action' ? 12 : 6);
      }
    } catch {
      // Audio context might fail silently without blocking calculations
    }
  }
}

export const soundManager = new AudioHaptics();
