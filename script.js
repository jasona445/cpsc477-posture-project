// run python3 -m http.server 4444
// then go to inspect element and console
var host = "cpsc484-02.stdusr.yale.internal:8888"
// var host = "localhost:4444"
$(document).ready(function () {
    frames.start();
    twod.start();
    updateContentForState(frames.state);
});

var frames = {
    state: "home_screen",
    socket: null,
    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            frames.get_posture_heuristic(JSON.parse(event.data));
            frames.drawPersonRectangle(JSON.parse(event.data));
            if (frames.state === "home_screen") {
                frames.checkForRightHandRaise(JSON.parse(event.data));

            }
        };
    },

    drawPersonRectangle: function (frameData) {
        // Access frame data and perform person detection
        var canvas = document.getElementById('kinect-canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // For example, assume frameData contains an array of people with their bounding box coordinates (x, y, width, height)
        frameData.people.forEach(person => {
            // Draw a rectangle around each detected person
            ctx.beginPath();
            // console.log([person.joints[18].position.x, person.joints[5].position.y, 100, 100]);

            ctx.rect(person.joints[18].position.x - 270, person.joints[5].position.y, 100, 100);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        });
    },

        // shoulder left 5
        // right 12
        // hip left 18
        // hip right 22
        
    get_posture_heuristic: function (frame) {
        // Returns an array of posture heuristics for all people in the frame
        let heuristics = frame.people.map((person) => {
            let spine_naval = person.joints[1].position.x;
            let neck = person.joints[3].position.x;
            return Math.abs(spine_naval - neck);
        });
        // console.log(frame);
        // console.log(heuristics);
        return heuristics;
    },

    get_hand: function (frame) {
        let left_hand = frame.people[0].joints[7].position.y;
        let right_hand = frame.people[0].joints[14].position.y;
        let head = frame.people[0].joints[26].position.y;

        // theoretically head should always be above hands if hands are by the side
        if (left_hand - head > 0){
            return { hand: "left" };
        } else if (right_hand - head > 0) {
            return { hand: "right" };
        } else {
            return { hand: "none" };
        }
    },

    // router to move between possible webpages
    router: function (frame) {
        switch (this.state) {
            case "home_screen":
                this.home_screen(frame);
                break;
            case "posture_detection":
                this.posture_detection(frame);
                break;
            case "stretches":
                this.stretches(frame);
                break;
        }
    },

    // load_page: function (page_name) {
    //     $("#content-placeholder").load(page_name);
    // },

    home_screen: function (frame) {
        console.log("Home Screen Here");
        if (this.checkForRightHandRaise) {
            this.state = "posture_detection";
            // this.router(frame);
            updateContentForState(this.state);
            this.router(frame);
        }
    },

    posture_detection: function (frame) {
        // use get_posture_heuristics to determine if good posture or not
        var postureGood = this.analyzePosture(frame); // Placeholder function
        setTimeout(() => {
            if (postureGood) {
                // this.load_page("posture_good.html"); // Load a page indicating good posture
                frames.state = "stretches";
                updateContentForState(frames.state);
                this.router(frame);
                // Now, start checking for the right hand raise gesture to proceed
                this.checkForRightHandRaise();
            } else {
                // this.load_page("adjust_posture.html"); // Load a page asking the user to adjust their posture
                frames.state = "adjust_posture";
                updateContentForState(frames.state);
                this.router(frame);
            }
        }, 3000);
    },

    analyzePosture: function (frame) {
        // Implement posture analysis logic here, using get_posture_heuristic
        // For now, this is a placeholder that always returns true
        return true;
    },

    stretches: function (frame) {
        // this.load_page("stretches.html");
        frames.state = "stretches";
        updateContentForState(frames.state);
        this.router(frame);
    },

    // checkForRightHandRaise: function (frame) {
    //     var checkInterval = setInterval(() => {
    //         var handResult = this.get_hand(frame);
    //         console.log("hi");
    //         console.log(handResult.hand);
    //         if (handResult.hand == "right") {
    //             clearInterval(checkInterval); // Stop the interval check
    //             // this.load_page("stretches.html"); // Proceed to the stretches page
    //             frames.state = "stretches";
    //             updateContentForState(frames.state);
    //         }
    //     }, 100); 
    // },
    checkForRightHandRaise: function (frame) {
        var handResult = this.get_hand(frame);

        if (handResult.hand == "right") {
            // Transition to the next state based on the current state
            if (this.state === "home_screen") {
                this.state = "posture_detection";
                updateContentForState(this.state);
                this.router(frame);
            } else if (this.state === "adjust_posture") {
                this.state = "stretches";
                updateContentForState(this.state);
                this.router(frame);
            }
            // updateContentForState(this.state);
        }
    },


};

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

function updateContentForState(state) {
    // First, hide all content sections
    // console.log("New State: ", { state });
    $(".state-content").addClass("hidden").removeClass("visible");

    // Then, show the content section for the current state
    switch (state) {
        case "home_screen":
            $("#home-screen").addClass("visible").removeClass("hidden");
            break;
        case "posture_detection":
            $("#posture-detection").addClass("visible").removeClass("hidden");
            break;
        case "bad_posture":
            $("#bad-posture").addClass("visible").removeClass("hidden");
            break;
        case "stretches":
            $("#stretches").addClass("visible").removeClass("hidden");
            break;
        case "adjust_posture":
            $("#adjust-posture").addClass("visible").removeClass("hidden");
            break;
        // Add more cases as needed
    }
};