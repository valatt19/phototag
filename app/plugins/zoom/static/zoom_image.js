var img_ele = null,
    x_cursor = 0,
    y_cursor = 0,
    x_img_ele = 0,
    y_img_ele = 0;
    
function zoom_image(newzoom) {
    zoom = newzoom;
    setImageZoom();
    mainDraw();
}
  
function start_drag() {
    img_ele = this;
    x_img_ele = window.event.clientX - document.getElementById('image').offsetLeft;
    y_img_ele = window.event.clientY - document.getElementById('image').offsetTop;
    
}
  
function stop_drag() {
    img_ele = null;
}
  
function while_drag() {
    var x_cursor = window.event.clientX;
    var y_cursor = window.event.clientY;
    if (img_ele !== null) {
      img_ele.style.left = (x_cursor - x_img_ele) + 'px';
      img_ele.style.top = ( window.event.clientY - y_img_ele) + 'px';
      
        console.log(img_ele.style.left+' - '+img_ele.style.top);
  
    }
}

function add_listeners() {
    document.getElementById('zoomout').addEventListener('click', function() {
        zoom_image(0.75*zoom);
    });
    
    document.getElementById('zoomin').addEventListener('click', function() {
        zoom_image(1.25*zoom);
    });

    document.getElementById('zoomreset').addEventListener('click', function() {
        zoom_image(init_zoom);
    });

    document.getElementById('image').addEventListener('mousedown', start_drag);
    document.getElementById('image').addEventListener('mousemove', while_drag);
    document.getElementById('image').addEventListener('mouseup', stop_drag);
}

$(document).ready(function() {
    document.getElementById('principal').style.overflow = 'hidden';
    // Wait that initial zoom is done to add listeners about image
    setTimeout(function(){add_listeners();}, 25);
});
