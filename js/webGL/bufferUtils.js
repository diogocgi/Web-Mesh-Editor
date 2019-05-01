/* @summary: Criação de um Vertex Buffer Object correspondente a um unico atributo
 * @version: 1.0.0
 * @param {gl.FLOAT[]} attributeArray: array com um dos atributos dos vertices do modelo (ex: array de posicoes)
 * @return {WebGLBuffer}: retorna o ponteiro para o buffer criado (o buffer foi criado na memoria do GPU)
 */
function createVBO(attributeArray) {
    let bufferPt = gl.createBuffer();

    /* Bind do VBO criado no contexto do webgl */
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPt);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeArray), gl.STATIC_DRAW);

    return bufferPt;
}

function bindIndexBuffer(indicesArray) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}

/* @summary: Criação do VBO respetivo ao index buffer
 * @version: 1.0.0
 * @param {gl.UNSIGNED_SHORT[]} indicesArray: array com as indices para os vertices do modelo
 * @return {WebGLBuffer}: retorna o ponteiro para o buffer criado
 */
function createIndicesBuffer(indicesArray) {
    let indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesArray), gl.STATIC_DRAW);

    return indexBuffer;
}
