import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CAMERA_CONTROLS, CAMERA_HOME, MODEL_PLACEMENT, SCENE_LIGHTS, SCENE_RENDERING } from '../portfolio-config.js';
import { createFloor } from './floor.js';

function createControls(camera, domElement) {
  const homeViewOffset = new THREE.Vector3().subVectors(CAMERA_HOME.position, CAMERA_HOME.target);
  const homePolarAngle = Math.acos(THREE.MathUtils.clamp(homeViewOffset.y / homeViewOffset.length(), -1, 1));
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = true;
  controls.dampingFactor = CAMERA_CONTROLS.dampingFactor;
  controls.enablePan = CAMERA_CONTROLS.enablePan;
  controls.enableZoom = CAMERA_CONTROLS.enableZoom;
  controls.minDistance = CAMERA_CONTROLS.minDistance;
  controls.maxDistance = CAMERA_CONTROLS.maxDistance;
  controls.panSpeed = CAMERA_CONTROLS.panSpeed;
  controls.screenSpacePanning = CAMERA_CONTROLS.screenSpacePanning;
  controls.minAzimuthAngle = THREE.MathUtils.degToRad(CAMERA_CONTROLS.rotationLimits.minAzimuthDegrees);
  controls.maxAzimuthAngle = THREE.MathUtils.degToRad(CAMERA_CONTROLS.rotationLimits.maxAzimuthDegrees);
  controls.minPolarAngle = Math.max(
    0.01,
    homePolarAngle + THREE.MathUtils.degToRad(CAMERA_CONTROLS.rotationLimits.minPolarOffsetDegrees)
  );
  controls.maxPolarAngle = THREE.MathUtils.degToRad(CAMERA_CONTROLS.rotationLimits.maxPolarDegrees);
  controls.target.copy(CAMERA_HOME.target);

  return controls;
}

function clampControlsTarget(camera, controls) {
  const bounds = CAMERA_CONTROLS.panTargetBounds;
  if (!CAMERA_CONTROLS.enablePan || !bounds) return;

  const clampedTarget = controls.target.clone().clamp(bounds.min, bounds.max);
  const correction = clampedTarget.sub(controls.target);
  if (correction.lengthSq() === 0) return;

  controls.target.add(correction);
  camera.position.add(correction);
}

function addLights(scene) {
  const ambient = new THREE.HemisphereLight(
    SCENE_LIGHTS.ambient.skyColor,
    SCENE_LIGHTS.ambient.groundColor,
    SCENE_LIGHTS.ambient.intensity
  );
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(SCENE_LIGHTS.key.color, SCENE_LIGHTS.key.intensity);
  keyLight.position.copy(SCENE_LIGHTS.key.position);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(SCENE_LIGHTS.key.shadowMapSize, SCENE_LIGHTS.key.shadowMapSize);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(SCENE_LIGHTS.rim.color, SCENE_LIGHTS.rim.intensity, SCENE_LIGHTS.rim.distance);
  rimLight.position.copy(SCENE_LIGHTS.rim.position);
  scene.add(rimLight);

  return { ambient, keyLight, rimLight };
}

export function createScene({ app, canvas }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_RENDERING.backgroundColor);
  scene.fog = new THREE.FogExp2(SCENE_RENDERING.backgroundColor, SCENE_RENDERING.fogDensity);

  const cssScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.copy(CAMERA_HOME.position);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = SCENE_RENDERING.toneMappingExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const environmentMap = pmremGenerator.fromScene(roomEnvironment).texture;
  scene.environment = environmentMap;
  scene.environmentIntensity = SCENE_RENDERING.environmentIntensity;
  roomEnvironment.dispose();
  pmremGenerator.dispose();

  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.className = 'css3d-layer';
  app.appendChild(cssRenderer.domElement);

  const controls = createControls(camera, renderer.domElement);
  const computerRoot = new THREE.Group();
  computerRoot.position.x = MODEL_PLACEMENT.offsetX ?? 0;
  scene.add(computerRoot);
  scene.add(createFloor());

  const lights = addLights(scene);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  function render() {
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
  }

  return {
    camera,
    clampControlsTarget: () => clampControlsTarget(camera, controls),
    computerRoot,
    controls,
    cssScene,
    environmentMap,
    lights,
    render,
    resize
  };
}
