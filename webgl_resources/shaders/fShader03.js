const fragmentShaderText03 =`
	precision mediump float;

    varying vec2 v_textureCoord;
	varying vec3 v_transformedVertex;
	varying vec4 v_vertexColor;
	varying vec3 v_vertexNormal;

    uniform sampler2D u_sampler;
	uniform vec3 u_lightPosition;
	uniform vec3 u_lightColor;
	uniform float u_shininess;
	uniform vec3 u_ambientColor;
	
    void main(void) {
		vec3 to_light;
		vec3 vertex_normal;
		vec3 reflection;
		vec3 to_camera;
		float cos_angle;
		vec3 diffuse_color;
		vec3 specular_color;
		vec3 ambient_color;
		vec3 object_color;
		vec3 color;
		
		vec4 texture = texture2D(u_sampler, vec2(v_textureCoord.s, v_textureCoord.t));
		
		// Calculate the ambient color as a percentage of the surface color
		ambient_color = u_ambientColor * vec3(texture);
  
		// Calculate a vector from the fragment location to the light source
	    to_light = u_lightPosition - v_transformedVertex;
	    to_light = normalize( to_light );

	    // The vertex's normal vector is being interpolated across the primitive
	    // which can make it un-normalized. So normalize the vertex's normal vector.
	    vertex_normal = normalize( v_vertexNormal );
		
		// Calculate the cosine of the angle between the vertex's normal vector
	    // and the vector going to the light.
	    cos_angle = dot(vertex_normal, to_light);
	    cos_angle = clamp(cos_angle, 0.0, 1.0);

		// Scale the color of this fragment based on its angle to the light.
		diffuse_color = vec3(texture) * cos_angle;
		
		// Calculate the reflection vector
	    reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;

	    // Calculate a vector from the fragment location to the camera.
	    // The camera is at the origin, so negating the vertex location gives the vector
	    to_camera = -1.0 * v_transformedVertex;

	    // Calculate the cosine of the angle between the reflection vector
	    // and the vector going to the camera.
	    reflection = normalize( reflection );
	    to_camera = normalize( to_camera );
	    cos_angle = dot(reflection, to_camera);
	    cos_angle = clamp(cos_angle, 0.0, 1.0);
	    cos_angle = pow(cos_angle, u_shininess);

		if(cos_angle > 0.0){
			// If this fragment gets a specular reflection, use the light's color,
			// otherwise use the objects's color
			specular_color = u_lightColor * cos_angle;
			diffuse_color = diffuse_color * (1.0 - cos_angle);
		}else{
			specular_color = vec3(0.0, 0.0, 0.0);
		}
		
	    //object_color = vec3(texture) * (1.0 - cos_angle);
	    color = ambient_color + diffuse_color + specular_color;	
		
	    // Scale the color of this fragment based on its angle to the light.
	    gl_FragColor = vec4(color*cos_angle, 1);
    }
    `;
