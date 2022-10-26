import * as THREE from "three";
import { FlyControls } from 'FlyControls';
import MeshObject from "./MeshObject.js";
class Ship extends THREE.Object3D{
    constructor(domElement, camera){
        super();
        this.name = "ship";
        this.camera = camera;
        this.cube;
        this.helperBox;
        this.boxGeometry;
        this.element = domElement
        this.ConstantboxGeometry = new THREE.Box3();
        this.shipModel = new MeshObject();
        this.shipModel.loadMesh("../resources/meshes/spaceship.glb");
        const scale = 1;
        this.shipModel.scale.set(scale,scale,scale);
        this.shipModel.translateZ(-10);
        this.shipModel.translateY(-5)
        this.shipModel.rotateY(Math.PI);
        this.basisX = new THREE.Vector3()
        this.current_basis = new THREE.Vector3()
        this.oldBasis = new THREE.Vector3()
        this.basisY = new THREE.Vector3()
        this.basisZ = new THREE.Vector3()
    
        this.controls = new FlyControls(this, domElement);
        this.controls.dragToLook = true;
        this.controls.movementSpeed = 50;
        this.controls.rollSpeed = 0.5;
        this.controls.autoForward = true;

        this.add(this.camera)
        this.add(this.shipModel)

        this.camera.position.add(new THREE.Vector3(0,0,0))
    }

    vectorThrust(oldDir){
        //oldDir = this.worldToLocal(oldDir)
        var forward = new THREE.Vector3(0,0,1)
        this.getWorldDirection(forward)
        var shipMatrix = new THREE.Matrix3()
        shipMatrix.setFromMatrix4(this.matrixWorld)
        shipMatrix.invert()

        forward.applyMatrix3(shipMatrix)
        oldDir.applyMatrix3(shipMatrix)

        const leftThruster = this.getObjectByName("thruster_connection_left");
        const rightThruster = this.getObjectByName("thruster_connection_right");
        const shipRotation = this.children[1]
        
        oldDir.sub(forward);
        //oldDir = this.worldToLocal(oldDir)
        var vertical = oldDir.y;
        var orizontal = oldDir.x;
        //var angle=oldDir.dot(this.up);
        shipRotation.matrixWorld.extractBasis(this.oldBasis, this.basisY, this.basisZ)
        
       
       
        const scale = this.element.width/this.element.height * 2

        // This may cause the glitch of the thruster. The next step would be to compute the angle
        // in a different way (This one does take into account that the oldir does not change when moving wrt to y
        // and takes its orizontal component to update the z rotation of the ship. What should be fixed
        // but its not necessary maybe is how one can correctly compute the angle)
        // and after that just try to update the rotation of the ship around z via
        // shipRotation.z += angle
        // It seems to work when plugged in a random value (this orizontal and scale stuff)
        // We need to add some check to stop the rotation when reaching a particular configuration
        // i.e 90 degrees wrt to z. There are a couple of ways to make this check, one way would be to directly 
        // check the worldmatrix of this object, take its rotational part and use the director cosine of the x 
        // component. Whenever the director cosine of this componenent equals the y axis (i.e 0 1 0), we won't 
        // make the rotation update. Moreover whenever the direction of the ship goes back to the approach direction
        // (whenever oldDir equals 0 0 1) we put back the orientation of the ship to its original orientation
        
        // This approach is problematic since the basis are changing when moving in vertical directions ofc
        shipRotation.rotation.z += -orizontal*scale
        shipRotation.matrixWorld.extractBasis(this.current_basis, this.basisY, this.basisZ)
        //this.current_basis.sub(this.oldBasis)
        console.log(this.oldBasis)
        console.log(this.current_basis)
       // leftThruster.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),(vertical-orizontal)*scale)
        //rightThruster.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),(vertical+orizontal)*scale)
        
    }
    createBoundingBox(x=3, y=2, z=5, parent = this)
    {
        parent.boxGeometry = new THREE.Box3();
        parent.boxGeometry.setFromCenterAndSize(this.position, new THREE.Vector3( x, y, z ) );
        parent.ConstantboxGeometry.setFromCenterAndSize(this.shipModel.position, new THREE.Vector3( x, y, z ) );
        parent.helperBox = new THREE.Box3Helper(parent.boxGeometry)
        return parent.helperBox
    }
    //Let's try creating a box that follows the ship, and then setting the bounding box via setfromobject
    
    updateBoundingBox(matrix, parent=this)
    {   
        parent.helperBox.box.copy(parent.ConstantboxGeometry).applyMatrix4(matrix)
    }
}
function degreeToRad(degree){
    return degree*(Math.PI/180);
}
export default Ship;
