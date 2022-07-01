// element selectors
const sourceVideo = document.querySelector('video');
const loader = document.getElementById('loader');
const infotext = document.getElementById('infotext');

//=== CAMERA ACCESS ===
function handleSuccess(stream) {
    const video = document.querySelector('video');
    console.log(`Using video device: ${stream.getVideoTracks()[0].label}`);
    video.srcObject = stream;
}

function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
        console.error(`The resolution requested is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
        console.error("User denied access to media devices");
    }
    console.error(`getUserMedia error: ${error.name}`, error);
}

document.body.onload = function() {
    document.querySelector('#content').hidden = true;
    // loader.style.display = "block";

    // Fix constraints to 640 px width; higher resolutions are more accurate but slower
    navigator.mediaDevices.getUserMedia({ video: { width: 320 }, audio: false })
        .then(handleSuccess)
        .catch(handleError)
}

// Change information text
function setInfoText(info) {
    infotext.innerHTML = info;
}


class PersonCanvas {
    constructor() {
        this.controls = document.querySelector('#controls')
        this.canvas = document.querySelector('canvas#person')
        this.ctx = this.canvas.getContext('2d');

        this.ctx.strokeStyle = "#0362fc";
        this.ctx.lineWidth = 5;

        this.ref = {
            x: this.canvas.width / 2,
            y: 150
        }
    }

    show() {
        this.controls.style.display = "block"
        // this._drawFixedPart()
        this.updatePositions()

        // Init click on buttons
        document.querySelectorAll("#buttons > button").forEach((e) => {
            e.addEventListener('click', (s) => {
                console.log("Clicked on", e.innerHTML)
            });
        })
    }

    hide() {
        this.controls.style.display = "none"
    }
    
    paintPoint(x,y,pointcolor){
        var oldColor = this.ctx.strokeStyle
        var oldSize = this.ctx.lineWidth
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = pointcolor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2)
        this.ctx.stroke();
        this.ctx.strokeStyle = oldColor
        this.ctx.lineWidth = oldSize
    }
    
    updatePositions(position) {
        if (!position) return;

        this._checkInteraction(position);

        const lw = this._projectCoords(position.leftWrist)
        const rw = this._projectCoords(position.rightWrist)
        const ls = this._projectCoords(position.leftShoulder)
        const rs = this._projectCoords(position.rightShoulder)
        const le = this._projectCoords(position.leftElbow)
        const re = this._projectCoords(position.rightElbow)

        const nose = this._projectCoords(position.nose)
        const rEye = this._projectCoords(position.rightEye)
        const lEye = this._projectCoords(position.leftEye)

        this._checkInteraction(lw);
        this._checkInteraction(rw);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Head
        const offsetRadius = 8
        const radius = Math.sqrt(Math.pow(rEye.x - lEye.x, 2) + Math.pow(rEye.y - lEye.y, 2)) + offsetRadius
        this.ctx.beginPath();
        this.ctx.arc(nose.x, nose.y, radius, 0, Math.PI * 2)
        this.ctx.stroke();

        // Eyes
        
        this.paintPoint(lEye.x, lEye.y,"#03dffc")
        this.paintPoint(rEye.x, rEye.y,"#03dffc")

        // Nose
        this.paintPoint(nose.x, nose.y + 3,"#fce303")
        this.ctx.beginPath();
        this.ctx.arc(nose.x, nose.y + 4, radius/2, Math.PI, Math.PI*2 , true); 
        this.ctx.stroke();                

        // Head to bottom
        const topNeck = nose.y + radius
        const bottomNeck = nose.y + radius + 10
        this.ctx.beginPath();
        this.ctx.moveTo(nose.x, topNeck);
        this.ctx.lineTo(nose.x, topNeck + (radius * 2));
        this.ctx.stroke();

        // Shoulders
        this.ctx.beginPath();
        this.ctx.moveTo(ls.x, ls.y);
        this.ctx.lineTo(nose.x, bottomNeck)
        this.ctx.lineTo(rs.x, rs.y);
        this.ctx.stroke();

        // Right elbow
        this.ctx.beginPath();
        this.ctx.moveTo(rs.x, rs.y)
        this.ctx.lineTo(re.x, re.y);
        this.ctx.stroke();

        // Left elbow
        this.ctx.beginPath();
        this.ctx.moveTo(ls.x, ls.y)
        this.ctx.lineTo(le.x, le.y);
        this.ctx.stroke();

        // Right hand
        this.ctx.beginPath();
        this.ctx.moveTo(re.x, re.y)
        this.ctx.lineTo(rw.x, rw.y);
        this.ctx.stroke();

        // Left hand
        this.ctx.beginPath();
        this.ctx.moveTo(le.x, le.y)
        this.ctx.lineTo(lw.x, lw.y);
        this.ctx.stroke();
        
        // Now  Joints
        this.paintPoint(lw.x, lw.y,"#03dffc")
        this.paintPoint(rw.x, rw.y,"#03dffc")
        this.paintPoint(le.x, le.y,"#03dffc")
        this.paintPoint(re.x, re.y,"#03dffc")
        this.paintPoint(ls.x, ls.y,"#03dffc")
        this.paintPoint(rs.x, rs.y,"#03dffc")
        
        
    }

    _checkInteraction(coords) {
        const { x, y } = coords;
        if (y < 40) {
            const index = parseInt(x / 100)
            changeMapLocation(index);

            // document.querySelectorAll("#buttons > button")[index].click()
        }
    }

    _projectCoords(obj) {
        const refX = this.ref.x;
        const refY = this.ref.y;

        return {
            x: obj.x * refX / 0.5,
            y: obj.y * refY / 0.5
        };
    }
}


// Canvas setup
const personCanvas = new PersonCanvas();

// Global flags
let flipHorizontal = true;
let isPlaying = false;
let gotMetadata = false;
let lastDistanceToHead = -1;
let savedDistanceToHead = 1;

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

function load(multiplier = 0.75,    stride = 8) {
    sourceVideo.width = sourceVideo.videoWidth;
    sourceVideo.height = sourceVideo.videoHeight;

    bodyPix.load({ multiplier: multiplier, stride: stride, quantBytes: 4 })
        .then(net => predictLoop(net))
        .catch(err => console.error(err));
}

async function predictLoop(net) {
    // loader.style.display = "none";
    personCanvas.show()

    while (isPlaying) {
        // BodyPix setup
        const segmentPersonConfig = {
            flipHorizontal: flipHorizontal,     // Flip for webcam
            maxDetections: 1,                   // only look at one person in this model
            scoreThreshold: 0.5,
            segmentationThreshold: 0.6,         // default is 0.7
        };
        const segmentation = await net.segmentPersonParts(sourceVideo, segmentPersonConfig);

        // skip if noting is there
        if (segmentation.allPoses[0] === undefined) {
            // console.info("No segmentation data");
            continue;
        }

        segmentation.allPoses.forEach(pose => {
            if (flipHorizontal) {
                pose = bodyPix.flipPoseHorizontal(pose, segmentation.width);
            }
            drawKeypoints(pose.keypoints, 0.1);
        });
    }
}

function dist(p1, p2) {
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;
    return Math.sqrt(a * a + b * b);
}
function toDegrees(rads) {
    return rads * 180 / Math.PI;
}
function toRads(degs) {
    return (degs / 180) * Math.PI;
}
var changeDatasetAllowed = true;
function drawKeypoints(keypoints, minConfidence) {
    var dEars = 0.1 // typical distance between human eyes

    var data = {}

    var camFOV = toRads(50)
    // find right eye, left eye, right hand, left hand
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score > minConfidence) {
            data[keypoint.part] = keypoint.position;
        }
    }

    rEar = data['rightEye'] ?? null
    lEar = data['leftEye'] ?? null
    rHand = data['rightWrist'] ?? null
    lHand = data['leftWrist'] ?? null
    rEye = data['rightEar'] ?? null
    lEye = data['leftEar'] ?? null

    // exit if not both eyes
    if ((rEye === null) || (lEye === null) || (rEar === null) || (lEar === null)) {
        return;
    }

    // normalize both eyes positions
    rEar.x = rEar.x / sourceVideo.videoWidth;
    rEar.y = rEar.y / sourceVideo.videoHeight;
    lEar.x = lEar.x / sourceVideo.videoWidth;
    lEar.y = lEar.y / sourceVideo.videoHeight;

    var buddyMove =  {
        nose: data['nose'] ? {
            x: data['nose'].x / sourceVideo.videoWidth,
            y: data['nose'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        leftEye: { x: lEar.x, y: lEar.y },
        rightEye: { x: rEar.x, y: rEar.y },
        leftEar: data['leftEar'] ? {
            x: data['leftEar'].x / sourceVideo.videoWidth,
            y: data['leftEar'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        rightEar: data['rightEar'] ? {
            x: data['rightEar'].x / sourceVideo.videoWidth,
            y: data['rightEar'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        leftHip: data['leftHip'] ? {
            x: data['leftHip'].x / sourceVideo.videoWidth,
            y: data['leftHip'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        rightHip: data['rightHip'] ? {
            x: data['rightHip'].x / sourceVideo.videoWidth,
            y: data['rightHip'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        leftWrist: data['leftWrist'] ? {
            x: data['leftWrist'].x / sourceVideo.videoWidth,
            y: data['leftWrist'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        rightWrist: data['rightWrist'] ? {
            x: data['rightWrist'].x / sourceVideo.videoWidth,
            y: data['rightWrist'].y / sourceVideo.videoHeight
        }: { x: 0.5, y: 0.5 },
        rightShoulder: data['rightShoulder'] ? {
            x: data['rightShoulder'].x / sourceVideo.videoWidth,
            y: data['rightShoulder'].y / sourceVideo.videoHeight
        } : { x: 0.5, y: 0.5 },
        leftShoulder: data['leftShoulder'] ? {
            x: data['leftShoulder'].x / sourceVideo.videoWidth,
            y: data['leftShoulder'].y / sourceVideo.videoHeight
        } : { x: 0.5, y: 0.5 },
        rightElbow: data['rightElbow'] ? {
            x: data['rightElbow'].x / sourceVideo.videoWidth,
            y: data['rightElbow'].y / sourceVideo.videoHeight
        } : { x: 0.5, y: 0.5 },
        leftElbow: data['leftElbow'] ? {
            x: data['leftElbow'].x / sourceVideo.videoWidth,
            y: data['leftElbow'].y / sourceVideo.videoHeight
        } : { x: 0.5, y: 0.5 },
    };
    personCanvas.updatePositions(buddyMove);

    // compute distance = distance between Ears
    var interEars = dist(lEar, rEar);
    var iEarsInAngle = interEars * camFOV
    var zEarsInAngle = (((lEar.y + rEar.y) / 2) * camFOV) + (Math.PI / 2) - (camFOV / 2)
    var xEarsInAngle = (((lEar.x + rEar.x) / 2) * camFOV) + (Math.PI / 2) - (camFOV / 2)

    distanceToHead = ((dEars / 2) / Math.tan(iEarsInAngle))

    //  now compute the face location in space in meters with 0 being the screen center .. dampen the distance to the screen as should not move fast. Given the initialisation is 0.5 meters, 

    fig = document.getElementById('myDiv');
    if (lastDistanceToHead == -1) {
        lastDistanceToHead = distanceToHead;
    }

    else {
        lastDistanceToHead = distanceToHead * 0.05 + lastDistanceToHead * 0.95;
        if (Math.abs(lastDistanceToHead - savedDistanceToHead) > 0.01) {
            savedDistanceToHead = lastDistanceToHead;
        }
    }
    var adjustedZoom = (1.8-savedDistanceToHead)*4+8

    var adjustedDistance = 2// savedDistanceToHead

    var nx = adjustedDistance * Math.cos(xEarsInAngle)
    var ny = adjustedDistance * Math.sin(xEarsInAngle)
    var nz = adjustedDistance * Math.cos(zEarsInAngle) + 0.5
    var newScene = {
        scene: {
            camera: {
                center: { x: 0, y: -1, z: 0 },//fig.layout.scene.camera.center,
                eye: { x: nx, y: ny, z: nz },
                //eye: { x:2, y:  3*(1-interEyes*lookerRef.leftEye.x), z: 3*(1-interEyes*lookerRef.leftEye.y )},
                up: { x: 0, y: 0, z: 1 }
            }
        },
    }


    if (!flying) {
        map?.setBearing(nx * 100);
        map?.setPitch(100 + nz * -60);
        map?.setZoom(adjustedZoom)
    }


    // console.log(50 + ny * 10)
}
