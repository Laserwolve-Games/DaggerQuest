
// Some code taken from "Integrated 3D Engine" example.
// We're using Three.js revision 167, so current documentation online might not apply.

import * as THREE from "three";

import { TrackballControls } from "./TrackballControls.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GLTFLoader } from "./three/addons/loaders/GLTFLoader.js";

// Three.js objects
let threeRenderer = null;
let threeCamera = null;
let threeMixer = null;
let threeControls = null;
let threeScene = null;
let raycaster = null;
let mouse = null;

// Wait for project to start
runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

// When the project starts up, initialize three.js.
// Note this is asynchronous so the display will remain blank until loading finishes.
async function OnBeforeProjectStart(runtime)
{
	await InitThreeJs(runtime);
	
	// Attach Construct event listeners for handling resize and rendering.
	runtime.addEventListener("resize", e => OnResize(e));
	
	runtime.addEventListener("tick", () => OnTick(runtime));
	
	window.addEventListener("contextmenu", onMouseClick, false);
	
	window.addEventListener("mousemove", onMouseMove, false);
}

function onMouseClick(event) {

    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, threeCamera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(threeScene.children, true);
	let firstVisibleIntersect;
	
	for (let i = 0; i < intersects.length; i++)
	
		if (intersects[i].object.parent.parent.visible) {
		
			firstVisibleIntersect = intersects[i].object;
			break;
		}

    // If there's an intersection, change the color of the first intersected object
    if (intersects.length > 0) {
        const object = firstVisibleIntersect;
		
		//Do something with a custom property of the node that was right clicked
		console.log(object.parent.parent.userData.description);
		
		// hide passive nodes when we allocate them
        firstVisibleIntersect.parent.parent.visible = false;
    }
}

function onMouseMove(event) {

    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, threeCamera);
	
        // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(threeScene.children, true);
	let firstVisibleIntersect;
	
	for (let i = 0; i < intersects.length; i++)
	
		if (intersects[i].object.parent.parent.visible) {
		
			firstVisibleIntersect = intersects[i].object;
			break;
		}
		
	const red = new THREE.Color(0xff0000);
	const none = new THREE.Color(0xffffff);
		
	// reset the color on all nodes any time the mouse is moved	
	threeScene.children.forEach(node => node.children[0].children[0].material.color.set(none));

 	// If there's an intersection, change the color of the first intersected object
    if (intersects.length > 0) 
		
		firstVisibleIntersect.material.color.set(red);     
}

// Initialize the three.js library.
async function InitThreeJs(runtime)
{
	// Construct's PlatformInfo object provides details about the size of the
	// main canvas, which is used to get three.js to make a same sized canvas.
	const platformInfo = runtime.platformInfo;
	
	// Insert the three.js canvas on the intrinsic HTML layer that's above all other layers.
	const container = runtime.getHTMLLayer(0);

	// Create three.js WebGL renderer with antialiasing. Note also that alpha
	// must be enabled for the three.js canvas to have a transparent background.
	threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	
	// Initialize 3D renderer pixel ratio (for high-dpi displays) and size
	// based on details from Construct's PlatformInfo object.
	threeRenderer.setPixelRatio(platformInfo.devicePixelRatio);
	threeRenderer.setSize(platformInfo.canvasCssWidth, platformInfo.canvasCssHeight);
	
	// Insert the three.js DOM element (a canvas) to the document.
	container.appendChild(threeRenderer.domElement);

	// Create a 3D scene and camera.
	const pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
	threeScene = new THREE.Scene();
	threeScene.environment = pmremGenerator.fromScene(new RoomEnvironment(threeRenderer), 0.04).texture;

	threeCamera = new THREE.PerspectiveCamera(40, platformInfo.canvasCssWidth / platformInfo.canvasCssHeight, 1, 100);
	// We'd need to increase or decrease the camera distance if we ever changed the size of the KoH.
	threeCamera.position.set(10, 4, 16);

	// Trackball controls instead of orbit controls so we can rotate on all axes with no limitations.
	threeControls = new TrackballControls( threeCamera, threeRenderer.domElement );
	threeControls.target.set( 0, 0, 0 );
	threeControls.update();
	threeControls.noPan = true;
	threeControls.rotateSpeed = 5;
	
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Create a GLTF loader to load the sample model with.
	const loader = new GLTFLoader();
	// Asyncronously attempt to load the model.
	// Note this uses a helper function to make the load() method async.
	const gltf = await LoadGLTF(loader, "node.glb");
	const templateNode = gltf.scene;
	// The number of passive nodes in the KoH's width, height and depth. Must be an odd number.
	const cubeSize = 7;
	// That number adjusted to be 0-centered, so that the first node is in the middle.
	const adjustedCubeSize = Math.floor(cubeSize / 2);
	const spacing = .1;
	
	let counter = 0;  // Initialize the counter to keep track of node IDs

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
		layer: layer
      };
    })
  )
);
	
// 	Create the passive cube
	for (let x = -adjustedCubeSize; x <= adjustedCubeSize; x++) {
	
		for (let y = -adjustedCubeSize; y <= adjustedCubeSize; y++) {
			
			for (let z = -adjustedCubeSize; z <= adjustedCubeSize; z++) {
			
				// create the passive node
				const node = templateNode.clone();
				// Give it its own texture
				node.children[0].children[0].material = templateNode.children[0].children[0].material.clone();
				// Place and space it appropriately
				node.position.set(x + x * spacing, y + y * spacing, z + z * spacing);
				// Give it its data
				node.userData = nodeData[x + adjustedCubeSize][y + adjustedCubeSize][z + adjustedCubeSize];
				
				// make all passive nodes invisible except the first one 
// 				if (x != 0 || y != 0 || z != 0) node.visible = false;
		
				threeScene.add(node);
			}
		}
	}
	// Hide the passive cube.
// 	document.evaluate("//canvas[@data-engine]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.style.display = 'none';
}

// This is a helper method to make the GLTFLoader load() method
// in to an asyncronous method that can be awaited.
function LoadGLTF(loader, path)
{
	return new Promise((resolve, reject) =>
	{
		loader.load(path, resolve, undefined /* progress */, reject);
	});
}

// In Construct's resize event, update the 3D renderer size to match.
function OnResize(e)
{
	threeCamera.aspect = e.cssWidth / e.cssHeight;
	threeCamera.updateProjectionMatrix();

	threeRenderer.setSize(e.cssWidth, e.cssHeight);
}

// In Construct's tick event, update the 3D playback and
// 3D rendering. (Note this uses Construct's delta-time value rather
// than THREE.Clock).
function OnTick(runtime)
{
	if(threeMixer) threeMixer.update(runtime.dt);

	threeControls.update();

	threeRenderer.render(threeScene, threeCamera);
}