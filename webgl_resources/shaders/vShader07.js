const vertexShaderText07=`
	attribute vec3 a_vertexPosition;
    attribute vec3 a_colorCoord;

    uniform mat4 u_modelMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_projectionMatrix;

    varying vec4 v_vertexColor;

    void main(void) {
		gl_PointSize = 5.0;
		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);

        // For the fragment shader
        v_vertexColor = vec4(a_colorCoord, 1.0);
    }
`;
