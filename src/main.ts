// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Path3 } from "./Path3";

const container: HTMLDivElement = document.querySelector("#scene-container")!;

/*
 * camera, scene, light, renderer
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(9, 0, 9);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);

const light1 = new THREE.PointLight(0xffffff, 0.4, 0);
light1.position.set(0, 200, 0);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 0.7, 0);
light2.position.set(50, 0, 50);
scene.add(light2);

const light3 = new THREE.PointLight(0xffffff, 0.5, 0);
light3.position.set(-100, 0, -100);
scene.add(light3);

const light4 = new THREE.PointLight(0xffffff, 0.3, 0);
light4.position.set(-100, -200, -100);
scene.add(light4);

const color = 0x1c1c1c;
const near = 1;
const far = 100;
scene.fog = new THREE.Fog(color, near, far);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

container.append(renderer.domElement);

/*
 * first helix
 */
const helixEdgeWidth = 0.4; // how "tall" the edge of the helix is, aka "ribbon width"
const numSteps = 3; // one step is a full coil around the imaginary cylinder in the middle
const yLengthPerStep = 5; // adjust the overall height of the double helix
const helixRadius = 1.35;
const numSegmentsPerStep = 40;

// the helix starts out as one long rectangle, like an uncoiled ribbon
const geometry = new THREE.BoxGeometry(
  numSteps * Math.PI * 2, // width
  helixEdgeWidth, // height of the "uncoiled ribbon," but "width" of the coiled helix's edge
  0.04, // depth
  numSteps * numSegmentsPerStep, // width segments
  1, // height segments
  1, // depth segments
);

const position = geometry.getAttribute("position");

let doubleHelixMinY = 0;
let doubleHelixMaxY = 0;

for (let i = 0; i < position.count; i++) {
  let x = position.getX(i);
  let y = position.getY(i);
  let z = position.getZ(i);

  let radius = helixRadius + z;
  let shift = (x / (Math.PI * 2)) * yLengthPerStep + y;

  position.setX(i, Math.cos(-x) * radius); // `-x` flips the rotation
  position.setY(i, shift);
  position.setZ(i, Math.sin(-x) * radius);

  if (shift < doubleHelixMinY) {
    doubleHelixMinY = shift;
  }
  if (shift > doubleHelixMaxY) {
    doubleHelixMaxY = shift;
  }
}

const material = new THREE.MeshPhongMaterial({
  color: 0x3a3a3a,
  emissive: 0xd4af37,
  shininess: 100,
  side: THREE.DoubleSide,
  flatShading: false,
});

const helix1 = new THREE.Mesh(geometry, material);
scene.add(helix1);

/*
 * second helix
 */
const geometry2 = geometry.clone();
const helix2 = new THREE.Mesh(geometry2, material);

// rotate the second geometry around the y-axis
helix2.rotation.y = Math.PI * 0.78;

scene.add(helix2);

const baseColorMaterial = (color: "red" | "green" | "blue" | "yellow") => {
  const colorLookup = {
    red: 0xff8c94,
    blue: 0x91cdf2,
    green: 0xb1e597,
    yellow: 0xfaedb9,
  };
  return new THREE.MeshPhongMaterial({
    color: colorLookup[color],
    shininess: 30,
    flatShading: false,
  });
};

const tubeGeometry = (path: any) =>
  new THREE.TubeGeometry(
    path,
    1, // pathSegments,
    0.065, // tubeRadius,
    20, // radiusSegments,
    false, // closed
  );

const basePair = (basePairY: number) => {
  // calculate the helix points based on the base pair's y
  const angle1 = 2 * Math.PI * (basePairY / yLengthPerStep);
  const x1 = helixRadius * Math.cos(-angle1);
  const y1 = basePairY;
  const z1 = helixRadius * Math.sin(-angle1);
  const x2 =
    x1 * Math.cos(-helix2.rotation.y) - z1 * Math.sin(-helix2.rotation.y);
  const y2 = y1;
  const z2 =
    x1 * Math.sin(-helix2.rotation.y) + z1 * Math.cos(-helix2.rotation.y);

  // split it in half, so it's a pair
  const baseCoords1: THREE.Vector3[] = [
    new THREE.Vector3(x1, y1, z1),
    new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2),
  ];
  const baseCoords2: THREE.Vector3[] = [
    new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2),
    new THREE.Vector3(x2, y2, z2),
  ];

  const isRedGreen = Math.random() >= 0.5;
  const isColorFlipped = Math.random() >= 0.5;

  const meshMaterial1 = baseColorMaterial(isRedGreen ? "red" : "blue");
  const meshMaterial2 = baseColorMaterial(isRedGreen ? "green" : "yellow");

  const baseMesh1 = new THREE.Mesh(
    tubeGeometry(new Path3(baseCoords1)),
    isColorFlipped ? meshMaterial1 : meshMaterial2,
  );
  const baseMesh2 = new THREE.Mesh(
    tubeGeometry(new Path3(baseCoords2)),
    isColorFlipped ? meshMaterial2 : meshMaterial1,
  );
  scene.add(baseMesh1);
  scene.add(baseMesh2);
};

const numBasePairs = numSteps * 10;
const totalDoubleHelixHeight = doubleHelixMaxY - doubleHelixMinY;
const distanceBetweenBasePairs = totalDoubleHelixHeight / numBasePairs;
for (let i = 1; i < numBasePairs; i++) {
  basePair(doubleHelixMinY + i * distanceBetweenBasePairs);
}

/*
 * controls and render
 */
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.3;

function render() {
  requestAnimationFrame(render);

  scene.rotation.y += 0.0012;

  renderer.render(scene, camera);
  // controls.update();
}
render();
