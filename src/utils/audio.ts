let audioCtx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
  } catch {
    // Ignore audio context errors on restricted devices
  }
}

export function playTone(freq: number, duration = 0.12, gainVal = 0.08, delay = 0): void {
  try {
    if (!audioCtx) unlockAudio();
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = gainVal;
    o.connect(g);
    g.connect(audioCtx.destination);
    const start = audioCtx.currentTime + delay;
    o.start(start);
    o.stop(start + duration);
  } catch {
    // Ignore audio synthesis errors
  }
}

export function playCountdownTick(): void {
  playTone(540, 0.07, 0.06, 0);
}

export function playPhaseStartBeep(): void {
  playTone(880, 0.22, 0.1, 0);
  try {
    if (navigator.vibrate) navigator.vibrate(100);
  } catch {
    // Ignore
  }
}

export function playFinishBeep(): void {
  [0, 0.25, 0.5].forEach((offset) => {
    playTone(880, 0.15, 0.09, offset);
  });
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {
    // Ignore
  }
}
