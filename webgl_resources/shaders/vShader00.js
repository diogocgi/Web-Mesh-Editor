const vertexShaderText = `

    attribute vec3 a_vertexPosition;
    attribute vec3 a_vertexColor;

    varying vec4 v_vertexColor;

    void main(void)
    {
	  gl_PointSize = 5.0;
       gl_Position = vec4(a_vertexPosition, 1.0);

       // Converting the RGB color value to RGBA
        v_vertexColor = vec4(a_vertexColor, 1.0);
   }`;
