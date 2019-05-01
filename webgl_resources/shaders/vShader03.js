const vertexShaderText03 = `

    attribute vec3 a_vertexPosition;

    void main(void)
    {
	   gl_PointSize = 5.0;
       gl_Position = vec4(a_vertexPosition, 1.0);
   }`;
