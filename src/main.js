import * as THREE from 'three';
import { createAudioController } from './audio/audio-controller.js';
import { getAppElements } from './dom-elements.js';
import { createAssetLoader } from './loaders/assets.js';
import { createCameraController } from './scene/camera-controller.js';
import { createScene } from './scene/create-scene.js';
import { createRippleController } from './scene/ripples.js';
import { createScreenController } from './scene/screen.js';
import { createBootUi } from './ui/boot-ui.js';

const elements = getAppElements();
const ui = createBootUi(elements);
const audio = createAudioController(elements);
const sceneRig = createScene(elements);
const rippleController = createRippleController();
const screenController = createScreenController({
  camera: sceneRig.camera,
  cssScene: sceneRig.cssScene,
  screenPortals: elements.screenPortals
});
const cameraController = createCameraController({
  camera: sceneRig.camera,
  controls: sceneRig.controls,
  onEntryComplete: () => {
    screenController.powerOn();
  },
  screenController
});
const assetLoader = createAssetLoader({
  audio,
  computerRoot: sceneRig.computerRoot,
  screenFrames: elements.screenFrames,
  rippleController,
  screenController,
  ui
});

async function bootApplication() {
  try {
    await assetLoader.bootApplication();
  } catch (error) {
    ui.showRetry(error);
  }
}

sceneRig.controls.addEventListener('start', () => {
  cameraController.setOrbitDragging(true);
});

sceneRig.controls.addEventListener('end', () => {
  cameraController.setOrbitDragging(false);
});

elements.enterSite.addEventListener('click', async () => {
  if (elements.enterSite.disabled) return;

  if (elements.enterSite.textContent === 'Retry') {
    ui.resetForRetry();
    bootApplication();
    return;
  }

  ui.hideLoader();
  screenController.powerOff();
  cameraController.startEntryFlyIn();
  await audio.playStartup();
  await audio.playAmbience();
});

elements.screenPortal.addEventListener('pointerenter', () => {
  cameraController.startFocusTransition(true);
});

elements.screenPortal.addEventListener('pointerleave', () => {
  cameraController.startFocusTransition(false);
});

window.addEventListener('resize', sceneRig.resize);

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  sceneRig.lights.rimLight.intensity = 4.4 + Math.sin(elapsed * 2.2) * 0.45;
  sceneRig.computerRoot.rotation.y = Math.sin(elapsed * 0.22) * 0.025;
  screenController.update();
  rippleController.update(elapsed, audio.isMusicActive());
  cameraController.update(delta);
  sceneRig.render();

  window.requestAnimationFrame(animate);
}

ui.startClock();
animate();
bootApplication();
