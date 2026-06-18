function getRequiredElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

export function getAppElements() {
  const screenPortals = Array.from(document.querySelectorAll('.screen-portal'));
  const screenFrames = Array.from(document.querySelectorAll('.screen-frame'));

  return {
    app: getRequiredElement('#app'),
    canvas: getRequiredElement('#scene'),
    loaderOverlay: getRequiredElement('#loader'),
    bootLog: getRequiredElement('#boot-log'),
    bootWarning: getRequiredElement('#boot-warning'),
    progressBar: getRequiredElement('#progress-bar'),
    progressLabel: getRequiredElement('#progress-label'),
    appStylesheet: document.querySelector('#app-stylesheet, link[rel="stylesheet"]'),
    screenPortal: getRequiredElement('#screen-portal'),
    screenPortals,
    portfolioFrame: getRequiredElement('#portfolio-frame'),
    screenFrames,
    nowTime: getRequiredElement('#now-time'),
    musicToggle: getRequiredElement('#music-toggle'),
    muteToggle: getRequiredElement('#mute-toggle'),
    enterSite: getRequiredElement('#enter-site')
  };
}
