const vertexShaderText01 = `
    attribute vec3 a_vertexPosition;
    attribute vec3 a_vertexColor;

    uniform mat4 u_modelMatrix;

    varying vec4 v_vertexColor;

    void main(void) {
		gl_PointSize = 5.0;
		// To allow seeing the points drawn
		gl_PointSize = 5.0;

		// Just converting the (x,y,z) vertices to Homogeneous Coord.
		// And multiplying by the Model-View matrix
        gl_Position = u_modelMatrix * vec4(a_vertexPosition, 1.0);

        // Converting the RGB color value to RGBA
        v_vertexColor = vec4(a_vertexColor, 1.0);
    }`
