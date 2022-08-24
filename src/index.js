import * as THREE from "three";

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import FireParticleSystem from './FireParticleSystem'
import SmokeParticleSystem from "./SmokeParticleSystem";


let camera, scene, renderer;

let cameraControls;

let previousRAF = null

let fireParticles,smokeParticles;

init();
animate();

function init() {
	const container = document.getElementById('container');

	// renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	container.appendChild(renderer.domElement);
	renderer.localClippingEnabled = true;

	// scene
	scene = new THREE.Scene();

	// camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.set(-100, 100, 230);

	cameraControls = new OrbitControls(camera, renderer.domElement);
	cameraControls.target.set(0, 40, 0);
	cameraControls.maxDistance = 400;
	cameraControls.minDistance = 10;
	cameraControls.update();

	//wals
	const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

	const planeBottom = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
		color: 0xffffff
	}));
	planeBottom.rotateX(-Math.PI / 2);
	scene.add(planeBottom);

	const planeBack = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
		color: 0x000001
	}));
	planeBack.position.z = -50;
	planeBack.position.y = 50;
	scene.add(planeBack);

	const planeFront = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
		color: 0x7f7fff
	}));
	planeFront.position.z = 50;
	planeFront.position.y = 50;
	planeFront.rotateY(Math.PI);
	scene.add(planeFront);

	const planeRight = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
		color: 0x00ff00
	}));
	planeRight.position.x = 50;
	planeRight.position.y = 50;
	planeRight.rotateY(-Math.PI / 2);
	scene.add(planeRight);


	const planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
		color: 0xff0000
	}));
	planeLeft.position.x = -50;
	planeLeft.position.y = 50;
	planeLeft.rotateY(Math.PI / 2);
	scene.add(planeLeft);


	// topLeftBacklight
	const topLeftBacklight = new THREE.PointLight(0xcccccc, 1.5, 250);
	topLeftBacklight.position.x = -50;
	topLeftBacklight.position.y = 99;
	topLeftBacklight.position.z = -40;
	scene.add(topLeftBacklight);

	//topRightBacklight
	const topRightBacklight = new THREE.PointLight(0xcccccc, 1.5, 250);
	topRightBacklight.position.x = 50;
	topRightBacklight.position.y = 99;
	topRightBacklight.position.z = -40;
	scene.add(topRightBacklight);

	//topLeftFrontlight

	const topLeftFrontlight = new THREE.PointLight(0xcccccc, 1.5, 250);
	topLeftFrontlight.position.x = -50;
	topLeftFrontlight.position.y = 99;
	topLeftFrontlight.position.z = 40;
	scene.add(topLeftFrontlight);

	//topRightFrontlight

	const topRightFrontlight = new THREE.PointLight(0xcccccc, 1.5, 250);
	topRightFrontlight.position.x = 50;
	topRightFrontlight.position.y = 99;
	topRightFrontlight.position.z = 40;
	scene.add(topRightFrontlight);


	//fireplace
	const objloader = new OBJLoader();
	const textureloader = new THREE.TextureLoader();
	const gltfLoader = new GLTFLoader();

	gltfLoader.load("resources/fireplace/fireplace.gltf",function(gltf){
		gltf.scene.scale.set(1,1,20);
		gltf.scene.scale.addScalar(30);
		scene.add(gltf.scene);
	});

	textureloader.load('resources/wood/Fire_Pit_texture.png',
		function ( texture ) {
			const material = new THREE.MeshBasicMaterial( {
				map: texture
			} );

			objloader.load("resources/wood/model.obj",
				function ( object ) {
					object.scale.addScalar(5);
					object.rotateX(-Math.PI/2)
					object.position.set(0,3.4,5);
					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
				
							child.material = material;
				
						}
				
					} );

					scene.add( object );

				},
				// called when loading is in progresses
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				},
				// called when loading has errors
				function ( error ) {

					console.log( error );

				}
			);
		},

		// onProgress callback currently not supported
		undefined,

		// onError callback
		function ( err ) {
			console.error( 'An error happened.' );
		}
	);
	
	//fire
	
	fireParticles = new FireParticleSystem({
		parent: scene,
		camera: camera,
	});

	//Smoke

	smokeParticles = new SmokeParticleSystem({
		parent: scene,
		camera: camera,
	});

	_RAF();

	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}
function _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    fireParticles.Step(timeElapsedS*3);
	smokeParticles.Step(timeElapsedS);
}

function _RAF() {
    requestAnimationFrame((t) => {
      if (previousRAF === null) {
        previousRAF = t;
      }

      _RAF();

      renderer.render(scene, camera);
      _Step(t - previousRAF);
      previousRAF = t;
    });
  }

  

function animate() {

	requestAnimationFrame(animate);


	// save the original camera properties
	const currentRenderTarget = renderer.getRenderTarget();
	const currentXrEnabled = renderer.xr.enabled;
	const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
	renderer.xr.enabled = false; // Avoid camera modification
	renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows



	// restore the original rendering properties
	renderer.xr.enabled = currentXrEnabled;
	renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
	renderer.setRenderTarget(currentRenderTarget);

	// render the main scene
	renderer.render(scene, camera);

}