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
const orange = new THREE.Color(0xffa500);
const red = new THREE.Color(0xff0000);
const none = new THREE.Color(0xffffff);
const lightRed = new THREE.Color(0xffcccc);
let passivePoints = 10;

runOnStartup(async runtime => {

	runtime.addEventListener('beforeprojectstart', () => OnBeforeProjectStart(runtime));

});

const OnBeforeProjectStart = async (runtime) => {

	await InitThreeJs(runtime);

	runtime.addEventListener('resize', e => OnResize(e));

	runtime.addEventListener('tick', () => OnTick(runtime));

	window.addEventListener('contextmenu', contextMenu);

	runtime.addEventListener('pointermove', mouseMove);

	runtime.addEventListener('keydown', keyDown);

	// threejs requires pointer events instead of mouse events
	// runtime.addEventListener('pointerdown', (event) => {
	// 	console.log("Pointer down event detected");
	// });
}


const mouseMove = (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

const keyDown = (event) => {
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
					node.children[0].children[0].material.opacity = 0.1;
				else node.children[0].children[0].material.opacity = 1;
			}
		});
	}
}

const scanAllNodes = (nodeParent) => {

	const adjacentNodes = [];
	const nonAdjacentNodes = [];
	const directions = [
		{ Row: 1, Column: 0, Depth: 0 },
		{ Row: -1, Column: 0, Depth: 0 },
		{ Row: 0, Column: 1, Depth: 0 },
		{ Row: 0, Column: -1, Depth: 0 },
		{ Row: 0, Column: 0, Depth: 1 },
		{ Row: 0, Column: 0, Depth: -1 }
	];

	threeScene.children.forEach(node => {
		if (!node.userData.isAllocated) {
			const isAdjacent = directions.some(direction => {
				const adjacentNode = threeScene.children.find(n => 
					n.userData.Row === node.userData.Row + direction.Row &&
					n.userData.Column === node.userData.Column + direction.Column &&
					n.userData.Depth === node.userData.Depth + direction.Depth &&
					n.userData.isAllocated
				);
				return adjacentNode !== undefined;
			});

			if (isAdjacent) {
				adjacentNodes.push(node);
			} else {
				nonAdjacentNodes.push(node);
			}
		// If a node is allocated, see if it can be deallocated without breaking allocated node continuity.
		} else {
			const visited = new Set();
			const stack = [nodeParent];

			while (stack.length > 0) {
				const currentNode = stack.pop();
				if (!visited.has(currentNode.userData.nodeId)) {
					visited.add(currentNode.userData.nodeId);

					directions.forEach(direction => {
						const adjacentNode = threeScene.children.find(n =>
							n.userData.Row === currentNode.userData.Row + direction.Row &&
							n.userData.Column === currentNode.userData.Column + direction.Column &&
							n.userData.Depth === currentNode.userData.Depth + direction.Depth &&
							n.userData.isAllocated
						);

						if (adjacentNode && !visited.has(adjacentNode.userData.nodeId)) {
							stack.push(adjacentNode);
						}
					});
				}
			}

			const allocatedNodes = threeScene.children.filter(n => n.userData.isAllocated);
			if (visited.size !== allocatedNodes.length) {
				nodeParent.userData.canBeDeallocated = false;
			} else {
				nodeParent.userData.canBeDeallocated = true;
			}
		}
	});

	adjacentNodes.forEach(node => node.userData.canBeAllocated = true);
	nonAdjacentNodes.forEach(node => node.userData.canBeAllocated = false);

}

const contextMenu = (event) => {

	let nodeParent = nodeUnderMouse?.parent.parent;

	if (nodeParent.userData.canBeAllocated && passivePoints > 0) {

		nodeParent.userData.isAllocated = true;
		passivePoints--;
		scanAllNodes(nodeParent);
		mouseMove(event);

	} else if (nodeParent.userData.canBeDeallocated) {

		nodeParent.userData.isAllocated = false;
		passivePoints++;
		scanAllNodes(nodeParent);
		mouseMove(event);
	}
}

const InitThreeJs = async (runtime) => {
	const platformInfo = runtime.platformInfo;
	const container = runtime.getHTMLLayer(0);

	threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});

	const canvas = threeRenderer.domElement;
	threeRenderer.setPixelRatio(platformInfo.devicePixelRatio);
	threeRenderer.setSize(platformInfo.canvasCssWidth, platformInfo.canvasCssHeight);
	container.appendChild(canvas);

	const pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
	threeScene = new THREE.Scene();
	threeScene.environment = pmremGenerator.fromScene(new RoomEnvironment(threeRenderer), 0.04).texture;

	threeCamera = new THREE.PerspectiveCamera(40, platformInfo.canvasCssWidth / platformInfo.canvasCssHeight, 1, 100);
	threeCamera.position.set(10, 4, 16);

	threeControls = new TrackballControls(threeCamera, canvas);
	threeControls.mouseButtons = {
		// Setting RIGHT to THREE.MOUSE.ROTATE and LEFT to null doesn't work.
		// Left becomes pan and right doesn't do anything.
		// Might be an issue with threejs 167.
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
					canBeAllocated: false,
					canBeDeallocated: false,
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
					node.userData.canBeAllocated = true;
				}

				threeScene.add(node);
			}

	// Hide the passive cube.
	// document.evaluate("//canvas[@data-engine]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.style.display = 'none';
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

	threeScene.children.forEach(node => {
		// Set all unallocated nodes white
		if (!node.userData.isAllocated) node.children[0].children[0].material.color.set(none);
		else node.children[0].children[0].material.color.set(red);
		// Make unallocated nodes that can be allocated pulsate blue
		if (node.userData.canBeAllocated && !node.userData.isAllocated && node.children[0].children[0].material.opacity == 1 && passivePoints > 0) {
			const scale = Math.sin(pulseClock.getElapsedTime() * 5) * 0.5 + 0.5;
			node.children[0].children[0].material.color.lerp(lightRed, scale);
		}
	});

	// Get the node under the mouse and highlight it
	if (!isRotating) {
		raycaster.setFromCamera(mouse, threeCamera);
		nodeUnderMouse = null;

		raycaster.intersectObjects(threeScene.children, true).slice().reverse().forEach((node) => {
			if (node.object.material.opacity == 1) nodeUnderMouse = node.object;
		});

		nodeUnderMouse?.material.color.set(orange);
	}
}