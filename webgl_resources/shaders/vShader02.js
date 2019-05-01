const vertexShaderText02 = `
    attribute vec3 a_vertexPosition;
    attribute vec2 a_vertexTexCoord;
	
	uniform mat4 u_modelMatrix;
		
    varying vec2 v_fragTexCoord;

    void main(void)
    {  
		gl_PointSize = 5.0;
       // To allow seeing the points drawn
		gl_PointSize = 5.0;

		// Just converting the (x,y,z) vertices to Homogeneous Coord.
		// And multiplying by the Model-View matrix
        gl_Position = u_modelMatrix * vec4(a_vertexPosition, 1.0);
		
				
	   v_fragTexCoord = a_vertexTexCoord;
   }`;
