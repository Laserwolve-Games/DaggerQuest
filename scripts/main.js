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
let pulseClock = new THREE.Clock();
const spacing = .1;
const cubeSize = 7;
const adjustedCubeSize = Math.floor(cubeSize / 2); // 3

runOnStartup(async runtime => {

	runtime.addEventListener('beforeprojectstart', () => OnBeforeProjectStart(runtime));

});

const OnBeforeProjectStart = async (runtime) => {

	await InitThreeJs(runtime);

	runtime.addEventListener('resize', e => OnResize(e));

	runtime.addEventListener('tick', () => OnTick(runtime));

	window.addEventListener('contextmenu', onMouseClick);

	window.addEventListener('mousemove', updateMousePosition);

	window.addEventListener('keydown', opacityToggle);
}

const updateMousePosition = (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

const opacityToggle = (event) => {
	let property = null;
	let index = null;

	// Toggle row, column, or depth opacity based on the keys pressed.
	// Account for nodes that were already made opaque by another key press.
	if (event.ctrlKey && event.key >= '1' && event.key <= cubeSize.toString())
		property = 'Row';
	else if (event.altKey && event.key >= '1' && event.key <= cubeSize.toString())
		property = 'Column';
	else if (event.key >= '1' && event.key <= cubeSize.toString())
		property = 'Depth';

	if (property) {
		index = parseInt(event.key) - 1;
		threeScene.children.forEach(node => {
			if (node.userData[property] === index) {
				const opacityProperty = `opacitySetVia${property}`;
				node.userData[opacityProperty] = !node.userData[opacityProperty];

				if (node.userData.opacitySetViaRow || node.userData.opacitySetViaColumn || node.userData.opacitySetViaDepth)
					node.children[0].children[0].material.opacity = 0.25;
				else node.children[0].children[0].material.opacity = 1;
			}
		});
	}
}

const onMouseClick = (event) => {

	let nodeParent = nodeUnderMouse?.parent.parent;

	if (!nodeParent.userData.isAllocated && nodeParent.userData.canBeAllocatedOrDeallocated) {
		nodeParent.visible = false;
		nodeParent.userData.isAllocated = true;

		// TODO: Refactor this to use row and column nodeData properties instead of child position values
		// Directions to the nodes that can be allocated or deallocated after this node has been allocated.
		// These are local coordinates, so it's based on the node that was just allocated, not the center of the KoH.
		const directions = [
			{ x: 1, y: 0, z: 0 },
			{ x: -1, y: 0, z: 0 },
			{ x: 0, y: 1, z: 0 },
			{ x: 0, y: -1, z: 0 },
			{ x: 0, y: 0, z: 1 },
			{ x: 0, y: 0, z: -1 }
		];

		// Find the node using each of those directions, and if it exists, mark it as canBeAllocatedOrDeallocated
		directions.forEach(direction => {
			const adjacentNode = threeScene.children.find(child =>
				Math.abs(child.position.x - (nodeParent.position.x + direction.x + direction.x * spacing)) < 0.001 &&
				Math.abs(child.position.y - (nodeParent.position.y + direction.y + direction.y * spacing)) < 0.001 &&
				Math.abs(child.position.z - (nodeParent.position.z + direction.z + direction.z * spacing)) < 0.001
			);
			if (adjacentNode)
				adjacentNode.userData.canBeAllocatedOrDeallocated = true;
		});
	}

	updateMousePosition(event);

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
					canBeAllocatedOrDeallocated: false,
					Row: x,
					Column: y,
					Depth: z
				};
			})
		)
	);

	for (let x = -adjustedCubeSize; x <= adjustedCubeSize; x++)
		for (let y = -adjustedCubeSize; y <= adjustedCubeSize; y++)
			for (let z = -adjustedCubeSize; z <= adjustedCubeSize; z++) {
				const node = templateNode.clone();
				node.children[0].children[0].material = templateNode.children[0].children[0].material.clone();
				node.position.set(x + x * spacing, y + y * spacing, z + z * spacing);
				node.userData = nodeData[x + adjustedCubeSize][y + adjustedCubeSize][z + adjustedCubeSize];

				// The eight nodes on the corners of the cube are the only ones that can be allocated or deallocated to start
				if (
					(Math.abs(x) === adjustedCubeSize && Math.abs(y) === adjustedCubeSize && Math.abs(z) === adjustedCubeSize)
				) {
					node.userData.canBeAllocatedOrDeallocated = true;
				}

				threeScene.add(node);
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

const red = new THREE.Color(0xff0000);
const none = new THREE.Color(0xffffff);
const blue = new THREE.Color(0x0000ff);

const OnTick = (runtime) => {

	threeMixer?.update(runtime.dt);

	threeControls.update();

	threeRenderer.render(threeScene, threeCamera);

	threeScene.children.forEach(node => {
		// Set all nodes white
		node.children[0].children[0].material.color.set(none);
		// Make nodes that can be allocated pulsate blue
		if (node.userData.canBeAllocatedOrDeallocated && !node.userData.isAllocated) {
			const scale = Math.sin(pulseClock.getElapsedTime() * 5) * 0.5 + 0.5;
			node.children[0].children[0].material.color.lerp(blue, scale);
		}
	});

	// Get the node under the mouse and highlight it red
	if (!isRotating) {
		raycaster.setFromCamera(mouse, threeCamera);
		nodeUnderMouse = null;

		raycaster.intersectObjects(threeScene.children, true).slice().reverse().forEach((node) => {
			if (node.object.parent.parent.visible) nodeUnderMouse = node.object;
		});

		nodeUnderMouse?.material.color.set(red);
	}
}