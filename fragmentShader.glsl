precision highp float;

uniform float time;
uniform sampler2D grainTexture;
varying vec2 vUv;
uniform vec3 color;
uniform vec2 u_resolution;  // Added uniform for resolution

// Simplex noise function (copy the code you provided)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g = vec3(0.0);
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
    return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Generate noise pattern
    float n = snoise(st * 200.0 + time * 0.05);  // Add time for animation effect

    // Grain effect (using noise texture)
    vec4 grain = texture2D(grainTexture, vUv);

    // Configuração para número de ondas
    float maxOffset = 2.0;  // Valor máximo de randomOffset
    float minOffset = 1.0;   // Valor mínimo de randomOffset
    float cycleTime = 50.0;   // Duração de um ciclo completo (em segundos)

    // Cria um padrão triangular para randomOffset
    float phase = mod(time / cycleTime, 1.0);  // Tempo normalizado para [0, 1]
    float triWave = abs(2.0 * phase - 1.0);   // Função triangular [0, 1, 0]
    float randomOffset = mix(minOffset, maxOffset, triWave);  // Interpolação

    // Ângulo de rotação baseado no tempo
    float angle = triWave * 0.5; // A velocidade da rotação depende de 'time'

    // Calculando a matriz de rotação
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);

    // Coordenadas rotacionadas
    float rotatedX = vUv.x * cosAngle - vUv.y * sinAngle;
    float rotatedY = vUv.x * sinAngle + vUv.y * cosAngle;

    // Usando as coordenadas rotacionadas para o cálculo da onda
    float wave = (sin(time + rotatedX * 35.0 * randomOffset) * 0.7 + 0.5) 
            + (cos(time + rotatedY * 20.0 * randomOffset) * 0.5 + 0.5);

    vec3 finalColor = mix(grain.rgb, color, wave);  // Mix grain and color based on wave
    finalColor += n * 0.2;  // Add noise to color

    // Calculate aspect ratio
    float aspectRatio = u_resolution.x / u_resolution.y;

    // Calculate scaled texture coordinates 
    vec2 scaledSt = st; 
    if (aspectRatio > 1.0) { // Wider than tall
        scaledSt.y *= aspectRatio; 
    } else { // Taller than wide
        scaledSt.x /= aspectRatio;
    }

    // Calculate distance from center
    vec2 center = vec2(0.5, 0.5);
    vec2 distanceToCenter = scaledSt - center;
    float distance = length(distanceToCenter);

    // Determine fade-out radius (adjust this value)
    float fadeRadius = 0.0001; // Fraction of the longest dimension

    // Calculate normalized distance (0.0 at center, 1.0 at fade-out radius)
    float normalizedDistance = distance / (max(u_resolution.x, u_resolution.y) * fadeRadius);

    // Calculate smooth edge fade (0.0 at center, 1.0 at edge)
    float edgeFade = smoothstep(0.7, 14.0, normalizedDistance); 

    // Apply edge fade to final color
    finalColor *= (0.7-edgeFade); 

    // Decrease alpha at the center to create transparency
    float alpha = 1.0 - edgeFade * (0.7 + n * 0.3); // Apply noise to alpha near edges

    gl_FragColor = vec4(finalColor, alpha);  // Set final color with alpha
}
