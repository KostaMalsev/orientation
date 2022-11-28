//Rotation helper supports rotation of the player and his alignment to true north


let RotHelper = {};

//Counter for init reading:
RotHelper.CmpssEventCounter=0;

//Hold compass heading :
RotHelper.CompassHeading=0;

RotHelper.Initial_cmpss_val=0; //for debug only



//Function initializes the rotation module
function InitRot()
{
    //Set listener to compass-event: 
    window.addEventListener('compass-event', SetInitRotation);
    
}


//Function sets initial rotation
function SetInitRotation(e)
{
    
    if( (e.detail.compass_reading!=0) && !(isNaN(e.detail.compass_reading))) {        

        let cmpss360 = e.detail.compass_reading;
        
        let cmpss180 = (cmpss360-180)%180;//to range [-180,180]

        let rot_y_ = RotTransform(cmpss180);
        
        if(isNaN(rot_y_))
          rot_y_=0;//ERROR
        
        let rot_y = rot_y_*Math.PI/180;

        //Set player rotation:
        CameraWrapper.rotation.x = 0;
        CameraWrapper.rotation.y = rot_y;//[-pi..pi]
        CameraWrapper.rotation.z = 0;

        //Compass tends to be icorrect in the beginning, so we take 5 takes of it:
        if(RotHelper.CmpssEventCounter > 5) 
        {
            window.removeEventListener('compass-event', SetInitRotation);
            
            console.log('Rotation module is loaded and ready');
            
            RotHelper.Initial_cmpss_val = cmpss180;
            
          // RotHelper.CmpssEventCounter=0;
            
            //CameraWrapper.camera.updateMatrix();
  
            //CameraWrapper.camera.updateMatrixWorld();
            
        }else{
          
            RotHelper.CmpssEventCounter++;
        }
        
        RotHelper.CompassHeading = e.detail.compass_reading;
    }
}


//Receives cmpss in [-180,180] and returng rot.y for the platform
function RotTransform(cmpss)
{
    if(cmpss>=-180 && cmpss<-90 ) 
        return cmpss+90;
    
    if(cmpss >=-90 && cmpss<0) 
        return cmpss+90;
    
    if(cmpss>=0 && cmpss<90) 
        return cmpss+90;
    
    if (cmpss>=90 && cmpss<180) 
        return cmpss - 270;

    return NaN;
}



//Convert degrees [-180, 180) to [0..360]
function Convert180to360(deg)
{
    //var x = Math.random()*360-180;  // Generate random angle in range [-180, 180)
    let deg_r = (deg + 360) % 360;        // Normalize to be in the range [0, 360)
    return deg_r;
}

//Convert degrees [-180, 180) to [0..360]
function Convert360to180(deg)
{
    let deg_r = ((deg - 180) % 180);        // Normalize to be in the range [-180, 180)
    return deg_r;
}

