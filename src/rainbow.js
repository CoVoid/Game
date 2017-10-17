// vertex shader
var vert = `#version 300 es
in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
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
    color = vec4(1.0);
    float f = u_time + sin(u_time / 3.17) * r + sin(u_time / 8.63) * uv.x + sin(u_time / 7.41) * uv.y;
    color.r = sin(2.0 * f + 0.0000) * 0.6666 + 0.3333;
    color.g = sin(2.0 * f + 2.0944) * 0.6666 + 0.3333;
    color.b = sin(2.0 * f + 4.1887) * 0.6666 + 0.3333;
}
`;

// four corners of the screen
var positions = [
    -1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0
];

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
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "u_time");

    // create a buffer for vertex positions
    var positionBuffer = gl.createBuffer();

    // create and use a vertex array object
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // turn on the attribute and bind the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // stored in vertex array object

    // fill position buffer with geometry
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    gl.vertexAttribPointer(positionAttributeLocation, size, gl.FLOAT, false, 0, 0); // stored in vertex array object

    var then = 0;
    requestAnimationFrame(drawScene);

    function drawScene(now) {
        now *= 0.001;
        var deltaTime = now - then;
        then = now;
        // make sure we're filling the available area
        resize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear the canvas
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // use the program
        gl.useProgram(program);

        // use the right buffer (redundant now as there's only one)
        gl.bindVertexArray(vao);

        // send the GPU the values it needs
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(timeUniformLocation, now);

        // draw
        var count = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
        requestAnimationFrame(drawScene);
    }
}

main();
