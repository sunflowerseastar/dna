import {
  BoxBufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createCamera } from "./threejs-helpers/camera";
import { createScene } from "./threejs-helpers/scene";
import { createRenderer } from "./threejs-helpers/renderer";
import { Path3 } from "./Path3";

let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let scene: Scene;

function main() {
  const container: HTMLDivElement = document.querySelector("#scene-container")!;

  camera = createCamera();
  renderer = createRenderer();
  scene = createScene();

  // var scene = new Scene();
  // scene.background = new Color(0xeeeeee);

  // var renderer = new WebGLRenderer({
  //   antialias: true,
  // });
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(renderer.domElement);

  container.append(renderer.domElement);

  var rbnWidth = 0.2; // y-axis "height" is the width of the ribbon
  var rbnSteps = 2;
  var rbnStepLength = 4;
  var rbnSegsPerStep = 40;
  var rbnRadius = 1;

  const geometry = new BoxBufferGeometry(
    rbnSteps * Math.PI * 2, // width
    rbnWidth, // height
    0.1, // depth
    rbnSteps * rbnSegsPerStep, // width segments
    1, // height segments
    1 // depth segments
  );

  const position = geometry.getAttribute("position");

  let minY = 0;
  let maxY = 0;

  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i);
    let y = position.getY(i);
    let z = position.getZ(i);

    let radius = rbnRadius + z;
    let shift = (x / (Math.PI * 2)) * rbnStepLength + y;

    position.setX(i, Math.cos(-x) * radius); // `-x` flips the rotation
    position.setY(i, shift);
    position.setZ(i, Math.sin(-x) * radius);

    if (shift < minY) {
      minY = shift;
    }
    if (shift > maxY) {
      maxY = shift;
    }
  }

  const material = new MeshPhongMaterial({
    color: 0x222222,
    emissive: 0x000000,
    shininess: 10,
    side: DoubleSide,
    flatShading: false,
  });

  const helix1 = new Mesh(geometry, material);
  scene.add(helix1);

  // Create a second geometry identical to the first one
  const geometry2 = geometry.clone();
  const box2 = new Mesh(geometry2, material);

  // Rotate the second geometry around the y-axis
  box2.rotation.y = Math.PI * 0.8;

  scene.add(box2);

  const baseColorMaterial = (color: "red" | "green" | "blue" | "yellow") => {
    const colorLookup = {
      red: 0xff8c94,
      blue: 0x91cdf2,
      green: 0xb1e597,
      yellow: 0xfaedb9,
    };
    return new MeshPhongMaterial({
      color: colorLookup[color],
      shininess: 10,
      side: DoubleSide,
      flatShading: false,
    });
  };

  const tubeGeometry = (path: any) =>
    new TubeGeometry(
      path,
      1, // pathSegments,
      0.05, // tubeRadius,
      20, // radiusSegments,
      false // closed
    );

  const basePair = (basePairY) => {
    // Calculate the angle for the first point on the first helix based on the basePairY position
    const angle1 = 2 * Math.PI * (basePairY / rbnStepLength);

    // Calculate the x, y, and z coordinates for this point
    const x1 = rbnRadius * Math.cos(-angle1);
    const y1 = basePairY;
    const z1 = rbnRadius * Math.sin(-angle1);

    // Calculate the x, y, and z coordinates for this point
    const x2 =
      x1 * Math.cos(-box2.rotation.y) - z1 * Math.sin(-box2.rotation.y);
    const y2 = y1;
    const z2 =
      x1 * Math.sin(-box2.rotation.y) + z1 * Math.cos(-box2.rotation.y);

    // Create two base pairs, each representing half of the original base pair
    const base1: Vector3[] = [
      new Vector3(x1, y1, z1),
      new Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2),
    ];
    const base2: Vector3[] = [
      new Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2),
      new Vector3(x2, y2, z2),
    ];

    const path1 = new Path3(base1);
    const path2 = new Path3(base2);

    const isRedGreen = Math.random() >= 0.5;
    const isColorFlipped = Math.random() >= 0.5;

    const meshMaterial1 = baseColorMaterial(isRedGreen ? "red" : "blue");
    const meshMaterial2 = baseColorMaterial(isRedGreen ? "green" : "yellow");

    const mesh1a = new Mesh(
      tubeGeometry(path1),
      isColorFlipped ? meshMaterial1 : meshMaterial2
    );
    const mesh1b = new Mesh(
      tubeGeometry(path2),
      isColorFlipped ? meshMaterial2 : meshMaterial1
    );
    scene.add(mesh1a);
    scene.add(mesh1b);
  };

  const numBasePairYs = rbnSteps * 10;
  const basePairYsRange = maxY - minY;
  const basePairYsDistance = basePairYsRange / numBasePairYs;
  for (let i = 1; i < numBasePairYs; i++) {
    basePair(minY + i * basePairYsDistance);
  }

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
