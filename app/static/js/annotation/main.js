///////////////////////////
// Init global variables //
///////////////////////////

// ZOOM
let zoom = 1;

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

let annotations = document.getElementById("annotations")
let boxes = []

///////////////////////////////
// When document is ready do //
///////////////////////////////

$(document).ready(function() {
    // Set zoom value
    setZoom();

    // Set colors values
    set_colors();

    // Draw saved annotations and add them in the annotations list
    ctx.lineWidth = 3;
    ctxo.lineWidth = 3;

    boxes = $('#my_data').data("boxes"); //Load from backend list
    setInterval(mainDraw, INTERVAL);

    setAnnotationsList(boxes);

    // 

});