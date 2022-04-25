////////////////////////////////////////////////////////////////////////
// When page is open : (de)zoom the image in fuction of the page size //
////////////////////////////////////////////////////////////////////////
function setZoom() {

    var w_height = $(window).height();
    var w_width = $(window).width()-400;

    var nav1 = document.getElementById("nav1").style.height;
    var nav2 = document.getElementById("nav2").style.height;
    var container = document.getElementById("principal");
    var image = document.getElementById("image");
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");

    // Compute zoom and sizes
    var img_h = image.height;
    var img_w = image.width;

    var ratio_h = 0.8*(w_height-nav1-nav2)/img_h;
    var ratio_w = w_width/img_w;

    // Zoom container and images following height max or weight max 
    if (ratio_h<ratio_w) {
        zoom = ratio_h;
    } else {
        zoom = ratio_w;
    }
    
    // Resize all elements (container, image, 2 layers)
    container.style.height = img_h*zoom;
    container.style.width = img_w*zoom;
     
    var new_image = document.createElement("img");
    new_image.id = "image"
    new_image.height = img_h*zoom;
    new_image.width = img_w*zoom;
    new_image.src = image.src;

    image.parentNode.removeChild(image);
    container.appendChild(new_image);

    canvas.width = img_w*zoom;
    canvas.height = img_h*zoom;

    overlay.width = img_w*zoom;
    overlay.height = img_h*zoom;
}