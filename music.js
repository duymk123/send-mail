/**
 * Romantic Music Box & Web Audio API Synthesizer
 * Zero external audio dependencies needed! Works completely offline.
 * Also supports optional 'bgm.mp3' file if user places one in the folder.
 */
class RomanticAudioManager {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.musicTimer = null;
    this.currentNoteIndex = 0;
    this.externalAudio = null;
    this.useExternal = false;

    this.checkExternalBgm();
  }

  checkExternalBgm() {
    const audio = new Audio('bgm.mp3');
    audio.loop = true;
    audio.addEventListener('canplaythrough', () => {
      this.externalAudio = audio;
      this.useExternal = true;
    });
    audio.addEventListener('error', () => {
      this.useExternal = false;
    });
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Romantic acoustic chord progression frequencies (Hz)
  getMelodyNotes() {
    return [
      // Phrase 1: C - G - Am - Em
      { f: 523.25, d: 0.5 }, // C5
      { f: 659.25, d: 0.5 }, // E5
      { f: 783.99, d: 0.7 }, // G5
      { f: 1046.50, d: 1.1 }, // C6

      { f: 493.88, d: 0.5 }, // B4
      { f: 587.33, d: 0.5 }, // D5
      { f: 783.99, d: 0.7 }, // G5
      { f: 987.77, d: 1.1 }, // B5

      { f: 440.00, d: 0.5 }, // A4
      { f: 523.25, d: 0.5 }, // C5
      { f: 659.25, d: 0.7 }, // E5
      { f: 880.00, d: 1.1 }, // A5

      { f: 392.00, d: 0.5 }, // G4
      { f: 493.88, d: 0.5 }, // B4
      { f: 587.33, d: 0.7 }, // D5
      { f: 783.99, d: 1.1 }, // G5

      // Phrase 2: F - C - F - G
      { f: 349.23, d: 0.5 }, // F4
      { f: 440.00, d: 0.5 }, // A4
      { f: 523.25, d: 0.7 }, // C5
      { f: 698.46, d: 1.1 }, // F5

      { f: 523.25, d: 0.5 }, // C5
      { f: 659.25, d: 0.5 }, // E5
      { f: 783.99, d: 0.7 }, // G5
      { f: 1046.50, d: 1.0 }, // C6

      { f: 349.23, d: 0.5 }, // F4
      { f: 440.00, d: 0.5 }, // A4
      { f: 523.25, d: 0.7 }, // C5
      { f: 659.25, d: 1.0 }, // E5

      { f: 392.00, d: 0.5 }, // G4
      { f: 493.88, d: 0.5 }, // B4
      { f: 587.33, d: 0.7 }, // D5
      { f: 783.99, d: 1.4 }  // G5
    ];
  }

  playMusicBoxTone(freq, duration = 0.8, volume = 0.14) {
    this.initContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    
    // Fundamental Oscillator (Sine)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    gain1.gain.setValueAtTime(0.0001, t);
    gain1.gain.exponentialRampToValueAtTime(volume, t + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    // Overtone Oscillator (Triangle harmonic)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, t);

    gain2.gain.setValueAtTime(0.0001, t);
    gain2.gain.exponentialRampToValueAtTime(volume * 0.35, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + (duration * 0.5));

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  startMusic() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.initContext();

    if (this.useExternal && this.externalAudio) {
      this.externalAudio.play().catch(() => this.runSynthMelody());
    } else {
      this.runSynthMelody();
    }

    const disc = document.getElementById('musicDisc');
    const label = document.getElementById('musicLabel');
    if (disc) disc.classList.add('playing');
    if (label) label.textContent = 'Đang phát 🎶';
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.externalAudio) {
      this.externalAudio.pause();
    }

    const disc = document.getElementById('musicDisc');
    const label = document.getElementById('musicLabel');
    if (disc) disc.classList.remove('playing');
    if (label) label.textContent = 'Bật nhạc nè 🎶';
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  runSynthMelody() {
    if (!this.isPlaying) return;
    const melody = this.getMelodyNotes();
    const item = melody[this.currentNoteIndex];

    this.playMusicBoxTone(item.f, item.d * 1.6, 0.12);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
    const delay = item.d * 850;

    this.musicTimer = setTimeout(() => {
      this.runSynthMelody();
    }, delay);
  }

  // Keypad click sound
  playKeypadSound(digit) {
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
    const freq = scale[digit % scale.length];
    this.playMusicBoxTone(freq, 0.35, 0.18);
  }

  playBackspaceSound() {
    this.playMusicBoxTone(440.00, 0.25, 0.12);
  }

  playWrongSound() {
    this.playMusicBoxTone(311.13, 0.28, 0.15);
    setTimeout(() => this.playMusicBoxTone(277.18, 0.35, 0.15), 140);
  }

  playSuccessSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playMusicBoxTone(freq, 0.8, 0.2), idx * 80);
    });
  }

  playEnvelopeOpenSound() {
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      setTimeout(() => this.playMusicBoxTone(freq, 1.2, 0.16), idx * 60);
    });
  }

  playCelebrationSound() {
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    fanfare.forEach((freq, idx) => {
      setTimeout(() => this.playMusicBoxTone(freq, 1.0, 0.22), idx * 75);
    });
  }
}

window.romanticAudio = new RomanticAudioManager();
