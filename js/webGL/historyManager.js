/**
 * Manages the undo and redo operations
 */

 class HistoryManager {

    constructor ()
    {
        this.undoBuffer = [];

        this.redoBuffer = [];

        document.getElementById('redo-menu-btn').classList.add('undo_redo_btn_isDisabled');
        document.getElementById('undo-menu-btn').classList.add('undo_redo_btn_isDisabled');
    }

    /**
     * Called by the transformation text fields, and not called by functions within this class
     * @param {*} meshID 
     * @param {*} meshProperty 
     * @param {*} propertyValue 
     */
    backupCurrentPropertyState(meshID, meshProperty, propertyValue) {
        console.log("value: " + propertyValue);
        let propertyState = new MeshPropertyState(meshID, meshProperty, propertyValue);

        console.log("propertyState: " + propertyState.propertyPreviousValue);
        let nextIndex = this.undoBuffer.length;

        console.log("index: " + nextIndex);

        this.undoBuffer[nextIndex] = propertyState;

        if(this.redoBuffer.length > 0)
        {
            // that means that an alteration was made in between undo and redo operations, so the redoBuffer needs to be cleared
            this.redoBuffer.length = 0;
            document.getElementById('redo-menu-btn').classList.add('undo_redo_btn_isDisabled');
        }

        document.getElementById('undo-menu-btn').classList.remove('undo_redo_btn_isDisabled');
    }

/**
     * This method is called every time the a property of a mesh in altered.
     * It saves the previous property state into the next position of hte currentIndex "pointer", overriding whatever 
     * states there are in the next positions (when a mesh property state alteration was made after several UNDO and REDO operations without 
     * reaching the end of the meshHistoryBuffer). 
     * The arguments allow for the creation of a MeshPropertyStateInstance
     * 
     * @param {*} meshID 
     * @param {*} meshProperty 
     * @param {ARRAYS of numbers} propertyValue: for now only give arrays (not references to arrays), ex: addStateToMeshHistoryBuffer((...), [1, 2, 3])
     */
    addStateToUndoBuffer(meshID, meshProperty, propertyValue) {

        let propertyState = new MeshPropertyState(meshID, meshProperty, propertyValue);

        let nextIndex = this.undoBuffer.length;

        this.undoBuffer[nextIndex] = propertyState;

        document.getElementById('undo-menu-btn').classList.remove('undo_redo_btn_isDisabled');
    }

    removeLatestStateOfUndoBuffer() {
        let latestState = this.undoBuffer.pop();
    }

    /**
     * Adiciona a alteracao mais recente realizada no objeto 
     * Ou seja antes do undo q se está a realizar ocorreu uma alteracao (ex: de uma posicao, rotacao, scaling) e nao um undo ou redo
     * @param {*} meshID 
     * @param {*} meshProperty 
     * @param {*} propertyValue 
     */
    addStateToRedoBuffer(meshID, meshProperty, propertyValue)
    {
        let propertyState = new MeshPropertyState(meshID, meshProperty, propertyValue);

        let nextIndex = this.redoBuffer.length;

        this.redoBuffer[nextIndex] = propertyState;

        document.getElementById('redo-menu-btn').classList.remove('undo_redo_btn_isDisabled');
    }

    removeLatestStateOfRedoBuffer() {
        let latestState = this.redoBuffer.pop();
    }

    /**
     * This is the method called when the undo button is pressed
     */
    undoMeshState () {
        
        if (this.undoBuffer == 0)   // the history buffer is empty or when there are no more undos
        {
            console.log("No more undos are possible...");
            return;
        }      

        console.log("indexa: " + (this.undoBuffer.length-1));

        // mesh property to restore the correspondent mesh with the previous value of the specific property 
        let previousState = this.undoBuffer[this.undoBuffer.length-1];

        console.log("indexa: " + previousState.propertyPreviousValue);

        // affected mesh by the undo operation
        let mesh = sManager.sceneMeshList[previousState.meshID.toString()];   // convert the number meshID into a string to get access to the correspondent element of the associative array

        /* Add current property value to redo buffer */
        // the current value of the property affected by the undo operation needs to be stored
        let propertyValueBeforeUndo = null; 

        switch(previousState.meshPropertyType) {
            case HistoryMeshProperty.POSITION:
                // the slice() operation clones the array and returns a reference to a new array.
                propertyValueBeforeUndo = mesh.transform.position.slice();  // get the current value of the position of the mesh in order to store it in the top of the mesh history buffer
                
                break;
            case HistoryMeshProperty.ROTATION:
                propertyValueBeforeUndo = mesh.transform.rotation.slice();

                break;
            case HistoryMeshProperty.SCALE:
                propertyValueBeforeUndo = mesh.transform.scale.slice();
                
                break;
            case HistoryMeshProperty.LOCK_TRANSFORMATION:
                // property value = vertexPosArray, position, rotation and scale vectors
                console.log("eeeeeeeeeeeeeeeeeeee" + mesh.vertexPosArray);
                propertyValueBeforeUndo = [mesh.vertexPosArray, mesh.transform.position, mesh.transform.rotation, mesh.transform.scale];

                break;
            default:
                console.log("Mesh property type not supported");
        }

        if (propertyValueBeforeUndo != null)
        {
            // store the current property value in the next position in order to be possible to redo (after the undos) until the latest change
            this.addStateToRedoBuffer(mesh.id, previousState.meshPropertyType, propertyValueBeforeUndo);
        }
        else
        {
            console.log("ERROR: invalid property detect when storing a value in the mesh history buffer");
        }

        /* Do the undo operation */
        this.restoreMeshPropertyValue(mesh, previousState);

        this.removeLatestStateOfUndoBuffer();

        if (this.undoBuffer.length == 0)
            document.getElementById('undo-menu-btn').classList.add('undo_redo_btn_isDisabled');
        else
            document.getElementById('undo-menu-btn').classList.remove('undo_redo_btn_isDisabled');


        console.log("undoMeshState(): redoBuffer length = " + this.redoBuffer.length);
        console.log("undoMeshState(): undoBuffer length = " + this.undoBuffer.length);
        
        // update values of the transformation text fields of the sidebar
        updateTransformationValues(mesh);
    }

    /**
     * This method is called in order to change an objects property with the property value specified in the argument
     * @param {RawModel} mesh: object that will have the specified property modified
     * @param {MeshPropertyValue} meshProperty: instance that contains the property value to modify the object with
     */
    restoreMeshPropertyValue(mesh, meshProperty) {
        
        switch(meshProperty.meshPropertyType) {
            case HistoryMeshProperty.POSITION:
                // the slice() operation clones the array and returns a reference to a new array.
                mesh.transform.position = meshProperty.propertyPreviousValue.slice();
                
                break;
            case HistoryMeshProperty.ROTATION:
                mesh.transform.rotation = meshProperty.propertyPreviousValue.slice();

                break;
            case HistoryMeshProperty.SCALE:
                mesh.transform.scale = meshProperty.propertyPreviousValue.slice();
                
                break;
            case HistoryMeshProperty.LOCK_TRANSFORMATION:
                mesh.vertexPosArray = meshProperty.propertyPreviousValue[0].slice();
                mesh.transform.position = meshProperty.propertyPreviousValue[1].slice();
                mesh.transform.rotation = meshProperty.propertyPreviousValue[2].slice();
                mesh.transform.scale = meshProperty.propertyPreviousValue[3].slice();

                sManager.currentlySelectedObject.updateVertexVBO();

                console.log("gggggggg");
                console.log(sManager.currentlySelectedObject.vertexPosArray);
                console.log(meshProperty.propertyPreviousValue[0].slice() );

                // reset the model matrix and the position, rotation and scale vectors!
                sManager.currentlySelectedObject.transform.updateModelMatrix();

                // update the transformation text fields
                updateTransformationValues(sManager.currentlySelectedObject);

                break;
            default:
                console.log("Mesh property type not supported");
        }
    }

    /**
     * This is the method called when the redo button is pressed
     */
    redoMeshState () {

        if (this.redoBuffer == 0)  
            return;

        // mesh property to restore the correspondent mesh with the previous value of the specific property 
        let nextState = this.redoBuffer[this.redoBuffer.length-1];

        // mesh to be restored by the previous value
        let mesh = sManager.sceneMeshList[nextState.meshID.toString()];

        /* Add current property value to undo buffer */

        // the current value of the property affected by the undo operation needs to be stored
        let propertyValueBeforeRedo = null; 

        switch(nextState.meshPropertyType) {
            case HistoryMeshProperty.POSITION:
                // the slice() operation clones the array and returns a reference to a new array.
                propertyValueBeforeRedo = mesh.transform.position.slice();  // get the current value of the position of the mesh in order to store it in the top of the mesh history buffer
                
                break;
            case HistoryMeshProperty.ROTATION:
                propertyValueBeforeRedo = mesh.transform.rotation.slice();

                break;
            case HistoryMeshProperty.SCALE:
                propertyValueBeforeRedo = mesh.transform.scale.slice();
                
                break;
            default:
                console.log("Mesh property type not supported");
        }

        if (propertyValueBeforeRedo != null)
        {
            // store the current property value in the next position in order to be possible to redo (after the undos) until the latest change
            this.addStateToUndoBuffer(mesh.id, nextState.meshPropertyType, propertyValueBeforeRedo);
        }
        else
        {
            console.log("ERROR: invalid property detect when storing a value in the mesh history buffer");
        }       

         /* Do the redo operation */
        this.restoreMeshPropertyValue(mesh, nextState);

        this.removeLatestStateOfRedoBuffer();

        if (this.redoBuffer.length == 0)
            document.getElementById('redo-menu-btn').classList.add('undo_redo_btn_isDisabled');
        else
            document.getElementById('redo-menu-btn').classList.remove('undo_redo_btn_isDisabled');

        console.log("redoMeshState: redoBuffer length = " + this.redoBuffer.length);
        console.log("undoMeshState(): undoBuffer length = " + this.undoBuffer.length);

         // update values of the transformation text fields of the sidebar
         updateTransformationValues(mesh);
    }
 }