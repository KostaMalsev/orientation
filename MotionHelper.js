//GPS motion helper module:

let Mhelper = {};

//Globals:
Mhelper.Scale = 1000; //scale km to pixel

Mhelper.positionGPS = {
  lat: 0,
  lon: 0,
  last_lat: 0,
  last_lon: 0
}; //GPS position of the player
Mhelper.positionXYZ = null; //VR position of the player in Vector3 format [km*Scale]

Mhelper.CenterPos = {
  lat: 0,
  lon: 0
}; //Center of the VR world new Location(31.3365254f, 34.8968868f)
Mhelper.worldIsSet = false; //Indicates that the center of the VR world is set with GPS coordinates




//Function initializes movement params
function InitMovement() {

  //Set the world center position to default value:
  Mhelper.CenterPos.lat = 32.159106367661465;
  Mhelper.CenterPos.lon = 34.80578701716976;

  //Set event handler on GPS event: 
  let id_watch = navigator.geolocation.watchPosition(nav_geo_success,
    nav_geo_error, this.options);

  //Listen to listener to completion event
  window.addEventListener('gps-coord-set', () => {
    console.log('Location initialized and stable')
  });

}



//Event handler for GPS event:
function nav_geo_success(pos) {

  //If GPS data from browser is valid:
  if ((!isNaN(pos.coords.latitude)) && (!isNaN(pos.coords.longitude))) {

    //Update current position:
    Mhelper.positionGPS.lat = pos.coords.latitude;; //LastDeviceGPS.lat;
    Mhelper.positionGPS.lon = pos.coords.longitude; //LastDeviceGPS.lon;


    //Calculate the position in XYZ world of the camera:
    //Get current position of camera wrapper:
    let currentPosition = CameraWrapper.position;

    //Convert from lat,lon -> x,y to next position of the camera:
    let res4 = GetDirection(Mhelper.CenterPos, Mhelper.positionGPS); //[km]

    //Store the next camera position int vector form (global):
    Mhelper.positionXYZ = new THREE.Vector3(res4.x * Mhelper.Scale,
      CameraWrapper.position.y, res4.y * Mhelper.Scale);

    let crd_accuracy = pos.accuracy; //@@ GPS accuracy for debug only

    if (crd_accuracy > 65) { // If accuracy is less than 30 meters
      //TBD - low accuracy
    } else {
      //TBD - normal accuracy
    }

    //Take the first good GPS reaqing and set the world center to be it:
    if (Mhelper.positionGPS.lat != 0 && Mhelper.positionGPS.lat != 0 && !Mhelper.worldIsSet) {

      InitWorldCenter(Mhelper.positionGPS, Mhelper.CenterPos);
      Mhelper.worldIsSet = true;

    }
  }
}



//Set initial position for the player in VR space:
function InitWorldCenter(PosCoord, WorldCenterPos) {

  Mhelper.CenterPos.lon = PosCoord.lon;
  Mhelper.CenterPos.lat = PosCoord.lat;

  const z = 1;

  CameraWrapper.position.x = 0;
  CameraWrapper.position.y = z; //height of the camera relative to plane xz in VR world
  CameraWrapper.position.z = 0;

  //Signal that there is gps:
  window.dispatchEvent(new CustomEvent('gps-coord-set', {
    detail: {
      position: Mhelper.CenterPos
    }
  }));
}



//Updates current position of player:
function UpdateCameraPos() {

  let v_res = null;

  if (Mhelper.positionXYZ != null) {

    if (!isNaN(CameraWrapper.position.x)) {

      let origin = new THREE.Vector3(CameraWrapper.position.x,
        CameraWrapper.position.y, CameraWrapper.position.z);

      //Interpulate the motion from origin to positionXYZ
      v_res = SmoothMotion(origin, Mhelper.positionXYZ, 100);

    } else {

      v_res = positionXYZ;

    }

    CameraWrapper.position.x = v_res.x;
    CameraWrapper.position.y = v_res.y;
    CameraWrapper.position.z = v_res.z;

  }
}


//Function interpulates position between vector v1 to vector v2 in n_step steps
//Returns the next position - mid_position:
//Usage:
//In function animate:
//Current position
//let v1 = new THREE.Vector3(obj.position.x,obj.position.y,obj.position.z);
//Target position
//let v2 = new THREE.Vector3(res.x,res.y,res.z);
//Number of steps to transition  - configuration
//let num_steps = 100;//1% in frame render
//SmoothMotion(v1, v2, 20)

//Globals:
Mhelper.curr_step = 0; //is midposition between to points
Mhelper.last_vb = null;
Mhelper.last_mid_pos = null;

function SmoothMotion(va, vb, num_steps) {

  //If in the middle of interpulation the destination moved,
  //We will start from the finish and update the new destination position with same step
  if (Mhelper.last_vb != null) {

    if (!Mhelper.last_vb.equals(vb)) {

      Mhelper.curr_step = 0;
      Mhelper.last_vb = vb;

      return Mhelper.last_mid_pos;
    }
  } else {

    Mhelper.last_vb = vb;

  }

  //Update the alpha (percent/100 of final value)
  let alpha = Mhelper.curr_step / num_steps;

  //If we've reached the target:
  if (alpha > 1) {
    Mhelper.curr_step = 0;
    Mhelper.last_mid_pos = vb;
    return Mhelper.last_mid_pos;
  } else {
    //not yet reached the target, return next step towards the target
    Mhelper.curr_step++;
    Mhelper.last_mid_pos = va.lerp(vb, alpha);
    return Mhelper.last_mid_pos;
  }
}


//Error handler for GPS event:
function nav_geo_error(err) {

  console.log('gps error: ', JSON.stringify(err));

}


//Get direction from pt. of origin to target :
//distance[km],[x,y]-in [km] and bearing[deg from north]
//from pt of origin to target location:
function GetDirection(Location_source, Location_target) {

  let lat2 = Location_target.lat;
  let lat1 = Location_source.lat;
  let lon2 = Location_target.lon;
  let lon1 = Location_source.lon;


  const R = 6371; // [km]
  let phi1 = THREE.Math.degToRad(lat1);
  let phi2 = THREE.Math.degToRad(lat2);
  let lambda1 = THREE.Math.degToRad(lon1);
  let lambda2 = THREE.Math.degToRad(lon2);

  let delta_phi = THREE.Math.degToRad(lat2 - lat1);
  let delta_lambda = THREE.Math.degToRad(lon2 - lon1);

  let a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  let distance = d; //distance in km

  //Calculate the bearing:
  //where phi1, lambda1 is the start point, phi2,lambda2 the end point(delta_lambda is the difference in longitude)

  let y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);

  let x = Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

  let brng = THREE.Math.radToDeg(Math.atan2(y, x));

  let bearing = brng; //bearing in [deg]

  //Fix the non-relevant degrees:
  bearing = (bearing + 360) % 360;

  let brng_tmp = (brng + 360) % 360;
  let x_ = distance * Math.cos(THREE.Math.degToRad(brng_tmp)); //km*Scale
  let y_ = distance * Math.sin(THREE.Math.degToRad(brng_tmp)); //km*Scale

  let result = {
    distance_: distance,
    bearing_: bearing,
    x: x_,
    y: y_,
  };
  return result;
}
