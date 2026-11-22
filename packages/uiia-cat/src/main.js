import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const MODELS = {
	'uiia-cat': { url: new URL('./models/uiia-cat.glb', import.meta.url).href, size: 4.0 },
	cow_havest_moon: {
		url: new URL('./models/cow_havest_moon.glb', import.meta.url).href,
		size: 2.5
	},
	capybara: { url: new URL('./models/capybara.glb', import.meta.url).href, size: 2.5 }
};

let currentModel = 'uiia-cat';

const canvas = document.getElementById('canvas');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const modelButtons = document.querySelectorAll('.model-btn');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const GROUND_Y = 0.0;

const envGeo = new THREE.SphereGeometry(80, 64, 64);
const envMat = new THREE.ShaderMaterial({
	side: THREE.BackSide,
	depthWrite: false,
	vertexShader: `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
	fragmentShader: `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    
    void main() {
      vec3 dir = normalize(vWorldPos);
      float y = dir.y;
      
      vec3 zenith = vec3(0.76, 0.84, 0.95);
      vec3 horizon = vec3(0.95, 0.93, 0.90);
      vec3 ground = vec3(0.85, 0.83, 0.80);
      
      vec3 color;
      if (y > 0.0) {
        float t = pow(y, 0.6);
        color = mix(horizon, zenith, t);
      } else {
        float t = pow(-y, 0.4);
        color = mix(horizon, ground, t);
      }
      
      vec3 lightDir = normalize(vec3(0.5, 0.6, 0.4));
      float lightGlow = max(0.0, dot(dir, lightDir));
      lightGlow = pow(lightGlow, 8.0) * 0.3;
      color += vec3(1.0, 0.98, 0.95) * lightGlow;
      
      vec3 rimDir = normalize(vec3(-0.3, 0.2, -0.8));
      float rimGlow = max(0.0, dot(dir, rimDir));
      rimGlow = pow(rimGlow, 12.0) * 0.15;
      color += vec3(1.0, 0.95, 0.85) * rimGlow;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
const envSphere = new THREE.Mesh(envGeo, envMat);
scene.add(envSphere);

const groundGeo = new THREE.PlaneGeometry(100, 100, 1, 1);
const groundMat = new THREE.MeshStandardMaterial({
	color: 0xeeeeee,
	roughness: 0.95,
	metalness: 0.0
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = GROUND_Y;
ground.receiveShadow = true;
scene.add(ground);

const shadowGeo = new THREE.PlaneGeometry(30, 30);
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = GROUND_Y + 0.001;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const contactShadowGeo = new THREE.CircleGeometry(1.2, 32);
const contactShadowMat = new THREE.ShaderMaterial({
	transparent: true,
	depthWrite: false,
	vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
	fragmentShader: `
    varying vec2 vUv;
    void main() {
      float dist = length(vUv - 0.5) * 2.0;
      float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
      alpha = pow(alpha, 1.5) * 0.3;
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `
});
const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.y = GROUND_Y + 0.002;
scene.add(contactShadow);

camera.position.set(5, 3, 6);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.minPolarAngle = Math.PI * 0.1;
controls.maxPolarAngle = Math.PI * 0.5;
controls.target.set(0, 1, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.5);
keyLight.position.set(6, 12, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 40;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0001;
keyLight.shadow.radius = 4;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe8f0ff, 1.2);
fillLight.position.set(-6, 5, -4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffe8d0, 1.5);
rimLight.position.set(-3, 6, -10);
scene.add(rimLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
topLight.position.set(0, 15, 0);
scene.add(topLight);

const bounceLight = new THREE.DirectionalLight(0xfff5e8, 0.4);
bounceLight.position.set(0, -3, 4);
scene.add(bounceLight);

scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xc8d8ff, 0xffe8d0, 0.5);
scene.add(hemiLight);

let modelContainer = null;
const loader = new GLTFLoader();

function loadModel(modelKey) {
	const modelConfig = MODELS[modelKey];
	if (!modelConfig) {
		console.error('Unknown model:', modelKey);
		return;
	}

	loadingEl.style.display = 'block';
	errorEl.style.display = 'none';

	if (modelContainer) {
		scene.remove(modelContainer);
		modelContainer.traverse((node) => {
			if (node.isMesh) {
				node.geometry?.dispose();
				if (node.material) {
					if (Array.isArray(node.material)) {
						node.material.forEach((m) => m.dispose());
					} else {
						node.material.dispose();
					}
				}
			}
		});
		modelContainer = null;
	}

	loader.load(
		modelConfig.url,
		(gltf) => {
			const model = gltf.scene;

			model.updateMatrixWorld(true);
			const originalBox = new THREE.Box3().setFromObject(model);
			const originalSize = originalBox.getSize(new THREE.Vector3());
			const originalCenter = originalBox.getCenter(new THREE.Vector3());

			console.log('=== Model Debug ===');
			console.log('Model:', modelKey);
			console.log('Original box min:', originalBox.min.toArray());
			console.log('Original box max:', originalBox.max.toArray());
			console.log('Original size:', originalSize.toArray());
			console.log('Original center:', originalCenter.toArray());

			const targetSize = modelConfig.size;
			const maxDim = Math.max(originalSize.x, originalSize.y, originalSize.z);
			const scale = targetSize / maxDim;

			console.log('Scale factor:', scale);

			modelContainer = new THREE.Group();
			modelContainer.add(model);

			model.position.set(
				-originalCenter.x,
				-originalBox.min.y,
				-originalCenter.z
			);

			modelContainer.scale.setScalar(scale);

			modelContainer.position.y = GROUND_Y;

			modelContainer.updateMatrixWorld(true);
			const finalBox = new THREE.Box3().setFromObject(modelContainer);
			console.log('Final box min:', finalBox.min.toArray());
			console.log('Final box max:', finalBox.max.toArray());
			console.log('Final bottom Y:', finalBox.min.y, '(should be ~0)');

			model.traverse((node) => {
				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
					if (node.material) {
						node.material.envMapIntensity = 0.5;
					}
				}
			});

			scene.add(modelContainer);

			contactShadow.position.set(0, GROUND_Y + 0.002, 0);

			const finalCenter = finalBox.getCenter(new THREE.Vector3());
			controls.target.set(0, finalCenter.y, 0);

			loadingEl.style.display = 'none';
			currentModel = modelKey;
			console.log(`%c Loaded: ${modelKey}`, 'font-size:14px;color:#88ff88');
		},
		(progress) => {
			if (progress.total) {
				const pct = Math.round((progress.loaded / progress.total) * 100);
				loadingEl.textContent = `Loading... ${pct}%`;
			}
		},
		(error) => {
			console.error('Failed to load model:', error);
			loadingEl.style.display = 'none';
			errorEl.style.display = 'block';
		}
	);
}

modelButtons.forEach((btn) => {
	btn.addEventListener('click', () => {
		const modelKey = btn.dataset.model;
		if (modelKey === currentModel) return;

		modelButtons.forEach((b) => b.classList.remove('active'));
		btn.classList.add('active');

		loadModel(modelKey);
	});
});

loadModel('uiia-cat');

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('dblclick', () => {
	controls.autoRotate = !controls.autoRotate;
});

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

animate();
