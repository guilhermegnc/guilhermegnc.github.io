precision highp float;

varying vec2 vUv;
// Add Perlin noise to the vertex positions in the vertex shader
uniform float time;
uniform float noiseStrength;  // Control how much the noise affects the sphere
varying vec3 vPosition;

float perlinNoise(vec3 position) {
    // Example of using a Perlin noise function
    return (sin(position.x + time) + cos(position.y + time)) * 0.5; 
}

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 displacedPosition = position + normal * perlinNoise(position) * noiseStrength;
    vPosition = displacedPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}