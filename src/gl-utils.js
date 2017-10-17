function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource) {
    // create, upload, and compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // link the shaders into a program
    return createProgram(gl, vertexShader, fragmentShader);
}

function resize(canvas) {
    // cookup the size the browser is displaying the canvas
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // check if the canvas is not the same size
    if (canvas.width  != displayWidth || canvas.height != displayHeight) {
        // make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}
