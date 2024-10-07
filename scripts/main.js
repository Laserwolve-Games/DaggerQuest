
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
import { OBJLoader } from './three/addons/loaders/OBJLoader.js';

// Three.js objects
let threeRenderer = null;
let threeCamera = null;
let threeMixer = null;
let threeControls = null;
let threeScene = null;

// Wait for project to start
runOnStartup(runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

// When the project starts up, initialize three.js.
// Note this is asynchronous so the display will remain blank until loading finishes.
function OnBeforeProjectStart(runtime)
{

	const platformInfo = runtime.platformInfo;
	const container = runtime.getHTMLLayer(0);
	threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});

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

	const loader = new OBJLoader();
	
	// load a resource
	loader.load(
		// resource URL
		'models/passive.obj',
		// called when resource is loaded
		function ( object ) {

			// Insert the model to the scene and play its animation.
			object.position.set(1, 1, 0);
			object.scale.set(.01, .01, .01);
			threeScene.add( object );
			threeMixer = new THREE.AnimationMixer(object);
			threeMixer.clipAction(object.animations[0]).play();

		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' + error.toString());

		}
	);

	
	// Attach Construct event listeners for handling resize and rendering.
	runtime.addEventListener("resize", e => OnResize(e));
	
	runtime.addEventListener("tick", () => OnTick(runtime));
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
