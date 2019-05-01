const fragmentShaderText =`
    precision mediump float;

    varying vec4 v_vertexColor;

    void main(void)
    {
       gl_FragColor = v_vertexColor;
    }
    `;
