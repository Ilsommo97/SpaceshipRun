import * as THREE from "three";
import sceneSetup from "./gameSetup.js";
import GameMaster from "./gameMaster.js";

class Game{
    constructor(LastUpdate){
        this.scene = new THREE.Scene();
        this.scene.background=new THREE.Color(0x808080);
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.LastUpdate = LastUpdate
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        
    }

    async init(difficulty, gameMaster)
    {
        this.gameMaster = gameMaster
        await sceneSetup(this.scene,this.camera,this.renderer.domElement,this.gameMaster, difficulty);
        this.checkpoints = this.scene.getObjectByName('checkpoints')
        this.ship= this.scene.getObjectByName("ship");
        this.oldDir=new THREE.Vector3();
        this.ship.getWorldDirection(this.oldDir);
        this.meteorites = this.scene.getObjectByName('meteorites')
    }

    // const dirLight = new THREE.DirectionalLight(0xffffff,1);
    // dirLight.position.set(-300,0,300)
    // level.level.add(dirLight);
    // dirLight.castShadow = true;
    animate(deltaTime) {
        var now = Date.now();
        deltaTime=(now-this.LastUpdate)/1000;
        this.LastUpdate = now;
        requestAnimationFrame( this.animate.bind(this) );
        this.scene.getObjectByName("ship").controls.update(deltaTime);
        
        //this.cameraControls.update(deltaTime);
        if(resizeRendererToDisplaySize(this.renderer)){
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        this.ship.rotation.z +=.0001
        this.ship.vectorThrust(this.oldDir);
        this.ship.getWorldDirection(this.oldDir);
        this.renderer.render(this.scene,this.camera);
        this.meteorites.moveAlongAxis('z', this.scene.userData.meteorites_velocity, this.ship.position, 500)
        this.meteorites.rotateOnAxis('z', .01)
        
        // Collision detection stuff
        this.ship.updateBoundingBox(this.ship.matrixWorld)
        this.meteorites.intersectObject(this.gameMaster, this.ship.helperBox.box)
        for (let mesh of this.checkpoints.children)
        {
            if (this.ship.helperBox.box.intersectsBox(mesh.helperBox.box))
            {
                this.gameMaster.updateCPCount()
                mesh.helperBox.box.makeEmpty()
            }
        } 
    };

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }


  function startGame(difficulty)
  {
    var LastUpdate = Date.now();
    var game = new Game(LastUpdate);
    let gameMaster = new GameMaster(game)
    gameMaster.gameScreen(difficulty)
  }
  
  function restartGame(difficulty)
  {
    var LastUpdate = Date.now();
    var game1 = new Game(LastUpdate);
    //while (game.scene.children.length)  game.scene.remove(game.scene.children[0]);
    let gameMaster1 = new GameMaster(game1)
    gameMaster1.gameScreen(difficulty)
  }
  
  
  window.startGame = startGame
  window.restartGame = restartGame
  
  