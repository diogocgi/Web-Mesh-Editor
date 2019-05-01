const vertexShaderText04=`
	attribute vec3 a_vertexPosition;

    attribute vec2 a_textureCoord;

    uniform mat4 u_modelMatrix;

    varying vec2 v_textureCoord;

    void main(void) {
		gl_PointSize = 5.0;
		gl_Position = u_modelMatrix * vec4(a_vertexPosition, 1.0);

        // For the fragment shader
        v_textureCoord = a_textureCoord;
    }
`;
