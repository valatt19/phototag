////////////////////////////////////////////////////////////////////////
// When page is open : (de)zoom the image in fuction of the page size //
////////////////////////////////////////////////////////////////////////
function setZoom() {
    zoom = 1;

    let w_height = $(window).height();
    let w_width = $(window).width()-400;

    let nav1 = document.getElementById("nav1").style.height;
    let nav2 = document.getElementById("nav2").style.height;
    let container = document.getElementById("principal");
    let image = document.getElementById("image");
    let canvas = document.getElementById("layerDraw");
    let overlay = document.getElementById("layerShow");

    // Compute zoom and sizes
    let img_h = image.height;
    let img_w = image.width;

    let ratio_h = 0.8*(w_height-nav1-nav2)/img_h;
    let ratio_w = w_width/img_w;

    // Zoom container and images following height max or weight max 
    if (ratio_h<ratio_w) {
        zoom = ratio_h;
    } else {
        zoom = ratio_w;
    }
    
    // Resize all elements (container, image, 2 layers)
    image.height = img_h*zoom;
    image.width = img_w*zoom;

    canvas.width = img_w*zoom;
    canvas.height = img_h*zoom;

    overlay.width = img_w*zoom;
    overlay.height = img_h*zoom;

    container.style.height = img_h*zoom+10+"px";
    container.style.width = img_w*zoom+10+"px";
}