// vertex shader
var vert = `#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;

uniform mat4 u_mTransform;
uniform mat4 u_mvpTransform;
uniform mat4 u_normTransform;

out vec3 v_normal;
out vec3 v_toLight;
out vec3 v_toView;

void main() {
    gl_Position = u_mvpTransform * a_position;
    v_normal = mat3(u_normTransform) * a_normal;

    vec3 position = (u_mTransform * a_position).xyz;
    v_toLight = u_lightPos - position;
    v_toView = u_viewPos - position;
}
`;

// fragment shader
var frag = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_toLight;
in vec3 v_toView;

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

    vec3 light;
    vec3 normal = normalize(v_normal);
    // ambient lighting
    float aLighting = 0.2;
    // directional lighting
    light = normalize(u_lightDir);
    float dLighting = 0.3 * max(dot(normal.xyz, light), 0.0);
    // point lighting
    light = normalize(v_toLight);
    float pLighting = 0.7 * max(dot(normal.xyz, light), 0.0);
    // specular highlighting
    vec3 view = normalize(v_toView);
    vec3 halfVector = normalize(view + light);
    float hLighting = 0.0;
    if (pLighting != 0.0)
        hLighting = pow(max(dot(normal, halfVector), 0.0), 2.0) * 0.4;

    color.rgb *= (aLighting + dLighting + pLighting);
    color.rgb += hLighting;
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
        a_position: [0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5],
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
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (world) {
            size = world.size;
            blocks = world.getSolids();
            // use the program
            gl.useProgram(programInfo.program);

            // view parameters
            const fieldOfView = 45 * Math.PI / 180;
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            // where's the camera and where's it lookin'
            var distance = size * 2.0;
            var speed = 0.4;
            var center = vec3.fromValues((size-1)/2, (size-1)/2, (size-1)/2);
            var path = vec3.fromValues(distance*Math.sin(speed*time), distance*Math.cos(speed*time), 2.3*Math.sin(0.3*speed*time));
            vec3.add(path, path, center);

            var properties = {
                u_lightDir: [0.75, 0.8, 0.85],
                u_lightPos: [3.5, 3.5, 5.5 + 2 * Math.sin(time)],
                u_viewPos: path,
                u_resolution: [gl.canvas.width, gl.canvas.height],
                u_time: time,
            };
            twgl.setUniforms(programInfo, properties);

            // MATH, NOT EVEN ONCE
            var mTransform = mat4.create()
            var vTransform = mat4.create();
            var pTransform = mat4.create();
            var vpTransform = mat4.create();
            var mvpTransform = mat4.create();
            var normTransform = mat4.create();
            mat4.lookAt(vTransform, path, center, [0, 0, 1]);
            mat4.invert(vTransform, vTransform);
            mat4.translate(vTransform, vTransform, [0.1*mouse.x, 0.1*mouse.y, 0]);
            mat4.invert(vTransform, vTransform);
            // put things in perspective
            mat4.perspective(pTransform, fieldOfView, aspect, zNear, zFar);
            mat4.multiply(vpTransform, pTransform, vTransform);

            for (var i = 0; i < blocks.length; i++) {
                mat4.fromTranslation(mTransform, blocks[i]);
                mat4.invert(normTransform, mTransform);
                mat4.transpose(normTransform, normTransform);
                mat4.multiply(mvpTransform, vpTransform, mTransform);
                // send transformation matrices
                var transforms = {
                    u_mTransform: mTransform,
                    u_mvpTransform: mvpTransform,
                    u_normTransform: normTransform,
                };
                twgl.setUniforms(programInfo, transforms);
                // draw a cube
                twgl.drawBufferInfo(gl, bufferInfo);
            }

            if (player) {
                var pos = [player.x, player.y, player.z];
                var scale = 0.7 + 0.2 * Math.sin(8.6 * time);
                mat4.fromRotationTranslationScale(mTransform, [0, 0, 0, 1], pos, [scale, scale, scale]);
                mat4.invert(normTransform, mTransform);
                mat4.transpose(normTransform, normTransform);
                mat4.multiply(mvpTransform, vpTransform, mTransform);
                // send transformation matrices
                var transforms = {
                    u_mTransform: mTransform,
                    u_mvpTransform: mvpTransform,
                    u_normTransform: normTransform,
                };
                twgl.setUniforms(programInfo, transforms);
                // draw a cube
                twgl.drawBufferInfo(gl, bufferInfo);
            }
        }
        requestAnimationFrame(render); // again, again!
    }

    this.canvas = canvas;

    // get this party started
    requestAnimationFrame(render);
}
