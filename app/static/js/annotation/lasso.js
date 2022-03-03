function addLasso(){

    // get references to the canvas and context
    var canvas = document.getElementById("layerDraw");
    var overlay = document.getElementById("layerShow");
    var ctx = canvas.getContext("2d");
    var ctxo = overlay.getContext("2d");

    var annotations = document.getElementById("annotations");

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

    // FUNCTION
    function Render(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save(); 
        RenderSelection(points); 
        ctx.restore(); 
    }
    
    // FUNCTION
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

    // FUNCTION
    function saveForm() {
        
        // Save in list
        var message = "l"

        ctxo.beginPath();
        for (var index = 0; index < points.length; index ++){
            // add in list
            var point = points[index];
            message = message + "-(" + Math.round(point.x/zoom) + ":" + Math.round(point.y/zoom) + ")"
            
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
        ctxo.fillStyle = `hsla(${colors[current]},75%,50%,0.2)`;
        ctxo.lineTo(start.x, start.y);
        ctxo.fill();
        ctxo.stroke();
        ctxo.closePath();
    }

    // FUNCTION
    function handleMouseDown(e){
        e.preventDefault();
        e.stopPropagation();

        // style the context
        ctx.strokeStyle = `hsl(${colors[current]},75%,50%)`;
        ctx.lineWidth = 3;
        ctxo.strokeStyle = `hsl(${colors[current]},75%,50%)`;
        ctxo.lineWidth = 3;

        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        isDown = true;
        start = {x: mouseX, y: mouseY} ;
        points = []; 
        points.push(start);
        RenderSelection(points); 
    }
    
    // FUNCTION
    function handleMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        if (isDown == false) {
            return; 
        }
        points.push({x:mouseX, y:mouseY} );
        Render(); 
        
    }
    
    // FUNCTION
    function handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();

        isDown = false;  
        points.push(start);
        Render(); 
        saveForm();
        canvas.removeEventListener("mousedown",handleMouseDown);
        canvas.removeEventListener("mousemove",handleMouseMove);
        canvas.removeEventListener("mouseup",handleMouseUp);
    }

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}