import * as THREE from 'three';
import { createAudioController } from './audio/audio-controller.js';
import { getAppElements } from './dom-elements.js';
import { createAssetLoader } from './loaders/assets.js';
import { createAcrylicHoverController } from './scene/acrylic-hover.js';
import { createCameraController } from './scene/camera-controller.js';
import { createScene } from './scene/create-scene.js';
import { createRippleController } from './scene/ripples.js';
import { createScreenController } from './scene/screen.js';
import { createBootUi } from './ui/boot-ui.js';
import { PORTFOLIO_URL, SCENE_LIGHTS } from './portfolio-config.js';

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
  clampControlsTarget: sceneRig.clampControlsTarget,
  controls: sceneRig.controls,
  onEntryComplete: () => {
    screenController.powerOn();
  },
  screenController
});
const assetLoader = createAssetLoader({
  audio,
  computerRoot: sceneRig.computerRoot,
  environmentMap: sceneRig.environmentMap,
  screenFrames: elements.screenFrames,
  rippleController,
  screenController,
  ui
});
createAcrylicHoverController({
  camera: sceneRig.camera,
  cameraController,
  canvas: elements.canvas,
  getAcrylicModel: () => assetLoader.getModel('acrylic')
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

  if (ui.getActionMode() === 'retry') {
    ui.resetForRetry();
    bootApplication();
    return;
  }

  if (ui.getActionMode() === 'fallback') {
    window.location.href = PORTFOLIO_URL;
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
let computerRootRotationY = sceneRig.computerRoot.rotation.y;

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  sceneRig.lights.rimLight.intensity =
    SCENE_LIGHTS.rim.pulseBase + Math.sin(elapsed * SCENE_LIGHTS.rim.pulseSpeed) * SCENE_LIGHTS.rim.pulseStrength;
  const idleRotationY = Math.sin(elapsed * 0.22) * 0.025;
  const rotationTargetY = cameraController.isSubjectFocusActive() ? computerRootRotationY : idleRotationY;
  computerRootRotationY = THREE.MathUtils.lerp(computerRootRotationY, rotationTargetY, 1 - Math.exp(-4 * delta));
  sceneRig.computerRoot.rotation.y = computerRootRotationY;
  screenController.update();
  rippleController.update(elapsed, audio.isMusicActive());
  cameraController.update(delta);
  sceneRig.render();

  window.requestAnimationFrame(animate);
}

ui.startClock();
ui.showMobileWarning(PORTFOLIO_URL);
animate();
bootApplication();
