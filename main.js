

//Main file for 3D localization engine 




//Create texture loader and scene:
const scene = new THREE.Scene();

//Create the camera wrapper - he will be aligned  to north and moved by GPS:
const CameraWrapper = new THREE.Object3D();
CameraWrapper.position.set(0, 0, 0.01 );

//Define perspective camera:
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
camera.position.set(0, 0, 0 );

//Set camera as camera wrapper child:
CameraWrapper.add(camera);
scene.add(CameraWrapper);

//Add laser for pointing to objects
let laser = new THREE.Object3D();
camera.add(laser);

//Set up the arrow and add it to the document:
const arrowEl = document.createElement( 'div' );
arrowEl.innerHTML = '<div class="arrow" style="font-size: 90px;rotate: -90deg">➤</div>';
document.body.appendChild(arrowEl);



//Create device binded controls:
var DevControls = new DeviceOrientationController( camera, null );
DevControls.connect();



//Animate function for rendering:
const animate = function () {
  
  //Update player position to next_pos - is updated from GPS
  UpdateCameraPos();

  //Get updated rotation sensor readings:
  DevControls.update();
  
  requestAnimationFrame(animate);
  
};

//Call animate recurring function:
animate();


//Start Sequence of initialization:
//Initialize location module
InitMovement();

//Init the rotation module:
InitRot();


