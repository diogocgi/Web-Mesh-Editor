/*
    Objeto que representa um shader program
*/
class ShaderProgram {
    /* @summary configuracao do shader program
     * @version: 1.0.0
     * @param {Shader object} vertexShader: objeto que representa o vertex shader a ser associado ao shader program
     * @param {Shader object} fragmentShader: objeto que representa o fragment shader a ser associado ao shader program
    */
    constructor(id, name, vertexShader, fragmentShader)
    {
        this.spID = id;
        this.spName = name;
        this.vertexShader = vertexShader;          // Shader object
        this.fragmentShader = fragmentShader;      // Shader object
        this.shaderProgram = gl.createProgram();

        gl.attachShader(this.shaderProgram, this.vertexShader.shader);
        gl.attachShader(this.shaderProgram, this.fragmentShader.shader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
        {
            let info = gl.getProgramInfoLog(this.shaderProgram);
            throw 'Could not compile WebGL program. \n\n' + info;   // finish program execution
        }
    }

    /* @summary: configurar o shader program para ser usado na proxima renderizacao
     *           Tambem ativa todos os atributos usados pelo vertex shader associado ao shader program
     * @version: 1.0.0
    */
    useShaderProgram() {
        gl.useProgram(this.shaderProgram);
        // ativar todos os vertex attributes, q contém um tipo de atributo, utilizados pelos shaders associados a este shader program
        for (let i = 0; i < this.vertexShader.inputVariablesList.length; i++){
            gl.enableVertexAttribArray(gl.getAttribLocation(this.shaderProgram, this.vertexShader.inputVariablesList[i]));
		}
    }

    getUniformLocation(uniformName) {
        return gl.getUniformLocation(this.shaderProgram, uniformName);
    }

    // carregar um float num uniform
    loadFloat(uniformName, value) {
        gl.uniform1f(this.getUniformLocation(uniformName), value);
    }
	
	loadInteger(uniformName, value){
		gl.uniform1i(this.getUniformLocation(uniformName),value);
	}

    loadVector2f(uniformName, vector) {
        gl.uniform2f(this.getUniformLocation(uniformName), vector[0], vector[1]);
    }

    /* @summary: carregar um vetor (x, y, z) num uniform
     * @param {Array} vector: [x, y, z]
    */
    loadVector3f(uniformName, vector) {
        gl.uniform3f(this.getUniformLocation(uniformName), vector[0], vector[1], vector[2]);
    }
	
	/* @summary: carregar um vetor (x, y, z) num uniform
     * @param {Array} vector: [x, y, z]
    */
    loadVector4f(uniformName, vector) {
        gl.uniform4f(this.getUniformLocation(uniformName), vector[0], vector[1], vector[2], vector[3]);
    }

    /* @summary carregar um boolean num uniform, mas como no GLSL nao existe o tipo boolean,
                carrega-se um 0 ou um 1
     * @param {Boolean} value
    */
    loadBoolean(uniformName, value) {
        let toLoad = 0;
        if (value)
            toLoad = 1;

        gl.uniform1f(this.getUniformLocation(uniformName), toLoad);
    }

    /* @summary carregar uma 4x4 matriz num uniform
     * @param {String} name of uniform variable
     * @param {} matrix 4x4
    */
    loadMatrix4(uniformName, matrix) {
        gl.uniformMatrix4fv(this.getUniformLocation(uniformName), false, new Float32Array(flatten(matrix)));
    }
}
