/* Classe para gerar uma grelha */

class Grid {

    constructor (size, div) {
        this.size = size;
        this.div = div;

        this.vertices = [];
		this.vertices = [];
        this.configureGridProperties(size, div);

        this.colors = [];
        this.indices = [];

        this.model;
		this.model2;
        this.createGrid();
    }

    configureGridProperties(size, div) {
        this.size = size;
        this.div = div;
        this.step = size/div;
        this.half = size/2;
        this.vertices = [];
    }

    // a grelha tem de estar no plano xOz e nao no planoe xOy
    createGrid() {
        this.vertices = [];
		this.vertices2 = [];
        let position;
		
		let mid=0;
		mid = this.div/2;

        for (let i = 0; i <= this.div; i++)
        {
			if(i == mid ){
				// linhas vertical
				position = -this.half + (i * this.step);
				this.vertices2 = this.vertices2.concat([position, 0, this.half]);
				this.vertices2 = this.vertices2.concat([position, 0, -this.half]);

				// linha horizontal
				position = this.half - (i * this.step);
				this.vertices2 = this.vertices2.concat([-this.half, 0, position]);
				this.vertices2 = this.vertices2.concat([this.half, 0, position]);
			}else{
				// linhas vertical
				position = -this.half + (i * this.step);
				this.vertices = this.vertices.concat([position, 0, this.half]);
				this.vertices = this.vertices.concat([position, 0, -this.half]);

				// linha horizontal
				position = this.half - (i * this.step);
				this.vertices = this.vertices.concat([-this.half, 0, position]);
				this.vertices = this.vertices.concat([this.half, 0, position]);
			}
        }

        let meshName_model = "grid1";
        let meshName_model2 = "grid2";

        // the grid doesnt need a valid id because it will not be included into the associative array of meshes
        let meshid = -2;

        this.model = new RawModel(meshid, meshName_model, this.vertices, [], [], [], []);
        console.log(this.vertices2);

        // the grid doesnt need a valid id because it will not be included into the associative array of meshes
        // I gave the different ids because I havent incorporated yet the sceneManager into the mainWebGL
        meshid = -3;
		this.model2 = new RawModel(meshid, meshName_model2, this.vertices2, [], [], [], []);
    }

}
