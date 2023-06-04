import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, Quaternion  } from 'babylonjs';
import 'babylonjs-loaders';
import { AbstractMesh } from 'babylonjs/Meshes/index';
import { Animation } from 'babylonjs';

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Couldn't find a canvas. Aborting the demo")

const engine = new Engine(canvas, true, {});
const scene = new Scene(engine);

function prepareScene() {
	// Camera
	const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 4, new Vector3(0, 0, 0), scene);
	camera.attachControl(canvas, true);

	// Light
	new HemisphericLight("light", new Vector3(0.5, 1, 0.8).normalize(), scene);

	// Objects
	const plane = MeshBuilder.CreateBox("Plane", {}, scene);
	plane.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);

	const icosphere = MeshBuilder.CreateIcoSphere("IcoSphere", {}, scene);
	icosphere.position.set(-2, 0, 0);
	const subDivisionsRange = document.getElementById('icosphere-subdivisions') as HTMLInputElement;
	subDivisionsRange.value = "4";

	const cylinder = MeshBuilder.CreateCylinder("Cylinder", {}, scene);
	cylinder.position.set(2, 0, 0);
}

prepareScene();

engine.runRenderLoop(() => {
	scene.render();
});

window.addEventListener("resize", () => {
	engine.resize();
})
function applyBouncing(selectedMesh: AbstractMesh, frameRate: number, duration: number) {
	const animationKeys = [];
  
	const ySlide = new Animation("ySlide", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

	const keyFrames = []; 
	keyFrames.push({
		frame: 0,
		value: 0
	});
	keyFrames.push({
		frame: frameRate,
		value: 2
	});
	keyFrames.push({
		frame: 2 * frameRate,
		value: 0
	});
	ySlide.setKeys(keyFrames);

	selectedMesh.animations.push(ySlide);
	scene.beginAnimation(selectedMesh, 0, 2 * frameRate, false, duration);
}
const editPlane = (uiWindow: HTMLElement, selectedMesh: AbstractMesh) => {
	uiWindow.style.display = 'block';
	// Set initial values
	const widthRange = document.getElementById('cube-width') as HTMLInputElement;
	const heightRange = document.getElementById('cube-height') as HTMLInputElement;
	const depthRange = document.getElementById('cube-depth') as HTMLInputElement;
	const bouncingSpeed = document.getElementById('cube-bouncespeed') as HTMLInputElement;
	bouncingSpeed.value = "1";
	widthRange.value = selectedMesh.scaling.x.toFixed(1);
	heightRange.value = selectedMesh.scaling.y.toFixed(1);
	depthRange.value = selectedMesh.scaling.z.toFixed(1);

	widthRange.addEventListener('input', function () {
		if (selectedMesh)
			selectedMesh.scaling.x = parseFloat(this.value);
	});
	heightRange.addEventListener('input', function () {
		if (selectedMesh)
			selectedMesh.scaling.y = parseFloat(this.value);
	});
	depthRange.addEventListener('input', function () {
		if (selectedMesh)
			selectedMesh.scaling.z = parseFloat(this.value);
	});
	bouncingSpeed.addEventListener('input', function () {
		if (selectedMesh){
			const speed = parseFloat(this.value);
			applyBouncing(selectedMesh, 10, speed);
		}			
	});
}

const editCylinder = (uiWindow: HTMLElement, selectedMesh: AbstractMesh) => {
	uiWindow.style.display = 'block';
	// Set initial values
	const diameterRange = document.getElementById('cylinder-diameter') as HTMLInputElement;
	const heightRange = document.getElementById('cylinder-height') as HTMLInputElement;
	const bouncingSpeed = document.getElementById('cylinder-bouncespeed') as HTMLInputElement;
	bouncingSpeed.value = "1";
	diameterRange.value = selectedMesh.scaling.x.toFixed(1);
	heightRange.value = selectedMesh.scaling.y.toFixed(1);

	diameterRange.addEventListener('input', function () {
		if (selectedMesh){
			selectedMesh.scaling.x = parseFloat(this.value);
			selectedMesh.scaling.z = parseFloat(this.value);
		}			
	});
	heightRange.addEventListener('input', function () {
		if (selectedMesh)
			selectedMesh.scaling.y = parseFloat(this.value);
	});
	bouncingSpeed.addEventListener('input', function () {
		if (selectedMesh){
			const speed = parseFloat(this.value);
			applyBouncing(selectedMesh, 10, speed);
		}			
	});
}

const editIcosphere = (uiWindow: HTMLElement, selectedMesh: AbstractMesh) => {
	uiWindow.style.display = 'block';
	// Set initial values
	const diameterRange = document.getElementById('icosphere-diameter') as HTMLInputElement;
	const subDivisionsRange = document.getElementById('icosphere-subdivisions') as HTMLInputElement;
	const bouncingSpeed = document.getElementById('icosphere-bouncespeed') as HTMLInputElement;
	bouncingSpeed.value = "1";

	diameterRange.addEventListener('input', function () {
		if (selectedMesh){
			selectedMesh.scaling.x = parseFloat(this.value);
			selectedMesh.scaling.y = parseFloat(this.value);
			selectedMesh.scaling.z = parseFloat(this.value);
		}			
	});
	subDivisionsRange.addEventListener('input', function () {
		if (selectedMesh){
			const subdivisions = parseInt(this.value);
			selectedMesh.dispose();
			const newIcosphere = MeshBuilder.CreateIcoSphere("IcoSphere", {subdivisions}, scene);
			newIcosphere.position.set(-2, 0, 0);
			selectedMesh = newIcosphere;
			
		}
	});
	bouncingSpeed.addEventListener('input', function () {
		if (selectedMesh){
			const speed = parseFloat(this.value);
			applyBouncing(selectedMesh, 10, speed);
		}			
	});
}

// Enable mesh picking
scene.onPointerDown = async function (evt, pickResult) {
	// Hide the UI window if another mesh is selected
	const cubeUI = document.getElementById('cube-ui');
	if (cubeUI)
		cubeUI.style.display = 'none';
	
	const cylinderUI = document.getElementById('cylinder-ui');
	if (cylinderUI)
		cylinderUI.style.display = 'none';

	const icosphereUI = document.getElementById('icosphere-ui');
	if (icosphereUI)
		icosphereUI.style.display = 'none';
			
	if (pickResult.hit) {
		const selectedMesh = pickResult.pickedMesh;
		if (selectedMesh?.name === "Plane") {
			// Show the UI window for cube parameters
			const uiWindow = document.getElementById('cube-ui');
			if (uiWindow !== null){
				editPlane(uiWindow, selectedMesh);
			} 
		} else if (selectedMesh?.name === "Cylinder"){
			// Show the UI window for cube parameters
			const uiWindow = document.getElementById('cylinder-ui');
			if (uiWindow !== null){
				editCylinder(uiWindow, selectedMesh);
			} 
		} else if (selectedMesh?.name === "IcoSphere") {
			// Show the UI window for cube parameters
			const uiWindow = document.getElementById('icosphere-ui');
			if (uiWindow !== null){
				editIcosphere(uiWindow, selectedMesh);
			} 
		}
	}


};

