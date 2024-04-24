// run python3 -m http.server 4444
// then go to inspect element and console
var host = "cpsc484-02.stdusr.yale.internal:8888"
// var host = "localhost:4444"
$(document).ready(function () {
    frames.start();
    twod.start();
    frames.transitionState("home_screen");
});

var latestFrameData = null;

var frames = {
    state: null,
    socket: null,
    cooldown: false,
    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        // frames.socket.onmessage = function (event) {
        //     frames.get_posture_heuristic(JSON.parse(event.data));
        //     frames.drawPersonRectangle(JSON.parse(event.data));
        //     if (frames.state === "home_screen") {
        //         frames.checkForHandRaise(JSON.parse(event.data));
        //     }
        // };
        frames.socket.onmessage = function (event) {
            latestFrameData = JSON.parse(event.data); 
            
            frames.drawPersonRectangle(latestFrameData);
            if (frames.state === "home_screen") {
                frames.checkForHandRaise(); 
            }
        };
    },

    drawPersonRectangle: function () {
        // Access frame data and perform person detection
        var canvas = document.getElementById('kinect-canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // For example, assume frameData contains an array of people with their bounding box coordinates (x, y, width, height)
        latestFrameData.people.forEach(person => {
            // Draw a rectangle around each detected person
            ctx.beginPath();
            if (person.x_pos < 0){
                xval = 640 * ((person.x_pos + 1.5)/3);
            }
            else {
                xval = 640 * ((1.5 - person.x_pos)/3);
            }
            yval = ((person.joints[0].position.y)/4);
            //console.log([xval, yval]);

            // xval = -640 * ((person.joints[5].position.x)/1500) + 320
            // yval = 360 * ((person.joints[5].position.y)/500)
            // console.log([xval, yval, 100, 100]);

            ctx.rect(xval - 50 , yval, 100, 300);
            ctx.lineWidth = 2;
            if (this.analyze_posture(person)){
                ctx.strokeStyle = 'green';
            }
            else {
                ctx.strokeStyle = 'red';
            }
            ctx.stroke();
        });
    },

    home_screen: function () {
        this.checkForHandRaise();
    },

    analyze_posture: function (person) {
        // Returns true if the posture of the person is good w.r.t the cutoff, else false
        let cutoff = 15

        return this.get_posture_heuristic(person) < cutoff;
    },

    posture_detection: function () {
        // use get_posture_heuristics to determine if good posture or not
        // var countdownElement = document.getElementById('countdown');
        // startCountdown(10, countdownElement);
        // var postureGood = this.analyze_posture(); // Placeholder function
        // setTimeout(() => {
        //     if (this.analyze_posture()) {
                this.checkForHandRaise();
        //     } else {
        //         this.transitionState("adjust_posture");
        //     }
        // }, 11000);
    },

    adjust_posture: function () {
        this.checkForHandRaise();
    },

    get_posture_heuristic: function (person) {
        // Returns an array of posture heuristics for all people in the frame
    
        let spine_chest = person.joints[2].position.x;
        let head = person.joints[26].position.x;
        console.log(head - spine_chest)
        return head - spine_chest;

    },



    stretches: function () {
        this.checkForHandRaise();
    },
    
    // grabs the current hand being raised
    get_hand: function (frame) {
        for (let person of frame.people) {
            let left_hand = person.joints[8].position.y * -1;
            let right_hand = person.joints[15].position.y * -1;
            let head = person.joints[26].position.y * -1;

            if (left_hand - head > 0 && right_hand - head <= 0) {
                return { hand: "left", personId: person.id };
            } else if (right_hand - head > 0 && left_hand - head <= 0) {
                return { hand: "right", personId: person.id };
            } else if (right_hand - head > 0 && left_hand - head > 0) {
                return { hand: "both", personId: person.id };
            }
        }
        return { hand: "none", personId: null };
    },

    checkForHandRaise: function () {
        if (this.cooldown) return; // Prevent handling if cooldown is active
        var intervalId = setInterval(() => {
            if (!latestFrameData) return; 
            var handResult = this.get_hand(latestFrameData);

            if (handResult.hand === "right" || handResult.hand === "left" || handResult.hand === "both") {
                clearInterval(intervalId); 
                this.handleGesture(handResult.hand); 
                this.initiateCooldown(); 
            }
        }, 1000); // Check every second
    },

    handleGesture: function (hand) {
        if (this.cooldown) return; // Prevent handling if cooldown is active
        switch (this.state) {
            case "home_screen":
                if (hand === "right") this.transitionState("posture_detection");
                break;
            case "posture_detection":
                if (hand === "right") this.transitionState("stretches");
                else if (hand === "left") this.transitionState("adjust_posture");
                else if (hand === "both") this.transitionState("home_screen");
                break;
            case "adjust_posture":
                if (hand === "right") this.transitionState("posture_detection");
                else if (hand === "left") this.transitionState("stretches");
                else if (hand === "both") this.transitionState("home_screen");
                break;
            case "stretches":
                if (hand === "right") this.transitionState("home_screen");
                else if (hand === "left") this.transitionState("posture_detection");
                break;
        }
    },

    router: function () {
        switch (this.state) {
            case "home_screen":
                this.home_screen();
                break;
            case "posture_detection":
                this.posture_detection();
                break;
            case "adjust_posture":
                this.adjust_posture();
                break;
            case "stretches":
                this.stretches();
                break;
        }
    },

    transitionState: function (newState) {
        this.state = newState;
        updateContentForState(this.state);
        this.router();
    },

    initiateCooldown: function () {
        if (!this.cooldown) { // Only start a new cooldown if there isn't already one active
            this.cooldown = true;

            setTimeout(() => {
                this.cooldown = false;
                this.checkForHandRaise(latestFrameData);
                
            }, 2500); // Cooldown period of 2.5 seconds

            
        }
    },
};

// shows the two-dimensional frame data
var twod = {
    socket: null,
    start: function () {
        var url = "ws://" + host + "/twod";
        twod.socket = new WebSocket(url);
        twod.socket.onmessage = function (event) {
            twod.show(JSON.parse(event.data));
        };
    },
    show: function (twod) {
        $('img.twod').attr("src", 'data:image/pnjpegg;base64,' + twod.src);
    }
};

// handles the dynamic html code
function updateContentForState(state) {
    $(".state-content").addClass("hidden").removeClass("visible");
    $("#container").hide();
    switch (state) {
        case "home_screen":
            $("#home-screen").addClass("visible").removeClass("hidden");
            break;
        case "posture_detection":
            $("#posture-detection").addClass("visible").removeClass("hidden");
            $("#container").css('display', 'inline-block');
            break;
        case "adjust_posture":
            $("#adjust-posture").addClass("visible").removeClass("hidden");
            break;
        case "stretches":
            $("#stretches").addClass("visible").removeClass("hidden");
            break;
    }
};
