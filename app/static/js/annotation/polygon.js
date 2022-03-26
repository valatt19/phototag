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

        // Polygon finished : save it on show layer and in annotations list
        if (points.length > 2 && isNear(mouseX,mouseY,points[0].x,points[0].y,isNearZone)) {
            
            // Add the new polygon (without zoom)
            let bp = [];
            for (let j = 0; j < points.length; j++) {
                let point = points[j]
                bp.push({x:point.x/zoom, y:point.y/zoom})
            }
            const poly = {tool:"polygon",type:current, p:bp};
            boxes.push(poly);
            
            // Redraw new canvas and update annotations list
            invalidate();
            setInterval(mainDraw, INTERVAL);
            setAnnotationsList(boxes);

            // Remove previous listeners
            canvas.removeEventListener("mousedown",handleMouseDown);
            canvas.removeEventListener("mousemove",handleMouseMove);

            list_to_json(boxes);

        } else {
            // Add mouse position 
            points.push({x:mouseX, y:mouseY});
        }

        // Set a flag indicating the drawing has begun
        isDrawing = true;

        // Draw
        ctx.strokeStyle = `hsla(${colors[current]},75%,50%,1)`;
        drawPolygon(ctx, points, true);
        clear(ctx);
        canvas.style.cursor = "default";
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
        drawPolygon(ctx, points, true);

        // Adapt mouse
        let near = isNear(mouseX,mouseY,points[0].x,points[0].y,isNearZone);
        if (near && points.length > 2) {
            canvas.style.cursor = "pointer";
        } else {
            canvas.style.cursor = "default";
        }
    }

    // Remove previous listeners
    canvas.removeEventListener("mousedown",handleMouseDown);
    canvas.removeEventListener("mousemove",handleMouseMove);

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove",handleMouseMove);
}

function modifyPolygon(index) {
    // The node (if any) being selected.
    let mySel = index;
    let selectionHandles = [];
    let isDrag = false;
    let isResizeDrag = false;
    let expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
    let mx, my; // mouse coordinates

    let mySelWidth = 4;
    let mySelBoxColor = 'black'; // New for selection boxes
    let mySelBoxSize = 8;

    // get correct rec
    let updatePoly = boxes[mySel];
    let updatePoints = updatePoly.p;

    ctx.strokeStyle = "black";
    ctx.lineWidth = mySelWidth;
    drawPolygon(ctx, updatePoly.p, false);
    
    // draw the boxes
    let half = 2.5;
    for (let index = 0; index < updatePoints.length; index ++){
        let cur = {x:updatePoints[index].x-half, y:updatePoints[index].y-half};
        selectionHandles.push(cur);
        ctx.fillStyle = mySelBoxColor;
        ctx.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
    }

    // Happens when the mouse is moving inside the canvas
    function myMove(e){
        if (isDrag) {
            getMouse(e);
        
            boxes[mySel].p[expectResize].x = mx - offsetX;
            boxes[mySel].p[expectResize].y = my - offsetY;  
        
            // something is changing position so we better invalidate the canvas!
            invalidate();
        } else if (isResizeDrag) {

            boxes[mySel].p[expectResize].x = mx;
            boxes[mySel].p[expectResize].y = my;

            selectionHandles[expectResize]={x:boxes[mySel].p[expectResize].x-half, y:boxes[mySel].p[expectResize].y-half};
            clear(ctx);
            ctx.strokeStyle = "black";
            ctx.lineWidth = mySelWidth;
            drawPolygon(ctx, updatePoly.p, false);
            
            // draw the boxes
            for (let index = 0; index < updatePoints.length; index ++){
                let cur = {x:updatePoints[index].x-half, y:updatePoints[index].y-half};
                selectionHandles.push(cur);
                ctx.fillStyle = mySelBoxColor;
                ctx.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
            }

            invalidate();
        }

        getMouse(e);
        if (mySel !== -1 && !isResizeDrag) {
            for (let i = 0; i < selectionHandles.length; i++) {
                let cur = selectionHandles[i];
            
                // we dont need to use the ghost context because
                // selection handles will always be rectangles
                if (mx >= cur.x && mx <= cur.x + mySelBoxSize &&
                    my >= cur.y && my <= cur.y + mySelBoxSize) {
                    // we found one!
                    expectResize = i;
                    invalidate();
                    canvas.style.cursor='nw-resize';
                    
                    return;
                }
                // not over a selection box, return to normal
                isResizeDrag = false;
                expectResize = -1;
                canvas.style.cursor='auto';
            }
        }
    }

    // Happens when the mouse is clicked in the canvas
    function myDown(e){
        getMouse(e);

        //we are over a selection box
        if (expectResize !== -1) {
            isResizeDrag = true;
            return;
        }

        clear(ctx);
        let l = boxes.length;
        for (let i = l-1; i >= 0; i--) {
            // draw shape onto ghost context
            let b = boxes[i];
            drawPolygon(ctxo,b.p, false);
            
            // get image data at the mouse x,y pixel
            let imageData = ctx.getImageData(mx, my, 1, 1);
            
            // if the mouse pixel exists, select and break
            if (imageData.data[3] > 0) {
                isDrag = true;
                
                invalidate();
                clear(ctx);
                return;
            }
            
        }
        // havent returned means we have selected nothing
        mySel = -1;
        // clear the ghost canvas for next time
        clear(ctx);
        // invalidate because we might need the selection border to disappear
        invalidate();
    }

    function myUp(){
        isDrag = false;
        isResizeDrag = false;
        expectResize = -1;
        clear(ctx);
        list_to_json(boxes);
    }

    function getMouse(e) {
        mx = parseInt(e.clientX - offsetX);
        my = parseInt(e.clientY - offsetY);
    }

    // make mainDraw() fire every INTERVAL milliseconds
    setInterval(mainDraw, INTERVAL);
    // Add listeners
    canvas.addEventListener("mousedown", myDown);
    canvas.addEventListener("mousemove", myMove);
    canvas.addEventListener("mouseup", myUp);

}

// Draw a polygon on canvas can
function drawPolygon(can,points,inCreation) {
    can.beginPath();
    for (let index = 0; index < points.length; index ++){
        let point = points[index];
        if (index == 0){
            can.moveTo(point.x, point.y);
        } else {
            can.lineTo(point.x, point.y);
        }
    }

    // User is drawing : last point is mouse position
    if (inCreation) {
        can.lineTo(mouseX, mouseY);
    // Polygon already created : Last point is the first
    } else {
        can.lineTo(points[0].x, points[0].y);
    }
    can.stroke();
    can.closePath();
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