const vertexShaderText10=`
	precision mediump float;
	
	attribute vec3 a_vertexPosition;
	attribute vec3 a_vertexNormal;

    uniform mat4 u_modelMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_projectionMatrix;
	
	uniform vec3 u_lightPosition;
	uniform vec3 u_lightColor;
	uniform float u_shininess;
	uniform vec3 u_ambientColor;

	varying vec3 v_transformedVertex;
	varying vec4 v_vertexColor;
	varying vec3 v_vertexNormal;

    void main(void) {
		gl_PointSize = 5.0;
		mat4 VM_matrix;
		mat4 PVM_matrix;

		VM_matrix = u_viewMatrix * u_modelMatrix;
		
		// Perform the model and view transformations on the vertex and pass this
		// location to the fragment shader.
		v_transformedVertex = vec3( VM_matrix * vec4(a_vertexPosition,1.0));
		
		// Perform the model and view transformations on the vertex's normal vector
		// and pass this normal vector to the fragment shader.
		v_vertexNormal = vec3( VM_matrix * vec4(a_vertexNormal,0.0));
		
		// Transform the location of the vertex for the rest of the graphics pipeline
		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
    }
`;
