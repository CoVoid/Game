// vertex shader
var vert = `#version 300 es

in vec4 a_position;

uniform mat4 u_transform;
uniform mat4 u_project;

void main() {
    gl_Position = u_project * u_transform * a_position;
}
`;

// fragment shader
var frag = `#version 300 es
precision highp float;

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
}
`;

// four corners of the screen

function main() {
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

    // look up uniform locations
    var uTransformLoc = gl.getUniformLocation(program, "u_transform");
    var uProjectLoc = gl.getUniformLocation(program, "u_project");
    var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    var uTimeLoc = gl.getUniformLocation(program, "u_time");

    // create and use a vertex array object
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // create and fill the position buffer
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    // create and fill the index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // scene drawing magic
    var then = 0;
    requestAnimationFrame(drawScene);

    // where the magic happens
    function drawScene(now) {

        // time stuff
        now *= 0.001;
        var deltaTime = now - then; // not used atm, but will be important for animations
        then = now;

        // make sure we're filling the available area
        resize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear the canvas
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // use the program
        gl.useProgram(program);

        // use the right buffer (redundant now as there's only one)
        gl.bindVertexArray(vao);

        // some bullshit hacky shit
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        var transform = mat4.create();
        mat4.translate(transform, transform, [-0.0, 0.0, -6.0]);
        mat4.rotate(transform, transform, now, [0, 1, 0.5]);
        var project = mat4.create();
        mat4.perspective(project, fieldOfView, aspect, zNear, zFar);

        // send the GPU the values it needs
        gl.uniformMatrix4fv(uTransformLoc, false, transform);
        gl.uniformMatrix4fv(uProjectLoc, false, project);
        gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(uTimeLoc, now);

        // draw
        var count = 36;
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(drawScene);
    }
}

const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
];

const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
];

main();
