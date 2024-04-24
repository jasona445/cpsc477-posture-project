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
            frames.get_posture_heuristic(latestFrameData);
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
            xval = 640 * ((person.x_pos + 1.5)/3);
            yval = ((person.joints[0].position.y)/4);
            console.log([xval, yval]);

            // xval = -640 * ((person.joints[5].position.x)/1500) + 320
            // yval = 360 * ((person.joints[5].position.y)/500)
            // console.log([xval, yval, 100, 100]);

            ctx.rect(xval - 50 , yval, 100, 300);
            ctx.lineWidth = 2;
            if (this.analyze_posture(person.body_id)){
                ctx.strokeStyle = 'green';
            }
            else {
                ctx.strokeStyle = 'red';
            }
            ctx.stroke();
        });
    },
    
    get_posture_heuristic: function () {
        // Returns an array of posture heuristics for all people in the frame
        let heuristics = latestFrameData.people.map((person) => {
            let spine_naval = person.joints[1].position.x;
            let neck = person.joints[3].position.x;
            return Math.abs(spine_naval - neck);
        });
        console.log(heuristics);
        return heuristics;
    },

    home_screen: function () {
        this.checkForHandRaise();
    },

    posture_detection: function () {
        // use get_posture_heuristics to determine if good posture or not
        var countdownElement = document.getElementById('countdown');
        startCountdown(10, countdownElement);
        var postureGood = this.analyze_posture(); // Placeholder function
        setTimeout(() => {
            if (this.analyze_posture()) {
                this.checkForHandRaise();
            } else {
                this.transitionState("adjust_posture");
            }
        }, 11000);
    },

    adjust_posture: function () {
        this.checkForHandRaise();
    },

    analyze_posture: function (person_id) {
        // Returns true if the posture of the person is good w.r.t the cutoff, else false
        let cutoff = 0.3

        heuristics = this.get_posture_heuristic()
        return heuristics.map(heuristic => heuristic > cutoff)[person_id];
    },

    stretches: function () {
        this.checkForHandRaise();
    },
    
    // grabs the current hand being raised
    get_hand: function (frame) {
        let left_hand = frame.people[0].joints[8].position.y * -1;
        let right_hand = frame.people[0].joints[15].position.y * -1;
        let head = frame.people[0].joints[26].position.y * -1;

        if (left_hand - head > 0) {
            return { hand: "left" };
        } else if (right_hand - head > 0) {
            return { hand: "right" };
        } else if (right_hand - head > 0 && left_hand - head > 0) {
            return { hand: "both" };
        } else {
            return { hand: "none" };
        }
    },

    checkForHandRaise: function () {
        if (this.cooldown) return; // Prevent handling if cooldown is active
        var intervalId = setInterval(() => {
            if (!latestFrameData) return; 
            var handResult = this.get_hand(latestFrameData);

            if (handResult.hand === "right" || handResult.hand === "left") {
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
                else if (hand === "left") this.transitionState("home_screen");
                break;
            case "adjust_posture":
                if (hand === "right") this.transitionState("posture_detection");
                else if (hand === "left") this.transitionState("stretches");
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

function startCountdown(duration, display) {
    var timer = duration;
    var countdownTimer = setInterval(function () {
        display.textContent = timer;
        if (--timer < 0) {
            clearInterval(countdownTimer);
            display.textContent = "Time's up!";
        }
    }, 1000);
}