export function createBootUi(elements) {
  const {
    appStylesheet,
    bootLog,
    bootWarning,
    enterSite,
    loaderOverlay,
    nowTime,
    progressBar,
    progressLabel
  } = elements;

  let actionMode = 'enter';

  function isMobileViewport() {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const narrowViewport = window.matchMedia?.('(max-width: 760px)').matches ?? window.innerWidth <= 760;
    const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    return (coarsePointer && narrowViewport) || mobileUserAgent;
  }

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
    actionMode = isMobileViewport() ? 'fallback' : 'enter';
    enterSite.textContent = actionMode === 'fallback' ? 'Open 2D Site' : 'Enter';
    enterSite.disabled = false;
    enterSite.focus();
  }

  function showRetry(error) {
    appendBootLine(`ERROR ${error?.message || 'boot failed'}`);
    actionMode = 'retry';
    enterSite.textContent = 'Retry';
    enterSite.disabled = false;
  }

  function resetForRetry() {
    actionMode = 'enter';
    enterSite.textContent = 'Enter';
    enterSite.disabled = true;
  }

  function getActionMode() {
    return actionMode;
  }

  function showMobileWarning(fallbackUrl) {
    if (!isMobileViewport()) return;

    bootWarning.hidden = false;
    bootWarning.textContent = `WARN mobile display detected. The embedded screen may not render correctly; the startup button will open ${fallbackUrl}.`;
    appendBootLine('WARN mobile display detected');
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
    getActionMode,
    hideLoader,
    resetForRetry,
    showMobileWarning,
    showRetry,
    startClock,
    unlockEnter,
    updateProgress,
    waitForAppShell,
    waitForFonts
  };
}
