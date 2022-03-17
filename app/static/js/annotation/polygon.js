var isNearZone = 5;

function addPolygon(){
    // updateRect flag is true when the user is dragging the mouse
    let isDrawing = false;

    // these lets will hold the starting and stoping mouse position 
    let points = [];

    //FUNCTION
    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        points.push({x:mouseX, y:mouseY});
    
        // Set a flag indicating the drawing has begun
        isDrawing = true;

        // Draw
        clear(ctx);
        ctx.beginPath();
        for (let index = 0; index < points.length; index ++){
            let point = points[index];
            if (index == 0){
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }

        // Polygon finished : save it on show layer and in annotations list
        let near = isNear(mouseX,mouseY,points[0].x,points[0].y,isNearZone);
        if (near && points.length > 2) {
            // Add the new rect
            const poly = {tool:"polygon",type:current, p:points};
            boxes.push(poly);
            
            // Redraw new canvas and update annotations list
            invalidate();
            setInterval(mainDraw, INTERVAL);
            setAnnotationsList(boxes);
            clear(ctx);

            // Remove previous listeners
            canvas.removeEventListener("mousedown",handleMouseDown);
            canvas.removeEventListener("mousemove",handleMouseMove);
        }
        ctx.stroke();
        ctx.closePath();
    }
    
    //FUNCTION
    function handleMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
    
        // if we're not dragging, just return
        if (!isDrawing) {
            return;
        }
    
        // get the current mouse position
        mouseX = parseInt(e.clientX - offsetX - scrollX);
        mouseY = parseInt(e.clientY - offsetY - scrollY);

        // Draw
        clear(ctx);
        ctx.beginPath();
        for (let index = 0; index < points.length; index ++){
            let point = points[index];
            if (index == 0){
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.closePath();

        // Adapt mouse
        let near = isNear(mouseX,mouseY,points[0].x,points[0].y,isNearZone);
        if (near && points.length > 2) {
            canvas.style.cursor = "pointer";
        }
    }

    // Remove previous listeners
    canvas.removeEventListener("mousedown",handleMouseDown);
    canvas.removeEventListener("mousemove",handleMouseMove);

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove",handleMouseMove);
}

function isNear(x1,y1,x2,y2,p) {
    if (Math.abs(x1-x2)>p) {
        return false;
    }
    if (Math.abs(y1-y2)>p) {
        return false;
    }
    return true;
}