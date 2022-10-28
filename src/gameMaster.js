import * as THREE from "three";
class GameMaster extends THREE.Object3D{
    constructor(game){
        super()
        this.game = game
        this.checkpointcount = -1;
        this.CPMax = 0;
        //this.window.startGame = startGame
 

    }
    // Function to toggle between screens
     toggleScreen(id,toggle){
        let element = document.getElementById(id)
        let display = (toggle) ? 'block' : 'none'
        // canvas of the renderer
        if (element == null)
        {
            this.game.renderer.domElement.style.display = display
        }
        else element.style.display = display
    }

    changeBackground(id, path)
    {
        var declaration = document.styleSheets[0].cssRules[0].style;
        
        declaration.setProperty('background',  
        "url(\""+String(path)) 
    }

    gameScreen(difficulty){
        this.toggleScreen('deathScreen', false)
        this.toggleScreen('initialScreen', false)
        this.toggleScreen('winScreen', false)
        this.toggleScreen('checkpointCount', true)
        this.toggleScreen('canvas', true)
        this.game.init(difficulty, this)
        this.game.animate(0);
    }


    loseScreen(){
        this.toggleScreen('initialScreen', false)
        this.toggleScreen('canvas', false)
        this.toggleScreen('deathScreen', true)
        this.toggleScreen('checkpointCount', false)
        this.changeBackground('deathScreen','../resources/html_imgs/SR_game-over.png')
        clearInterval(this.game.animate)
    }

    /**
     * show win screen
     */
    winScreen(){
        this.toggleScreen('initialScreen', false)
        this.toggleScreen('canvas', false)
        this.toggleScreen('deathScreen', false)
        this.toggleScreen('winScreen', true)
        this.toggleScreen('checkpointCount', false)
        this.changeBackground('winScreen', '../resources/html_imgs/SR_win.png')
        clearInterval(this.game.animate)
    }

    /**
     * update number of checkpoints reached
     */
    updateCPCount(){
        this.checkpointcount++;

        var count = document.getElementById("count");
        count.innerText = this.checkpointcount.toString().concat("/",this.CPMax.toString())
        if(this.checkpointcount == this.CPMax) this.winScreen()
    }
}

export default GameMaster