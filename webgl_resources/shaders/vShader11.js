const vertexShaderText11=`
	attribute vec3 a_vertexPosition;

    uniform mat4 u_modelMatrix;
	uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    
   // varying vec4 v_vertexColor;

    void main(void) {
		gl_PointSize = 5.0;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
        
        // Converting the RGB color value to RGBA
       // v_vertexColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;
