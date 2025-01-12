// Fetch shaders in parallel
export async function loadShaders() {
    try {
        const [vertexShader, fragmentShader] = await Promise.all([
            fetch('vertexShader.glsl').then(res => {
                if (!res.ok) throw new Error(`Vertex shader failed: ${res.statusText}`);
                return res.text();
            }),
            fetch('fragmentShader.glsl').then(res => {
                if (!res.ok) throw new Error(`Fragment shader failed: ${res.statusText}`);
                return res.text();
            })
        ]);

        setupScene(vertexShader, fragmentShader);
    } catch (err) {
        console.error('Error loading shaders:', err);
    }
}

// Primeiro, vamos atualizar o setup da cena para incluir os novos uniforms

function setupScene(vertexShader, fragmentShader) {
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: "high-performance",
        alpha: true
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "threeCanvas";
    document.body.appendChild(renderer.domElement);

    // Carregar as duas texturas necessárias
    const textureLoader = new THREE.TextureLoader();
    
    // Textura do grain
    const grainTexture = textureLoader.load('/images/perlin-noise.png', 
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
        }
    );

    // Nova textura para o blur (você precisará criar ou fornecer esta textura)
    const blurTexture = textureLoader.load('/images/blur.jpg', 
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
        }
    );

    // Material atualizado com os novos uniforms
    const sphereMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            time: { value: 0.0 },
            seed: { value: Math.random() }, // Valor aleatório para seed
            grainTex: { value: grainTexture },
            blurTex: { value: blurTexture },
            back: { value: new THREE.Color(0x000000) },
            param1: { value: 5.0 }, // Controla a escala do grain
            param2: { value: .4 }, // Controla a intensidade do deslocamento
            param3: { value: 0.8 }  // Controla a escala do noise
        },
        transparent: true // Habilita transparência para usar o blurAlpha
    });

    const sphereGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    camera.position.z = 4;
    sphere.position.x = -2;

    // Handler de redimensionamento
    const resizeObserver = new ResizeObserver(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(document.body);

    // Loop de animação atualizado
    let previousTime = 0;
    function animate(currentTime) {
        const deltaTime = (currentTime - previousTime) * 0.001;
        previousTime = currentTime;

        // Atualizar uniforms
        sphere.material.uniforms.time.value += deltaTime;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate(0);

    return {
        cleanup: () => {
            resizeObserver.disconnect();
            grainTexture.dispose();
            blurTexture.dispose();
            sphereGeometry.dispose();
            sphereMaterial.dispose();
            renderer.dispose();
        }
    };
}