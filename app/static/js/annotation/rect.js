
function addRect(){
    // get references to the canvas and context
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");
    var ctx = canvas.getContext("2d");
    var ctxo = overlay.getContext("2d");

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

    // List of all annotations
    var annotations = document.getElementById("annotations");

    // these vars will hold the starting and stoping mouse position 
    var startX;
    var startY;
    var width;
    var height;

    var prevStartX = 0;
    var prevStartY = 0;
    var prevWidth  = 0;
    var prevHeight = 0;

    //FUNCTION
    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        ctx.strokeStyle = `hsl(${colors[current]},75%,50%)`;
        ctx.lineWidth = 3;
        ctxo.strokeStyle = `hsl(${colors[current]},75%,50%)`;
        ctxo.lineWidth = 3;
    
        // save the starting x/y of the rectangle
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
    
        // set a flag indicating the drag has begun
        isDown = true;
    }
    
    //FUNCTION
    function handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag + save coordinates
        if (isDown) {
            saveRect();
        }
        isDown = false;
        canvas.removeEventListener("mousedown",handleMouseDown);
        canvas.removeEventListener("mousemove",handleMouseMove);
        canvas.removeEventListener("mouseup",handleMouseUp);
    }
    
    //FUNCTION
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
        prevEndX = startX + width;
        prevEndY = startY + height;
    }
    
    // FUNCTION
    function saveRect() {
        // Save rectangle in layer
        ctxo.beginPath();
        ctxo.moveTo(prevStartX, prevStartY);
        ctxo.lineTo(prevEndX, prevStartY);
        ctxo.lineTo(prevEndX, prevEndY);
        ctxo.lineTo(prevStartX, prevEndY);
        ctxo.lineTo(prevStartX, prevStartY);
        ctxo.fillStyle = `hsla(${colors[current]},75%,50%,0.2)`;
        ctxo.fill();
        ctxo.stroke();
        ctxo.closePath();

        // Save in list
        var message = "r" + Math.round(startX/zoom) + "-" + Math.round(startY/zoom) + "-" + Math.round(width/zoom) + "-" + Math.round(height/zoom)
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(message));
        annotations.appendChild(li);
    }
    canvas.removeEventListener("mousedown",handleMouseDown);
    canvas.removeEventListener("mousemove",handleMouseMove);
    canvas.removeEventListener("mouseup",handleMouseUp);

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}