function addRect(){
    // updateRect flag is true when the user is dragging the mouse
    let isDown = false;

    // these lets will hold the starting and stoping mouse position 
    let startX;
    let startY;
    let width;
    let height;

    //FUNCTION
    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
    
        // save the starting x/y of the rectangle
        startX = parseInt(e.clientX - offsetX) - relative_pos_left;
        startY = parseInt(e.clientY - offsetY) - relative_pos_top;
    
        // set a flag indicating the drag has begun
        isDown = true;
    }
    
    //FUNCTION
    function handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag + save coordinates
        if (isDown) {
            // Add the new rect
            const rect = {tool:"rect",type:current, x:startX/zoom, y:startY/zoom, w:width/zoom,h:height/zoom};
            boxes.push(rect);
            
            // Redraw new canvas and update annotations list
            invalidate();
            setInterval(mainDraw, INTERVAL);
            setAnnotationsList(boxes);
            clear(ctx);
        }
        isDown = false;
        canvas.removeEventListener("mousedown",handleMouseDown);
        canvas.removeEventListener("mousemove",handleMouseMove);
        canvas.removeEventListener("mouseup",handleMouseUp);
        save_modifications(boxes,"add","rect",document.getElementById("classes").getElementsByTagName("li")[current].innerHTML);
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
        mouseX = parseInt(e.clientX - offsetX - scrollX) - relative_pos_left;
        mouseY = parseInt(e.clientY - offsetY - scrollY) - relative_pos_top;
    
        // Put your mousemove stuff here
    
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // calculate the rectangle width/height based
        // on starting vs current mouse position
        width = mouseX - startX;
        height = mouseY - startY;
    
        // draw a new rect from the start position 
        // to the current mouse position
        drawRect(ctx,current,startX,startY,startX+width,startY+height);
    }

    // Remove previous listeners
    canvas.removeEventListener("mousedown",handleMouseDown);
    canvas.removeEventListener("mousemove",handleMouseMove);
    canvas.removeEventListener("mouseup",handleMouseUp);

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function drawRect(c,type,x1,y1,x2,y2) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y1);
    c.lineTo(x2, y2);
    c.lineTo(x1, y2);
    c.lineTo(x1, y1);
    c.fillStyle = `hsla(${colors[type]},75%,50%,0.2)`;
    c.strokeStyle = `hsla(${colors[type]},75%,50%,1)`;
    c.fill();
    c.stroke();
    c.closePath();
}

function modifyRect(index) {
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
    let ur = boxes[index];
    let updateRect = {x:ur.x*zoom, y:ur.y*zoom, w:ur.w*zoom, h:ur.h*zoom};

    ctx.strokeStyle = "black";
    ctx.lineWidth = mySelWidth;
    ctx.strokeRect(updateRect.x,updateRect.y,updateRect.w,updateRect.h);
    
    // draw the boxes
    let half = mySelBoxSize/2;

    selectionHandles = [{x:updateRect.x-half, y:updateRect.y-half}, 
        {x:updateRect.x+updateRect.w/2-half, y:updateRect.y-half},
        {x:updateRect.x+updateRect.w-half, y:updateRect.y-half},
        {x:updateRect.x-half, y:updateRect.y+updateRect.h/2-half},
        {x:updateRect.x+updateRect.w-half, y:updateRect.y+updateRect.h/2-half},
        {x:updateRect.x-half, y:updateRect.y+updateRect.h-half},
        {x:updateRect.x+updateRect.w/2-half, y:updateRect.y+updateRect.h-half},
        {x:updateRect.x+updateRect.w-half, y:updateRect.y+updateRect.h-half}];
    
    drawHandles();

    // Happens when the mouse is moving inside the canvas
    function myMove(e){
        if (isResizeDrag) {

            // time ro resize!
            let oldx = boxes[mySel].x;
            let oldy = boxes[mySel].y;
            
            // Adapt coordinates in function of 
            mx = mx - relative_pos_left;
            my = my - relative_pos_top;

            // 0  1  2
            // 3     4
            // 5  6  7
            switch (expectResize) {
            case 0:
                boxes[mySel].x = mx/zoom;
                boxes[mySel].y = my/zoom;
                boxes[mySel].w += oldx - mx/zoom;
                boxes[mySel].h += oldy - my/zoom;
                break;
            case 1:
                boxes[mySel].y = my/zoom;
                boxes[mySel].h += oldy - my/zoom;
                break;
            case 2:
                boxes[mySel].y = my/zoom;
                boxes[mySel].w = mx/zoom - oldx;
                boxes[mySel].h += oldy - my/zoom;
                break;
            case 3:
                boxes[mySel].x = mx/zoom;
                boxes[mySel].w += oldx - mx/zoom;
                break;
            case 4:
                boxes[mySel].w = mx/zoom - oldx;
                break;
            case 5:
                boxes[mySel].x = mx/zoom;
                boxes[mySel].w += oldx - mx/zoom;
                boxes[mySel].h = my/zoom - oldy;
                break;
            case 6:
                boxes[mySel].h = my/zoom - oldy;
                break;
            case 7:
                boxes[mySel].w = mx/zoom - oldx;
                boxes[mySel].h = my/zoom - oldy;
                break;
            }
            let ur = boxes[mySel];
            let b = {x:ur.x*zoom, y:ur.y*zoom, w:ur.w*zoom, h:ur.h*zoom};
            selectionHandles = [{x:b.x-half, y:b.y-half}, 
                {x:b.x+b.w/2-half, y:b.y-half},
                {x:b.x+b.w-half, y:b.y-half},
                {x:b.x-half, y:b.y+b.h/2-half},
                {x:b.x+b.w-half, y:b.y+b.h/2-half},
                {x:b.x-half, y:b.y+b.h-half},
                {x:b.x+b.w/2-half, y:b.y+b.h-half},
                {x:b.x+b.w-half, y:b.y+b.h-half}]; 
                
            drawHandles();

            invalidate();
        }

        getMouse(e);
        // if there's a selection see if we grabbed one of the selection handles
        if (mySel !== -1 && !isResizeDrag) {
            for (let i = 0; i < 8; i++) {
            // 0  1  2
            // 3     4
            // 5  6  7
        
            let cur = selectionHandles[i];
        
            // we dont need to use the ghost context because
            // selection handles will always be rectangles
            if (mx - relative_pos_left >= cur.x && mx - relative_pos_left <= cur.x + mySelBoxSize &&
                my - relative_pos_top>= cur.y && my - relative_pos_top <= cur.y + mySelBoxSize) {
                // we found one!
                expectResize = i;
                invalidate();
                
                switch (i) {
                    case 0:
                        canvas.style.cursor='nw-resize';
                        break;
                    case 1:
                        canvas.style.cursor='n-resize';
                        break;
                    case 2:
                        canvas.style.cursor='ne-resize';
                        break;
                    case 3:
                        canvas.style.cursor='w-resize';
                        break;
                    case 4:
                        canvas.style.cursor='e-resize';
                        break;
                    case 5:
                        canvas.style.cursor='sw-resize';
                        break;
                    case 6:
                        canvas.style.cursor='s-resize';
                        break;
                    case 7:
                        canvas.style.cursor='se-resize';
                        break;
                    }
                return;
                }
        
            }
            // not over a selection box, return to normal
            isResizeDrag = false;
            expectResize = -1;
            canvas.style.cursor='auto';
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
            drawRect(ctxo,b.type,b.x,b.y,b.x+b.w,b.y+b.h);
            
            // get image data at the mouse x,y pixel
            let imageData = ctx.getImageData(mx, my, 1, 1);
            
            // if the mouse pixel exists, select and break
            if (imageData.data[3] > 0) {
                boxes[mySel] = boxes[i];
                offsetx = mx - boxes[mySel].x;
                offsety = my - boxes[mySel].y;
                boxes[mySel].x = mx - offsetx;
                boxes[mySel].y = my - offsety;
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
        save_modifications(boxes,"modify","rect",document.getElementById("classes").getElementsByTagName("li")[boxes[index].type].innerHTML);
        canvas.style.cursor='auto';
            
        // Remove previous listeners
        canvas.removeEventListener("mousedown",myDown);
        canvas.removeEventListener("mousemove",myMove);
        canvas.removeEventListener("mouseup",myUp);
    }


    function getMouse(e) {
        mx = parseInt(e.clientX - offsetX);
        my = parseInt(e.clientY - offsetY);
    }

    function drawHandles() {
        clear(ctx);
        ctx.strokeStyle = "black";
        ctx.lineWidth = mySelWidth;

        let ur = boxes[index];
        let updateRect = {x:ur.x*zoom, y:ur.y*zoom, w:ur.w*zoom, h:ur.h*zoom};

        ctx.strokeRect(updateRect.x,updateRect.y,updateRect.w,updateRect.h);
    
        selectionHandles = [{x:updateRect.x-half, y:updateRect.y-half}, 
            {x:updateRect.x+updateRect.w/2-half, y:updateRect.y-half},
            {x:updateRect.x+updateRect.w-half, y:updateRect.y-half},
            {x:updateRect.x-half, y:updateRect.y+updateRect.h/2-half},
            {x:updateRect.x+updateRect.w-half, y:updateRect.y+updateRect.h/2-half},
            {x:updateRect.x-half, y:updateRect.y+updateRect.h-half},
            {x:updateRect.x+updateRect.w/2-half, y:updateRect.y+updateRect.h-half},
            {x:updateRect.x+updateRect.w-half, y:updateRect.y+updateRect.h-half}];
        // 0  1  2
        // 3     4
        // 5  6  7
    
        // Draw all boxes
        ctx.fillStyle = mySelBoxColor;
        for (let i = 0; i < 8; i ++) {
            let cur = selectionHandles[i];
            ctx.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
        }
    }

    // make mainDraw() fire every INTERVAL milliseconds
    setInterval(mainDraw, INTERVAL);
    // Add listeners
    canvas.addEventListener("mousedown", myDown);
    canvas.addEventListener("mousemove", myMove);
    canvas.addEventListener("mouseup", myUp);
}