/* Original Source: https://github.com/sketchpunk/FunWithWebGL2/blob/master/lesson_008/RenderLoop.js */

class RenderLoop{
	constructor(callback,fps){ // callback é a funçao que vai ser executada repetitivamente, é o loop de renderizacao
		let oThis = this;
		this.msLastFrame = null;	// The time in Miliseconds of the last frame.
		this.callBack = callback;	// What function to call for each frame
		this.isActive = false;		// Control the On/Off state of the render loop

        if (fps == undefined)
		      this.fps = 60;				// Default fps

		if(fps > 0)
        {
			this.msFpsLimit = 1000/fps; //Calc how many milliseconds per frame in one second of time.
			this.run = function(){
				//Calculate Deltatime between frames and the FPS currently.
				let msCurrent = performance.now();
				let	msDelta	= (msCurrent - oThis.msLastFrame);
				let	deltaTime = msDelta / 1000.0;		//What fraction of a single second is the delta time

                //Now execute frame since the time has elapsed.
				if(msDelta >= oThis.msFpsLimit)
                {
					oThis.fps = Math.floor(1/deltaTime);
					oThis.msLastFrame = msCurrent;
					oThis.callBack(deltaTime);
				}

				if(oThis.isActive)
                    window.requestAnimationFrame(oThis.run);
			}
		}
	}

	start() {
		this.isActive = true;
		this.msLastFrame = performance.now();
		requestAnimationFrame(this.run);
		return this;
	}

	stop() {
        this.isActive = false;
    }
}
