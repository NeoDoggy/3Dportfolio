import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { SCREEN_PLANES } from '../portfolio-config.js';

export function createScreenController({ camera, cssScene, screenPortals }) {
  const focusViewDirection = new THREE.Vector3();
  const fallbackPosition = new THREE.Vector3();
  let screens = [];
  let focusScreen = null;

  function shuffleWords(words) {
    return [...words].sort(() => Math.random() - 0.5);
  }

  function createTerminalTicker(portal, config) {
    const lines = portal.querySelector('.screen-terminal-lines');
    if (!lines) return null;

    const words = config.terminalWords?.length
      ? config.terminalWords
      : ['SYSTEM', 'READY', 'ONLINE', 'MEMORY', 'SIGNAL'];

    function render() {
      const shuffled = shuffleWords(words);
      const lineCount = 7;
      lines.textContent = Array.from({ length: lineCount }, (_, index) => {
        const word = shuffled[index % shuffled.length];
        const address = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        const status = Math.random() > 0.28 ? 'OK' : 'WAIT';
        return `C:\\${word}> ${address} ${status}`;
      }).join('\n');
    }

    render();
    return window.setInterval(render, 640);
  }

  function createScreenInstance(model, config) {
    const portal = screenPortals.find((element) => element.id === config.elementId);
    if (!portal) {
      throw new Error(`Missing screen portal element: #${config.elementId}`);
    }

    const target = model.getObjectByName(config.parentName) || model;
    portal.style.width = `${config.pixelWidth}px`;
    portal.style.height = `${config.pixelHeight}px`;

    const object = new CSS3DObject(portal);
    object.scale.set(
      config.width / config.pixelWidth,
      config.height / config.pixelHeight,
      1
    );
    cssScene.add(object);

    const localMatrix = new THREE.Matrix4();
    localMatrix.compose(
      config.position,
      new THREE.Quaternion().setFromEuler(config.rotation),
      object.scale
    );

    return {
      config,
      cameraDirection: new THREE.Vector3(),
      localMatrix,
      normal: new THREE.Vector3(),
      object,
      portal,
      target,
      terminalTicker: config.type === 'terminal' ? createTerminalTicker(portal, config) : null,
      worldMatrix: new THREE.Matrix4(),
      worldPosition: new THREE.Vector3(),
      worldQuaternion: new THREE.Quaternion(),
      worldScale: new THREE.Vector3()
    };
  }

  function setup(model) {
    screens.forEach((screen) => {
      if (screen.terminalTicker) window.clearInterval(screen.terminalTicker);
    });
    screens = SCREEN_PLANES.map((config) => createScreenInstance(model, config));
    focusScreen = screens.find((screen) => screen.config.focusTarget) || screens[0] || null;
  }

  function powerOff() {
    screens.forEach((screen) => {
      screen.portal.classList.remove('is-powered-on');
    });
  }

  function powerOn() {
    screens.forEach((screen) => {
      screen.portal.classList.add('is-powered-on');
    });
  }

  function update() {
    screens.forEach((screen) => {
      screen.target.updateWorldMatrix(true, false);
      screen.worldMatrix.multiplyMatrices(screen.target.matrixWorld, screen.localMatrix);
      screen.worldMatrix.decompose(screen.worldPosition, screen.worldQuaternion, screen.worldScale);

      screen.object.position.copy(screen.worldPosition);
      screen.object.quaternion.copy(screen.worldQuaternion);
      screen.object.scale.copy(screen.worldScale);

      screen.normal.set(0, 0, 1).applyQuaternion(screen.worldQuaternion).normalize();
      screen.cameraDirection.subVectors(camera.position, screen.worldPosition).normalize();
      screen.portal.classList.toggle('is-facing-away', screen.normal.dot(screen.cameraDirection) < 0.05);
    });
  }

  function getFocusPosition(target) {
    if (!focusScreen) return target;

    focusViewDirection
      .copy(focusScreen.normal)
      .multiplyScalar(focusScreen.normal.dot(focusScreen.cameraDirection) >= 0 ? 1 : -1);
    return target.copy(focusScreen.worldPosition).addScaledVector(focusViewDirection, 2.55);
  }

  return {
    getFocusPosition,
    get position() {
      return focusScreen?.worldPosition || fallbackPosition;
    },
    powerOff,
    powerOn,
    setup,
    update
  };
}
