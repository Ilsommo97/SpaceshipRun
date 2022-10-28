import * as THREE from "three";
import {GLTFLoader} from 'GLTFLoader'
import {sampleCubePosition, getRandomArbitrary} from "./utils.js"


class InstancedMeshGroup extends THREE.Group{
    constructor(name)
    {
        super()
        super.name = name
        this.loader = new GLTFLoader();
        this.meshPosition = [] //This array is composed of the position of each mesh instanciated
        this.CubeSide; //This is the side length of the cube 
        this.CubeOrigin;
        this.count;
        this.BBgeometry;
        this.BBoxArray = [];
    }

    async load3DModel(meshFile, parent=this)
    {
        var promise = await parent.loader.loadAsync(meshFile)
        return promise
    }

    loadMeshAsCube(count=1 , promise, CubeOrigin = [0,0,0] , CubeSide = 10, scale, parent=this)
    { 
        this.CubeSide = CubeSide
        this.CubeOrigin = CubeOrigin
        //this.position.copy(new THREE.Vector3(CubeOrigin[0], CubeOrigin[1], CubeOrigin[2]))
        /**
         The code line above this comment is causing the trouble of meteorites coordinates not matching with the one of the camera (MAYBE world coordinates) 
        I do think that it is related to the fact that it somehow updates the postion of all the meteorites, so that when we were setting 
        the z component to be -100 for example, each meteorites was rendered -100 on z axis but their position was somehow not matching the one displayed
        I need to ask someone for this issue
        */
        parent.count = count
        
        for (let i=0; i < parent.count; i++)
        {
            parent.meshPosition.push(sampleCubePosition(CubeSide, CubeOrigin))
        }

        promise.scene.traverse
            (function(child)
                {
                    if (child.isMesh)
                        {
                        child.material.side = THREE.DoubleSide // An attempt to fix the hole in the meteorites
                        var instancedMesh = new THREE.InstancedMesh( child.geometry, child.material, count );
                        //instancedMesh.scale.set(scale,scale,scale)
                        var matrix = new THREE.Matrix4()
                        //instancedMesh.geometry.computeBoundingBox()
                        
                        for (let i=0; i < count; i++)
                            {
                            matrix.makeScale(scale, scale, scale) 
                            matrix.setPosition(parent.meshPosition[i][0], parent.meshPosition[i][1], parent.meshPosition[i][2]) //This one affects just the position element of the matrix
                            instancedMesh.setMatrixAt( i, matrix );
                            }
                        parent.add(instancedMesh)
                        instancedMesh.instanceMatrix.needsUpdate = true;
                        instancedMesh.matrixWorld
                        }
                }
            )
    }
    /*
    There is one b(u)ig issue with this method. Okay it seems that the bug appears just when setting the z component of cube origin different from 0
    Somehow it is causing some problems with the coordinates of each meteorite. We need to solve this issue

    !** We need to fix the respawn option when we want to move an object wit negative velocity -> e.g left direction for x  !**
    */
    moveAlongAxis(axis= 'z', velocity= .1, respawn_position, limit_position, parent=this)
    {
        var mesh_matrix = new THREE.Matrix4()
        var pos =  new THREE.Vector3()
        var initial_quat = new THREE.Quaternion()
        var scale = new THREE.Vector3()
        
        for (let instancedMesh of this.children)
        {
        for (let index = 0; index < instancedMesh.count; index++)
            {
                instancedMesh.getMatrixAt(index, mesh_matrix)
                mesh_matrix.decompose(pos, initial_quat, scale)
                
                if (axis =='x') pos.x += velocity
                if (axis =='y') pos.y += velocity
                if (axis =='z') pos.z += velocity
                if (typeof respawn_position =='number')
                {
                    if (axis =='x')
                    {
                        if (pos.x >= limit_position)
                        {
                            pos.x = respawn_position
                        }
                    }
                    if (axis =='y')
                    {
                        if (pos.y >= limit_position)
                        {
                            
                            pos.y = respawn_position
                        }
                    }
                    if (axis =='z')
                    {
                        if (pos.z >= limit_position)
                        {
                            
                            pos.z = respawn_position
                        }
                    }
                }
                mesh_matrix.compose(pos, initial_quat, scale)  
                instancedMesh.setMatrixAt(index, mesh_matrix)
                // Bounding box update!
                if (parent.BBoxArray.length !=0)
                {
                parent.BBoxArray[index].box.copy( parent.children[0].geometry.boundingBox )
                parent.BBoxArray[index].box.applyMatrix4(mesh_matrix)
                }
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
        }
    }
    /**
       This method is needed to rotate each object around its own axis. If we use the method of the three js group class
       each object will rotate around the position of the group defined in in the loadmeshascube (the cubeOrigin),
       resulting in a different behaviour
    */
    rotateOnAxis(axis = 'y', angularVelocity= .1, parent=this)
    {
        var mesh_matrix = new THREE.Matrix4()
        var pos =  new THREE.Vector3()
        var initial_quat = new THREE.Quaternion()
        var end_quat = new THREE.Quaternion()
        var scale = new THREE.Vector3()
        mesh_matrix.matrixAutoUpdate = false
        if (axis == 'x') var factor_quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), angularVelocity )
        else if (axis == 'y') var factor_quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angularVelocity )
        else if (axis == 'z') var factor_quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), angularVelocity )
        else 
        {
            return console.error('the axis must be a string indicating x or y or z lowercase')
        }
        //we need to loop over all the meshes
        for (var instancedMesh of this.children)
        {
            //this.children is an array composed of a certain number of meshes composing the 3d Model (in the matilda case, we have 103 instanced mesh)
            //in the case of the meteorites, the 3d model is just composed of one mesh
            //Now if we want to move or rotate one of the 3d model added to scene, we need to access each one by using getmatrixat
            for (var i = 0; i< instancedMesh.count; i++)
            {
                instancedMesh.getMatrixAt(i, mesh_matrix)
                mesh_matrix.decompose(pos, initial_quat, scale)
                end_quat.multiplyQuaternions(initial_quat, factor_quat)
                mesh_matrix.compose(pos, end_quat, scale)
                instancedMesh.setMatrixAt(i, mesh_matrix)
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
        }
    }

    /*
        This method works only for 3D models that have jsut one mesh i.e this.children is composed of just one element. meteorites are composed of just one,
        more complex models may be composed of several ones (matilda is composed of 103 meshes)
    */
    createBoundingBox(parent=this)
    {
        if (parent.children.length !=1) console.error('This method works only for simpler models! (The ones composed by just one mesh)')
        parent.BBgeometry = parent.children[0].geometry.boundingBox
        for (let i=0; i< parent.count; i++)
        {
            let bbox =  new THREE.Box3();
            bbox.copy(parent.BBgeometry)
            let helperBox = new THREE.Box3Helper(bbox)
            parent.BBoxArray.push(helperBox)
            //If we do not want to visualize the bbox, we need to comment out the upper line and add the lower one
            //BBoxArray.push(bbox)
        }
        return parent.BBoxArray
    }

    intersectObject(gameMaster, box3, parent=this)
    {        
        var pos =  new THREE.Vector3()
        var initial_quat = new THREE.Quaternion()
        var scale = new THREE.Vector3()
        for (let i=0; i < parent.count; i++)
        {
            if (parent.BBoxArray[i].box.intersectsBox(box3)) 
            {
                /* let index = i //the index at which gettin the matrix of the related intersected mesh

                let intersectMatrix  = new THREE.Matrix4()
                parent.children[0].getMatrixAt(i, intersectMatrix)

                intersectMatrix.decompose(pos, initial_quat,scale )
                console.log(pos) */
                gameMaster.loseScreen()
            }
        }
        
    }
}

export default InstancedMeshGroup