// some helpers function
function getRandomArbitrary(min, max) 
{
    return Math.random() * (max - min) + min;
}

function sampleCubePosition(CubeSide, CubeOrigin)
{
    var pos = [CubeOrigin[0] + getRandomArbitrary(-CubeSide/2, CubeSide/2), CubeOrigin[1] + getRandomArbitrary(-CubeSide/2, CubeSide/2)
                ,CubeOrigin[2] + getRandomArbitrary(-CubeSide/2, CubeSide/2)]
    return pos
}

export {getRandomArbitrary,sampleCubePosition}