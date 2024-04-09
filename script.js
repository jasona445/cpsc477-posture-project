// run python3 -m http.server 4444
// then go to inspect element and console
var host = "cpsc484-02.stdusr.yale.internal:8888"

$(document).ready(function () {
    frames.start();
    twod.start();
});

var frames = {
    socket: null,
    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            frames.get_posture_heuristic(JSON.parse(event.data));
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
    }
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
