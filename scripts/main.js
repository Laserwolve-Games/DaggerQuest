import * as THREE from 'three';

import { TrackballControls } from './TrackballControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { GLTFLoader } from './three/addons/loaders/GLTFLoader.js';

let threeRenderer = null;
let threeCamera = null;
let threeMixer = null;
let threeControls = null;
let threeScene = null;
let raycaster = null;
let mouse = null;
let nodeUnderMouse = null;
let isRotating = false;

runOnStartup(async runtime => {
	runtime.addEventListener('beforeprojectstart', () => OnBeforeProjectStart(runtime));
});

const OnBeforeProjectStart = async (runtime) => {
	await InitThreeJs(runtime);

	runtime.addEventListener('resize', e => OnResize(e));
	runtime.addEventListener('tick', () => OnTick(runtime));

	window.addEventListener('contextmenu', onMouseClick);
	window.addEventListener('mousemove', updateMousePosition);
}

const updateMousePosition = (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

const onMouseClick = (event) => {
	if (nodeUnderMouse) {
		console.log(nodeUnderMouse.parent.parent.userData.description);
		console.log(nodeUnderMouse.parent.parent.userData.canBeAllocatedOrDeallocated);

		if (!nodeUnderMouse.parent.parent.userData.isAllocated && nodeUnderMouse.parent.parent.userData.canBeAllocatedOrDeallocated) {
			nodeUnderMouse.parent.parent.visible = false;
		}

		updateMousePosition(event);
	}
}

const getNodeUnderMouse = () => {
	const red = new THREE.Color(0xff0000);
	const none = new THREE.Color(0xffffff);

	threeScene.children.forEach(node => node.children[0].children[0].material.color.set(none));

	if (!isRotating) {
		raycaster.setFromCamera(mouse, threeCamera);
		nodeUnderMouse = null;

		raycaster.intersectObjects(threeScene.children, true).slice().reverse().forEach((node) => {
			if (node.object.parent.parent.visible) nodeUnderMouse = node.object;
		});

		nodeUnderMouse?.material.color.set(red);
	}
}

const InitThreeJs = async (runtime) => {
	const platformInfo = runtime.platformInfo;
	const container = runtime.getHTMLLayer(0);

	threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});

	threeRenderer.setPixelRatio(platformInfo.devicePixelRatio);
	threeRenderer.setSize(platformInfo.canvasCssWidth, platformInfo.canvasCssHeight);
	container.appendChild(threeRenderer.domElement);

	const pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
	threeScene = new THREE.Scene();
	threeScene.environment = pmremGenerator.fromScene(new RoomEnvironment(threeRenderer), 0.04).texture;

	threeCamera = new THREE.PerspectiveCamera(40, platformInfo.canvasCssWidth / platformInfo.canvasCssHeight, 1, 100);
	threeCamera.position.set(10, 4, 16);

	threeControls = new TrackballControls(threeCamera, threeRenderer.domElement);
	threeControls.mouseButtons = {
		LEFT: THREE.MOUSE.ROTATE,
		MIDDLE: null,
		RIGHT: null
	};

	threeControls.addEventListener('start', () => {
		isRotating = true;
	});
	threeControls.addEventListener('end', () => {
		mouse.x = window.innerWidth;
		mouse.y = window.innerHeight;
		isRotating = false;
	});
	threeControls.target.set(0, 0, 0);
	threeControls.update();
	threeControls.rotateSpeed = 5;

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	const loader = new GLTFLoader();
	const gltf = await LoadGLTF(loader, 'node.glb');
	const templateNode = gltf.scene;
	const cubeSize = 7;
	const adjustedCubeSize = Math.floor(cubeSize / 2);
	const spacing = .1;

	let counter = 0;

	const nodeData = new Array(cubeSize).fill(null).map((_, x) =>
		new Array(cubeSize).fill(null).map((_, y) =>
			new Array(cubeSize).fill(null).map((_, z) => {
				const nodeId = counter++;
				const center = Math.floor(cubeSize / 2);
				const layer = Math.max(Math.abs(x - center), Math.abs(y - center), Math.abs(z - center));

				return {
					nodeId: nodeId,
					description: `Description of node: ${nodeId}`,
					passiveMod: `Mod details of node: ${nodeId}`,
					layer: layer,
					isAllocated: false,
					canBeAllocatedOrDeallocated: false
				};
			})
		)
	);

	for (let x = -adjustedCubeSize; x <= adjustedCubeSize; x++) {
		for (let y = -adjustedCubeSize; y <= adjustedCubeSize; y++) {
			for (let z = -adjustedCubeSize; z <= adjustedCubeSize; z++) {
				const node = templateNode.clone();
				node.children[0].children[0].material = templateNode.children[0].children[0].material.clone();
				node.position.set(x + x * spacing, y + y * spacing, z + z * spacing);
				node.userData = nodeData[x + adjustedCubeSize][y + adjustedCubeSize][z + adjustedCubeSize];

				if (
					(Math.abs(x) === adjustedCubeSize && Math.abs(y) === adjustedCubeSize && Math.abs(z) === adjustedCubeSize)
				) {
					node.userData.canBeAllocatedOrDeallocated = true;
				}

				threeScene.add(node);
			}
		}
	}
}

const LoadGLTF = (loader, path) => {
	return new Promise((resolve, reject) => {
		loader.load(path, resolve, undefined, reject);
	});
}

const OnResize = (e) => {
	threeCamera.aspect = e.cssWidth / e.cssHeight;
	threeCamera.updateProjectionMatrix();

	threeRenderer.setSize(e.cssWidth, e.cssHeight);
}

const OnTick = (runtime) => {
	threeMixer?.update(runtime.dt);

	threeControls.update();

	threeRenderer.render(threeScene, threeCamera);

	getNodeUnderMouse();
}