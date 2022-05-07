var cntrlIsPressed = false;

var img_ele = null,
    x_cursor = 0,
    y_cursor = 0,
    x_img_ele = 0,
    y_img_ele = 0;
    
function zoom_image(newzoom) {
    zoom = newzoom;
    setImageZoom();
    invalidate();
    setInterval(mainDraw, INTERVAL);
}
  
function start_drag() {
    if(cntrlIsPressed && zoom > init_zoom) {
        img_ele = this;
        x_img_ele = window.event.clientX - document.getElementById('layerDraw').offsetLeft;
        y_img_ele = window.event.clientY - document.getElementById('layerDraw').offsetTop;
    }
}
  
function stop_drag() {
    if(cntrlIsPressed) {
        img_ele = null;
    }
}
  
function while_drag() {
    if(cntrlIsPressed) {
        var x_cursor = window.event.clientX;
        var y_cursor = window.event.clientY;
        if (img_ele !== null) {
            relative_pos_left = (x_cursor - x_img_ele);
            relative_pos_top = (y_cursor - y_img_ele);

            img_ele.style.left = relative_pos_left + 'px';
            img_ele.style.top = relative_pos_top + 'px';

            var img = document.getElementById('image');
            img.style.left = relative_pos_left + 'px';
            img.style.top = relative_pos_top + 'px';

            var layerShow = document.getElementById('layerShow');
            layerShow.style.left = relative_pos_left + 'px';
            layerShow.style.top = relative_pos_top + 'px';
        }
    }
}

function reset_drag() {
    var img = document.getElementById('layerDraw');
    img.style.left = '0px';
    img.style.top = '0px';

    var layerShow = document.getElementById('layerShow');
    layerShow.style.left = '0px';
    layerShow.style.top = '0px';
}

function add_listeners() {
    document.getElementById('zoomout').addEventListener('click', function() {
        zoom_image(0.75*zoom);
        reset_drag();
    });
    
    document.getElementById('zoomin').addEventListener('click', function() {
        zoom_image(1.25*zoom);
        reset_drag();
    });

    document.getElementById('zoomreset').addEventListener('click', function() {
        zoom_image(init_zoom);
        reset_drag();
    });

    $(document).keydown(function(event){
        if(event.which=="17")
            cntrlIsPressed = true;
    });
    
    $(document).keyup(function(){
        stop_drag();
        cntrlIsPressed = false;
    });

    document.getElementById('layerDraw').addEventListener('mousedown', start_drag);
    document.getElementById('layerDraw').addEventListener('mousemove', while_drag);
    document.getElementById('layerDraw').addEventListener('mouseup', stop_drag);
}

$(document).ready(function() {
    document.getElementById('principal').style.overflow = 'hidden';
    // Wait that initial zoom is done to add listeners about image
    setTimeout(function(){add_listeners();}, 25);
});
