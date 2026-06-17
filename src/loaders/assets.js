import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MODEL_PATH, SCREEN_PLANES } from '../portfolio-config.js';
import { applyModelMaterials, fitModelToScene } from '../scene/model.js';

export function createAssetLoader({ computerRoot, screenFrames, rippleController, screenController, ui, audio }) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  function loadModel() {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        MODEL_PATH,
        (gltf) => {
          const model = gltf.scene;
          applyModelMaterials(model);
          fitModelToScene(model);
          computerRoot.add(model);
          screenController.setup(model);
          rippleController.setup(model);
          ui.updateProgress(82);
          resolve();
        },
        (event) => {
          if (event.lengthComputable) {
            ui.updateProgress(32 + (event.loaded / event.total) * 48);
          }
        },
        reject
      );
    });
  }

  function loadIframe() {
    const iframeScreens = SCREEN_PLANES.filter((screen) => screen.type === 'iframe');

    const frameLoads = iframeScreens.map((screen) => {
      const frame = screenFrames.find((element) => element.id === screen.frameId);
      if (!frame) {
        throw new Error(`Missing screen iframe element: #${screen.frameId}`);
      }

      return new Promise((resolve) => {
        const settle = () => {
          frame.removeEventListener('load', settle);
          resolve();
        };

        frame.addEventListener('load', settle, { once: true });
        frame.src = screen.url;
      });
    });

    return Promise.all(frameLoads).then(() => {
      ui.updateProgress(96);
    });
  }

  async function bootApplication() {
    ui.appendBootLine('C:\\PORTFOLIO> boot /sequence');
    ui.appendBootLine('OK  loading html/css/js shell');
    await ui.waitForAppShell();

    ui.appendBootLine('OK  loading fonts');
    await ui.waitForFonts();

    ui.appendBootLine(`OK  loading model ${MODEL_PATH}`);
    await loadModel();

    ui.appendBootLine('OK  buffering background music');
    await audio.load();
    ui.updateProgress(88);

    ui.appendBootLine('OK  linking screen content');
    await loadIframe();

    ui.unlockEnter();
  }

  return { bootApplication };
}
