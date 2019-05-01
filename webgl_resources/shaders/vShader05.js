const vertexShaderText05=`
	attribute vec3 a_vertexPosition;

    attribute vec2 a_textureCoord;

    uniform mat4 u_modelMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_projectionMatrix;

    varying vec2 v_textureCoord;

    void main(void) {
		gl_PointSize = 5.0;
		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);

        // For the fragment shader
        v_textureCoord = a_textureCoord;
    }
`;
