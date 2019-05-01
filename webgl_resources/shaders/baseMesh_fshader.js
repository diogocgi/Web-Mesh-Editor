const baseMesh_fshader =`
    precision mediump float;

    //varying vec4 v_vertexColor;
    uniform vec4 u_color;
    
    void main(void)
    {
       //gl_FragColor = v_vertexColor;
       gl_FragColor = u_color;
    }
    `;