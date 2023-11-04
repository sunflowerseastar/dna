import {
  AxesHelper,
  BoxBufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import { createCamera } from "./threejs-helpers/camera";
// import { createScene } from "./threejs-helpers/scene";
// import { createRenderer } from "./threejs-helpers/renderer";
// import { Path3 } from "./Path3";

// let camera: PerspectiveCamera;
// let renderer: WebGLRenderer;
// let scene: Scene;

function main() {
  const container: HTMLDivElement = document.querySelector("#scene-container")!;

  // camera = createCamera();
  // renderer = createRenderer();
  // scene = createScene();

  var scene = new Scene();
  scene.background = new Color(0xeeeeee);

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 3, 10);
  var renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  container.append(renderer.domElement);

  var rbnWidth = 0.3; // y-axis "height" is the width of the ribbon
  var rbnSteps = 2;
  var rbnStepLength = 2;
  var rbnSegsPerStep = 40;
  var rbnRadius = 1;

  const geometry = new BoxBufferGeometry(
    rbnSteps * Math.PI * 2,     // width
    rbnWidth,                   // height
    0.15,                       // depth
    rbnSteps * rbnSegsPerStep,  // width segments
    1,                          // height segments
    1                           // depth segments
  );

  const position = geometry.getAttribute("position");
  // console.log("position.count", position.count);
  // console.log("position", position);

  // const middle = 0.5; // The center of the box
  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i);
    let y = position.getY(i);
    let z = position.getZ(i);

    console.log('x, -x', x, -x);
    // let angle = -x; // twist left as it raises
    let radius = rbnRadius + z;
    let shift = (x / (Math.PI * 2)) * rbnStepLength + y;
    console.log('shift', shift);

    position.setX(i, Math.cos(x) * radius);
    position.setY(i,  shift);
    position.setZ(i, Math.sin(x) * radius);
  }

  const material = new MeshBasicMaterial({ color: 0x999999, wireframe: true }); // This will make it green, but you can adjust as desired
  const box1 = new Mesh(geometry, material);
  scene.add(box1);

  // Create a second geometry identical to the first one
  const geometry2 = geometry.clone();
  const box2 = new Mesh(geometry2, material);

  // Rotate the second geometry by 180 degrees around the y-axis
  box2.rotation.y = Math.PI;

  scene.add(box2);

  scene.add(new AxesHelper(50));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.3;

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
  }
  render();
}

main();
