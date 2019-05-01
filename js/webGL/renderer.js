/*
    Objeto que representa o estado atual do contexto de renderizacao geral do WebGL
*/
class Renderer {
    /* @summary configuracao inicial do estado do WebGL
     * @version: 1.0.0
     */
    constructor() {
        this.currentPrimitive = gl.TRIANGLES;               // default primitive
        //this._currentCulling;                                // default do OpenGL é disabled
        gl.disable(gl.CULL_FACE);
        //this._currentFaceCulling;                            // default do OpenGL é back face (lado de uma face que irá desaparecer quando tiver virada para a camara)
        gl.cullFace(gl.BACK);									//O default significa se a lado de trás de uma face tiver virado para a camara, este nao ira ser renderizado
		gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.9176,0.9058,0.8627, 1.0);       // default clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawScene (mesh) {

        mesh.loadVertexAttribToShaderAttribs();
        mesh.loadUniformsToShaderVariables();

		if(mesh.usingTexture){
			mesh.prepareTextureBeforeDrawing();
		}

        if (mesh.renderWithIndices) {
            this.drawSceneWithIndices(mesh);
        }
        else {
            this.drawSceneWithoutIndices(mesh);
        }
    }

    drawSceneWithoutIndices (rawModel) {

        // Drawing the contents of the vertex buffer
        gl.drawArrays(this.currentPrimitive, 0, rawModel.elemCount);
    }

    /* @summary: renderizacao da scene
     * @version: 1.0.0
     * @param {RawModel Object} Objeto respetivo ao modelo 3D que se pretende renderizar
    */
    drawSceneWithIndices (rawModel) {

        bindIndexBuffer(rawModel.indicesArray); // WARNING: por testar

        gl.drawElements(this.currentPrimitive, rawModel.elemCount, gl.UNSIGNED_SHORT, 0);
    }

    /* @summary: configurar a clear color
     * @version: 1.0.0
     * @param {GLclampf} red: intervalo [0, 1]
     * @param {GLclampf} green: intervalo [0, 1]
     * @param {GLclampf} blue: intervalo [0, 1]
     * @param {GLclampf} alpha: intervalo [0, 1]
    */
    setClearColor(r, g, b, a) {
        if ((r >= 0.0 && r <= 1.0) && (g >= 0.0 && g <= 1.0) && (b >= 0.0 && b <= 1.0) && (a >= 0.0 && a <= 1.0))
            gl.clearColor(r, g, b, a);
        else
            alert("ERROR: Color values need to be in the range [0, 1]");
    }

    /* @summary: configurar a primitiva que o webgl deve renderizar
     * @version: 1.0.0
     * @param {GLenum} primitive: primitiva a ser renderizada
    */
    setCurrentPrimitive(primitive) {
        if (primitive === gl.LINES || primitive === gl.LINE_LOOP || primitive === gl.LINE_STRIP ||
                primitive === gl.TRIANGLES || primitive === gl.TRIANGLE_STRIP || primitive === gl.TRIANGLE_FAN || primitive === gl.POINTS)
            this.currentPrimitive = primitive;
        else
            alert("ERROR: Invalid primitive!");
    }
}
