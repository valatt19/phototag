//////////////////////////////
// DOWNLOAD ANNOTATED IMAGE //
//////////////////////////////
function download_image(){
    // Create canvas which will be downloaded
    var dl_canvas = document.createElement('canvas');
    var dl_ctx = dl_canvas.getContext("2d");

    var img = document.getElementById("image");

    // Set size of the canvas (= size of image) and draw the image on
    dl_ctx.canvas.width = img.width/zoom;
    dl_ctx.canvas.height = img.height/zoom;
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

///////////////////////////////
// DOWNLOAD ANNOTATIONS JSON //
///////////////////////////////
function download_json(){
    var obj = $('#my_data').data("boxes");
    var new_obj = [];
    for (let i = 0; i < obj.length; i++) {
        var box = obj[i];
        box.type = document.getElementById("classes").getElementsByTagName("li")[obj[i].type].innerHTML;
        new_obj.push(box);
    }
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

    var link = document.createElement('a');
    var img_name = $('#my_data').data("name").split(".")[0];
    link.download = img_name+".json";
    link.href = 'data:' + data;
    link.click();
}

//////////////////////
// DOWNLOAD LOG TXT //
//////////////////////
function download_log(){
    var data = "text/txt;charset=utf-8," + encodeURIComponent(log);
    var link = document.createElement('a');
    var img_name = $('#my_data').data("name").split(".")[0];
    link.download = img_name+"-LOG.txt";
    link.href = 'data:' + data;
    link.click();
}