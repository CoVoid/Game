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
    var programInfo = twgl.createProgramInfo(gl, [vert, frag]);

    // set attribues and fill buffers
    const arrays = {
        a_position: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
        a_normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
        indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // make the magic happen
    function render(time) {
        time *= 0.001;

        // make sure we're filling the available area
        twgl.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // clear the canvas
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        // gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        blocks = display.blocks;
        if (blocks) {
            // use the program
            gl.useProgram(programInfo.program);

            var properties = {
                u_lightDir: [0.75, 0.8, 0.85],
                u_resolution: [gl.canvas.width, gl.canvas.height],
                u_time: time,
            };
            twgl.setUniforms(programInfo, properties);

            // view parameters
            const fieldOfView = 45 * Math.PI / 180;
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            // where's the camera and where's it lookin'
            var distance = world.size * 2.0;
            var speed = 0.4;
            var center = vec3.fromValues(world.size/2, world.size/2, world.size/2);
            var path = vec3.fromValues(distance*Math.sin(speed*time), distance*Math.cos(speed*time), 1.5*Math.sin(0.3*speed*time));
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
                // // enable this for happy fun good times
                // var scale = 1.0 - 0.2 * Math.abs(Math.sin(2 * Math.PI * time));
                // mat4.scale(transform, transform, [scale, scale, scale]);
                mat4.invert(normTransform, transform);
                mat4.transpose(normTransform, normTransform);
                mat4.multiply(transform, view, transform);
                // send transformation matrices
                var transforms = {
                    u_transform: transform,
                    u_normTransform: normTransform,
                };
                twgl.setUniforms(programInfo, transforms);
                // draw a cube
                twgl.drawBufferInfo(gl, bufferInfo);
            }
        }
        requestAnimationFrame(render); // again, again!
    }

    function update() {
        this.blocks = world.getSolids();
    }

    // determines what properties will be visible from outside the object
    this.update = update;

    requestAnimationFrame(render);
}
