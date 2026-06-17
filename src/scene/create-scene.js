import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CAMERA_HOME, MODEL_PLACEMENT } from '../portfolio-config.js';
import { createFloor } from './floor.js';

function createControls(camera, domElement) {
  const homeViewOffset = new THREE.Vector3().subVectors(CAMERA_HOME.position, CAMERA_HOME.target);
  const homePolarAngle = Math.acos(THREE.MathUtils.clamp(homeViewOffset.y / homeViewOffset.length(), -1, 1));
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 2.25;
  controls.maxDistance = 11;
  controls.minAzimuthAngle = -Math.PI / 28;
  controls.maxAzimuthAngle = Math.PI / 20;
  controls.minPolarAngle = Math.max(0.01, homePolarAngle - Math.PI / 28);
  controls.maxPolarAngle = Math.PI * 0.45;
  controls.target.copy(CAMERA_HOME.target);

  return controls;
}

function addLights(scene) {
  const ambient = new THREE.HemisphereLight(0xf2f2f2, 0x111111, 1.25);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
  keyLight.position.set(3.8, 5.5, 4.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xffffff, 4.8, 14);
  rimLight.position.set(-3.5, 2.2, -2.5);
  scene.add(rimLight);

  return { ambient, keyLight, rimLight };
}

export function createScene({ app, canvas }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.FogExp2(0x050505, 0.025);

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
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    computerRoot,
    controls,
    cssScene,
    lights,
    render,
    resize
  };
}
