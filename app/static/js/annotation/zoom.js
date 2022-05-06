////////////////////////////////////////////////////////////////////////
// When page is open : (de)zoom the image in fuction of the page size //
////////////////////////////////////////////////////////////////////////
function computeZoom() {
    var w_height = $(window).height()*0.8;
    var w_width = $(window).width()-600;

    var nav1 = document.getElementById("nav1").style.height;
    var nav2 = document.getElementById("nav2").style.height;
    var image = document.getElementById("image");
    var pannel = document.getElementById("pannel").style.height;

    // Compute zoom and sizes
    img_h = image.height;
    img_w = image.width;

    var ratio_h = (w_height-nav1-nav2-pannel)/img_h;
    var ratio_w = w_width/img_w;

    // Zoom container and images following height max or weight max 
    if (ratio_h<ratio_w) {
        zoom = ratio_h;
    } else {
        zoom = ratio_w;
    }

    // Set container at this moment
    var container = document.getElementById("principal");
    container.style.height = (w_height-nav1-nav2-pannel) + 'px';
    container.style.width = w_width + 'px';
}

function setImageZoom() {
    
    var container = document.getElementById("principal");
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");

    // Resize all elements (image and 2 layers)
     
    var new_image = document.createElement("img");
    new_image.id = "image"
    new_image.height = img_h*zoom;
    new_image.width = img_w*zoom;
    new_image.src = image.src;
    new_image.style.zIndex = 1;

    image.parentNode.removeChild(image);
    container.appendChild(new_image);

    canvas.width = img_w*zoom;
    canvas.height = img_h*zoom;

    overlay.width = img_w*zoom;
    overlay.height = img_h*zoom;
}