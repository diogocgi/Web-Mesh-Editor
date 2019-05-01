/**
 * This class serves for storing the previous state of a property of a mesh before it being altered
 * It is used for the elements of the historyMeshBuffer in the SceneManager instance.
 * 
 * 
 */
class MeshPropertyState {

    /**
     * 
     * @param {integer} id: id of the mesh whos property was changed
     * @param {HistoryMeshProperty} property: it's a member of the HistoryMeshProperty enum
     * @param {*} previousValue: value before the change. It can be of whatever type (according to the property)
     */
    constructor(id, property, previousValue) {
        this.meshID = id;
        this.meshPropertyType = property;
        this.propertyPreviousValue = previousValue; // aka previous state of the property
    }
}

var HistoryMeshProperty = 
{
    POSITION: 1,
    ROTATION: 2,
    SCALE: 3,
    LOCK_TRANSFORMATION: 4,
    VERTEX_POS_ARRAY: 5,
    VERTEX_COLOR_ARRAY: 6,
    VERTEX_NORMAL_ARRAY: 7,
    TEXTURE: 8,
    SHADER_PROGRAM: 9,
    TEXTURE_COORD_ARRAY: 10,
  };
  
