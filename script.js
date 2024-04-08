// run python3 -m http.server 4444
// then go to inspect element and console
var host = "cpsc484-02.stdusr.yale.internal:8888"

$(document).ready(function () {
    frames.start();
    // twod.start();
});

var frames = {
    socket: null,
    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            frames.show(JSON.parse(event.data));
        };
    },
    show: function (frame) {
        console.log(frame);
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
