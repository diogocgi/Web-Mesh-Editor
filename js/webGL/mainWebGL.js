"use strict"

/**
 * Global variables declarations
 */
var canvas;             // webgl canvas
var gl = null;          // webgl context
var currentRenderer;    // renderer that is currently being used
var rLoop;              // render loop for defining framerate
var sManager;           // SceneManager instance
var historyManager;     // Manages undo and redo operations

// start program
runWebGL();

/**
 * Entry point (main) function. 
 */
function runWebGL()
{
    canvas = document.getElementById("canvas");
    
    // get webgl context
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (canvas != null)
    {
        // fit canvas to the screen space available
        fitToContainer();

        // object initialization
        currentRenderer = new Renderer();
        sManager        = new SceneManager();
        historyManager  = new HistoryManager();

        /**
         * Start the programs main loop of execution
         * Assign the rendering loop callback function and specify the framerate / call frequency
         */
        rLoop = new RenderLoop(renderingLoop, 60).start();  // 60 fps

        // create and configure base meshes to be rendered
        configInitialMeshesToBeRendered();

        // initially no meshes are selected, so the transformation textboxes are disabled
        disableTransformationObjectTextBoxes();

		setEventListeners();
    }
    else
    {
        alert("This broswer doesn't support WebGL");
    }
}

/**
 * TEST FUNCTION
 * Function to create an example meshes in the scene.
 */
function configInitialMeshesToBeRendered() {
    // render cube
	testRendering();
}

/**
 * Rendering loop (called each frame).
 * It's the callback function that it's called by the renderLoop object.
 */
function renderingLoop() {
    /**
     * Update camera view matrix, according to the position of the main camera and its rotation vectors
     * It's important to update the view matrix before drawing mesh
     */
    sManager.mainCamera.updateViewMatrix();

    /**
     * Clearing color buffer (rgba buffers) with the background color.
     * Clear every frame before any drawing
     */ 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // render the grid of the scene
    sManager.renderSceneGrid();

    // render scene directional axis
    sManager.renderSceneDirectionalAxis();
    
    // render every mesh in the sceneMeshList
    for (var key in sManager.sceneMeshList) {
        /**
         * each RawModel/mesh has a ShaderProgram associated with it.
         * This allows for the application of different shaders on different meshes
         */
        sManager.sceneMeshList[key].shaderProgram.useShaderProgram();

        // update RawModel/mesh position in world space.
        sManager.sceneMeshList[key].transform.updateModelMatrix();

        // update the model matrix of the RawModel which is an input to the vertex shader: uniform with the name "u_modelMatrix"
        sManager.sceneMeshList[key].changeUniformData("u_modelMatrix", sManager.sceneMeshList[key].transform.modelMatrix);

        // update the view matrix of the RawModel, which is an input to the vertex shader: uniform with the name "u_viewMatrix"
        sManager.sceneMeshList[key].changeUniformData("u_viewMatrix", sManager.mainCamera.viewMatrix);

        // update the projection matrix, which is an input to the vertex shader:uniform with the name "u_projectionMatrix"
        sManager.sceneMeshList[key].changeUniformData("u_projectionMatrix", sManager.mainCamera.projectionMatrix);
        
        // set the primitive for the rendering of the RawModel
        currentRenderer.setCurrentPrimitive(sManager.sceneMeshList[key].renderPrimitive);

        // draw RawModel into the scene
        currentRenderer.drawScene(sManager.sceneMeshList[key]);
    }
}

/**
 * For rendering the first cube in the scene
 */
function testRendering() {
    /**
     * Note: To create a new Shader object, the list of vertex attributes has to have as the:
     *           - first element, the name of the vertex position attribute
     *           - second element, the name of the vertex color attribute
     *       -> For example: ["a_vertexPosition", "a_vertexColor"]
     */

    // create a vertex shader
    let vertexShader = new Shader(gl.VERTEX_SHADER, baseMesh_vshader, ["a_vertexPosition"], ["u_modelMatrix", "u_viewMatrix", "u_projectionMatrix"]);

    // create fragment shader
    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, baseMesh_fshader, [], ["u_color"]);

    // get a new shader program id
    let spID = sManager.getRndShaderProgramID();

    // create a shader program with the previosly created vertex and fragment shader
    let shaderProgram = new ShaderProgram(spID, "test shader", vertexShader, fragmentShader);

    /**
     * Adds the ShaderProgram to a list of referencies to all created ShaderPrograms.
     * For now it doesn't have any purpose
     */
    sManager.sceneShaderProgramList[spID.toString()] = shaderProgram;

    // 3d model of a cube
	let vertices = [
        // FRONT FACE
        -0.25, -0.25,  0.25,
         0.25, -0.25,  0.25,
         0.25,  0.25,  0.25,

         0.25,  0.25,  0.25,
        -0.25,  0.25,  0.25,
        -0.25, -0.25,  0.25,

        // TOP FACE
        -0.25,  0.25,  0.25,
         0.25,  0.25,  0.25,
         0.25,  0.25, -0.25,

         0.25,  0.25, -0.25,
        -0.25,  0.25, -0.25,
        -0.25,  0.25,  0.25,

        // BOTTOM FACE
        -0.25, -0.25, -0.25,
         0.25, -0.25, -0.25,
         0.25, -0.25,  0.25,

         0.25, -0.25,  0.25,
        -0.25, -0.25,  0.25,
        -0.25, -0.25, -0.25,

        // LEFT FACE
        -0.25,  0.25,  0.25,
        -0.25, -0.25, -0.25,
        -0.25, -0.25,  0.25,

        -0.25,  0.25,  0.25,
        -0.25,  0.25, -0.25,
        -0.25, -0.25, -0.25,

        // RIGHT FACE
         0.25,  0.25, -0.25,
         0.25, -0.25,  0.25,
         0.25, -0.25, -0.25,

         0.25,  0.25, -0.25,
         0.25,  0.25,  0.25,
         0.25, -0.25,  0.25,

        // BACK FACE
        -0.25,  0.25, -0.25,
         0.25, -0.25, -0.25,
        -0.25, -0.25, -0.25,

        -0.25,  0.25, -0.25,
         0.25,  0.25, -0.25,
         0.25, -0.25, -0.25
    ];
    let colors = [];
    let textureCoords = [];
    let indices = [];
	let normals = [];

    /** 
     * Name that appears in the inspector bar
     * The name can be repeated because the RawModels are identified by an id
     */
    let meshName = "cube";

    // generate random id for the RawModel
    let meshid =  sManager.getRndMeshID();

    // create RawModel
    let cubeMesh = new RawModel(meshid, meshName, vertices, indices, colors);

    // give a reference of the shader program (being used by the raw model) to the raw model 
    cubeMesh.shaderProgram = shaderProgram;

    /** RawModel configuration in order to be renderable in the renderingLoop() function **/

    cubeMesh.shaderProgram.useShaderProgram();

    cubeMesh.addVertexAttrib("a_vertexPosition", cubeMesh.posVBO, 3);

    /**
     * Call after useShaderProgram()
     * Binding the vertex attributes added in the previous lines
     */
    cubeMesh.loadVertexAttribToShaderAttribs();

    cubeMesh.addUniform("u_modelMatrix",  cubeMesh.transform.modelMatrix, "mat4");
    cubeMesh.addUniform("u_viewMatrix",  sManager.mainCamera.viewMatrix, "mat4");
    cubeMesh.addUniform("u_projectionMatrix",  sManager.mainCamera.projectionMatrix, "mat4");
    cubeMesh.addUniform("u_color",  [0.5, 0.5, 0.5, 1], "vec4");    // configure the mesh color: grey

    /**
     * Call after useShaderProgram()
     * Binding the uniforms added in the previous lines
     */
    cubeMesh.loadUniformsToShaderVariables();

    /** 
     * Put the cube in the RawModel list of the scene
     * This cube is identified by a key, which is the cubes RawModel id
     */
    sManager.sceneMeshList[meshid.toString()] = cubeMesh;

    // put the model on the scene hierarchy (inspector)
    updateSceneHierarchy(cubeMesh);
}

/**
 * Adapt canvas and the cameras aspect ratio when the screen is resized
 */
function screenResizeAdaptation() {
    // update canvas size
    fitToContainer();

    // update do aspect ratio of the camera
    sManager.mainCamera.updateCameraAspectRatio();
}

/**
 * Fill entire div with the canvas and resize according to the window size
*/
function fitToContainer() {
    
    canvas.style.width='100%';
    canvas.style.height='100%';

    //let width = canvas.clientWidth;
    //let height = canvas.clientHeight;

    let width = window.innerWidth;
    let height = window.innerHeight;

    if (canvas.width != width || canvas.height != height)
    {
        canvas.width = width;
        canvas.height = height;
    }

    console.log("canvas height: " + gl.canvas.height);

    // Set the viewport to be the size of the canvas's drawingBuffer.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

/**
 * Event Listeners configuration
 */
function setEventListeners(){
    
     // add event listeners to the undo and redo buttons, because th emethods are only accessible through an instance of the SceneManager class
     document.getElementById("undo-menu-btn").addEventListener("click", function() { 
        historyManager.undoMeshState()
    });

    document.getElementById("redo-menu-btn").addEventListener("click", function() 
    { 
        historyManager.redoMeshState() 
    });

    /* Object transformation textbox listeners */
    document.querySelector("#x-translate").addEventListener("input", function () {
        handleModelTransformation("x-translate");
    });

    document.querySelector("#y-translate").addEventListener("input", function () {
        handleModelTransformation("y-translate");
    });

    document.querySelector("#z-translate").addEventListener("input", function () {
        handleModelTransformation("z-translate");
    });

    document.querySelector("#x-rotate").addEventListener("input", function () {
        handleModelTransformation("x-rotate");
    });

    document.querySelector("#y-rotate").addEventListener("input", function () {
        handleModelTransformation("y-rotate");
    });

    document.querySelector("#z-rotate").addEventListener("input", function () {
        handleModelTransformation("z-rotate");
    });

    document.querySelector("#x-scale").addEventListener("input", function () {
        handleModelTransformation("x-scale");
    });

    document.querySelector("#y-scale").addEventListener("input", function () {
        handleModelTransformation("y-scale");
    });

    document.querySelector("#z-scale").addEventListener("input", function () {
        handleModelTransformation("z-scale");
    });
   
    document.getElementById("lock-transformations-menu-btn").addEventListener("click", function()  {
       
        if (sManager.currentlySelectedObject != null)
        {
            console.log(sManager.currentlySelectedObject.vertexPosArray);
            // guardar o estado atual antes do lock transformation
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.LOCK_TRANSFORMATION, [sManager.currentlySelectedObject.vertexPosArray.slice(), 
                sManager.currentlySelectedObject.transform.position.slice(), sManager.currentlySelectedObject.transform.rotation.slice(), sManager.currentlySelectedObject.transform.scale.slice()]);

            console.log(sManager.currentlySelectedObject.vertexPosArray);

            /**
             * update vertices positions of the mesh (only the vectors of position rotation and scale of the mesh are updated regurlarly with each transformation, and 
             * then applied to the original list of vertices through the modalMatrix)
             */
            sManager.currentlySelectedObject.updateVertexPositionArray();

            // reset the model matrix and the position, rotation and scale vectors!
            sManager.currentlySelectedObject.transform.resetModelMatrix();

            // update the transformation text fields
            updateTransformationValues(sManager.currentlySelectedObject);
        }
        else
        {
            window.alert("No model is currently selected...");
        }
    });

     /** NOTE: a informaçao sobre a translacao, rotacao e escalamento apenas estao presentes nos ficheiros que guardam informação sobre a scene toda, 
         ou seja, num formato que é proprio do programa! Quando se faz export de um modelo, o ficheiro resultante nao vai ter os dados da translacao,
         rotacao e nem de tranalacao, mas apenas da posicao dos vertices sem ter em conta as transformaçoes atuais do modelo (ou seja, admite que 
         a translacao, rotacao e escalamento estao todos a 0.) Se quisermos incluir a informacao da translacao, rotacao e/ou escalamente nos vertices do
         modelo 3d, é necessario fazer FREEZE TRANSFORMATION, o que irá aplicar as transformacoes aos vertices do modelo antes de estes serem armazenados
         no ficheiro => após o FREEZE TRANSFORMATION; as transoformacoes do modelo sao repostas a zero, mas o objeto continua a estar posicionado, rodado e 
         escalado pois as transformaçoes foram aplicadas diretamente aos seus vertices (e nao apenas temporariamente aplicadas aos vertices, no gpu, usando a
         model matrix.)
      */
    // Export selected model
    document.getElementById("export-model-menu-btn").onclick = function(){

        if (sManager.currentlySelectedObject != null)
        {
            let allModelInfo = "";

            // tmp variables
            let vertices= "";
            let index= "";
            let color= "";
            let normals= "";
            
            // name that identifies the next set of data to a particular mesh
            //allModelInfo += sManager.currentlySelectedObject.name + "\n";

            console.log("----length: " + sManager.currentlySelectedObject.vertexPosArray.length);

            console.log(sManager.currentlySelectedObject.vertexPosArray);

            for(let i=0; i<sManager.currentlySelectedObject.vertexPosArray.length;){
                vertices += "v "+sManager.currentlySelectedObject.vertexPosArray[i];
                vertices += " "+sManager.currentlySelectedObject.vertexPosArray[i+1];
                vertices += " "+sManager.currentlySelectedObject.vertexPosArray[i+2]+"\n";
                i=i+3;
            }

            if(sManager.currentlySelectedObject.vertexNormalArray != null){

                for(let i=0; i<sManager.currentlySelectedObject.vertexNormalArray.length;){
                    normals += "vn "+sManager.currentlySelectedObject.vertexNormalArray[i];
                    normals += " "+sManager.currentlySelectedObject.vertexNormalArray[i+1];
                    normals += " "+sManager.currentlySelectedObject.vertexNormalArray[i+2]+"\n";
                    i=i+3;
                }
            }

            if(sManager.currentlySelectedObject.vertexColorArray != null){

                for(let i=0; i<sManager.currentlySelectedObject.vertexColorArray.length;){
                    color += "c "+sManager.currentlySelectedObject.vertexColorArray[i];
                    color += " "+sManager.currentlySelectedObject.vertexColorArray[i+1];
                    color += " "+sManager.currentlySelectedObject.vertexColorArray[i+2]+"\n";
                    i=i+3;
                }
            }

            if(sManager.currentlySelectedObject.indicesArray != null){

                for(let i=0; i<sManager.currentlySelectedObject.indicesArray.length;){
                    index += "f "+sManager.currentlySelectedObject.indicesArray[i];
                    index += " "+sManager.currentlySelectedObject.indicesArray[i+1];
                    index += " "+sManager.currentlySelectedObject.indicesArray[i+2]+"\n";
                    i=i+3;
                }
            }
            
            allModelInfo += vertices + normals + color + index + "\n";    
            
            // reset tmp variables
            vertices= "";
            index= "";
            color= "";
            normals= "";

            //let total = vertices + normals + color + index;
            //let name = "scene1" + ".obj";
            let name = sManager.currentlySelectedObject.name  + ".obj";
            download(allModelInfo, name, 'text/plain');
        }
        else
        {
            window.alert("No model is currently selected...");
        }
    }

    /**
     * Import model into the scene
     */

    const realImportModelBtn = document.getElementById("real-import-model-btn");

    document.getElementById("import-model-menu-btn").addEventListener("click", function() {
        realImportModelBtn.click();
    });

    realImportModelBtn.addEventListener("change", function() {

        console.log(realImportModelBtn.value);
        
        let filePath = realImportModelBtn.value;

        let filename = filePath.split(/(\\|\/)/g).pop();
        
        let fileReader = new FileReader();
        
        // called when the load event is fired: when content read with readAsText is available
        fileReader.onload = function() {
            //console.log(this.result);
            let importedModel = parseOBJfile(filename, this.result);

            importModelFromFile(importedModel.name, importedModel.vertices);

            //importModelFromFile();
        }
        
        fileReader.readAsText(this.files[0]);

    });
}

// returns an ImportedModel instance
function parseOBJfile(filename, text)
{
    // como o export é feito para apenas um modelo 3d, o nome do modelo pode ser obtido atraves do nome do ficheiro (e nao atraves da sua inclusao erradamente no ficheiro obj)
    let meshName = filename.split('.')[0];
    let vertices = [];

    var lines = text.split('\n');
    for(var i = 0;i < lines.length;i++){
        if (lines[i].charAt(0) == "v")
        {
            let vertexPos = lines[i].split(' ');
            //console.log(vertexPos);
            vertices.push(parseFloat(vertexPos[1]));
            vertices.push(parseFloat(vertexPos[2]));
            vertices.push(parseFloat(vertexPos[3]));
        }
    }

    return new ImportedModel(meshName, vertices);
}

function importModelFromFile(meshName, vertices) {

    let vertexShader = new Shader(gl.VERTEX_SHADER, baseMesh_vshader, ["a_vertexPosition"], ["u_modelMatrix", "u_viewMatrix", "u_projectionMatrix"]);

    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, baseMesh_fshader, [], ["u_color"]);

    let spID = sManager.getRndShaderProgramID();

    let shaderProgram = new ShaderProgram(spID, "test shader", vertexShader, fragmentShader);

    //currentShaderProgram.push(shaderProgram);
    sManager.sceneShaderProgramList[spID.toString()] = shaderProgram;

    let colors = [];

    let textureCoords = [];

    let indices = [];

	let normals = [];

    let meshid =  sManager.getRndMeshID();

    let cubeMesh = new RawModel(meshid, meshName, vertices, indices, colors);

    cubeMesh.shaderProgram = shaderProgram;

    cubeMesh.shaderProgram.useShaderProgram();

    cubeMesh.addVertexAttrib("a_vertexPosition", cubeMesh.posVBO, 3);

    // chamar dps do useShaderProgram()
    // bind dos vertex attributes adicionados nas 2 linhas anteriores
    cubeMesh.loadVertexAttribToShaderAttribs();

    cubeMesh.addUniform("u_modelMatrix",  cubeMesh.transform.modelMatrix, "mat4");
    cubeMesh.addUniform("u_viewMatrix",  sManager.mainCamera.viewMatrix, "mat4");
    cubeMesh.addUniform("u_projectionMatrix",  sManager.mainCamera.projectionMatrix, "mat4");
    cubeMesh.addUniform("u_color",  [0.5, 0.5, 0.5, 1], "vec4");

    // chamar dps do useShaderProgram()
    // bind dos uniforms adicionados nas linhas anteriores
    cubeMesh.loadUniformsToShaderVariables();

    // colocar o cubo na lista da modelos da scene
    sManager.sceneMeshList[meshid.toString()] = cubeMesh;

    // put the model on the scene hierarchy 
    updateSceneHierarchy(cubeMesh);
}

