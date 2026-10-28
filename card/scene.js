/* 빛나는 유리 구 + 고리 3D 장면 — BILAB 로고의 "spot"을 블루 톤으로 */
import * as THREE from "three";

const canvas = document.getElementById("scene");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  document.body.classList.add("no-webgl");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
// 네온 빛 패널로 만든 환경맵: 유리 표면에 핑크·시안·바이올렛이 비치게 함
function neonEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0e2038);
  const panel = (color, w, h, pos, intensity = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(0x7dd3fc, 8, 6, [6, 4, 3], 2.2);    // sky
  panel(0x8fb2ff, 7, 6, [-6, -1, 4], 2.0);  // light blue
  panel(0x3454d1, 10, 5, [0, -6, -2], 1.6); // accent blue
  panel(0x4a63d8, 6, 6, [-3, 5, -6], 1.4);  // blue
  panel(0xffffff, 3, 2, [-2, 6, 5], 3.0);   // key highlight
  panel(0xe6e9ff, 4, 1.5, [5, -3, 6], 1.5);
  return env;
}
scene.environment = pmrem.fromScene(neonEnvironment(), 0.02).texture;

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 9);

// 블루 계열 빛 (sky, light blue, accent)
const sky = new THREE.PointLight(0x7dd3fc, 420, 40); sky.position.set(4, 4, 5);
const light = new THREE.PointLight(0x8fb2ff, 380, 40); light.position.set(-5, -2, 4);
const blue = new THREE.PointLight(0x3454d1, 260, 40); blue.position.set(0, -5, -2);
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 5, 6);
scene.add(key);
scene.add(sky, light, blue, new THREE.AmbientLight(0x163863, 0.6));

const iris = (opts = {}) => new THREE.MeshPhysicalMaterial({
  color: 0xe3eafb, metalness: 0.55, roughness: 0.06,
  iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 820],
  clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, ...opts,
});

const group = new THREE.Group();
scene.add(group);

const orb = new THREE.Mesh(new THREE.SphereGeometry(1.25, 128, 128), iris({ sheen: 1, sheenColor: new THREE.Color(0xbae6fd) }));
group.add(orb);

const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.1, 64, 240), iris({ metalness: 0.4, roughness: 0.12 }));
ring.rotation.set(1.15, 0.2, 0.3);
group.add(ring);

// 궤도를 도는 작은 구슬
const pearls = [0.32, 0.22, 0.16].map((r, i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 64), iris({ iridescenceThicknessRange: [200 + i * 150, 900] }));
  m.userData = { radius: 2.6 + i * 0.45, speed: 0.35 - i * 0.07, phase: i * 2.1, tilt: 0.5 + i * 0.35 };
  group.add(m);
  return m;
});

// 화면 크기에 따라 위치 조정: 모바일은 오른쪽 위, 넓은 화면은 오른쪽
function layout() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const narrow = w < 640;
  group.userData.base = narrow ? new THREE.Vector3(0.75, 1.55, 0) : new THREE.Vector3(2.3, 0.6, 0);
  group.scale.setScalar(narrow ? 0.5 : 0.85);
}
addEventListener("resize", layout);
layout();

// 포인터/스크롤 반응
const pointer = new THREE.Vector2();
addEventListener("pointermove", (e) => {
  pointer.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
});
let scrollY = 0;
addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

const clock = new THREE.Clock();
function frame() {
  const t = reduced ? 0 : clock.getElapsedTime();
  const base = group.userData.base;
  const s = Math.min(scrollY / innerHeight, 1.5);

  group.position.set(
    base.x + pointer.x * 0.35,
    base.y + Math.sin(t * 0.8) * 0.12 + s * 4 - pointer.y * 0.25,
    -s * 1.5
  );
  group.rotation.y += ((pointer.x * 0.5) - group.rotation.y) * 0.05;
  group.rotation.x += ((pointer.y * 0.3) - group.rotation.x) * 0.05;

  orb.rotation.y = t * 0.25;
  orb.rotation.z = Math.sin(t * 0.4) * 0.2;
  ring.rotation.z = 0.3 + t * 0.35;
  ring.rotation.x = 1.15 + Math.sin(t * 0.5) * 0.12;

  pearls.forEach((p) => {
    const { radius, speed, phase, tilt } = p.userData;
    const a = t * speed + phase;
    p.position.set(Math.cos(a) * radius, Math.sin(a) * radius * Math.sin(tilt), Math.sin(a) * radius * Math.cos(tilt) * 0.6);
  });

  renderer.render(scene, camera);
}

if (reduced) {
  frame();
  addEventListener("resize", frame);
} else {
  renderer.setAnimationLoop(frame);
  // 탭이 보이지 않으면 멈춤
  document.addEventListener("visibilitychange", () => {
    renderer.setAnimationLoop(document.hidden ? null : frame);
  });
}
// 3D가 떴으면 준비 표시 (늦게 떠도 CSS 대체 구를 걷어냄)
canvas.classList.add("ready");
document.body.classList.remove("no-webgl");
