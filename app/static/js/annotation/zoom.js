let zoom = 1;
$(document).ready(function() {
    zoom = 1;

    let w_height = $(window).height()
    let w_width = $(window).width()

    let container = document.getElementById("container");
    let image = document.getElementById("image");
    let canvas = document.getElementById("layerDraw");
    let overlay = document.getElementById("layerShow");

    // Compute zoom and sizes
    let img_h = image.height;
    let img_w = image.width;

    let ratio_h = 0.8*w_height/img_h
    let ratio_w = 0.8*w_width/img_w

    // Zoom container and images following height max or weight max 
    if (ratio_h<ratio_w) {
        zoom = ratio_h;
    } else {
        zoom = ratio_w;
    }
    
    // Resize all elements (container, image, 2 layers)
    container.style.height = img_h*zoom;
    container.style.width = img_w*zoom;

    image.height = img_h*zoom;
    image.width = img_w*zoom;

    canvas.width = img_w*zoom;
    canvas.height = img_h*zoom;

    overlay.width = img_w*zoom;
    overlay.height = img_h*zoom;

});