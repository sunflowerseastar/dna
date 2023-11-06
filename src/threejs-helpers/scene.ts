import {
  AmbientLight,
  // AxesHelper,
  Color,
  Fog,
  // GridHelper,
  PointLight,
  Scene,
} from "three";

function createScene() {
  const scene = new Scene();

  scene.background = new Color(0x202020);
  // scene.add(new AxesHelper(50));
  // scene.add(new GridHelper(100));

  const ambientLight = new AmbientLight(0x444444);
  scene.add(ambientLight);

  const light1 = new PointLight(0xffffff, 0.4, 0);
  light1.position.set(0, 200, 0);
  scene.add(light1);

  const light2 = new PointLight(0xffffff, 0.7, 0);
  light2.position.set(50, 0, 50);
  scene.add(light2);

  const light3 = new PointLight(0xffffff, 0.5, 0);
  light3.position.set(-100, 0, -100);
  scene.add(light3);

  const light4 = new PointLight(0xffffff, 0.3, 0);
  light4.position.set(-100, -200, -100);
  scene.add(light4);

  const color = 0x1c1c1c;
  const near = 1;
  const far = 100;
  scene.fog = new Fog(color, near, far);

  return scene;
}

export { createScene };
