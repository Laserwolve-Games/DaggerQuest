
// Use the three.js library for 3D rendering, combining HTML layers to integrate
// with Construct layers. See: https://threejs.org/
// This example is based on the following three.js example:
// https://threejs.org/examples/#webgl_animation_keyframes

// Notes:
// - three.js relies on import maps for mapping bare import specifiers like "three".
//   This project includes an import map (importMap.json) to handle this.
// - There is some overlap between what three.js does and what Construct does.
//   For example THREE.Clock can be used in three.js to determine delta-time, but
//   Construct already calculates this value. Wherever possible, Construct features
//   are used instead of three.js features for better integration.

import * as THREE from "three";

import { OrbitControls } from "./three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "./three/addons/environments/RoomEnvironment.js";

import { GLTFLoader } from "./three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "./three/addons/loaders/DRACOLoader.js";

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
	
	// The HTML element to insert the three.js canvas to is the wrapper element
	// for HTML layer 0 (i.e. the bottom-most HTML layer, corresponding to the
	// layer "Back").
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

	// Add default OrbitControls allowing rotating and zooming the model by mouse.
	threeControls = new OrbitControls( threeCamera, threeRenderer.domElement );
	threeControls.target.set( 0, 0.5, 0 );
	threeControls.update();
	threeControls.enablePan = false;
	threeControls.enableDamping = true;

	// Create a Draco loader for loading 3D models. Point its decoder file path
	// to the folder in Construct's Files folder.
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("draco-gltf-decoder/");

	// Create a GLTF loader to load the sample model with.
	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);
	
	try {
		// Asyncronously attempt to load the 'Littlest Tokyo' model.
		// Note this uses a helper function to make the load() method async.
		const gltf = await LoadGLTF(loader, "models/LittlestTokyo.glb");
		
		// Insert the model to the scene and play its animation.
		const model = gltf.scene;
		model.position.set(1, 1, 0);
		model.scale.set(0.01, 0.01, 0.01);
		threeScene.add(model);

		threeMixer = new THREE.AnimationMixer(model);
		threeMixer.clipAction(gltf.animations[0]).play();
	}
	catch (err)
	{
		console.error("Error loading model: ", err);
	}
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

// In Construct's tick event, update the 3D animation playback and
// 3D rendering. (Note this uses Construct's delta-time value rather
// than THREE.Clock).
function OnTick(runtime)
{
	threeMixer.update(runtime.dt);

	threeControls.update();

	threeRenderer.render(threeScene, threeCamera);
}
