/**
 * This class manages all the states of the scene.
 * It's has control over every meshes that are created implicitly (grid and direction axis) or explicitly by the user.
 * The camera and camera controller are also managed by this class
 * 
 */
class SceneManager {

    /**
     * Creates the camera, camera controller, the meshes for the base grid and directional axis
     */
    constructor () {

        // Create and position main camera in world space
        this.mainCamera = new Camera(projectionEnum.PERSPECTIVE);
        this.mainCamera.transform.position = [0, 0, 20];
        this.mainCamera.transform.rotation = [-20, 0, 0];
        this.mainCamera.updateViewMatrix();
        
        // Create the camera controller
        this.cameraController = new CameraController(gl, this.mainCamera);

        // Create the grid of the scene
        this.sceneBaseGrid = new Grid(10, 20);
        this.sceneBaseGrid.model.setRenderPrimitive(gl.LINES);

        // Create the directional axes of the scene
        this.sceneDirectionalAxis = this.createDirectionalAxis();

        /** 
         * All meshes (instances of RawModel) have a state. A state is the collection of all the configurations of an object at a given time.
         * This is the list of meshes explicitly created by the user (it doesn't include the camera, the basegrid and the directional axis)
         * It stores the current state of each mesh.
         * Each mesh is indexed by an unique ID number generated during its creation
         * 
         * Use an object, as people are saying. However, note that you can not have integer keys. JavaScript will convert the integer to a string. The following outputs 20, not undefined:

            var test = {}
            test[2300] = 20;
            console.log(test["2300"]);
        */
        this.sceneMeshList = {}; // associative array! of integer keys

        // apenas um objecto pode ser selecionado de cada vez
        // RawModel reference
        this.currentlySelectedObject = null;

        /**
         * List of all shader programs in the scene
         */
        this.sceneShaderProgramList = {};
       
        this.configureBaseGridForRendering();

    }

    /**
     * Creates the direction axis of the scene and configures it for rendering
     * Returns a RawModel instance
     */
    createDirectionalAxis() {
        /* ["a_vertexPosition", "a_vertexColor"] - o 1º é obrigatoriamente o nome da vertex position variable,
         e o 2º é obrig. o nome do vertex color variable */
        let vertexShader = new Shader(gl.VERTEX_SHADER, vertexShaderText07, ["a_vertexPosition", "a_colorCoord"], ["u_modelMatrix", "u_viewMatrix", "u_projectionMatrix"]);
        
        let fragmentShader = new Shader(gl.FRAGMENT_SHADER, fragmentShaderText, [], []);

        let shID = -1;
        let shName = "axis-sp";

        let shaderProgram = new ShaderProgram(shID, shName, vertexShader, fragmentShader);
    
        let vertices = [
            //Y
            0.0, 1.0, 0.0,
            0.0, 0.0, 0.0,
            //Z
            0.0, 0.0, 1.0,
            0.0, 0.0, 0.0,
            //X
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
            //Center
         ];
    
        let colors = [
             //Y
             0.00,  1.00,  0.00,
             0.00,  1.00,  0.00,
             //Z
             0.00,  0.00,  1.00,
             0.00,  0.00,  1.00,
             //X
             1.00,  0.00,  0.00,
             1.00,  0.00,  0.00
         ];
    
        let textureCoords = [];
        let indices = [];
        let normals = [];
        let meshName = "";  // it doesn't nedd to have a name (it's not going to appear in the scene hierarchy of objects)
        // the grid doesnt need a valid id because it will not be included into the associative array of meshes
        let meshid =  -1;
        let axisMesh = new RawModel(meshid, meshName, vertices, indices, colors, textureCoords, normals);
    
        axisMesh.shaderProgram = shaderProgram;
    
        axisMesh.shaderProgram.useShaderProgram();
    
        axisMesh.addVertexAttrib("a_vertexPosition", axisMesh.posVBO, 3);
        axisMesh.addVertexAttrib("a_colorCoord", axisMesh.colorVBO, 3);
        axisMesh.setRenderPrimitive(gl.LINES);
    
        // chamar dps do useShaderProgram()
        // bind dos vertex attributes adicionados nas 2 linhas anteriores
        axisMesh.loadVertexAttribToShaderAttribs();
    
        axisMesh.addUniform("u_modelMatrix",  axisMesh.transform.modelMatrix, "mat4");
        axisMesh.addUniform("u_viewMatrix",  this.mainCamera.viewMatrix, "mat4");
        axisMesh.addUniform("u_projectionMatrix", this.mainCamera.projectionMatrix, "mat4");
    
        // chamar dps do useShaderProgram()
        // bind dos uniforms adicionados nas linhas anteriores
        axisMesh.loadUniformsToShaderVariables();

        return axisMesh;
    }

    /**
     * called by the renderingLoop() in the mainWebGL
     */
    renderSceneDirectionalAxis () {
        this.sceneDirectionalAxis.shaderProgram.useShaderProgram();

        this.sceneDirectionalAxis.transform.updateModelMatrix();

        this.sceneDirectionalAxis.changeUniformData("u_modelMatrix", this.sceneDirectionalAxis.transform.modelMatrix);

        // update da view matrix em cada objeto
        // TODOS OS OBJETOS TÊM DE TER UMA VIEW MATRIX
        this.sceneDirectionalAxis.changeUniformData("u_viewMatrix", this.mainCamera.viewMatrix);

        // para os objetos nao ficarem distorcidos ao redimensionar a janela, faz-se o update da projection matrix de cada um
        this.sceneDirectionalAxis.changeUniformData("u_projectionMatrix", this.mainCamera.projectionMatrix);
        
        currentRenderer.setCurrentPrimitive(this.sceneDirectionalAxis.renderPrimitive);

        currentRenderer.drawScene(this.sceneDirectionalAxis);
    }

    /**
     *  Configure grid for rendering
     *  squareLength: comprimento dos lados das quadriculas da grelha base do software de modelação
     *  nlines: numero de linhas horizontais (ou verticais) acima ou abaixo (à esquerda ou à direita dos eixos)
     */
    configureBaseGridForRendering() {

        let vertexShader = new Shader(gl.VERTEX_SHADER, basegrid_vshader, ["a_vertexPosition"], ["u_viewMatrix", "u_projectionMatrix", "u_modelMatrix", "u_color"]);
        let fragmentShader = new Shader(gl.FRAGMENT_SHADER, basegrid_fshader, [], []);

        //let shaderProgramID = this.getRndShaderProgramID();
        let shaderProgramID = -4;
        let shaderProgram = new ShaderProgram(shaderProgramID, "shader program base grid", vertexShader, fragmentShader);

        /* Definition of all grid lines except those at the middle */

        // sManager.sceneShaderProgramList[shaderProgramID.toString()] = shaderProgram;

        this.sceneBaseGrid.model.shaderProgram = shaderProgram;

        this.sceneBaseGrid.model.shaderProgram.useShaderProgram();

        this.sceneBaseGrid.model.addVertexAttrib("a_vertexPosition", this.sceneBaseGrid.model.posVBO, 3);

        this.sceneBaseGrid.model.loadVertexAttribToShaderAttribs();

        this.sceneBaseGrid.model.addUniform("u_modelMatrix",  this.sceneBaseGrid.model.transform.modelMatrix, "mat4");
        this.sceneBaseGrid.model.addUniform("u_viewMatrix",  this.mainCamera.viewMatrix, "mat4");
        this.sceneBaseGrid.model.addUniform("u_projectionMatrix",  this.mainCamera.projectionMatrix, "mat4");
    
        this.sceneBaseGrid.model.addUniform("u_color", vec4(0.5,0.5,0.5,1), "vec4");        // grid colour

        // chamar dps do useShaderProgram()
        // bind dos uniforms adicionados nas linhas anteriores
        this.sceneBaseGrid.model.loadUniformsToShaderVariables();

        /* Definition of the 2 grid lines at the middle */

        //Lihas do meio a preto -> usa o mesmo shader program

        this.sceneBaseGrid.model2.shaderProgram = shaderProgram;

        this.sceneBaseGrid.model2.shaderProgram.useShaderProgram();

        this.sceneBaseGrid.model2.addVertexAttrib("a_vertexPosition", this.sceneBaseGrid.model2.posVBO, 3);

        this.sceneBaseGrid.model2.loadVertexAttribToShaderAttribs();

        this.sceneBaseGrid.model2.addUniform("u_modelMatrix",  this.sceneBaseGrid.model2.transform.modelMatrix, "mat4");
        this.sceneBaseGrid.model2.addUniform("u_viewMatrix",  this.mainCamera.viewMatrix, "mat4");
        this.sceneBaseGrid.model2.addUniform("u_projectionMatrix",  this.mainCamera.projectionMatrix, "mat4");
        this.sceneBaseGrid.model2.addUniform("u_color", vec4(0,0,0,1), "vec4"); // middle grid lines colored black

        this.sceneBaseGrid.model2.setRenderPrimitive(gl.LINES);

        // chamar dps do useShaderProgram()
        // bind dos uniforms adicionados nas linhas anteriores
        this.sceneBaseGrid.model2.loadUniformsToShaderVariables();
    }

    /**
     * called by the renderingLoop() in the mainWebGL
     */
    renderSceneGrid () {
        // grid 1
        this.sceneBaseGrid.model.shaderProgram.useShaderProgram();

        this.sceneBaseGrid.model.transform.updateModelMatrix();

        this.sceneBaseGrid.model.changeUniformData("u_modelMatrix", this.sceneBaseGrid.model.transform.modelMatrix);

        // update da view matrix em cada objeto
        // TODOS OS OBJETOS TÊM DE TER UMA VIEW MATRIX
        this.sceneBaseGrid.model.changeUniformData("u_viewMatrix", this.mainCamera.viewMatrix);

        // para os objetos nao ficarem distorcidos ao redimensionar a janela, faz-se o update da projection matrix de cada um
        this.sceneBaseGrid.model.changeUniformData("u_projectionMatrix", this.mainCamera.projectionMatrix);
        
        currentRenderer.setCurrentPrimitive(this.sceneBaseGrid.model.renderPrimitive);

        currentRenderer.drawScene(this.sceneBaseGrid.model);

        // grid 2

        this.sceneBaseGrid.model2.shaderProgram.useShaderProgram();

        this.sceneBaseGrid.model2.transform.updateModelMatrix();

        this.sceneBaseGrid.model2.changeUniformData("u_modelMatrix", this.sceneBaseGrid.model2.transform.modelMatrix);

        // update da view matrix em cada objeto
        // TODOS OS OBJETOS TÊM DE TER UMA VIEW MATRIX
        this.sceneBaseGrid.model2.changeUniformData("u_viewMatrix", this.mainCamera.viewMatrix);

        // para os objetos nao ficarem distorcidos ao redimensionar a janela, faz-se o update da projection matrix de cada um
        this.sceneBaseGrid.model2.changeUniformData("u_projectionMatrix", this.mainCamera.projectionMatrix);
        
        currentRenderer.setCurrentPrimitive(this.sceneBaseGrid.model2.renderPrimitive);

        currentRenderer.drawScene(this.sceneBaseGrid.model2);

        
    }
        
    /**
     * return a random number for a mesh ID. 
     * It makes sure that the randomly generated number is unique, avoiding collisions of ids
     */
    getRndMeshID() {
        let randomNumber;
        let min = 0;
        let max = 1000000;
        let flag = true;

        while(flag)
        {
            randomNumber = Math.floor(Math.random()*(max - min + 1)) + min;
            flag = false;

            /* at the beginning ths method is being called inside the SceneManager constructor for the creation of the grid and the directional axis
            * so at this time the sManager is undefined because the constructor hasn't yet returned the new instance. 
            * Because the meshes created in the sManager will not be in the list of meshes, they do not need an id, so a negative id is given to them.
            * So this condition doesn't serve any purpose, just for capturing an eventual arror
            */ 
            if (sManager == undefined || sManager == null)
            {
                console.log("sManager is undefined");
                break;
            }

            for (var key in this.sceneMeshList) {
                if (randomNumber == key)
                {    
                    flag = true;
                    break;
                }
            }
        }
        console.log("random number: " + randomNumber);
        return randomNumber;
    }

    /**
     * return a random number for a shader program ID. 
     * It makes sure that the randomly generated number is unique, avoiding collisions of ids
     */
    getRndShaderProgramID() {
        let randomNumber;
        let min = 0;
        let max = 1000000;
        let flag = true;    // equal to true in order to enter the while loop

        while(flag)
        {
            console.log("hello");
            randomNumber = Math.floor(Math.random()*(max - min + 1)) + min;
            flag = false;   // means that a unique number was found

            /** at the beginning ths method is being called inside the SceneManager constructor for the creation of the grid and the directional axis
             * so at this time the sManager is undefined because the constructor hasn't yet returned the new instance. 
             * Because the meshes created in the sManager will not be in the list of meshes, they do not need an id, so a negative id is given to them.
             * So this condition doesn't serve any purpose, just for capturing an eventual arror
             */ 
            if (sManager == undefined || sManager == null)
            {
                console.log("sManager is undefined");
                break;
            }

            for (var key in this.sceneShaderProgramList) {
                if (randomNumber == key)
                {    
                    flag = true;    // means that the random number calculated in this iteration is already in use => do another iteration
                    break;
                }
            }
        }
        console.log("random number: " + randomNumber);
        return randomNumber;
    }
}


