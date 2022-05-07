///////////////////////////
// Init global variables //
///////////////////////////

// ZOOM
let zoom = 1;
let init_zoom = 1;
let img_h;
let img_w;

// COLORS
let colors = [];
let current = 0;

// CANVAS AND DRAW
let canvasValid = false;
let INTERVAL = 20;  // How often, in milliseconds, we check to see if a redraw is needed

let canvas = document.getElementById("layerDraw"); // Front layer used when drawing
let ctx = canvas.getContext("2d");

let overlay = document.getElementById("layerShow"); // 2nd layer where drawing are stored
let ctxo = overlay.getContext("2d");

let $canvas = $("#layerDraw"); // calculate where the canvas is on the window (used to help calculate mouseX/mouseY)
let canvasOffset = $canvas.offset();
let offsetX = canvasOffset.left;
let offsetY = canvasOffset.top;
let scrollX = $canvas.scrollLeft();
let scrollY = $canvas.scrollTop();

let annotations = document.getElementById("annotations");
let boxes = [];
let previous_boxes = [];
let log = "";

let isNearZone = 4; // For polygon tool, distance within magic join is done

let relative_pos_left = 0; // Relative position of image in annotation container (by default on top-left corner)
let relative_pos_top = 0;

//A web socket connection to the server using socketio.
const socket = io();
let img_id;

///////////////////////////////
// When document is ready do //
///////////////////////////////

function loading_page() {
    // Set zoom value and image depending on zoom value
    computeZoom();
    init_zoom = zoom;
    setImageZoom();

    // Set colors values
    set_colors();

    boxes = $('#my_data').data("boxes"); //Load from backend list
    previous_boxes.push(boxes); //Load 1st version of boxes
    setInterval(mainDraw, INTERVAL);

    setAnnotationsList(boxes);
    log = $('#my_data').data("log");

    img_id = $('#my_data').data("img");
    socket.on("update", update);
}

$(document).ready(function() {

    // Set zoom value, colors, and previous savec annotations on page
    // The waiting of 20 ms is useful to prevent loading problems on Firefox
    setTimeout(function(){loading_page();}, 20);

});