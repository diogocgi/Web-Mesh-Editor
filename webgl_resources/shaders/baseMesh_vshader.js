const baseMesh_vshader=`
	precision mediump float;
	attribute vec3 a_vertexPosition;

	uniform mat4 u_modelMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_projectionMatrix;
    
    // constant color across all vertices
    //uniform vec4 u_color;

    void main(void) {
		gl_PointSize = 5.0;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
    }

`;
