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

    $("#layerDraw").onmousedown(function(e) {
        e.preventDefault();
        e.stopPropagation();

        isDown = true;
        start = {x: e.clientX, y: e.clientY} ;
        points = []; 
        points.push(start);
        RenderSelection(points); 
    });
    
    $("#layerDraw").onmousemove(function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isDown == false) {
            return; 
        }
        points.push({x: e.clientX, y: e.clientY} );
        Render(); 
        
    });
    
    $("#layerDraw").onmouseup(function() {
        e.preventDefault();
        e.stopPropagation();

        isDown = false;  
        points.push(start);
        Render(); 
        return;
    });  
}