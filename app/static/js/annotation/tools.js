function addRect(){

    // get references to the canvas and context
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");
    var ctx = canvas.getContext("2d");
    var ctxo = overlay.getContext("2d");

    // style the context
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctxo.strokeStyle = "blue";
    ctxo.lineWidth = 3;

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    var $canvas = $("#layerDraw");
    var canvasOffset = $canvas.offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var scrollX = $canvas.scrollLeft();
    var scrollY = $canvas.scrollTop();

    // this flag is true when the user is dragging the mouse
    var isDown = false;

    // these vars will hold the starting and stoping mouse position 
    var startX;
    var startY;
    var width;
    var height;

    var prevStartX = 0;
    var prevStartY = 0;

    var prevWidth  = 0;
    var prevHeight = 0;

    // List of all annotations
    var annotations = document.getElementById("annotations");

    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        // save the starting x/y of the rectangle
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);

        // set a flag indicating the drag has begun
        isDown = true;
    }

    function handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();

        // the drag is over, clear the dragging flag + save coordinates
        if (isDown) {
            saveRect();
        }
        isDown = false;
    }

    function handleMouseOut(e) {
        e.preventDefault();
        e.stopPropagation();

        // the drag is over, clear the dragging flag + save coordinates
        if (isDown) {
            saveRect();
        }
        isDown = false;
    }

    function handleMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();

        // if we're not dragging, just return
        if (!isDown) {
            return;
        }

        // get the current mouse position
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        // Put your mousemove stuff here

        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // calculate the rectangle width/height based
        // on starting vs current mouse position
        width = mouseX - startX;
        height = mouseY - startY;

        // draw a new rect from the start position 
        // to the current mouse position
        ctx.strokeRect(startX, startY, width, height);

        prevStartX = startX;
        prevStartY = startY;

        prevWidth  = width;
        prevHeight = height;
    }

    function saveRect() {
        
        // Save in list
        var message = "r" + startX + "-" + startY + "-" + width + "-" + height
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(message));
        annotations.appendChild(li);

        // Save rectangle in layer
        ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
    }

    // listen for mouse events
    $("#layerDraw").mousedown(function (e) {
        handleMouseDown(e);
    });
    $("#layerDraw").mousemove(function (e) {
        handleMouseMove(e);
    });
    $("#layerDraw").mouseup(function (e) {
        handleMouseUp(e);
    });
    $("#layerDraw").mouseout(function (e) {
        handleMouseOut(e);
    });

}

function addLasso(){

    // get references to the canvas and context
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");
    var ctx = canvas.getContext("2d");
    var ctxo = overlay.getContext("2d");

    // style the context
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctxo.strokeStyle = "blue";
    ctxo.lineWidth = 3;

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    var $canvas = $("#layerDraw");
    var canvasOffset = $canvas.offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var scrollX = $canvas.scrollLeft();
    var scrollY = $canvas.scrollTop();

    // this flage is true when the user is dragging the mouse
    var isDown = false;

    // starting point and list containing all the points of the form
    var start = {x:0,y:0};
    var points = [];

    // render functions
    function Render(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save(); 
        RenderSelection(points); 
        ctx.restore(); 
    }
    
    
    function RenderSelection(points){
        if (points.length <= 1){
            return;
        }
      
        ctx.beginPath();
        for (var index = 0; index < points.length; index ++){
            var point = points[index];
            if (index == 0){
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.lineTo(start.x, start.y);
        ctx.stroke();
        ctx.closePath();
    }

    function saveForm() {
        
        // Save in list
        var message = "l"

        ctxo.beginPath();
        for (var index = 0; index < points.length; index ++){
            // add in list
            var point = points[index];
            message = message + "-(" + point.x + ":" + point.y + ")"
            
            // draw in ctxo
            if (index == 0){
                ctxo.moveTo(point.x, point.y);
            } else {
                ctxo.lineTo(point.x, point.y);
            }
        }
        // add list
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(message));
        annotations.appendChild(li);

        // Save free form in layer
        ctxo.lineTo(start.x, start.y);
        ctxo.stroke();
        ctxo.closePath();
    }

    $("#layerDraw").mousedown(function(e) {
        e.preventDefault();
        e.stopPropagation();
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        isDown = true;
        start = {x: mouseX, y: mouseY} ;
        points = []; 
        points.push(start);
        RenderSelection(points); 
    });
    
    $("#layerDraw").mousemove(function(e) {
        e.preventDefault();
        e.stopPropagation();
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        if (isDown == false) {
            return; 
        }
        points.push({x:mouseX, y:mouseY} );
        Render(); 
        
    });
    
    $("#layerDraw").mouseup(function(e) {
        e.preventDefault();
        e.stopPropagation();

        isDown = false;  
        points.push(start);
        Render(); 
        saveForm();
        return;
    });  
}