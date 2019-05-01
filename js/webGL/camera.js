class Camera
{

    constructor(projectionType)
    {
        this.counter = 0;
        this.projectionType = null;
        this.projectionMatrix = null;

        // valores inicialmente indefinidos para a matriz de projeçao
        this.near = undefined;
        this.far = undefined;
        // variaveis especificas para a projeçao ortografica
        this.left = undefined;
        this.right = undefined;
        this.top = undefined;
        this.bottom = undefined;
        // variaveis especificas para a projeçao perspetiva
        this.fov = undefined;
        this.aspectRatio = canvas.width / canvas.height;    // por default os apect ratio é o correspondente às dimensoes do canvas

        // configurar a matriz de projeçao
        switch (projectionType)
        {
            case projectionEnum.ORTHOGRAPHIC:
                // valores default explicados quando chegar à materia das projeções
                this.setupOrthographicProjectionMatrix(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
                break;
            case projectionEnum.PERSPECTIVE:
                // valores default explicados quando chegar à materia das projeções
                this.setupPerspectiveProjectionMatrix(45, this.aspectRatio, 0.01, 1000);
                break;
            default:
                //console.log("ERROR: Invalid projection type!");
                break;
        }

        // model matrix da camaar (matriz de transformação) - matriz C
        this.transform = new Transform();   // permite-nos mover e rodar a câmara

        // o pivot de rotação da camara é inicialmente na origem do mundo;
        // este pivot é alterado quando se fizer panning
        this.rotationPivotPos = [0, 0, 0];

        // Em computação grafica não é a camara que se move ou roda em relação ao mundo,
        // mas é o mudo que se move e roda em relação à camara, daí usar o inverso da matriz de transformação da camara - C(^-1) <=> View Matrix (V)
        this.viewMatrix = inverseMat4(this.transform.modelMatrix);
    }

    setupOrthographicProjectionMatrix(left, right, bottom, top, near, far)
    {
        this.projectionType = projectionEnum.ORTHOGRAPHIC;    // para garantir que a camara está no modo de projeçao ortografica

        this.near = near;
        this.far = far;
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

        this.projectionMatrix = ortho(left, right, bottom, top, near, far);
    }

    setupPerspectiveProjectionMatrix(fov, aspectRatio, near, far)
    {
        this.projectionType = projectionEnum.PERSPECTIVE;    // para garantir que a camara está no modo de projeçao perspetiva

        this.near = near;
        this.far = far;
        this.fov = fov;
        this.aspectRatio = aspectRatio;

        this.projectionMatrix = perspective(fov, aspectRatio, near, far);
    }

    // para o caso de o ecra ser redimensionado
    updateCameraAspectRatio() {

        this.projectionMatrix = perspective(this.fov, canvas.width / canvas.height, this.near, this.far);

    }

    // panning: mover tendo em conta a direção para onde a camara está a olhar
    // por exemplo: continuamos a olhar em frente, apesar de nos movermos para a esquerda, direita, cima, baixa, frente, trás,

    // movimento para a esquerda e para a direita
    panX(moveVelocity) {
        this.transform.position[0] += this.transform.right[0] * moveVelocity;
        this.transform.position[1] += this.transform.right[1] * moveVelocity;
        this.transform.position[2] += this.transform.right[2] * moveVelocity;
        //this.updateViewMatrix();
    }

    // movimento para cima e para baixo
    panY(moveVelocity) {
        this.transform.position[0] += this.transform.up[0] * moveVelocity;
        this.transform.position[1] += this.transform.up[1] * moveVelocity;
        this.transform.position[2] += this.transform.up[2] * moveVelocity;
        //this.updateViewMatrix();
    }

    // movimento para a frente e para trás
    panZ(moveVelocity) {
        this.transform.position[0] += this.transform.forward[0] * moveVelocity;
        this.transform.position[1] += this.transform.forward[1] * moveVelocity;
        this.transform.position[2] += this.transform.forward[2] * moveVelocity;

        //console.log("sum: " + this.transform.forward[2] * moveVelocity);
        //console.log("PAN Z: " + this.transform.position);
        //this.updateViewMatrix();
    }

    updateViewMatrix() {
                // ------------------ translacao para o pivot de rotação (inicialmente na origem) ----------------------
                // distancia entre a posiao da camara e o rotationPivotPos
                let magnitude = distanceBetween3DPoints(this.transform.position, this.rotationPivotPos);

                //console.log("Magnitude: " + magnitude);

                // translacao da camara até ao ponto em relação ao qual ir rodar.
                // o pivot inicialmente está na origem, logo a camara irá para a posicao (0, 0, 0)
                // aqui tou a passar a referencia e nao os valores do array do this.rotationPivotPos ao this.transform.position (porque um array é um objeto, e objetos sao copiados por referencia
                // e nao por valor)
                //this.transform.position = this.rotationPivotPos;
                this.transform.position[0] = this.rotationPivotPos[0];
                this.transform.position[1] = this.rotationPivotPos[1];
                this.transform.position[2] = this.rotationPivotPos[2];

                let mMatrix = translationMatrix(this.transform.position[0], this.transform.position[1], this.transform.position[2]);

                // ---------------------- rotaçao ----------------------
                mMatrix = mult(rotationZZMatrix(this.transform.rotation[2]), mMatrix);
                mMatrix = mult(rotationYYMatrix(this.transform.rotation[1]), mMatrix);
                mMatrix = mult(rotationXXMatrix(this.transform.rotation[0]), mMatrix);

                //console.log("Rotacao:             " + mMatrix);

                // IMPORTANTE!! Se nao atualizarmos aqui a modelmatrix, o updateDirectionVectors() da proxima linha
                // irá calcular mal os vetores direçao, pois tem em consideração a model matrix antes da rotação
                // aqui estou tambem a passar a matriz por referencia ao this.transform.modelMatrix, mas como a variavel mMatrix é local,
                // após a funcao atual terminar, o this.transform.modelMatrix será a unica variavel a apontar para a referencia
                this.transform.modelMatrix = mMatrix;

                // determinar a direçao apos todas as transformaçoes
                this.transform.updateDirectionVectors();

                // ------------------ translacao do mesmo comprimento, mas tendo em conta a nova direção dos vetores do referencial local da camara ----------------------

                // o vector contrario ao forward, o back vector, aponta para o pivot (para onde a camara está a olhar).
                //Entao, forward vector = (x, y, z), back vector = (-x, -y, -z)
                this.transform.position[0] = magnitude * this.transform.forward[0] /*+ magnitude * this.transform.up[0] + magnitude * this.transform.forward[0]*/;
                this.transform.position[1] = /*magnitude * this.transform.right[1] +*/ magnitude * this.transform.forward[1]/* + magnitude * this.transform.forward[1]*/;
                this.transform.position[2] = /*magnitude * this.transform.right[2] + magnitude * this.transform.up[2] +*/ magnitude * this.transform.forward[2];;

                mMatrix = mult(translationMatrix(this.transform.position[0], this.transform.position[1], this.transform.position[2]), mMatrix);

                this.transform.modelMatrix = mMatrix;
                //console.log("model matrix" + this.transform.modelMatrix);

                // determinar a direçao apos todas as transformaçoes
                //this.transform.updateDirectionVectors();

                // update da view matrix (é o inverso da model matrix da camara)
                this.viewMatrix = inverseMat4(this.transform.modelMatrix);

        }


    // Rotação da camara
    // from: camera position, to: pivot point position
    lookAt(from, to) {

        // 1º) calcular o vetor forwrd: TF (To-From vector)
        let newForwardVector = subtract(vec3(from[0], from[1], from[2]), vec3(to[0], to[1], to[2]));

        newForwardVector = normalizeVec3(newForwardVector);

        //console.log("Forward vector: " + newForwardVector);

        //this.transform.forward = [newForwardVector[0], newForwardVector[1], newForwardVector[2]];

        // 2º) calcular o vector right
        let arbitraryVec = vec3(0, 1, 0);
        let newRightVector;

        // tratar do caso extrmeo, one o vetor forwaed é igual a (0, 1, 0) ou a (0, -1, 0)
        if (newForwardVector[0] == arbitraryVec[0] && (newForwardVector[1] == arbitraryVec[1] || newForwardVector[1] == -arbitraryVec[1]) && newForwardVector[2] == arbitraryVec[2])
        {
            newRightVector = vec(0, 0, -1);
            //console.log("forward = (0, 1, 0) out (0, -1, 0)");
        }
        else  // situação normal
        {
            newRightVector = crossProductVec3(normalizeVec3(arbitraryVec), newForwardVector);
        }

        // 3º calcular o up vector
        let newUpVector = crossProductVec3(newForwardVector, newRightVector);

        /* 4º construir a model Matrix
         * | rightX upX forwardX tx |
         * | rightY upY forwardY ty |
         * | rightZ upZ forwardZ tz |
         * |   0     0     0     1  |
        */
        let mMatrix = mat4();
        mMatrix[0][0] = newRightVector[0];  mMatrix[1][0] = newUpVector[0];  mMatrix[2][0] = newForwardVector[0];
        mMatrix[0][1] = newRightVector[1];  mMatrix[1][1] = newUpVector[1];  mMatrix[2][1] = newForwardVector[1];
        mMatrix[0][2] = newRightVector[2];  mMatrix[1][2] = newUpVector[2];  mMatrix[2][2] = newForwardVector[2];

        return mMatrix
    }

}
