/*
    Objeto que representa um shader compilado
*/
class Shader {
    /* @summary configuracao inicial do estado do WebGL
     * @version: 1.0.0
     * @param {type} shaderType: gl.VERTEX_SHADER or gl.FRAGMENT_SHADER; tipo do shader que se pretende criar
     * @param {DOMString} shaderSourceCode: codigo fonte do shader que se pretende criar
     * @param {String[]} inputVariableNamesList: lista de nomes das variaveis/atributos do shader
     *                                           No caso de um vertex shader:
     *                                              - o primeiro elemento é o nome da vertex position variable do shader
     *                                              - o segundo elemento é o nome da vertex color variable do shader
     *                                              - os restantes podem ser uniform's
    */
    constructor(shaderType, shaderSourceCode, vertexAttributeList, uniformList)
    {
        // pointer to shader
        this.shader = gl.createShader(shaderType);
        this.inputVariablesList = vertexAttributeList;
        this.uniformList = uniformList;

        gl.shaderSource(this.shader, shaderSourceCode);

        gl.compileShader(this.shader);

        if ( !gl.getShaderParameter(this.shader, gl.COMPILE_STATUS) )
        {
            var info = gl.getShaderInfoLog(this.shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
    }
}
