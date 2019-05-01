/*
    Creation of a button in the scene hierarchy div for the newly created model 
*/
/*function updateModelList(modelName) {

    let hierarchyDiv = document.getElementById("hierarchy-textbox");

    // each element in the scene hierarchy div is a button
    let btn = document.createElement("button");
    // this arrow appears when the object has child objects attached to it
    btn.className="hierarchy-btn fa fa-caret-up";
    // the id of the button is the name of the 3d model
	btn.id=modelName;
    
    let t = document.createTextNode(" " + modelName);
    btn.appendChild(t);

    hierarchyDiv.appendChild(btn);

    document.getElementById(modelName).addEventListener("click", function(){
        enableTransformationObjectTextBoxes()
    });

    modelSelectionClickSetup(btn.id);
}*/

/* 
                            hierarchyDiv
                                |
                    ------------------- (...)
                    |
                meshBtnDiv
                    |
            -----------------
            |               |
        carretBtn        meshBtn
                            |
                       meshBtnText
*/
function updateSceneHierarchy(mesh) {

    // gets the div of the hierarchy box
    let hierarchyDiv = document.getElementById("hierarchy-textbox");

    // this div will be composed of 2 buttons: the carret (for expanding the child objects) and the name of the object (in order to be selectable)
    let meshBtnDiv = document.createElement("div");
    meshBtnDiv.id=mesh.id + "-div";

    // button with the arrow
    let carretBtn = document.createElement("button");
    carretBtn.className="carrot-btn fa fa-caret-up";
    carretBtn.id=mesh.id + "-carrot";

    // button for selection of the correspondent mesh
    let meshBtn = document.createElement("button");
    meshBtn.className="hierarchy-btn";
    meshBtn.id=mesh.id + "-btn";

    // add mesh to the list of meshes currently in the scene
    // the name of the mesh in the associative array is the id of the correspondent button in the hierarchy
    //sManager.sceneMeshList[meshBtn.id] = mesh;
    
    // name of the mesh for the correspondent button
    let meshBtnText = document.createTextNode(mesh.name);
    meshBtn.appendChild(meshBtnText);

    meshBtnDiv.appendChild(carretBtn);

    meshBtnDiv.appendChild(meshBtn);

    hierarchyDiv.appendChild(meshBtnDiv);

    meshBtn.addEventListener("click", function(){
        enableTransformationObjectTextBoxes()
    });

    modelSelectionClickSetup(meshBtn.id, mesh);
}

/* enable the textboxes for model translation, rotation and scaling */
function enableTransformationObjectTextBoxes()
{
    document.getElementById('x-translate').removeAttribute('disabled');
    document.getElementById('y-translate').removeAttribute('disabled');
    document.getElementById('z-translate').removeAttribute('disabled');
    document.getElementById('x-rotate').removeAttribute('disabled');
    document.getElementById('y-rotate').removeAttribute('disabled');
    document.getElementById('z-rotate').removeAttribute('disabled');
    document.getElementById('x-scale').removeAttribute('disabled');
    document.getElementById('y-scale').removeAttribute('disabled');
    document.getElementById('z-scale').removeAttribute('disabled');
}

/* disable the textboxes for model translation, rotation and scaling */
function disableTransformationObjectTextBoxes()
{
    document.getElementById('x-translate').setAttribute('disabled', 'disabled');
    document.getElementById('y-translate').setAttribute('disabled', 'disabled');
    document.getElementById('z-translate').setAttribute('disabled', 'disabled');
    document.getElementById('x-rotate').setAttribute('disabled', 'disabled');
    document.getElementById('y-rotate').setAttribute('disabled', 'disabled');
    document.getElementById('z-rotate').setAttribute('disabled', 'disabled');
    document.getElementById('x-scale').setAttribute('disabled', 'disabled');
    document.getElementById('y-scale').setAttribute('disabled', 'disabled');
    document.getElementById('z-scale').setAttribute('disabled', 'disabled');
}

/*
    Setup of the newly created button in order to be clickable and to be able to select tne
    corresponding 3d model
*/
function modelSelectionClickSetup(buttonId, mesh) {

	document.getElementById(buttonId).onclick = function(){

        sManager.currentlySelectedObject = sManager.sceneMeshList[mesh.id.toString()];

        // put selected model position in sidebar
        document.getElementById("x-translate").value = sManager.sceneMeshList[mesh.id.toString()].transform.position[0];
        document.getElementById("y-translate").value = sManager.sceneMeshList[mesh.id.toString()].transform.position[1];
        document.getElementById("z-translate").value = sManager.sceneMeshList[mesh.id.toString()].transform.position[2];

        document.getElementById("x-rotate").value = sManager.sceneMeshList[mesh.id.toString()].transform.rotation[0];
        document.getElementById("y-rotate").value = sManager.sceneMeshList[mesh.id.toString()].transform.rotation[1];
        document.getElementById("z-rotate").value = sManager.sceneMeshList[mesh.id.toString()].transform.rotation[2];

        document.getElementById("x-scale").value = sManager.sceneMeshList[mesh.id.toString()].transform.scale[0];
        document.getElementById("y-scale").value = sManager.sceneMeshList[mesh.id.toString()].transform.scale[1];
        document.getElementById("z-scale").value = sManager.sceneMeshList[mesh.id.toString()].transform.scale[2];
	}
}

function updateTransformationValues(mesh)
{
    document.getElementById("x-translate").value = mesh.transform.position[0];
    document.getElementById("y-translate").value = mesh.transform.position[1];
    document.getElementById("z-translate").value = mesh.transform.position[2];

    document.getElementById("x-rotate").value = mesh.transform.rotation[0];
    document.getElementById("y-rotate").value = mesh.transform.rotation[1];
    document.getElementById("z-rotate").value = mesh.transform.rotation[2];

    document.getElementById("x-scale").value = mesh.transform.scale[0];
    document.getElementById("y-scale").value = mesh.transform.scale[1];
    document.getElementById("z-scale").value = mesh.transform.scale[2];
}

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});

    if (window.navigator.msSaveOrOpenBlob) // IE10+
    {
        window.navigator.msSaveOrOpenBlob(file, filename);
    }
    else // Others 
    {   
        var a = document.createElement("a");
        var url = URL.createObjectURL(file);

        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        
        a.click();
        
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

/*
    transform id: id of the object tranform textbox that was changed
*/
function handleModelTransformation(transformId){
   
    if (sManager.currentlySelectedObject != null)
    {
        // get the value of the textbox with the id in the variable transformId
        let textboxValue = document.getElementById(transformId).value;

        if (transformId == "x-translate") {
            // add the previous value in the mesh history buffer
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.POSITION, 
                [sManager.currentlySelectedObject.transform.position[0], sManager.currentlySelectedObject.transform.position[1], sManager.currentlySelectedObject.transform.position[2]]);

            sManager.currentlySelectedObject.transform.position[0]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "y-translate") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.POSITION, 
                [sManager.currentlySelectedObject.transform.position[0], sManager.currentlySelectedObject.transform.position[1], sManager.currentlySelectedObject.transform.position[2]]);

            sManager.currentlySelectedObject.transform.position[1]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "z-translate") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.POSITION, 
                [sManager.currentlySelectedObject.transform.position[0], sManager.currentlySelectedObject.transform.position[1], sManager.currentlySelectedObject.transform.position[2]]);

            sManager.currentlySelectedObject.transform.position[2]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "x-rotate") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.ROTATION, 
                [sManager.currentlySelectedObject.transform.rotation[0], sManager.currentlySelectedObject.transform.rotation[1], sManager.currentlySelectedObject.transform.rotation[2]]);

            sManager.currentlySelectedObject.transform.rotation[0]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "y-rotate") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.ROTATION, 
                [sManager.currentlySelectedObject.transform.rotation[0], sManager.currentlySelectedObject.transform.rotation[1], sManager.currentlySelectedObject.transform.rotation[2]]);
                
            sManager.currentlySelectedObject.transform.rotation[1]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "z-rotate") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.ROTATION, 
                [sManager.currentlySelectedObject.transform.rotation[0], sManager.currentlySelectedObject.transform.rotation[1], sManager.currentlySelectedObject.transform.rotation[2]]);

            sManager.currentlySelectedObject.transform.rotation[2]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "x-scale") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.SCALE, 
                [sManager.currentlySelectedObject.transform.scale[0], sManager.currentlySelectedObject.transform.scale[1], sManager.currentlySelectedObject.transform.scale[2]]);

            sManager.currentlySelectedObject.transform.scale[0]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "y-scale") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.SCALE, 
                [sManager.currentlySelectedObject.transform.scale[0], sManager.currentlySelectedObject.transform.scale[1], sManager.currentlySelectedObject.transform.scale[2]]);

            sManager.currentlySelectedObject.transform.scale[1]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }

        if (transformId == "z-scale") {
            historyManager.backupCurrentPropertyState(sManager.currentlySelectedObject.id, HistoryMeshProperty.SCALE, 
                [sManager.currentlySelectedObject.transform.scale[0], sManager.currentlySelectedObject.transform.scale[1], sManager.currentlySelectedObject.transform.scale[2]]);

            sManager.currentlySelectedObject.transform.scale[2]  = textboxValue;
            sManager.currentlySelectedObject.transform.updateModelMatrix();
        }
    }
}

/*
function handleVertexTransformation(e){
    if (currentlySelectedObject != null)
    {
        var key=e.keyCode || e.which;
        if (key==13){
            if (document.getElementById("vertex_number").value != null || document.getElementById("vertex_number").value != undefined)
            {
                let vertexSelected = document.getElementById("vertex_number").value;

                if (e.target.id == "vertex_number") {
                    document.getElementById("x_ver").value = currentlySelectedObject.vertexPosArray[0 + 3*vertexSelected];
                    document.getElementById("y_ver").value = currentlySelectedObject.vertexPosArray[1 + 3*vertexSelected];
                    document.getElementById("z_ver").value = currentlySelectedObject.vertexPosArray[2 + 3*vertexSelected];
                }
                else {
                    let vertexBeforeChange = [currentlySelectedObject.vertexPosArray[0 + 3*vertexSelected],
                                              currentlySelectedObject.vertexPosArray[1 + 3*vertexSelected],
                                              currentlySelectedObject.vertexPosArray[2 + 3*vertexSelected]];


                    if (e.target.id == "x_ver") {
                        currentlySelectedObject.vertexPosArray[0 + 3*vertexSelected] = Number(e.target.value);
                    }

                    if (e.target.id == "y_ver") {
                        currentlySelectedObject.vertexPosArray[1 + 3*vertexSelected] =  Number(e.target.value);
                    }

                    if (e.target.id == "z_ver") {
                        currentlySelectedObject.vertexPosArray[2 + 3*vertexSelected] =  Number(e.target.value);
                    }

                    for (let i = 0; i < currentlySelectedObject.vertexPosArray.length; i++)
                    {
                        // component x da posicao de um vertice
                        if (currentlySelectedObject.vertexPosArray[i] === vertexBeforeChange[0] &&
                                currentlySelectedObject.vertexPosArray[i+1] === vertexBeforeChange[1] &&
                                    currentlySelectedObject.vertexPosArray[i+2] === vertexBeforeChange[2])
                        {
                            // todos os vertices na mesma posicao que o alterado tambem sao alterados
                            currentlySelectedObject.vertexPosArray[i] = currentlySelectedObject.vertexPosArray[0 + 3* vertexSelected];
                            currentlySelectedObject.vertexPosArray[i+1] = currentlySelectedObject.vertexPosArray[1 + 3* vertexSelected];
                            currentlySelectedObject.vertexPosArray[i+2] = currentlySelectedObject.vertexPosArray[2 + 3* vertexSelected];
                        }

                        i+=2;
                    }

                    currentlySelectedObject.updateVertexVBO();
                }
            }
        }
    }
}*/
