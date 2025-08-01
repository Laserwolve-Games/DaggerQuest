import * as THREE from 'three';

import { TrackballControls } from './three/addons/controls/TrackballControls.js';
import { RoomEnvironment } from './three/addons/environments/RoomEnvironment.js';
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
let runtime = null;

/**
 * Handles logic to run on startup, including event registration.
 * @param {object} r - The runtime object.
 */
runOnStartup(async (r) => {

	runtime = r;

	runtime.addEventListener('beforeprojectstart', () => OnBeforeProjectStart(runtime));

});

/**
 * Initializes event listeners and sets up the 3D scene before the project starts.
 * @param {object} runtime - The runtime object.
 */
const OnBeforeProjectStart = async (runtime) => {

	await InitThreeJs(runtime);

	runtime.addEventListener('resize', e => OnResize(e));

	runtime.addEventListener('tick', () => OnTick(runtime));

	window.addEventListener('pointerdown', pointerDown);

	runtime.addEventListener('pointermove', pointerMove);

	runtime.addEventListener('keydown', keyDown);
}

/**
 * Handles pointer down events for node allocation and deallocation.
 * @param {PointerEvent} event - The pointer event.
 */
const pointerDown = (event) => {

	if (event.button === 2) {

		let nodeParent = nodeUnderMouse?.parent.parent;

		if (nodeParent?.userData?.canBeAllocated && !nodeParent?.userData?.isAllocated && runtime.objects.player.getFirstInstance().instVars.unspentPassivePoints > 0) {

			nodeParent.userData.isAllocated = true;
			nodeParent.userData.canBeAllocated = false;
			nodeParent.userData.canBeDeallocated = true;
			runtime.objects.player.getFirstInstance().instVars.unspentPassivePoints--;
			runtime.objects.player.getFirstInstance().instVars.allocatedPassivePoints++;
			runtime.callFunction('manageNodeMods', nodeParent.userData.isAllocated, nodeParent.userData.Row, nodeParent.userData.Column, nodeParent.userData.Depth);
			scanAllNodes(nodeParent);
			pointerMove(event);

		} else if (nodeParent?.userData?.canBeDeallocated && nodeParent?.userData?.isAllocated) {

			nodeParent.userData.isAllocated = false;
			nodeParent.userData.canBeAllocated = true;
			nodeParent.userData.canBeDeallocated = false;
			runtime.objects.player.getFirstInstance().instVars.unspentPassivePoints++;
			runtime.objects.player.getFirstInstance().instVars.allocatedPassivePoints--;
			runtime.callFunction('manageNodeMods', nodeParent.userData.isAllocated, nodeParent.userData.Row, nodeParent.userData.Column, nodeParent.userData.Depth);
			scanAllNodes(nodeParent);
			pointerMove(event);
		}
	}
}

/**
 * Updates the mouse position for raycasting on pointer move.
 * @param {PointerEvent} event - The pointer event.
 */
const pointerMove = (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Handles key down events for toggling node opacity by row, column, depth, or layer.
 * @param {KeyboardEvent} event - The keyboard event.
 */
const keyDown = (event) => {

	const layer = runtime.layout.getLayer('passives');
	let property = null;
	let index = null;

	if (layer?.isVisible) {
		// Toggle row, column, or depth opacity based on the keys pressed.
		// Account for nodes that were already made opaque by another key press.
		if (event.ctrlKey && event.key >= '1' && event.key <= cubeSize.toString()) {
			property = 'Row';
			index = parseInt(event.key) - 1;
		} else if (event.altKey && event.key >= '1' && event.key <= cubeSize.toString()) {
			property = 'Column';
			index = parseInt(event.key) - 1;
		} else if (event.shiftKey && event.code.startsWith('Digit')) {
			const digit = parseInt(event.code.replace('Digit', ''));
			if (digit >= 1 && digit <= cubeSize) {
				property = 'Depth';
				index = digit - 1;
			}
		}  else if (event.key >= '1' && event.key <= cubeSize.toString()) {
			property = 'Layer';
			index = parseInt(event.key) - 1;
		}

		if (property && index !== null) {
			threeScene.children.forEach(node => {
				if (node.userData[property] === index) {
					const opacityProperty = `opacitySetVia${property}`;
					node.userData[opacityProperty] = !node.userData[opacityProperty];

					if (
						node.userData.opacitySetViaRow ||
						node.userData.opacitySetViaColumn ||
						node.userData.opacitySetViaDepth ||
						node.userData.opacitySetViaLayer
					) {
						node.children[0].children[0].material.opacity = 0;
					} else {
						node.children[0].children[0].material.opacity = 1;
					}
				}
			});
		}
	}
}

/**
 * Scans all nodes to update their allocation and deallocation status based on adjacency and connectivity.
 * @param {object} nodeParent - The parent node to scan from.
 */
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
        }
    });

    // For each allocated node, check if it can be deallocated without breaking connectivity
    const allocatedNodes = threeScene.children.filter(n => n.userData.isAllocated);
    allocatedNodes.forEach(node => {
        // Temporarily unallocate this node
        node.userData.isAllocated = false;
        // Find another allocated node to start the search
        const otherAllocated = threeScene.children.find(n => n.userData.isAllocated);
        let canDeallocate = false;
        if (otherAllocated) {
            // BFS/DFS to count reachable allocated nodes
            const visited = new Set();
            const stack = [otherAllocated];
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
            // If all other allocated nodes are reachable, allow deallocation
            canDeallocate = (visited.size === allocatedNodes.length - 1);
        } else {
            // If this was the only allocated node, allow deallocation
            canDeallocate = true;
        }
        node.userData.canBeDeallocated = canDeallocate;
        // Restore allocation state
        node.userData.isAllocated = true;
    });

    adjacentNodes.forEach(node => node.userData.canBeAllocated = true);
    nonAdjacentNodes.forEach(node => {
        node.userData.canBeAllocated = false;
    });
}

/**
 * Initializes the Three.js scene, camera, controls, and loads the node model.
 * @param {object} runtime - The runtime object.
 */
const InitThreeJs = async (runtime) => {
	const platformInfo = runtime.platformInfo;
	const container = runtime.getHTMLLayer(0);

	threeRenderer = new THREE.WebGPURenderer({
		antialias: true,
		alpha: true
	});

	const canvas = threeRenderer.domElement;
	threeRenderer.setPixelRatio(platformInfo.devicePixelRatio);
	threeRenderer.setSize(platformInfo.canvasCssWidth, platformInfo.canvasCssHeight);
	container.appendChild(canvas);

	const pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
	threeScene = new THREE.Scene();
	// Suppress PMREMGenerator .fromScene() warning
	const originalWarn = console.warn;
	console.warn = function(msg, ...args) {
	    if (typeof msg === "string" && msg.includes("THREE.PMREMGenerator: .fromScene() called before the backend is initialized")) return;
	    originalWarn.call(console, msg, ...args);
	};
	threeScene.environment = pmremGenerator.fromScene(new RoomEnvironment(threeRenderer), 0.04).texture;
	console.warn = originalWarn;

	threeCamera = new THREE.PerspectiveCamera(40, platformInfo.canvasCssWidth / platformInfo.canvasCssHeight, 1, 100);
	threeCamera.position.set(10, 4, 16);

	threeControls = new TrackballControls(threeCamera, canvas);
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
					Layer: layer,
					isAllocated: false,
					canBeAllocated: false,
					canBeDeallocated: false,
					startingPointForClass: null,
					Row: x,
					Column: y,
					Depth: z
				};
			})
		)
	);

	const playerClasses = [
		"knight",
		"rogue",
		"barbarian",
		"paladin",
		"cleric",
		"ranger",
		"wizard",
		"monk"
	];

	for (let x = -adjustedCubeSize; x <= adjustedCubeSize; x++)
		for (let y = -adjustedCubeSize; y <= adjustedCubeSize; y++)
			for (let z = -adjustedCubeSize; z <= adjustedCubeSize; z++) {
				const node = templateNode.clone();
				node.children[0].children[0].material = templateNode.children[0].children[0].material.clone();
				node.position.set(x + x * spacing, y + y * spacing, z + z * spacing);
				node.userData = nodeData[x + adjustedCubeSize][y + adjustedCubeSize][z + adjustedCubeSize];

				// The eight nodes on the corners are the eight starting locations of the eight classes
				if (
					(Math.abs(x) === adjustedCubeSize && Math.abs(y) === adjustedCubeSize && Math.abs(z) === adjustedCubeSize)
				) {
					node.userData.startingPointForClass = playerClasses.shift();
				}

				threeScene.add(node);
			}

	// Hide the passive cube.
	document.evaluate('//canvas[@data-engine]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.style.display = 'none';
}

/**
 * Loads a GLTF model asynchronously.
 * @param {GLTFLoader} loader - The GLTFLoader instance.
 * @param {string} path - The path to the GLTF file.
 * @returns {Promise<object>} - The loaded GLTF scene.
 */
const LoadGLTF = (loader, path) => {
	return new Promise((resolve, reject) => {
		loader.load(path, resolve, undefined, reject);
	});
}

/**
 * Handles window or canvas resize events to update camera and renderer.
 * @param {object} e - The resize event object.
 */
const OnResize = (e) => {
	threeCamera.aspect = e.cssWidth / e.cssHeight;
	threeCamera.updateProjectionMatrix();

	threeRenderer.setSize(e.cssWidth, e.cssHeight);
}
/**
 * Main render loop: updates animation, controls, rendering, and node highlighting.
 * @param {object} runtime - The runtime object.
 */
const OnTick = (runtime) => {

	threeMixer?.update(runtime.dt);

	threeControls.update();

	threeRenderer.render(threeScene, threeCamera);

	threeScene.children.forEach(node => {

		let player = runtime?.objects?.player?.getFirstInstance();

		if (player?.instVars.allocatedPassivePoints === 0) {

			// TODO: don't hardcode this, get it from the player/body
			if (node.userData.startingPointForClass === "knight") {

				node.userData.canBeAllocated = true;

				// Move the camera controls target to this node's position so it appears in the middle
				// threeControls.target.copy(node.position);
				// threeCamera.position.addVectors(node.position, new THREE.Vector3(10, 4, 16));
				// threeCamera.lookAt(node.position);
				// threeControls.update();

				if (!OnTick.cameraSetForZeroPoints) {
					threeCamera.position.set(-11, -11, -11);
					OnTick.cameraSetForZeroPoints = true;
				}

				// if (!OnTick.lastLogTime || performance.now() - OnTick.lastLogTime > 1000) {
				// 	console.log(`Camera position: X=${threeCamera.position.x}, Y=${threeCamera.position.y}, Z=${threeCamera.position.z}`);
				// 	OnTick.lastLogTime = performance.now();
				// }
			}
		}
		// Set all unallocated nodes white
		if (!node.userData.isAllocated) node.children[0].children[0].material.color.set(none);
		else node.children[0].children[0].material.color.set(red);
		// Make unallocated nodes that can be allocated pulsate blue
		if (node.userData.canBeAllocated && !node.userData.isAllocated && node.children[0].children[0].material.opacity == 1 && player?.instVars.unspentPassivePoints > 0) {
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

		let nodeParent = nodeUnderMouse?.parent.parent;

		const layer = runtime.layout.getLayer('passives');

		if (layer) if (nodeUnderMouse && layer.isVisible) {

			runtime.callFunction('Show node tooltip', nodeParent.userData.Row, nodeParent.userData.Column, nodeParent.userData.Depth);
		} else {
			runtime.callFunction('Hide node tooltip');
		}			
	}


}