import * as THREE from "three";
import {GLTFLoader} from 'GLTFLoader'
class MeshObject extends THREE.Object3D{
    constructor(){
        super();
        this._mesh;
    }

    get mesh() {return this._mesh;}
    set mesh(mesh){
        super.clear()
        super.add(mesh);
        this._mesh = mesh;
    }

    //TODO 
    loadMesh(meshFile,filetype,parent=this){
        const loader = new GLTFLoader();

        loader.load(
            meshFile,
            function(object){//object is a Object3D
                //parent.mesh = object.getObjectByName("Group1");
                parent.add(object.scene.children[0]);
            }
        )
    }
    createBoundingBox(x=2,y=2,z=2, parent=this)
    {
        parent.boxGeometry = new THREE.Box3();
        parent.boxGeometry.setFromCenterAndSize(this.position, new THREE.Vector3( x, y, z ) );

        parent.helperBox = new THREE.Box3Helper(parent.boxGeometry)
        
        
        return parent.helperBox
    }
}

export default MeshObject;