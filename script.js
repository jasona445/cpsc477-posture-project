// run python3 -m http.server 4444
// then go to inspect element and console
var host = "cpsc484-02.stdusr.yale.internal:8888"

$(document).ready(function () {
    frames.start();
    twod.start();
});

var frames = {
    state: null,
    socket: null,
    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            frames.get_posture_heuristic(JSON.parse(event.data));
            // frames.router(frame); 
        };
    },

    get_posture_heuristic: function (frame) {
        // Returns an array of posture heuristics for all people in the frame
        let heuristics = frame.people.map((person) => {
            let spine_naval = person.joints[1].position.x;
            let neck = person.joints[3].position.x;
            return Math.abs(spine_naval - neck);
        });
        console.log(frame)
        console.log(heuristics)
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

    load_page: function (page_name) {
        $("#content-placeholder").load(page_name);
    },

    home_screen: function (frame) {
        if (this.get_hand(frame).hand == "right") {
            this.state = "posture_detection";
            this.router(frame);
        }
    },

    posture_detection: function (frame) {
        // use get_posture_heuristics to determine if good posture or not
        var postureGood = this.analyzePosture(frame); // Placeholder function

        if (postureGood) {
            this.load_page("posture_good.html"); // Load a page indicating good posture
            // Now, start checking for the right hand raise gesture to proceed
            this.checkForRightHandRaise();
        } else {
            this.load_page("adjust_posture.html"); // Load a page asking the user to adjust their posture
        }
    },

    analyzePosture: function (frame) {
        // Implement posture analysis logic here, using get_posture_heuristic
        // For now, this is a placeholder that always returns true
        return true;
    },

    stretches: function (frame) {
        this.load_page("stretches.html");
    },

    checkForRightHandRaise: function (frame) {
        var checkInterval = setInterval(() => {
            var handResult = this.get_hand(frame);

            if (handResult.hand == "right") {
                clearInterval(checkInterval); // Stop the interval check
                this.load_page("stretches.html"); // Proceed to the stretches page
            }
        }, 100); 
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
