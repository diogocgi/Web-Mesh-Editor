/* Para guardar informação sobre as transformações de um modelo */
class Transform
{
    constructor() {
        // transform vectors
        this.position = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];  // em graus por ser mais intuitivo.É dps convertido para radianos

        // directional vectors: Armazenar a mudança feita em cada uma das transformaçoes de forma a se poder determinar em que
        //    é up, down, front, back, left right
        // Sao os vetores do referencial local do objeto, daí serem normalizados (pois sao vetores unitários)
        // Inicialmente um objeto nao tem qualquer rotação, logos os vetores respetivos aos eixos do seu referencial local
        // sao iguais aos vetores do referencial global (com representação da mao direita: eixo x para a direita, eixo y para cima, eixo z a sair do ecra)
        this.right = [1, 0, 0];
        this.up = [0, 1, 0];
        this.forward = [0, 0, 1];

        this.modelMatrix; // valor configurado pela chamada da linha seguinte
        this.updateModelMatrix();   // colocar o modelo na origem, sem rotação e sem escalamento
    }
    
    resetModelMatrix() {
        this.modelMatrix = mat4();
        this.position = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
    }

    updateModelMatrix() {

        let mMatrix = mult( rotationZZMatrix(this.rotation[2]), scalingMatrix(this.scale[0], this.scale[1], this.scale[2]));

        mMatrix = mult(rotationYYMatrix(this.rotation[1]), mMatrix);

        mMatrix = mult(rotationXXMatrix(this.rotation[0]), mMatrix);

        mMatrix = mult(translationMatrix(this.position[0], this.position[1], this.position[2]), mMatrix);

        this.modelMatrix = mMatrix;

        // determinar a direçao apos todas as transformaçoes
        this.updateDirectionVectors();
    }

    updateDirectionVectors()
    {
        // normalizar ??

        this.right = [this.modelMatrix[0][0], this.modelMatrix[1][0], this.modelMatrix[2][0]];
        //console.log(this.right);
        this.up = [this.modelMatrix[0][1], this.modelMatrix[1][1], this.modelMatrix[2][1]];
        //console.log(this.up);
        this.forward = [this.modelMatrix[0][2], this.modelMatrix[1][2], this.modelMatrix[2][2]];
        //console.log(this.forward);

        //console.log("right: " + this.right);
        //console.log("up: " + this.up);
        //console.log("forward: " + this.forward);
    }
}
