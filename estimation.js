
//Estimate time to target in minutes: 
//(assuming walking spped is WALK_SPEED km/h)
function estimation(coord, currPos) {
  
  //If the globcenter is not initialized:
  if (coord.lat == 0 && coord.lon == 0)
    return;

  const WALK_SPEED = 3; //km/h

  const z = -8; //see the z of the player position (which is set to be z=4 in motionHelper module)

  //Get the relative position to world center:
  let result = GetDirection(currPos, coord); //distance in [km]

  let vrpos = new THREE.Vector3(result.x * Mhelper.Scale, z, result.y * Mhelper.Scale);
  
  let dist = CameraWrapper.position.distanceTo(vrpos); //[km*Scale]

  let walkingTime = (((dist / Mhelper.Scale) / WALK_SPEED) * 60).toFixed(1); //in[minutes]

  return {walkDist: walkingTime, aspect: getAspect(vrpos) };

}



//Retrieves relative angle to camera view 
//given relative position in 3D space vrpos:
function getAspect(vrpos) {

  //"camera" is global variable 
  //which defines the current point view of the player
 // camera.updateMatrix();
  
 // camera.updateMatrixWorld();
  
  // 3D point to check
  var pos = new THREE.Vector3(vrpos.x, vrpos.y, vrpos.z);
  

  pos.x = -vrpos.x * Mhelper.Scale;
  
  pos.y = (CameraWrapper.position.y) + Math.floor(5*(Math.random())); //height of the point relative to plane xz
  
  pos.z = vrpos.y * Mhelper.Scale;
  
  //Create laser to the object to measure the delta angle:
  laser.lookAt(pos);
  
  let laser_rot = new THREE.Vector3(laser.rotation.x, 
                                    laser.rotation.y, laser.rotation.z);

  let ly = laser_rot.y * 180 / 3.14;
  let lx = laser_rot.x * 180 / 3.14; //pitch: [-90,..,-180,180,..,90]
  let lz = laser_rot.z * 180 / 3.14;
    
    laser.rotation.x=0;
    laser.rotation.y=0;
    laser.rotation.z=0;
  return {y:ly,x:lx,z:lz};//in degrees;
  
}




function testVitals() {
  
  //Check GPS data availability:

  console.log('GPS location: ' + JSON.stringify(Mhelper.positionGPS));

  //Check Rotation data availability:
  console.log('Rotation data: ' + CameraWrapper.rotation.y);

  let testCoord1 = {
    "lat": 31.241779897014453,
    "lon": 34.81248870780638
  }; //Some where in Beer Sheva

  let testCoord2 = {
    "lat": 31.243256162385038,
    "lon": 34.81265196913165
  }; //some other place in Beer-Sheva

  const parkPos = {
    lat: 31.335425, 
    lon: 34.896735
  };
  
  
  
  //kosta
  const park2 = 
  { 
    "lat": 31.335429199489425,
    "lon": 34.896722581147
  };
  
  const testCurrPos = {
    "lat": 31.3363433,
    "lon": 34.8966079
  };
  
  //Test function
  //let res = estimation(testCoord1, testCoord2);
  let res = estimation(park2, testCurrPos);
  console.log('Testing estimation: walk distance in minutes' + res.walkDist + ', aspect[deg]:'+JSON.stringify(res.aspect) );
}
