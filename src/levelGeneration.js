import MeshObject from "./MeshObject.js"
import * as THREE from "three";
import { DDSLoader } from 'DDSLoader'

class LevelGenerator{
    constructor(scene, gameMaster){
        if(scene == null) this.level = new THREE.Scene();
        this.level = scene;
        this.gameMaster = gameMaster;
    }

    generateLevel(difficulty){
        const length = randomLength(difficulty*2,difficulty*2+2);
        const checkPointDistance = 100;
        const checkpointAngle = Math.cos(degreeToRad(11));

        var direction = new THREE.Vector3(0,0,-1);
        var pos = direction.clone();
        pos.multiplyScalar(20)

        var checkpoints = new THREE.Object3D()
        checkpoints.name = 'checkpoints'
        this.level.add(checkpoints)

        //Rings texture
        const loader = new DDSLoader();
        const map4 = loader.load( '../resources/textures/explosion_dxt5_mip.dds');
		
        const material= new THREE.MeshBasicMaterial( { map: map4,  blending: THREE.AdditiveBlending, depthTest: true, transparent: true} );
        material.side = THREE.DoubleSide
        material.transparent=true
        material.opacity= 0.3

        for (var i = 0;i<length;i++){
            var checkpoint = new MeshObject();
            //test geometries
            const geometry = new THREE.TorusGeometry( 7, 1, 16, 10 );
            checkpoint.mesh = new THREE.Mesh(geometry,material);
            checkpoints.add(checkpoint);
            checkpoint.position.set(pos.x,pos.y,pos.z);
            let bbox = checkpoint.createBoundingBox(5,5,5)
            

            var newDir = new THREE.Vector3();
            newDir.randomDirection();
            var angle = direction.dot(newDir);
            while(angle<checkpointAngle){
                newDir.randomDirection();
                angle = direction.dot(newDir);
            }
            direction = newDir.clone();
            var newPos = direction.clone();
            newPos.multiplyScalar(checkPointDistance);
            pos.add(newPos);
            //pos.multiplyScalar(checkPointDistance);
        }

        this.gameMaster.CPMax = length;
        this.gameMaster.updateCPCount();
    }
}

function randomLength(min,max){
    return Math.floor(Math.random()*(max-min)+min)
}

function degreeToRad(degree){
    return degree*(Math.PI/180);
}
export default LevelGenerator
