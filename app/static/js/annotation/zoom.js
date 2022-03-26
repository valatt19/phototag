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

//////////////////////////////
// DOWNLOAD ANNOTATED IMAGE //
//////////////////////////////
function download_image(){
    // Create canvas which will be downloaded
    var dl_canvas = document.createElement('canvas');
    var dl_ctx = dl_canvas.getContext("2d");

    var img = document.getElementById("image");

    // Set size of the canvas (= size of image) and draw the image on
    dl_ctx.canvas.width = img.width;
    dl_ctx.canvas.height = img.height;
    dl_ctx.drawImage(img,0,0);
        
    // Draw all boxes on download canvas
    let l = boxes.length;
    for (let i = 0; i < l; i++) {
        let b = boxes[i];
        if (b.tool == "rect") {
            // Box is a rectangle
            drawRect(dl_ctx,b.type,b.x,b.y,b.x+b.w,b.y+b.h);
        } else {
            // Box is a free form
            drawFree(dl_ctx,b.type,b.p);
        }
    }

    // Create downloadable image
    image = dl_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    var img_name = $('#my_data').data("name").split(".")[0];
    link.download = img_name+".png";
    link.href = image;
    link.click();
}