import { publicPath } from '../public-path.js';

const AUDIO_FILES = {
  music: publicPath('sound/music.mp3'),
  startup: publicPath('sound/startup.mp3'),
  keyboard: publicPath('sound/kb.ogg'),
  background: publicPath('sound/bg.mp3')
};

function createAudio(src, { loop = false, volume = 1 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = 'auto';
  audio.volume = volume;
  return audio;
}

function preloadAudio(audio) {
  return new Promise((resolve) => {
    let isSettled = false;
    const settle = () => {
      if (isSettled) return;
      isSettled = true;
      audio.removeEventListener('canplaythrough', settle);
      audio.removeEventListener('loadeddata', settle);
      audio.removeEventListener('error', settle);
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const fallbackTimer = window.setTimeout(settle, 4500);

    audio.addEventListener('canplaythrough', settle, { once: true });
    audio.addEventListener('loadeddata', settle, { once: true });
    audio.addEventListener('error', settle, { once: true });
    audio.load();
  });
}

export function createAudioController({ musicToggle, muteToggle }) {
  const mainMusic = createAudio(AUDIO_FILES.music, { loop: true, volume: 0.1 });
  const startupSound = createAudio(AUDIO_FILES.startup, { volume: 0.6 });
  const keyboardAmbience = createAudio(AUDIO_FILES.keyboard, { loop: true, volume: 0.2 });
  const backgroundAmbience = createAudio(AUDIO_FILES.background, { loop: true, volume: 0.24 });
  const managedAudio = [mainMusic, keyboardAmbience, backgroundAmbience, startupSound];

  let isMuted = false;

  function setMusicLabel(isPlaying) {
    musicToggle.textContent = isPlaying ? 'Music: Playing' : 'Music: Paused';
  }

  async function load() {
    await Promise.all(managedAudio.map(preloadAudio));
    musicToggle.disabled = false;
    muteToggle.disabled = false;
  }

  async function playStartup() {
    try {
      startupSound.currentTime = 0;
      await startupSound.play();
    } catch {
      // Startup audio is ornamental; keep entering even if the browser refuses it.
    }
  }

  async function playAmbience() {
    try {
      await Promise.all([
        mainMusic.play(),
        keyboardAmbience.play(),
        backgroundAmbience.play()
      ]);
      setMusicLabel(true);
    } catch {
      setMusicLabel(false);
    }
  }

  async function toggleMusic() {
    if (musicToggle.disabled) return;

    if (mainMusic.paused) {
      try {
        await mainMusic.play();
        setMusicLabel(true);
      } catch {
        setMusicLabel(false);
      }
      return;
    }

    mainMusic.pause();
    setMusicLabel(false);
  }

  function toggleMute() {
    if (muteToggle.disabled) return;

    isMuted = !isMuted;
    for (const audio of managedAudio) {
      audio.muted = isMuted;
    }
    muteToggle.textContent = isMuted ? 'Mute: On' : 'Mute: Off';
  }

  function isMusicActive() {
    return !mainMusic.paused && !isMuted;
  }

  musicToggle.disabled = true;
  muteToggle.disabled = true;
  musicToggle.addEventListener('click', toggleMusic);
  muteToggle.addEventListener('click', toggleMute);
  mainMusic.addEventListener('pause', () => setMusicLabel(false));
  mainMusic.addEventListener('play', () => setMusicLabel(true));

  return {
    isMusicActive,
    load,
    playAmbience,
    playStartup
  };
}
