import * as THREE from "three";
import LevelGenerator from "./levelGeneration.js";
import Ship from "./ship.js";
import InstancedMeshGroup from "./InstancedMeshGroup.js";

async function sceneSetup(scene,camera, domElement, gameMaster, difficulty){

    var ship = new Ship(domElement,camera);
    ship.position.y=2.5
    let helper = ship.createBoundingBox()
    scene.userData.meteorites_number;
    scene.userData.meteorites_velocity;
    //scene.add(helper)
    //#region meteorites
     // METEORITES STUFF
    if (difficulty=='easy')
    {
        scene.userData.meteorites_number = 200
        scene.userData.meteorites_velocity = .4
    }
    if (difficulty=='medium')
    {
        scene.userData.meteorites_number = 350
        scene.userData.meteorites_velocity = .6
    }
    if (difficulty=='hard')
    {
        scene.userData.meteorites_number = 600
        scene.userData.meteorites_velocity = .8
    }

    var meteorites = new InstancedMeshGroup('meteorites')
    var promise = await meteorites.load3DModel('../resources/meshes/meteorites/scene.gltf')
    meteorites.loadMeshAsCube(scene.userData.meteorites_number, promise, [0,0,-300], 400, 20)
    meteorites.createBoundingBox()
    /*  for (let box of meteorites.BBoxArray)
     {
         scene.add(box)
     } */
    scene.add(meteorites) 
    // METEORITES STUFF 
    //#endregion

    //#region skybox 
    //skybox
    //source: https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=3.6899461267865497&fov=80&nebulae=true&pointStars=true&resolution=1024&seed=1e6bxj1uo3mo&stars=true&sun=true
    const loader = new THREE.CubeTextureLoader();
    loader.setPath("../resources/skybox/");

    const textureCube = loader.load(["right.png", "left.png", "top.png", "bottom.png", "front.png", "back.png"])
    scene.background = textureCube;
    //skybox
    //#endregion
    
    scene.add(ship);
    //lights
    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.x = 10000000000 // This high value is needed to mimic the position of the 'sun' in the skybox
    scene.add(pointLight)
    const dirLight = new THREE.DirectionalLight(0xffffff,0.5);
    dirLight.position.set(1,10,-10);
    scene.add(dirLight)
    
    var level = new LevelGenerator(scene, gameMaster);
    level.generateLevel(5);

    camera.position.z =0;

    //Adding audio to the game
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.sourceType= 'mp3'
    audioLoader.load( '../resources/audio/ambient.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    });


}

    

export default sceneSetup
