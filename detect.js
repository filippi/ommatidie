// Canvas setup
const drawCtx = drawCanvas.getContext('2d');

// Global flags
const flipHorizontal = true;
let stopPrediction = false;
let isPlaying = false,
    gotMetadata = false;
let firstRun = true;
let lastDistanceToHead = -1
let savedDistanceToHead= 1

// check if metadata is ready - we need the sourceVideo size
sourceVideo.onloadedmetadata = () => {
    console.log("video metadata ready");
    gotMetadata = true;
    if (isPlaying)
        load()
};

// Check if the sourceVideo has started playing
sourceVideo.onplaying = () => {
    console.log("video playing");
    isPlaying = true;
    if (gotMetadata) {
        load()
    }
};

function load(multiplier=0.75, stride=16) {
    sourceVideo.width = sourceVideo.videoWidth;
    sourceVideo.height = sourceVideo.videoHeight;

    // Canvas results for displaying masks
    drawCanvas.width = sourceVideo.videoWidth;
    drawCanvas.height = sourceVideo.videoHeight;

    userMessage.innerText = "Waiting for Machine Learning model to load...";

    console.log(`loading BodyPix with multiplier ${multiplier} and stride ${stride}`);

    bodyPix.load({multiplier: multiplier, stride: stride, quantBytes: 4})
        .then(net => predictLoop(net))
        .catch(err => console.error(err));
}

async function predictLoop(net) {

    stopPrediction = false;

    let lastFaceArray = new Int32Array(sourceVideo.width * sourceVideo.height);
    let alerts = 0;
    let alertTimeout = false;

    enableDashboard(firstRun); // Show the dashboard

    // Timer to update the face mask
    let updateFace = true;
    setInterval(() => {
        updateFace = !updateFace;
    }, 1000);

    while (isPlaying && !stopPrediction) {

        // BodyPix setup
        const segmentPersonConfig = {
            flipHorizontal: flipHorizontal,     // Flip for webcam
            maxDetections: 1,                   // only look at one person in this model
            scoreThreshold: 0.5,
            segmentationThreshold: 0.6,         // default is 0.7
        };
        const segmentation = await net.segmentPersonParts(sourceVideo, segmentPersonConfig);


        const faceThreshold = 0.9;
        const touchThreshold = 0.01;

        const numPixels = segmentation.width * segmentation.height;


        // skip if noting is there
        if (segmentation.allPoses[0] === undefined) {
            // console.info("No segmentation data");
            continue;
        }

        // Draw the data to canvas
        draw(segmentation);

        // Verify there is a good quality face before doing anything
        // I am assuming a consistent array order
        let nose = segmentation.allPoses[0].keypoints[0].score > faceThreshold;
        let leftEye = segmentation.allPoses[0].keypoints[1].score > faceThreshold;
        let rightEye = segmentation.allPoses[0].keypoints[2].score > faceThreshold;
       
        // Check for hands if there is a nose or eyes
        if (nose && (leftEye || rightEye)) {

            // Look for overlaps where the hand is and the face used to be

            // Create an array of just face values
            let faceArray = segmentation.data.map(val => {
                if (val === 0 || val === 1) return val;
                else return -1;
            });

            // Get the hand array
            let handArray = segmentation.data.map(val => {
                if (val === 10 || val === 11) return val;
                else return -1;
            });

            let facePixels = 0;
            let score = 0;

            for (let x = 0; x < lastFaceArray.length; x++) {

                // Count the number of face pixels
                if (lastFaceArray[x] > -1)
                    facePixels++;

                // If the hand is overlapping where the face used to be
                if (lastFaceArray[x] > -1 && handArray[x] > -1)
                    score++;
            }

            let multiFaceArray = arrayToMatrix(faceArray, segmentation.width);
            let multiHandArray = arrayToMatrix(handArray, segmentation.width);
            let touchScore = touchingCheck(multiFaceArray, multiHandArray, 10);
            score += touchScore;


            // Update the old face according to the timer
            if (updateFace)
                lastFaceArray = faceArray;

            updateStats(alertTimeout);

            // Handle alerts
            if (score > facePixels * touchThreshold && !alertTimeout) {
                console.info(` numPixels: ${numPixels} \n facePixels: ${facePixels}\n score: ${score}, touchScore: ${touchScore}\n` +
                    ` facePixels%: ${facePixels / numPixels}\n touch%: ${score / facePixels}`);
                alerts++;
                console.log("alert!!!", alerts);

                // User alerts
                if (beepToggle.checked)
                    beep(350, 150, 0);
                if (notifyToggle.checked)
                    notify(`You touched your face! That's ${touches+1} times now`);

                alertTimeout = true;

                setTimeout(() => {
                    console.log("resuming alerts");
                    alertTimeout = false;
                }, alertTimeoutEntry.value * 1000)
            }

        }

    }

}

// Checks if there is a face pixel above, below, left or right to this pixel
function touchingCheck(matrix1, matrix2, padding) {
    let count = 0;
    for (let y = padding; y < matrix1.length - padding; y++)
        for (let x = padding; x < matrix1[0].length - padding; x++) {
            if (matrix1[y][x] > -1) {
                for (let p = 0; p < padding; p++) {
                    // if the hand is left or right, above or below the current face segment
                    if (matrix2[y][x - p] > -1 || matrix2[y][x + p] > -1 ||
                        matrix2[y - p][x] > -1 || matrix2[y + p][x] > -1) {
                        count++;
                    }
                }
            }
        }
    return count
}

// Use the bodyPix draw API's
function draw(personSegmentation) {

    if (showMaskToggle.checked) {
        let targetSegmentation = personSegmentation;

        // Draw a mask of the body segments - useful for debugging

        // Just show the face and hand parts
        targetSegmentation.data = personSegmentation.data.map(val => {
            if (val !== 0 && val !== 1 && val !== 10 && val !== 11)
                return -1;
            else
                return val;
        });

        const coloredPartImage = bodyPix.toColoredPartMask(targetSegmentation);
        const opacity = 0.7;
        const maskBlurAmount = 0;
        bodyPix.drawMask(
            drawCanvas, sourceVideo, coloredPartImage, opacity, maskBlurAmount,
            flipHorizontal);

    }

    // drawMask clears the canvas, drawKeypoints doesn't
    if (showMaskToggle.checked === false) {
        // bodyPix.drawMask redraws the canvas. Clear with not
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }

    // Show dots from pose detection
    if (showPointsToggle.checked) {
        personSegmentation.allPoses.forEach(pose => {
            if (flipHorizontal) {
                pose = bodyPix.flipPoseHorizontal(pose, personSegmentation.width);
            }
            drawKeypoints(pose.keypoints, 0.1, drawCtx);
        });
    }

}

var refScene = {scene:{
                              camera: {
                              center: { x: 0, y: 0, z: 0 }, 
                              eye: { x: 0, y: 0, z: 0 }, 
                               up: { x: 0, y: 0, z: 1 }
                                }
                            },}



var lookerRef = {inited: false, leftEar: { x: 0, y: 0}, rightEar: { x: 0, y: 0}, up: { x: 0, y: 0, z: 1 }, }

var lookerMod = {inited: false, leftEar: { x: 0, y: 0}, rightEar: { x: 0, y: 0}, up: { x: 0, y: 0, z: 0 }, }

function dist( p1, p2 ){
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;
    return Math.sqrt( a*a + b*b );
}
function toDegrees(rads) {
  return rads * 180 / Math.PI;
};
function toRads(degs) {
  return (degs / 180) * Math.PI;
};
function drawKeypoints(keypoints, minConfidence, ctx, color = 'aqua') {
    var rEye = null
    var lEye = null
    var rHand = null
    var lHand = null
    var rEar = null
    var lEar = null
    var dEars = 0.2 // typical distance between human eyes
 
    var camFOV = toRads(55)

    // find right eye, left eye, right hand, left hand
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score > minConfidence) {
                if (keypoint.part === 'rightEye'){
                  rEye = keypoint.position;
                 }
                if (keypoint.part === 'leftEye'){
                  lEye = keypoint.position;
                 }
                if (keypoint.part === 'rightHand'){
                  rHand = keypoint.position;
                 }
                if (keypoint.part === 'leftHand'){
                  lHand = keypoint.position;
                 }
                if (keypoint.part === 'rightEar'){
                  rEar = keypoint.position;
                 }
                if (keypoint.part === 'leftEar'){
                  lEar = keypoint.position;
                 }
            
        const {y, x} = keypoint.position;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        }
    }


   
    
    // exit if not both eyes
    if((rEye === null) || (lEye === null)||(rEar === null) || (lEar === null)){
        return;
    }


    
    // normalize both eyes positions 
    rEar.x = rEar.x/sourceVideo.videoWidth;
    rEar.y = rEar.y/sourceVideo.videoHeight;
    lEar.x = lEar.x/sourceVideo.videoWidth;
    lEar.y = lEar.y/sourceVideo.videoHeight;
    
     
   
    
    // if no ref looker, looker is set and continue
    if (lookerRef.inited === false) {   
      lookerRef.leftEar.x = lEar.x;
      lookerRef.rightEar.x = rEar.x;  
      lookerRef.leftEar.y = lEar.y;
      lookerRef.rightEar.y = rEar.y;
        //lookerRef.inited = true;
    }
    
    // compute distance = distance between Ears
    var interEars = dist(lookerRef.leftEar,lookerRef.rightEar);
    var iEarsInAngle = interEars*camFOV
    var zEarsInAngle = (((lEar.y+rEar.y)/2)*camFOV)+(Math.PI/2)-(camFOV/2)
    var xEarsInAngle = (((lEar.x+rEar.x)/2)*camFOV)+(Math.PI/2)-(camFOV/2)
    
    distanceToHead = ((dEars/2)/Math.tan(iEarsInAngle))
   // console.log(distanceToHead);
    //  now compute the face location in space in meters with 0 being the screen center .. dampen the distance to the screen as should not move fast. Given the initialisation is 0.5 meters, 
    
    
    // OK, from that I can compute the camera vector to the center of the figure (given the center is 000)
    // If the center is at 0/0/0 and it is at the center of the screen... well shall be no problem.
    
     
    // make the diff by comparing with the reference looker 
    
    // compute the new Scene 
    //QRect face = featureDetector->getFaceRect();
    //QRect lEar = featureDetector->getLeftEarRect();
    //QRect rEar = featureDetector->getRightEarRect();


    //QSize imageSize = featureDetector->getImageSize();
    //float distFromCamera = featureDetector->getDistanceFromCamera();
    //zFar = distFromCamera;

    //int centerEarsX = (lEar.x() + rEar.right()) / 2;
    //int centerEarsY = lEar.y() + lEar.height() / 2;

    //float ratio = 0.05f;
    //int x = centerEarsX - imageSize.width() / 2;
    //int y = centerEarsY - imageSize.height() / 2;

    //cameraPosition.setX(x * ratio);
    //cameraPosition.setY(-y * ratio);
    //cameraPosition.setZ(distFromCamera / 3.5f);
    fig = document.getElementById('myDiv');
    var nx = 1//fig.layout.scene.camera.Ear.x 
    var ny = 1//fig.layout.scene.camera.Ear.y 
    var nz = 1//fig.layout.scene.camera.Ear.z 
      if (lastDistanceToHead == -1){
          lastDistanceToHead = distanceToHead ;
      }
       
    else{
        lastDistanceToHead = distanceToHead*0.5 + lastDistanceToHead*0.5;
        if (Math.abs(lastDistanceToHead-savedDistanceToHead)>0.005){
            savedDistanceToHead = lastDistanceToHead;
            
        }
    }
    var adjustedDistance = savedDistanceToHead*3//10-4
    
 
     nx = adjustedDistance * Math.cos(xEarsInAngle)
     ny = adjustedDistance * Math.sin(xEarsInAngle)
     nz = adjustedDistance * Math.cos(zEarsInAngle)
 
    
    var newScene = {scene:{
                              camera: {
                              center: { x: 0, y: 0, z: 0}, 
                              eye: { x: nx, y: ny, z: nz }, 
                                  //eye: { x:2, y:  3*(1-interEyes*lookerRef.leftEye.x), z: 3*(1-interEyes*lookerRef.leftEye.y )}, 
                               up: { x: 0, y: 0, z: 1 }
                                }
                            },}
    // update the layout
    var test = fig.layout.scene.camera
  
        
    lastDistanceToHead = lastDistanceToHead+0
    console.log(nx,ny,nz) ;
    Plotly.relayout(document.getElementById('myDiv'), newScene);
    
}
// Draw dots
function drawKeypoints2(keypoints, minConfidence, ctx, color = 'aqua') {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }else{
             if (keypoint.part === 'rightEye'){
                  nx=  keypoint.position.x;
                 
                  ny=  keypoint.position.y;
                 let dispX =  (nx-400)/100;
                console.log(keypoint.position, dispX);
                
                var update = {
                    scene:{
                              camera: {
                              center: { x: 1-dispX, y: 0, z: 0 }, 
                              eye: { x: 2, y: 2, z: 0.1 }, 
                               up: { x: 0, y: 0, z: 1 }
                                }
                            },
                    };
            
                    Plotly.relayout(document.getElementById('myDiv'), refScene);
                 }
        }

        const {y, x} = keypoint.position;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

    }
}

// Helper function to convert an arrow into a matrix for easier pixel proximity functions
function arrayToMatrix(arr, rowLength) {
    let newArray = [];

    // Check
    if (arr.length % rowLength > 0 || rowLength < 1) {
        console.log("array not divisible by rowLength ", arr, rowLength);
        return
    }

    let rows = arr.length / rowLength;
    for (let x = 0; x < rows; x++) {
        let b = arr.slice(x * rowLength, x * rowLength + rowLength);
        newArray.push(b);
    }
    return newArray;
}
