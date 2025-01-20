
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
	threeCamera.position.set(5, 2, 8);

	// Add default TrackballControls to allow rotating and zooming the model by mouse.
	threeControls = new TrackballControls( threeCamera, threeRenderer.domElement );
	threeControls.target.set( 0, 0, 0 );
	threeControls.update();
	threeControls.noPan = true;
	threeControls.rotateSpeed = 5;

	// Create a GLTF loader to load the sample model with.
	const loader = new GLTFLoader();
	
	// Asyncronously attempt to load the model.
	// Note this uses a helper function to make the load() method async.
	const gltf = await LoadGLTF(loader, "passive.glb");

	// Insert the model to the scene.
	const model = gltf.scene;
	model.position.set(0, 0, 0);
	model.scale.set(1, 1, 1);
	threeScene.add(model);
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
