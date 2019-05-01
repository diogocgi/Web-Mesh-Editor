/*
    Objeto que representa um modelo 3D
*/
class RawModel {
    /* @summary: Para criar um modelo, é necessario especificar o array de posicoes, array de indices, array de cores dos vertices
     * @version: 1.0.0
     * @param {gl.FLOAT[]} vertexPosArray: array com as coordenadas dos vertices do modelo
     * @param {gl.UNSIGNED_SHORT[]} indicesArray: array com as indices para os vertices do modelo
     * @param {gl.FLOAT[]} vertexColorArray: array com as cores rgb para os vertices do modelo
     */
    constructor (meshID, meshName, vertexPosArray, indicesArray, vertexColorArray, textCoordArray, vertexNormalArray ) {
        this.id = meshID; // uniquely identifies the mesh, it's randomly generated
        this.name = meshName; // name of the mesh that is displayed in the scene hierarchy
        this.vertexPosArray = vertexPosArray;
        this.indicesArray = null;
        this.vertexColorArray = null;
		this.vertexNormalArray = null;
		this.normalsVBO = null;
        this.indexVBO = null;
		this.textCoordArray = null;
		this.textCoordVBO = null;
		
		//this.vertexPointPositions = null;
		
        this.renderPrimitive = gl.TRIANGLES; // primitiva de renderizaçao default
		
		this.texture = null;
		this.usingTexture = false;
		this.textureBindPoint = null;		// ex: gl.TEXTURE_2D
		this.texturedUnitType = null;		// ex: gl.TEXTURE0
		this.textureUnit = -1;				// valores validos : { 0, 1, 2 ,3, ...}
        this.samplerName = null;

        // se o array de indices for vazio
        if (indicesArray === [] || indicesArray.length === 0) {
            this.renderWithIndices = false;
            this.elemCount = this.vertexPosArray.length/3;
        }
        else {
            this.renderWithIndices = true;
            this.elemCount = this.indicesArray.length;
            this.indexVBO = createIndicesBuffer(indicesArray);
        }

        // criaçao dos vertex buffer objects
        this.posVBO = createVBO(vertexPosArray);               // reference to the vbo holding the vertex positions of the model
		
		if(vertexNormalArray != undefined && vertexNormalArray.length !==0){
			this.vertexNormalArray = vertexNormalArray;
			this.normalsVBO = createVBO(vertexNormalArray);
		}
		
		if(vertexColorArray != undefined && vertexColorArray.length !==0){
			this.vertexColorArray = vertexColorArray;
			this.colorVBO = createVBO(vertexColorArray);           // reference to the vbo holding the vertex colors of the model
		}

		if(textCoordArray != undefined && textCoordArray.length !== 0){
			this.textCoordArray = textCoordArray;
			this.textCoordVBO = createVBO(textCoordArray);
		}

        this.transform = new Transform();

        this.shaderProgram = null;  // Object da class ShaderProgram! Nao é o shaderProgram do tipo WebGLProgram -> shaderProgram.shaderProgram
        this.vAttribDictionary = {};    // exemplo: vAttribDictionary["a_vertexPosition"] = [posVBO, 3];
        this.uniformDictionary = {};    // exemplo: uniformDictionary["u_modelMatrix"] = [modelMatrix, "mat4"];
		
		//this.vertexPointPositions=[];
		

	}
	
	updateVertexVBO() {
        this.posVBO = createVBO(this.vertexPosArray);
        this.vAttribDictionary["a_vertexPosition"][0] = this.posVBO;
    }
	
    // configurar o tipo de primitiva com a qual se deve renderizar o modelo
    setRenderPrimitive(primitiveType) {
        this.renderPrimitive = primitiveType;
    }

    setShaderProgram (shaderProgram) {
        this.shaderProgram = shaderProgram;
    }

    addVertexAttrib(attribName, vertexBufferPt, numAttribComponents) {
        this.vAttribDictionary[attribName] = [vertexBufferPt, numAttribComponents];
    }

    addUniform(uniformName, uniformValue, uniformType) {
        this.uniformDictionary[uniformName] = [uniformValue, uniformType];
    }

    changeUniformData(uniformName, newValue) {
        this.uniformDictionary[uniformName][0] = newValue;
    }

    /* binds buffer and matrices to vertex input variables attribute and uniform
     * Esta funcao assume que:
     *      - para vertex attributes, a location=0 é para o atributo a_vertexPosition
                                      a location=1 é para o atributo a_vertexColor
                                      (TODO: preencher com o resto)
            - para uniforms: a localizaçao dos uniforms é separada das localizacoes usadas para os vertex attributes,
                            logo também começa em 0.
                                      a location=0 corresponde ao uniform u_MVMatrix
    */
    loadVertexAttribToShaderAttribs() {

        for (var key in this.vAttribDictionary)
        {
            this.bindBufferToVertexAttrib(this.vAttribDictionary[key][0],  key, this.vAttribDictionary[key][1]);
            // bindBufferToVertexAttrib(mesh.posVBO, shaderProgram.shaderProgram, "a_vertexPosition", 3);
        }
    }

    loadUniformsToShaderVariables() {

        for (var key in this.uniformDictionary)
        {
            switch(this.uniformDictionary[key][1]) {
                case "mat4":
                    this.shaderProgram.loadMatrix4(key, this.uniformDictionary[key][0])
                    break;
                case "float":
                    this.shaderProgram.loadFloat(key, this.uniformDictionary[key][0]);
                    break;
                case "boolean":
                    this.shaderProgram.loadBoolean(key, this.uniformDictionary[key][0]);
                    break;
                case "vec3":
                    this.shaderProgram.loadVector3f(key, this.uniformDictionary[key][0]);
                    break;
				case "vec4":
                    this.shaderProgram.loadVector4f(key, this.uniformDictionary[key][0]);
                    break;
                case "vec2":
                    this.shaderProgram.loadVector2f(key, this.uniformDictionary[key][0]);
                    break;
				case "integer":
					this.shaderProgram.loadInteger(key, this.uniformDictionary[key][0]);
					break;
                default:
					console.log(this.uniformDictionary[key][1]);
                    console.log("ERROR: Invalid uniform type. Perhaps it's something to add in the future");
                    break;

            }
        }
    }

	prepareTextureBeforeDrawing(){
		// Tell WebGL we want to affect texture unit 0
		//console.log(this.textureUnitType);
		gl.activeTexture(this.textureUnitType);

		// Bind the texture to texture unit 0
		gl.bindTexture(this.textureBindPoint, this.texture);

		// Tell the shader we bound the texture to texture unit 0
		// "u_texture" = sampler2D uniform name; #hardcoded
		gl.uniform1i(this.shaderProgram.getUniformLocation(this.samplerName), this.textureUnit);
	}

	configureTexture(texture, usingTexture, textureBindPoint, textureUnitType, textureUnit, samplerName){
		this.texture = texture;
		this.usingTexture = usingTexture;
		this.textureBindPoint = textureBindPoint;
		this.textureUnitType = textureUnitType;
		this.textureUnit = textureUnit;
        this.samplerName = samplerName;
	}

    /* @summary: O gl.vertexAttribPointer() faz o binding da localizacao de um vertex attribute com o buffer bound ao target gl.ARRAY_BUFFER
     * @version: 1.0.0
     * @param {WebGLBuffer} bufferPt: ponteiro para o buffer que vai ser ligado à localizaçao do vertex attribute
     * @param {WebGLProgram} shaderProgram: para obter a localizacao do vertex attribute que se pretende ligar ao buffer bufferPt
     * @param {String} inputVariableName: nome do vertex atribute que se pretende ligar ao buffer bufferPt
     * @param {Number} numAttribComponents: numero de componentes do atributo em questao
     */
    bindBufferToVertexAttrib(bufferPt, inputVariableName, numAttribComponents) {
        // IMPORTANTE: o buffer respetivo tem de estar atualmente bound ao gl.ARRAYBUFFER target!!!!!
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferPt);

        let vertexAttribLocation = gl.getAttribLocation(this.shaderProgram.shaderProgram, inputVariableName);

        // esta funçao utiliza o buffer bound ao target gl.ARRAY_BUFFER
        gl.vertexAttribPointer(vertexAttribLocation, numAttribComponents, gl.FLOAT, false, 0, 0);
    }

    /**
     * Called before saving the scene
     */
    updateVertexPositionArray() {
        console.log("before update:" + this.vertexPosArray);
        for (var i = 0; i < this.vertexPosArray.length;)
        {
            console.log("------- vertex " + i);

            //console.log(this.transform.modelMatrix);
            let vertexPos = multMat4WithVec4(this.transform.modelMatrix, vec4(this.vertexPosArray[i], this.vertexPosArray[i+1], this.vertexPosArray[i+2]));
        
           // console.log(vertexPos);
            this.vertexPosArray[i] = vertexPos[0];
            this.vertexPosArray[i+1] = vertexPos[1];
            this.vertexPosArray[i+2] = vertexPos[2];
            
            //console.log(this.vertexPosArray[i]);

            i += 3;
        }
        console.log("after update:" + this.vertexPosArray);

        this.updateVertexVBO();
    }

}
	