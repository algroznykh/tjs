
function add_plane(scene, folder, param) {

    let vertices = [];
    let uv = [];

    // create corners
    let corner_planes = [];
    for(let i = 0; i < 4; i++) {
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const geometry = new THREE.PlaneGeometry(0.1,0.1);
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.z = Math.PI/4;
        plane.position.x = Math.cos(Math.PI * 2 * i / 4 + Math.PI/4);
        plane.position.y = Math.sin(Math.PI * 2 * i / 4 + Math.PI/4);
        plane.position.z = 0.1;

        corner_planes.push(plane);
        scene.add(plane);
    }

    const geometry = new THREE.BufferGeometry();

    // create geometry

    function set_corners(N) {
        const Z = 0.;

        vertices = [];
        uv = [];

        let corners = [];

        for(let i = 0; i < N; i++) {
            let x = Math.cos(Math.PI * 2 * i / N + Math.PI/4);
            let y = Math.sin(Math.PI * 2 * i / N + Math.PI/4);
            corners.push({x, y});
        }

        
        for(let i = 0; i < N; i++) {
            vertices.push(0., 0., Z);
            vertices.push(corners[i].x, corners[i].y, Z);
            vertices.push(corners[(i + 1) % N].x, corners[(i + 1) % N].y, Z);

            uv.push(0.5, 0.5);
            uv.push(corners[i].x + 0.5, corners[i].y + 0.5);
            uv.push(corners[(i + 1) % N].x + 0.5, corners[(i + 1) % N].y + 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    }

    set_corners(4);

    const vertex_shader = vert`
        varying vec2 _uv;
        uniform mat4 projection;

        void main() {
            gl_Position = projection * vec4( position, 1.0 );
            _uv = uv;
        }
    `;

    // create shading

    const fragment_shader = frag`
        precision mediump float;
        precision mediump int;

        varying vec2 _uv;

        void main() {
            gl_FragColor = vec4(vec3(0.), 1.);
        }
    `;

    let projection = new THREE.Matrix4();
    projection.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    let uniforms = {
        time: {value: 1.0},
        texture0: {type: "t", value: param.texture0},
        projection: {value: projection}
    };

    const material = new THREE.ShaderMaterial( {
        uniforms,
        vertexShader: vertex_shader[0],
        fragmentShader: fragment_shader[0],
    } );
    
    const plane = new THREE.Mesh(geometry, material);

    scene.add(plane);
    
    let gui_param = {
        rotate_x: 0,
        rotate_y: 0,
        rotate_z: 0,
        x: 0,
        y: 0,
        scale_x: 1,
        scale_y: 1,
        corners: 3,
    };

    folder.add(gui_param, 'rotate_x')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.x = value);
    folder.add(gui_param, 'rotate_y')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.y = value);
    folder.add(gui_param, 'rotate_z')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.z = value);
    
    folder.add(gui_param, 'x')
        .min(-1).max(1).step(.05)
        .listen().onChange(value => plane.position.x = value);
    folder.add(gui_param, 'y')
        .min(-1).max(1).step(.05)
        .listen().onChange(value => plane.position.y = value);

    folder.add(gui_param, 'scale_x')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.x = value);
    folder.add(gui_param, 'scale_y')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.y = value);
    
    folder.add(gui_param, 'corners')
        .min(3).max(12).step(1)
        .listen().onChange(value => set_corners(value));

    function update_material(fragment_text) {
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertex_shader[0],
            fragmentShader: fragment_text,
        });

        plane.material = material;
    }

    function update_uniform(data) {
        for(key in data) {
            plane.material.uniforms[key].value = data[key];
        }
    }

    function get_corner_id(x, y) {
        return 0;
    }

    function update_transform() {
        let t = transform2d(
            1, 1,
            corner_planes[0].position.x, corner_planes[0].position.y,
            corner_planes[1].position.x, corner_planes[1].position.y,
            corner_planes[2].position.x, corner_planes[2].position.y,
            corner_planes[3].position.x, corner_planes[3].position.y
        );

        projection.set(
            t[0], t[1], 0, t[2],
            t[3], t[4], 0, t[5],
            0   , 0   , 1, 0   ,
            t[6], t[7], 0, t[8]
        );
    }

    function move_corner(id, x, y) {
        if(id === null) return;

        console.log(id, x, y);
        corner_planes[id].position.x = x * 2 / window.innerWidth - 1;
        corner_planes[id].position.y = -y * 2 / window.innerHeight + 1.;

        update_transform();
    }

    update_transform();

    return {update_material, update_uniform, get_corner_id, move_corner};
}