// vertex shader
var vert = `#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_transform;
uniform mat4 u_normTransform;

out vec3 v_normal;

void main() {
    gl_Position = u_transform * a_position;
    v_normal = mat3(u_normTransform) * a_normal;
}
`;

// fragment shader
var frag = `#version 300 es
precision highp float;

in vec3 v_normal;

uniform vec3 u_lightDir;
uniform vec2 u_resolution;
uniform float u_time;

out vec4 color;

void main() {
    // some kinda hacky color stuff
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    float r = length(uv);
    float f = u_time + sin(u_time / 3.17) * r + sin(u_time / 8.63) * uv.x + sin(u_time / 7.41) * uv.y;
    color = vec4(1.0);
    color.r = sin(2.0 * f + 0.0000) * 0.6666 + 0.3333;
    color.g = sin(2.0 * f + 2.0944) * 0.6666 + 0.3333;
    color.b = sin(2.0 * f + 4.1887) * 0.6666 + 0.3333;

    vec3 normal = normalize(v_normal);
    vec3 light = normalize(u_lightDir);
    float lighting = max(dot(normal.xyz, light), 0.0) * 0.8 + 0.2;
    color.rgb *= lighting;
}
`;

function Display() {

    // get a WebGL context
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
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
    var uTimeLoc = gl.getUniformLocation(program, "u_time");
    var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    var uLightDirLoc = gl.getUniformLocation(program, "u_lightDir");
    var uTransformLoc = gl.getUniformLocation(program, "u_transform");
    var uNormTransformLoc = gl.getUniformLocation(program, "u_normTransform");

    function loadWorld(world) {
        this.world = world;
    }

    function update() {
        this.blocks = this.world.getSolids();
    }

    // scene drawing magic
    var then = 0;
    requestAnimationFrame(render);

    function render(now) {
        world = display.world;
        blocks = display.blocks;
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
        if (world) {
            // use the program
            gl.useProgram(program);
            // use the right buffer (redundant now as there's only one)
            gl.bindVertexArray(vao);

            // send the GPU the values it needs
            gl.uniform1f(uTimeLoc, now);
            gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
            gl.uniform3f(uLightDirLoc, 0.75, 0.8, 0.85);

            // view parameters
            const fieldOfView = 45 * Math.PI / 180;
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            // where's the camera and where's it lookin'
            var distance = world.size * 2.0;
            var speed = 0.4;
            var center = vec3.fromValues(world.size/2, world.size/2, world.size/2);
            var path = vec3.fromValues(distance*Math.sin(speed*now), distance*Math.cos(speed*now), 1.5*Math.sin(0.3*speed*now));
            vec3.add(path, path, center);

            // MATH, NOT EVEN ONCE
            var view = mat4.create();
            var projection = mat4.create();
            var transform = mat4.create();
            var normTransform = mat4.create();
            mat4.lookAt(view, path, center, [0, 0, 1]);
            // put things in perspective
            mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);
            mat4.multiply(view, projection, view);

            for (var i = 0; i < blocks.length; i++) {
                // offset for each cube
                mat4.fromTranslation(transform, blocks[i]);
                var scale = 1.0 - 0.1 * Math.abs(Math.sin(2 * Math.PI * now));
                // mat4.scale(transform, transform, [scale, scale, scale]);
                mat4.invert(normTransform, transform);
                mat4.transpose(normTransform, normTransform);
                mat4.multiply(transform, view, transform);
                // send transformation matrices
                gl.uniformMatrix4fv(uTransformLoc, false, transform);
                gl.uniformMatrix4fv(uNormTransformLoc, false, normTransform);
                // draw a cube
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
            }
        }
        requestAnimationFrame(render); // again, again!
    }

    this.canvas = canvas;
    this.gl = gl;
    this.program = program;
    this.aPositionLoc = aPositionLoc;
    this.aNormalLoc = aNormalLoc;
    this.vao = vao;
    this.positionBuf = positionBuf;
    this.normalBuf = normalBuf;
    this.indexBuf = indexBuf;
    this.uTimeLoc = uTimeLoc;
    this.uResolutionLoc = uResolutionLoc
    this.uLightDirLoc = uLightDirLoc
    this.uTransformLoc = uTransformLoc
    this.uNormTransformLoc = uNormTransformLoc
    this.then = then;
    this.render = render;
    this.loadWorld = loadWorld;
    this.update = update;
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

var display = new Display();
