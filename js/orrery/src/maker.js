import * as ORR from "./init.js";
import * as THREE from "../../../node_modules/three/build/three.module.js";
import { mergeGeometries } from "../../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js";
import $ from "../../jquery/jquery.module.js";

const gratRadius = 1000;

/**
 * Make 3D object for a celestial body.
 * @param {number} sysId - System ID
 * @param {float} radius - Planet radius
 * @param {float} ringRad - Ring radius
 * @returns {THREE.Object3D}
 */
export function makeBody (sysId, radius, ringRad) { // make bodies
    const body = ORR.system[sysId];
    let material = (body.texture != "default") ? new THREE.MeshStandardMaterial({ map: ORR.loader.load('data/' + body.texture) }) : ORR.defaultMaterial;
    if (body.isSun) {
        material = new THREE.MeshStandardMaterial({
            map: ORR.loader.load('data/' + body.texture),
            emissive: new THREE.Color(0xffdd99),
            emissiveMap: ORR.loader.load('data/' + body.texture),
            emissiveIntensity: 4.0
        });
    } else {
        material.roughness = 0.7;
        material.metalness = 0.1;
        if (["Jupiter", "Saturn", "Uranus", "Neptune"].includes(body.name)) {
            material.roughness = 0.3; // Gas giants have smoother surfaces
        }
    }
    const planetRadius = radius;
    let geometry;
    if (body.isSun) {
        // Use a perfectly round sphere for the sun
        geometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    } else {
        // Use optimized icosahedron for other planets
        geometry = new THREE.IcosahedronGeometry(planetRadius, 5);
    }
    const sphere = new THREE.Mesh( geometry, material );
    sphere.name = body.name;
    sphere.sysId = sysId;
    

    // Add Atmosphere Glow
    if (["Earth", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Titan"].includes(body.name)) {
        let glowColor = new THREE.Color(0x4488ff);
        if (body.name === "Venus") glowColor = new THREE.Color(0xffcc88);
        if (body.name === "Mars") glowColor = new THREE.Color(0xff6644);
        if (["Jupiter", "Saturn"].includes(body.name)) glowColor = new THREE.Color(0xaa9977);
        if (["Uranus", "Neptune"].includes(body.name)) glowColor = new THREE.Color(0x44aaff);

        const atmoMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { type: "c", value: glowColor }
            },
            vertexShader: `
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    float dotP = dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );
                    intensity = pow( 0.65 - dotP, 4.0 );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        const atmoGeometry = new THREE.IcosahedronGeometry( planetRadius * 1.06, 5 );
        const atmosphere = new THREE.Mesh( atmoGeometry, atmoMaterial );
        sphere.add(atmosphere);
    }


    const ringRadius = (ringRad) ? parseFloat(ringRad) : 0;
    if (ringRadius > 0) {  // make rings
        const geometry = new THREE.RingGeometry(planetRadius * 1.01, ringRadius * planetRadius, 64);
        const texMap = ORR.loader.load('data/' + body.ringTexture);
        const material = new THREE.MeshBasicMaterial({ map: texMap, side:THREE.DoubleSide, transparent: true, combine: THREE.AddOperation });
        const ring = new THREE.Mesh( geometry, material );
        ring.rotateX(Math.PI / 2);
        sphere.attach(ring); // parent ring to planet
    }

    // apply initial rotation
    ORR.reAxis(sphere, body.axisRA, body.axisDec);
    sphere.userData.tiltQuaternion = sphere.quaternion.clone();
    sphere.rotateOnAxis(new THREE.Vector3(0, -1, 0), body.thetaDot * ORR.times.ephTime + Math.PI * body.phase );
    return sphere;
}

/**
 * Make point geometry.
 * @param {string} name 
 * @param {number} sysId - System ID
 * @returns {THREE.Points}
 */
export function makePoint (name, sysId) {
    const point = new THREE.Points( ORR.pointGeometry, ORR.pointMaterial );
    point.name = name;
    point.sysId = sysId;
    return point;
}

/**
 * Make body label.
 * @param {number} i - System ID 
 */
export function makeLabel(i) {
    $("body").append("<div id='" + i + "' class='label'>" + ORR.system[i].label + "</div>");
    $("#" + i).addClass( "tag" + ORR.system[i].type ).on("click", function() {
        $(".label").removeClass( "active" );
        if ( ORR.state.clickedLabel != "" && $(this)[0].id == ORR.state.clickedLabel[0].id ) {
            ORR.closeTag(ORR.state.clickedLabel);
        } else {
            ORR.clickTag($(this)[0].id);
        }
    }).hover( function() {
        if (ORR.state.clickedLabel != "" && $(this)[0].id != ORR.state.clickedLabel[0].id) {
            ORR.state.hoverLabel = $(this);
            const hoverContent = $(this).html();
            ORR.state.hoverLabel.html(hoverContent + '<span id="distToActive"></span>');
        }
    }, function() {
        $("#distToActive").remove();
        ORR.state.hoverLabel = false;
    });
}

/**
 * Make graticule label.
 * @param {number} i
 * @param {string} text 
 * @returns {*}
 */
export function makeGratLabel(i, text) { 
    $("body").append("<div id='grat" + i + "' class='gratLabel'>" + text + "</div>");
    return "grat" + i;
}

/**
 * Make graticule object.
 */
export function makeGraticules() {
    const points = 360;
    const longDivisions = 12;
    const latDivisions = 12;
    const ringPoints = [];

    for (let i = 0; i <= points; i++) {
        let p = new THREE.Vector3(0, gratRadius, 0);
        p.applyAxisAngle(new THREE.Vector3(1, 0, 0), i * Math.PI * 2 / points);
        ringPoints.push(p);
    }
    const ringGeometry = new THREE.BufferGeometry().setFromPoints( ringPoints );

    const rings = [];
    for (let i = 0; i < longDivisions / 2; i++) {
        const tempRing = ringGeometry.clone();
        tempRing.rotateY( i * Math.PI * 2 / longDivisions );
        rings.push(tempRing);
    }
    ringGeometry.rotateZ(Math.PI / 2);
    for (let i = ( latDivisions / -2 ); i < ( latDivisions / 2 ); i++) {
        const tempRing = ringGeometry.clone();
        const x = Math.cos( i * Math.PI / latDivisions );
        const y = Math.sin( i * Math.PI / latDivisions ) * gratRadius;
        tempRing.scale(x, 1, x);
        tempRing.translate(0, -y, 0);
        rings.push(tempRing);
    }

    ringGeometry.rotateX(ORR.eclInclination);
    rings.push(ringGeometry);
    const longSphereGeometry = mergeGeometries(rings);
    const ringMaterial = new THREE.LineBasicMaterial({ color: 0x222211, linewidth: 1 });
    const graticule = new THREE.LineLoop( longSphereGeometry, ringMaterial);
    graticule.name = "graticule";
    ORR.scene.add(graticule);
    ORR.cameraLocked.graticule = graticule;
}

/**
 * Make reference points.
 */
export function makeRefPoints() {
    const longDivisions = 12;
    const latDivisions = 12;
    const refPoints = [0, gratRadius, 0];
    const labels = ["NP"];

    for (let i = 1; i < latDivisions; i++) {
        const latLabel = 90 - i * 15;
        for (let j = 0; j < longDivisions; j++) {
            const x = Math.sin(j * Math.PI * 2 / longDivisions) * Math.sin(i * Math.PI / latDivisions) * gratRadius;
            const y = Math.cos(i * Math.PI / latDivisions) * gratRadius;
            const z = Math.cos(j * Math.PI * 2 / longDivisions) * Math.sin(i * Math.PI / latDivisions) * gratRadius;
            refPoints.push(x, y, z);
            labels.push(latLabel + "&deg;/" + ((j + 9) % 12) * 2 + "h")
        }
    }
    refPoints.push(0, -gratRadius, 0);
    labels.push("SP");

    for (let i = 0; i < refPoints.length / 3; i++) {
        const x = refPoints[3 * i];
        const y = refPoints[3 * i + 1];
        const z = refPoints[3 * i + 2];
        const text = labels[i];
        ORR.gratLabels.push({label: makeGratLabel(i, text), x: x, y: y, z: z});
    }
}