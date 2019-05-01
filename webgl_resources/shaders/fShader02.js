const fragmentShaderText02 =`
	precision mediump float;

    varying vec2 v_textureCoord;

    uniform sampler2D u_sampler;

    void main(void) {

        gl_FragColor = texture2D(u_sampler, vec2(v_textureCoord.s, v_textureCoord.t));
    }
    `;
