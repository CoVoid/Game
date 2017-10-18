// vertex shader
var vert = `#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_offset;
uniform mat4 u_transform;
uniform mat4 u_project;
uniform mat4 u_normTransform;

out float lighting;

void main() {
    vec4 pos = a_position;
    pos.xyz = pos.xyz + u_offset;
    gl_Position = u_project * u_transform * pos;
    vec4 normal = u_normTransform * vec4(a_normal, 1.0);
    vec3 light = normalize(vec3(0.85, 0.8, 0.75));
    lighting = max(dot(normal.xyz, light), 0.0) * 0.8 + 0.2;
}
`;

// fragment shader
var frag = `#version 300 es
precision highp float;

in float lighting;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 color;

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    float r = length(uv);
    float f = u_time + sin(u_time / 3.17) * r + sin(u_time / 8.63) * uv.x + sin(u_time / 7.41) * uv.y;
    color = vec4(1.0);
    color.r = sin(2.0 * f + 0.0000) * 0.6666 + 0.3333;
    color.g = sin(2.0 * f + 2.0944) * 0.6666 + 0.3333;
    color.b = sin(2.0 * f + 4.1887) * 0.6666 + 0.3333;
    color.rgb *= lighting;
}
`;



function main() {

    // make a new world (currently in testing configuration)
    var world = new World(8);
    // fuck with the world a lot
    world.fillArea([2, 2, 3], [5, 5, 5], FILL_ADD);
    world.fillArea([3, 3, 6], [4, 4, 6], FILL_ADD);
    world.fillArea([2, 3, 3], [5, 4, 4], FILL_REMOVE);
    world.fillArea([3, 2, 3], [4, 5, 4], FILL_REMOVE);
    world.fillArea([2, 2, 4], [5, 5, 6], FILL_TOGGLE);
    // figure out what needs to be drawn
    var blocks = world.getSolids();

    // get a WebGL context
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl2");
    if(!gl) {
        alert("No gl?");
        return;
    }

    // link the shaders into a program
    var program = createProgramFromSource(gl, vert, frag);

    // look up where vertex data needs to go
    var aPositionLoc = gl.getAttribLocation(program, "a_position");
    var aNormalLoc = gl.getAttribLocation(program, "a_normal");

    // create and use a vertex array object
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // create and fill the position buffer
    var positionBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    // create and fill the normal buffer
    var normalBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalLoc);

    // create and fill the index buffer
    var indexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // look up uniform locations
    var uOffsetLoc = gl.getUniformLocation(program, "u_offset");
    var uTransformLoc = gl.getUniformLocation(program, "u_transform");
    var uProjectLoc = gl.getUniformLocation(program, "u_project");
    var uNormTransformLoc = gl.getUniformLocation(program, "u_normTransform");
    var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    var uTimeLoc = gl.getUniformLocation(program, "u_time");


    // scene drawing magic
    var then = 0;
    requestAnimationFrame(drawScene);
    function drawScene(now) {
        now *= 0.001;
        var deltaTime = now - then; // not used atm, but will be important for animations
        then = now;

        // make sure we're filling the available area
        resize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // clear the canvas
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // use the program
        gl.useProgram(program);
        // use the right buffer (redundant now as there's only one)
        gl.bindVertexArray(vao);

        // view parameters
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;

        // TRANSFORMS READ IN THE REVERSE ORDER

        // model transform
        var transform = mat4.create();
        mat4.translate(transform, transform, [0, 0, -6]);
        mat4.rotate(transform, transform, 0.3 * now, [0, 1, 0]);
        mat4.rotate(transform, transform, -90 * Math.PI / 180, [1, 0, 0]);
        // mat4.scale(transform, transform, [2 / world.size, 2 / world.size, 2 / world.size]); // enabling this breaks normals...
        mat4.translate(transform, transform, [-4, -4, -4]);
        gl.uniformMatrix4fv(uTransformLoc, false, transform);

        var normTransform = mat4.create();
        mat4.invert(normTransform, transform);
        mat4.transpose(normTransform, normTransform);
        gl.uniformMatrix4fv(uNormTransformLoc, false, normTransform);

        var camera = mat4.create();
        //mat4.lookAt(camera, [], [0, 0, 0], [0, 0, 1]);

        var project = mat4.create();
        mat4.perspective(project, fieldOfView, aspect, zNear, zFar);
        gl.uniformMatrix4fv(uProjectLoc, false, project);

        // send the GPU the values it needs
        gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(uTimeLoc, now);

        for (var i = 0; i < blocks.length; i++) {
            gl.uniform3fv(uOffsetLoc, blocks[i]);
            // draw a cube
            var count = 36;
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        }

        requestAnimationFrame(drawScene);
    }
}

const positions = [
    // front
     0.0,  0.0,  1.0,
     1.0,  0.0,  1.0,
     1.0,  1.0,  1.0,
     0.0,  1.0,  1.0,

    // back
     0.0,  0.0,  0.0,
     0.0,  1.0,  0.0,
     1.0,  1.0,  0.0,
     1.0,  0.0,  0.0,

    // top
     0.0,  1.0,  0.0,
     0.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  0.0,

    // bot
     0.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // right
     1.0,  0.0,  0.0,
     1.0,  1.0,  0.0,
     1.0,  1.0,  1.0,
     1.0,  0.0,  1.0,

    // left
     0.0,  0.0,  0.0,
     0.0,  0.0,  1.0,
     0.0,  1.0,  1.0,
     0.0,  1.0,  0.0
];

const normals = [
    // front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // bot
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
 ];

const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bot
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
];

main();
