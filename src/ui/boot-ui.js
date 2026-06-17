export function createBootUi(elements) {
  const {
    appStylesheet,
    bootLog,
    enterSite,
    loaderOverlay,
    nowTime,
    progressBar,
    progressLabel
  } = elements;

  function updateProgress(percent) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    progressBar.style.width = `${clamped}%`;
    progressLabel.textContent = `${clamped}%`;
  }

  function appendBootLine(line) {
    bootLog.textContent += `${line}\n`;
  }

  function unlockEnter() {
    updateProgress(100);
    appendBootLine('READY');
    enterSite.disabled = false;
    enterSite.focus();
  }

  function showRetry(error) {
    appendBootLine(`ERROR ${error?.message || 'boot failed'}`);
    enterSite.textContent = 'Retry';
    enterSite.disabled = false;
  }

  function resetForRetry() {
    enterSite.textContent = 'Enter';
    enterSite.disabled = true;
  }

  function hideLoader() {
    loaderOverlay.classList.add('is-hidden');
  }

  function waitForAppShell() {
    return new Promise((resolve) => {
      const settle = () => {
        updateProgress(15);
        resolve();
      };

      if (!appStylesheet || appStylesheet.sheet) {
        window.requestAnimationFrame(settle);
        return;
      }

      appStylesheet.addEventListener('load', () => window.requestAnimationFrame(settle), { once: true });
      appStylesheet.addEventListener('error', () => window.requestAnimationFrame(settle), { once: true });
    });
  }

  async function waitForFonts() {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    updateProgress(32);
  }

  function updateNowTime() {
    const now = new Date();
    nowTime.dateTime = now.toISOString();
    nowTime.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function startClock() {
    updateNowTime();
    return window.setInterval(updateNowTime, 1000);
  }

  enterSite.disabled = true;
  updateProgress(4);

  return {
    appendBootLine,
    hideLoader,
    resetForRetry,
    showRetry,
    startClock,
    unlockEnter,
    updateProgress,
    waitForAppShell,
    waitForFonts
  };
}
