import * as THREE from "three";
import {
  OrbitControls,
  RoundedBoxGeometry,
} from "three/examples/jsm/Addons.js";
import { TextGeometry, FontLoader } from "three/examples/jsm/Addons.js";

export function Rubik() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const render = () => renderer.render(scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);

  const cubes = [];
  const facesHelper = [];
  var isShowFaceHelper = false;
  var moveHistory = [];
  let rotationDirection;
  let selectedCube;
  let pivot;

  function setupCamera() {
    camera.position.set(5, 5, 5);
    camera.lookAt(scene.position);
    controls.enablePan = false;
    controls.enableZoom = false;
  }

  function setupLights() {
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight1.position.set(10, 10, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-10, -10, -10);
    scene.add(directionalLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
  }

  function initScene() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    document.body.appendChild(renderer.domElement);

    setupLights();
    setupCamera();
    createCubes();
    createFacesHelper();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
  }

  function createFacesHelper() {
    const loader = new FontLoader();
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const sides = [
          {
            text: "F",
            position: { x: 0, y: 0, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
          }, // Front
          {
            text: "B",
            position: { x: 0, y: 0, z: -3 },
            rotation: { x: 0, y: Math.PI, z: 0 },
          }, // Back
          {
            text: "L",
            position: { x: -3, y: 0, z: 0 },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
          }, // Left
          {
            text: "R",
            position: { x: 3, y: 0, z: 0 },
            rotation: { x: 0, y: -Math.PI / 2, z: 0 },
          }, // Right
          {
            text: "U",
            position: { x: 0, y: 3, z: 0 },
            rotation: { x: -Math.PI / 2, y: 0, z: 0 },
          }, // Up
          {
            text: "D",
            position: { x: 0, y: -3, z: 0 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
          }, // Down
        ];

        sides.forEach((side) => {
          const geometry = new TextGeometry(side.text, {
            font: font,
            size: 1,
            depth: 0.02,
          });
          geometry.center();
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
            opacity: 0,
            transparent: true,
          });
          const textMesh = new THREE.Mesh(geometry, material);
          textMesh.position.set(
            side.position.x,
            side.position.y,
            side.position.z
          );
          textMesh.rotation.set(
            side.rotation.x,
            side.rotation.y,
            side.rotation.z
          );
          facesHelper.push(textMesh);
          scene.add(textMesh);
        });
      }
    );
  }

  function onToggleFacesHelper() {
    isShowFaceHelper = !isShowFaceHelper;
    facesHelper.forEach((face) => {
      face.material.opacity = isShowFaceHelper ? 0.8 : 0;
    });
  }

  function createCubes() {
    const geometry = new RoundedBoxGeometry(1, 1, 1, 12, 0.1);
    const setFaces = (x, y, z) => {
      var colors = Array(6).fill(0xffffff);
      if (x == 1) colors[0] = 0xb71234;
      if (z == 1) colors[4] = 0x009b48;
      if (y == 1) colors[2] = 0xffffff;
      if (x == -1) colors[1] = 0xff5800;
      if (z == -1) colors[5] = 0xffd500;
      if (y == -1) colors[3] = 0x0046ad;
      return colors.map(
        (color) =>
          new THREE.MeshPhysicalMaterial({
            color,
            roughness: 0.4,
            metalness: 0.4,
          })
      );
    };

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          let cube = new THREE.Mesh(geometry, setFaces(x, y, z));
          cube.castShadow = true;
          cube.receiveShadow = true;
          scene.add(cube);
          cube.userData.originPosition = new THREE.Vector3(x, y, z);
          cube.position.set(x, y, z);
          cubes.push(cube);
        }
      }
    }
  }

  function predictSelectedFace() {
    let group;
    if (rotationDirection === "y" || rotationDirection === "-y") {
      group = cubes.filter(
        (x) => Math.abs(x.position.y - selectedCube.object.position.y) < 0.05
      );
    } else if (rotationDirection === "x" || rotationDirection === "-x") {
      group = cubes.filter(
        (x) => Math.abs(x.position.x - selectedCube.object.position.x) < 0.05
      );
    } else if (rotationDirection === "z" || rotationDirection === "-z") {
      group = cubes.filter(
        (x) => Math.abs(x.position.z - selectedCube.object.position.z) < 0.05
      );
    }
    pivot = new THREE.Object3D();
    pivot.add(...group);
    scene.add(pivot);
  }

  function addMoveHistory() {}

  function rotatingAnimate() {
    let d = 0;

    const axis = rotationDirection.replace("-", "");
    let counterClockWise = rotationDirection.includes("-");

    let timer = setInterval(() => {
      d += 3;

      pivot.rotation[axis] = THREE.MathUtils.degToRad(
        counterClockWise ? -d : d
      );

      if (d >= 90) {
        pivot.rotation[axis] = (counterClockWise ? -Math.PI : Math.PI) / 2;
        render();

        if (pivot != undefined) {
          let groupMatrix = pivot.matrix;
          let children = [...pivot.children];
          for (let i = 0; i < children.length; i++) {
            pivot.remove(children[i]);
            scene.add(children[i]);
            children[i].applyMatrix4(groupMatrix);
          }
          scene.remove(pivot);
        }

        clearInterval(timer);
      }
    }, 10);
  }

  function resetView() {
    let currentPosition = camera.position;
    let targetPosition = { x: 5, y: 5, z: 5 };
    let duration = 300;
    let stepX = ((targetPosition.x - currentPosition.x) / duration) * 10;
    let stepY = ((targetPosition.y - currentPosition.y) / duration) * 10;
    let stepZ = ((targetPosition.z - currentPosition.z) / duration) * 10;

    let x = currentPosition.x;
    let y = currentPosition.y;
    let z = currentPosition.z;
    let timer = setInterval(() => {
      x += stepX;
      y += stepY;
      z += stepZ;
      camera.position.x = x;
      camera.position.y = y;
      camera.position.z = z;
      if (
        x <= 5.1 &&
        x >= 4.9 &&
        y <= 5.1 &&
        y >= 4.9 &&
        z <= 5.1 &&
        z >= 4.9
      ) {
        camera.position.x = 5;
        camera.position.y = 5;
        camera.position.z = 5;
        render();
        clearInterval(timer);
      }
    }, 10);
  }

  const resetValues = () => {
    controls.enableRotate = true;
    rotationDirection = undefined;
    selectedCube = undefined;
  };

  function onMouseDown(e) {
    var mousePosition = new THREE.Vector2();

    if (e.type === "mousedown") {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    } else if (e.type === "touchstart") {
      mousePosition.x =
        +(e.targetTouches[0].pageX / window.innerWidth) * 2 + -1;
      mousePosition.y =
        -(e.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera);
    let intersects = raycaster.intersectObjects(cubes, false);

    if (intersects.length) {
      controls.enableRotate = false;
      selectedCube = intersects[0];
    }
  }

  function predictDirection(startPoint, nextPoint) {
    let limit = 0.3;

    let dx = startPoint.x - nextPoint.x;
    let dy = startPoint.y - nextPoint.y;
    let dz = startPoint.z - nextPoint.z;

    let absX = Math.abs(dx);
    let absY = Math.abs(dy);
    let absZ = Math.abs(dz);

    if (startPoint.x >= 1.5) {
      if (absY > limit || absZ > limit) {
        if (absY > absZ) {
          rotationDirection = dy < 0 ? "z" : "-z";
        } else {
          rotationDirection = dz < 0 ? "-y" : "y";
        }
      }
    } else if (startPoint.y >= 1.5) {
      if (absX > limit || absZ > limit) {
        if (absX > absZ) {
          rotationDirection = dx < 0 ? "-z" : "z";
        } else {
          rotationDirection = dz < 0 ? "x" : "-x";
        }
      }
    } else if (startPoint.z >= 1.5) {
      if (absX > limit || absY > limit) {
        if (absX > absY) {
          rotationDirection = dx < 0 ? "y" : "-y";
        } else {
          rotationDirection = dy < 0 ? "-x" : "x";
        }
      }
    } else if (startPoint.x <= -1.5) {
      if (absY > limit || absZ > limit) {
        if (absY > absZ) {
          rotationDirection = dy < 0 ? "-z" : "z";
        } else {
          rotationDirection = dz < 0 ? "y" : "-y";
        }
      }
    } else if (startPoint.y <= -1.5) {
      if (absX > limit || absZ > limit) {
        if (absX > absZ) {
          rotationDirection = dx < 0 ? "z" : "-z";
        } else {
          rotationDirection = dz < 0 ? "-x" : "x";
        }
      }
    } else if (startPoint.z <= -1.5) {
      if (absX > limit || absY > limit) {
        if (absX > absY) {
          rotationDirection = dx < 0 ? "-y" : "y";
        } else {
          rotationDirection = dy < 0 ? "x" : "-x";
        }
      }
    }
  }

  function onMouseMove(e) {
    if (!selectedCube) return;
    const mousePosition = new THREE.Vector2();

    if (e.type === "mousemove") {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    } else if (e.type === "touchmove") {
      mousePosition.x =
        +(e.targetTouches[0].pageX / window.innerWidth) * 2 + -1;
      mousePosition.y =
        -(e.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera);
    let intersects = raycaster.intersectObjects(cubes, false);

    if (!intersects.length) return;

    predictDirection(selectedCube.point, intersects[0]?.point);
    if (rotationDirection != undefined) {
      predictSelectedFace();
      rotatingAnimate();
      selectedCube = undefined;
    }
  }

  initScene();
  animate();

  return {
    resize,
    resetView,
    resetValues,
    onMouseDown,
    onMouseMove,
    onToggleFacesHelper,
  };
}
