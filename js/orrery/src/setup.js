import * as ORR from "./init.js";
import * as THREE from "../../../vendor/three/build/three.module.js";
import { OrbitControls } from "../../../vendor/three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "../../../vendor/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../../../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "../../../vendor/three/examples/jsm/postprocessing/EffectComposer.js";
import { ShaderPass } from "../../../vendor/three/examples/jsm/postprocessing/ShaderPass.js";

// spatial constants
export const toRad = Math.PI/180
export const toDeg = 180/Math.PI;
export const celestialXAxis = new THREE.Vector3(1, 0, 0);
export const celestialZAxis = new THREE.Vector3(0, -1, 0);
export const eclInclination = 23.43928 * toRad + Math.PI; // inclination of the ecliptic relative to the celestial sphere
export const AU = 1.495978707e+11; // astronomical unit
export const exagScale = 500000;
export const initMinDistance = 1;
export const initMaxDistance = 1400;
export const initialPoint = 0.01;

// temporal constants
export const daysPerCent = 36525.6363;
export const fps = 60; // max FPS
export const rates = [ -1/20/fps, -1/100/fps, -100/daysPerCent/fps, -20/daysPerCent/fps, -1/daysPerCent/fps, -1/24/daysPerCent/fps, -1/86400/daysPerCent/fps, 0, 1/86400/daysPerCent/fps, 1/24/daysPerCent/fps, 1/daysPerCent/fps, 20/daysPerCent/fps, 100/daysPerCent/fps, 1/100/fps, 1/20/fps]; // centuries per frame

// constants
export const pointCount = 180;
export const initialFOV = 60;
export const system = []; // the solar system as an associative array
export const majorBodies = []; // bodies that scale on zoom
export const moons = []; // need late update with planet references
export const paths = []; // orbital paths
export const gratLabels = [];
export const precessing = []; // orbits with temporal drift
export const specialID = { earth:0, moon:0, pluto:0, charon:0 };
export const center = { x:0, y:0 }; // screen center
export const state = { clickedLabel: "", clickedPlanet: {}, lastClickedPlanet: {}, mousePos: new THREE.Vector3(0, 0, 1), following: false, lastFollow: new THREE.Vector3(), hoverLabel: false, extraData: false, orbitOpacity:0.5 };
export const groundPosition = { latitude: 51.48, longitude: 0, default: true }; // default location is Greenwich
export const times = { ephTime: ORR.MJDToEphTime(ORR.unixToMJD(Date.now())), speed: 8, lastSpeed: 8, rate: rates[8], pauseRate: 7, avgFPS: 0, parsedDate: 0 };
export const searchLists = { combined: [], planetNames: [], moonNames: [], asteroidNames: [], cometNames: [], orderedNames: [] };
export const cameraLocked = { starfieldObj: new THREE.Object3D(), graticule: new THREE.Line() };
export const orbitPlot = { points: pointCount };

const materials = {};

/**
 * Get HTTP variables.
 * @returns {object}
 */
function getUrlVars() {
    let vars = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

export const vars = getUrlVars();

if (typeof vars.y == "undefined" || typeof vars.x == "undefined") {
    navigator.geolocation.getCurrentPosition(ORR.getLatLong); // request user's coordinates, if unavailable keep Greenwich
} else {
    const lat = parseFloat(vars.y);
    const lon = parseFloat(vars.x);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        groundPosition.latitude = lat;
        groundPosition.longitude = lon;
        groundPosition.default = false;
    }
}

if (typeof vars.t != "undefined" && (vars.t.length == 12 || vars.t.length == 13)) { // apply date
    const BC = parseFloat(vars.t) < 0;
    const split = BC ? 5 : 4;
    const year = vars.t.substr(0, split).substr(-4);
    const dayTime = vars.t.substr(split);
    const dateCode = (BC ? "-00" : "") + year + "-" + dayTime.substr(0, 2) + "-" + dayTime.substr(2,2) + "T" + 
    dayTime.substr(4,2) + ":" + dayTime.substr(6,2);
    times.parsedDate = Date.parse(dateCode);
}

// three.js setup
export const scene = new THREE.Scene();
export const clock = new THREE.Clock();

export const camera = new THREE.PerspectiveCamera( initialFOV, window.innerWidth/window.innerHeight, 0.000001, 100000 );
export const renderer = new THREE.WebGLRenderer( {
    antialias: true, 
    logarithmicDepthBuffer: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    powerPreference: "high-performance"
});

// standard materials
export const loader = new THREE.TextureLoader();
export const selectedPathMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2.0, transparent:true, opacity: 1.0 });
export const defaultMaterial = new THREE.MeshStandardMaterial({ map: loader.load('data/1k_eris_fictional.jpg')});
export const pointMaterial = new THREE.PointsMaterial( { color: 0xffffff, alphaMap: loader.load('data/disc.png'), size: initialPoint, transparent: true } );
export const darkMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
export const transparentMaterial = new THREE.LineBasicMaterial( { transparent: true, opacity: 0 } );

// orbit path materials
export let pathMaterials = [
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5, transparent:true, opacity: 0.8 }), // Planets: White
    new THREE.LineBasicMaterial({ color: 0x66aaff, linewidth: 1.5, transparent:true, opacity: 0.5 }), // Moons: Light Blue
    new THREE.LineBasicMaterial({ color: 0x66aaff, linewidth: 1.5, transparent:true, opacity: 0.4 }), // Asteroids: Light Blue
    new THREE.LineBasicMaterial({ color: 0x66aaff, linewidth: 1.5, transparent:true, opacity: 0.3 }), // Comets: Light Blue
    new THREE.LineBasicMaterial({ color: 0x66aaff, linewidth: 1.5, transparent:true, opacity: 0.2 })  // Others: Light Blue
];
export function setPathMaterials(n) {
    pathMaterials[0].opacity = 0.8 * n;
    pathMaterials[1].opacity = 0.5 * n;
    pathMaterials[2].opacity = 0.4 * n;
    pathMaterials[3].opacity = 0.3 * n;
    pathMaterials[4].opacity = 0.2 * n;
}

export const pointGeometry = new THREE.InstancedBufferGeometry();
pointGeometry.setAttribute( 'position', new THREE.InstancedBufferAttribute( new Float32Array([0,0,0]), 3 ) );

export function darkenNonBloomed( obj ) {
    if ( typeof obj.glow == "undefined" || obj.glow == false ) {
        materials[ obj.uuid ] = obj.material;
        obj.material = ORR.darkMaterial;
    }
}

export function restoreMaterial( obj ) {
    if ( materials[ obj.uuid ] ) {
        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];
    }
}

// set up bloom pass
export const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
export const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

export const renderScene = new RenderPass( scene, camera );
export const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0.2;
bloomPass.strength = 1.0;
bloomPass.radius = 0.4;

export const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

export const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        defines: {}
    } ), "baseTexture"
);
finalPass.needsSwap = true;

export const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

// backdrop and lighting
const ambient = new THREE.AmbientLight( 0x303040 );
const sunlight = new THREE.PointLight( 0xffffff, 3, 0, 0.1 );

scene.add(sunlight, ambient);

// skysphere / background
const textureEquirec = loader.load( 'data/starmap_2020_8k.jpg' );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;
scene.background = textureEquirec;
scene.environment = textureEquirec;

// make sun
function createSunGlow() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    // Keep core transparent so fiery solar surface/core texture is 100% visible
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.48, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.55, 'rgba(255, 140, 20, 0.28)');
    gradient.addColorStop(0.65, 'rgba(255, 85, 10, 0.16)');
    gradient.addColorStop(0.80, 'rgba(200, 45, 0, 0.06)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.75
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.36, 0.36, 1);
    sprite.glow = true; // Soft outer corona participates gently in bloom
    return sprite;
}

const sunGeometry = new THREE.SphereGeometry( 0.1, 128, 128 );
const sunTexture = loader.load('data/1k_sun.jpg');
sunTexture.colorSpace = THREE.SRGBColorSpace;

const sunMaterial = new THREE.MeshBasicMaterial({ 
    map: sunTexture
});
sunMaterial.userData.time = { value: 0.0 };

sunMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sunMaterial.userData.time;
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vNormalWorld;
        varying vec3 vWorldPosition;
        `
    );
    shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        varying vec3 vNormalWorld;
        varying vec3 vWorldPosition;
        `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
            vec2 uvBase = vMapUv;
            float t = uTime * 0.4;
            // Fiery convection perturbation & boiling turbulence
            float warp1 = sin(uvBase.y * 28.0 + t * 1.4) * cos(uvBase.x * 24.0 + t * 1.1) * 0.003;
            float warp2 = cos(uvBase.x * 32.0 - t * 1.6) * sin(uvBase.y * 28.0 + t * 1.2) * 0.003;
            vec2 fireUv = uvBase + vec2(warp1, warp2);

            vec4 sampledColor = texture2D( map, fireUv );
            vec3 rawRgb = sampledColor.rgb;

            // View direction & solar limb darkening
            vec3 viewDir = normalize( cameraPosition - vWorldPosition );
            float cosTheta = clamp( dot( normalize( vNormalWorld ), viewDir ), 0.0, 1.0 );
            
            // Solar limb darkening curve (makes core deep and clear)
            float limbDarkening = 0.50 + 0.50 * pow( cosTheta, 0.65 );

            // Fiery plasma color grading
            // Valleys/sunspots: rich dark amber / deep crimson red
            // Midtones: burning fiery orange / convective gold
            // Flare peaks: brilliant golden-yellow plasma
            vec3 fireRgb;
            fireRgb.r = pow( rawRgb.r, 0.95 ) * 1.04;
            fireRgb.g = pow( rawRgb.g, 1.08 ) * 0.94;
            fireRgb.b = pow( rawRgb.b, 1.35 ) * 0.55;

            // Subtle plasma simmer
            float simmer = sin( fireUv.x * 55.0 + t * 2.2 ) * cos( fireUv.y * 55.0 + t * 2.8 ) * 0.035;
            fireRgb = clamp( fireRgb + simmer * rawRgb.r, 0.0, 1.0 );

            // Delicate chromospheric rim glow right at the limb
            float rim = pow( 1.0 - cosTheta, 3.2 );
            vec3 rimColor = vec3( 1.0, 0.45, 0.08 ) * rim * 0.8;

            vec3 finalFire = fireRgb * limbDarkening + rimColor;
            diffuseColor = vec4( finalFire, 1.0 );
        #endif
        `
    );
};

export const sun = new THREE.Mesh( sunGeometry, sunMaterial );
sun.add(createSunGlow());
sun.name = "Sol";
sun.glow = false; // Core sphere does NOT bloom to keep fiery core details crisp and visible
ORR.reAxis(sun, 63.87 * toRad, 286.13 * toRad);
sun.thetaDot = 360 * daysPerCent / -25.05 * toRad; // sun rotation rotate
scene.add( sun );

// camera controls
export const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.target = new THREE.Vector3();
controls.screenSpacePanning = false;
controls.minDistance = initMinDistance;
controls.maxDistance = initMaxDistance;
controls.maxPolarAngle = Math.PI;

const camStart = new THREE.Vector3(0, -8, 0).applyAxisAngle(celestialXAxis, eclInclination);
camera.position.y = camStart.y;
camera.position.z = camStart.z;
controls.update();