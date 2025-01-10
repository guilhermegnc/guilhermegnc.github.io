// Fetch the shaders
export async function loadShaders() {
    const vertexShader = await fetch('vertexShader.glsl').then(res => res.text());
    const fragmentShader = await fetch('fragmentShader.glsl').then(res => res.text());

    // After shaders are loaded, setup scene
    setupScene(vertexShader, fragmentShader);
}

function setupScene(vertexShader, fragmentShader) {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Add an ID to the canvas element
    renderer.domElement.id = "threeCanvas";
    document.body.appendChild(renderer.domElement);

    // Grain Texture
    const textureLoader = new THREE.TextureLoader();
    const grainTexture = textureLoader.load('images/gray.png'); // Replace with your grain image path

    // Plane with grain shader
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            time: { value: 0.0 },
            grainTexture: { value: grainTexture }
        }
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    const sphereMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            time: { value: 0.0 },
            grainTexture: { value: grainTexture },
            color: { value: new THREE.Color(0x000000) },
            noiseStrength: { value: 0.1 },  // Adjust this value to control the strength of the noise
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Camera position
    camera.position.z = 4;
    sphere.position.x = -2;

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Animate loop
    function animate(time) {
        sphere.material.uniforms.time.value = time * 0.001; // Update time uniform for shader

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate(0);
}
