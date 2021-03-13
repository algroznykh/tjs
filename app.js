const glsl = x => x;
const vert = x => x;
const frag = x => x;

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const vertex_shader = vert`
    varying vec2 _uv;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        _uv = uv;
    }
`;

const fragment_shader = frag`
    precision mediump float;
    precision mediump int;

    varying vec2 _uv;

    void main() {
        gl_FragColor = vec4(vec3(pow(_uv.x - 0.5, 2.) * 2. + pow(_uv.y - 0.5, 2.) * 2., 0., 0.), 1.);
    }
`;

const geometry = new THREE.PlaneGeometry(1, 1);

console.log(vertex_shader, fragment_shader);

const material = new THREE.ShaderMaterial( {
	uniforms: {
		time: { value: 1.0 }
    },
    vertexShader: vertex_shader[0],
	fragmentShader: fragment_shader[0],
} );

const plane = new THREE.Mesh(geometry, material);

function animate() {
    plane.rotation.x += 0.01;
    plane.rotation.y += 0.01;

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function app() {
    const gui = new dat.GUI();
    var person = {name: 'Sam'};
    gui.add(person, 'name');
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    
    scene.add(plane);
    
    camera.position.z = 5;

    animate();
}

window.onload = app;
