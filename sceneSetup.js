// Fetch the shaders
export async function loadShaders() {
    const vertexShader = await fetch('vertexShader.glsl')
    .then(res => {
        if (!res.ok) throw new Error(`Failed to load vertex shader: ${res.statusText}`);
        return res.text();
    });
    const fragmentShader = await fetch('fragmentShader.glsl')
    .then(res => {
        if (!res.ok) throw new Error(`Failed to load fragment shader: ${res.statusText}`);
        return res.text();
    });

    // After shaders are loaded, setup scene
    setupScene(vertexShader, fragmentShader);
}

function setupScene(vertexShader, fragmentShader) {
    // Scene setup with WebGL2 and mobile-friendly settings
    const renderer = new THREE.WebGLRenderer({
        antialias: false, // Disable antialiasing for better mobile performance
        powerPreference: "high-performance",
        alpha: true
    });

    // Check WebGL capabilities
    const gl = renderer.getContext();
    const isWebGL2 = gl instanceof WebGL2RenderingContext;
    const extensions = renderer.capabilities.extensions;
    
    if (!isWebGL2 && !extensions.has('OES_standard_derivatives')) {
        console.warn('Required WebGL extensions not supported');
        // Fallback handling here
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for mobile
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "threeCanvas";
    document.body.appendChild(renderer.domElement);

    // Grain Texture with proper settings for mobile
    const textureLoader = new THREE.TextureLoader();
    const grainTexture = textureLoader.load('images/gray.png', 
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false; // Disable mipmaps for better performance
        }
    );

    // Sphere with optimized settings
    const sphereGeometry = new THREE.SphereGeometry(3.5, 32, 32); // Reduced segments for mobile
    const sphereMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            time: { value: 0.0 },
            grainTexture: { value: grainTexture },
            color: { value: new THREE.Color(0x0a0a0a) },
            noiseStrength: { value: 0.1 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Camera position
    camera.position.z = 4;
    sphere.position.x = -2;

    // Improved resize handler with resizeObserver
    const resizeObserver = new ResizeObserver(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    
        sphere.material.uniforms.u_resolution.value.set(width, height);
    });
    resizeObserver.observe(document.body);

    // Optimized animation loop
    let previousTime = 0;
    function animate(currentTime) {
        const deltaTime = (currentTime - previousTime) * 0.001;
        previousTime = currentTime;

        // Update uniforms
        sphere.material.uniforms.time.value += deltaTime;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate(0);
}
