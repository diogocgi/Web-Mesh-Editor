// Adpated from https://github.com/sketchpunk/FunWithWebGL2/blob/master/lesson_007/Camera.js

class CameraController
{
	constructor(gl,camera)
	{
		var oThis = this;	// object's this
		var box = gl.canvas.getBoundingClientRect();
		this.canvas = gl.canvas;						//Need access to the canvas html element, main to access events
		this.camera = camera;							//Reference to the camera to control

		this.rotateRate = 100;							//How fast to rotate, degrees per dragging delta
		this.panRate = 25;								//How fast to pan, max unit per dragging delta
		this.zoomRate = 500;							//How fast to zoom or can be viewed as forward/backward movement

		this.offsetX = box.left;						//Help calc global x,y mouse cords.
		this.offsetY = box.top;

		this.initX = 0;									//Starting X,Y position on mouse down
		this.initY = 0;
		this.prevX = 0;									//Previous X,Y position on mouse move
		this.prevY = 0;

		this.onUpHandler = function(e) {
			oThis.onMouseUp(e);
		};		//Cache func reference that gets bound and unbound a lot

		this.onMoveHandler = function(e) {
			oThis.onMouseMove(e);
		}

		this.canvas.addEventListener("mousedown", function(e) {
			oThis.onMouseDown(e);
		});		//Initializes the up and move events

		// verificar o suporte do browser para um evento do javascript
		if ("onwheel" in window) {
			// o evento é "wheel", mas a propriedade do objeto window do chrome correspondente chama-se "onwheel" (as propriedades têm sempre "on" atrás do nome do evento)

			this.canvas.addEventListener("wheel", function(e) {
				oThis.onMouseWheel(e);
			});	//Handles zoom/forward movement

			console.log("The browser supports the onwheel event!");
		}
		else {
			console.log("The browser doesn't support the onwheel event!");
		}
	}

	//Transform mouse x,y coords to something useable by the canvas.
	getMouseVec2(e) 
	{
        return { x:e.pageX - this.offsetX,
                 y:e.pageY - this.offsetY
               };
    }

	//Begin listening for dragging movement
	onMouseDown(e)
	{
		this.initX = this.prevX = e.pageX - this.offsetX;
		this.initY = this.prevY = e.pageY - this.offsetY;

		this.canvas.addEventListener("mouseup",this.onUpHandler);
		this.canvas.addEventListener("mousemove",this.onMoveHandler);
	}

	//End listening for dragging movement
	onMouseUp(e)
	{
		this.canvas.removeEventListener("mouseup",this.onUpHandler);
		this.canvas.removeEventListener("mousemove",this.onMoveHandler);
	}
	// e = event
	onMouseWheel(e)
	{
		if (e.wheelDelta == undefined)	// no caso do firefox
		{
			var delta = Math.max(-1, Math.min(1, (-e.deltaY || -e.detail))); 	//Try to map wheel movement to a number between -1 and 1

			this.camera.panZ(-delta * (this.zoomRate / this.canvas.height));		//Keep the movement speed the same, no matter the height diff
		}
		else {
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); 	//Try to map wheel movement to a number between -1 and 1

			this.camera.panZ(-delta * (this.zoomRate / this.canvas.height));		//Keep the movement speed the same, no matter the height diff
		}
	}

	onMouseMove(e)
	{
		var  x = e.pageX - this.offsetX,	//Get X,y where the canvas's position is origin.
			y = e.pageY - this.offsetY,
			dx = x - this.prevX,		//Difference since last mouse move
			dy = y - this.prevY;

		//When shift is being helt down, we pan around else we rotate.
		if(!e.shiftKey){
			// dividir pelo width e o height permite que arrastar o rato na horizontal afete a mesma quantidade no moviemnto do mundo, que arrastar o mesmo comprimento na vertical
			// Em vez de:
			//   - como a altura é mais pequena que o comprimento, para deslocar a camara 10 unidades para cima, levaria a um menor deslocamento do rato no ecrã comparativamente a
			//      se quisessemos deslocar a camaa 10 undidades para a direita (pois o comprimento do canvas é maior do que a altura )

			// é preciso negar porque a camara aponta para -z, ou seja, se nao tivesse negdo e se arrastarmos para o lado direito, o camara roda para o esquerdo (o mesmo acontece a rotacao vertical)
			this.camera.transform.rotation[1] += -dx * (this.rotateRate / this.canvas.width);	// irá rodar a camara em torno do pivot em relacao ao eixo dos y

			// quando arrasto na vertical, estou a rodar a camara em torno do eixo dos x! Daí a deslocação do rato na vertical
			// afetar a componente x da rotação!
			this.camera.transform.rotation[0] += -dy * (this.rotateRate / this.canvas.height);   // irá rodar a camara em torno do pivot em relacao ao eixo dos x

			// graus de rotação adicionados pelo arrastar do rato na horizontal
			// let rotWithHorizontalDrag = -dx * (this.rotateRate / this.canvas.width);
			//
			// let rotWithVerticalDrag = -dy * (this.rotateRate / this.canvas.height);
			//
			// // distribuicao das duas rotaçoes pelos 3 eixos
			// // ter em conta que o back vector da camara aponta para o pivot (back vector = -forward vector)
			// this.camera.transform.rotation[0] += rotWithVerticalDrag * this.camera.transform.right[0] + rotWithHorizontalDrag * this.camera.transform.up[0];
			// this.camera.transform.rotation[1] += rotWithVerticalDrag * this.camera.transform.right[1] + rotWithHorizontalDrag * this.camera.transform.up[1];
			// this.camera.transform.rotation[2] += rotWithVerticalDrag * this.camera.transform.right[2] + rotWithHorizontalDrag * this.camera.transform.up[2];
		}else{
			this.camera.panX( -dx * (this.panRate / this.canvas.width) );
			this.camera.panY( dy * (this.panRate / this.canvas.height) );
		}

		this.prevX = x;
		this.prevY = y;
	}
}
