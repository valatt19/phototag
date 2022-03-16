let canvasValid = false;
let INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed

let canvas = document.getElementById("layerDraw");
let overlay = document.getElementById("layerShow");
let ctx = canvas.getContext("2d");
let ctxo = overlay.getContext("2d");

// calculate where the canvas is on the window
// (used to help calculate mouseX/mouseY)
let $canvas = $("#layerDraw");
let canvasOffset = $canvas.offset();
let offsetX = canvasOffset.left;
let offsetY = canvasOffset.top;
let scrollX = $canvas.scrollLeft();
let scrollY = $canvas.scrollTop();

function addRect(){
    // get references to the canvas and context
    let canvas = document.getElementById("layerDraw");
    let overlay = document.getElementById("layerShow");
    let ctx = canvas.getContext("2d");
    let ctxo = overlay.getContext("2d");

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    let $canvas = $("#layerDraw");
    let canvasOffset = $canvas.offset();
    let offsetX = canvasOffset.left;
    let offsetY = canvasOffset.top;
    let scrollX = $canvas.scrollLeft();
    let scrollY = $canvas.scrollTop();

    // updateRect flag is true when the user is dragging the mouse
    let isDown = false;

    // List of all annotations
    let annotations = document.getElementById("annotations");

    // these lets will hold the starting and stoping mouse position 
    let startX;
    let startY;
    let width;
    let height;

    let prevStartX = 0;
    let prevStartY = 0;
    let prevWidth  = 0;
    let prevHeight = 0;

    //FUNCTION
    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        ctx.lineWidth = 3;
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
        mouseX = parseInt(e.clientX - offsetX - scrollX);
        mouseY = parseInt(e.clientY - offsetY - scrollY);
    
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
        clear(ctx);
        drawRect(ctxo,current,prevStartX,prevStartY,prevEndX,prevEndY);

        // Save in list
        const rect = {tool:"rect",type:current, x:startX, y:startY, w:width,h:height};
        let nb_boxes = boxes.length;
        boxes.push(rect);
        
        // Save in HTML table
        let tr = document.createElement("tr");

        // Cell 1 
        let td1 = document.createElement("td");
        td1.innerHTML = nb_boxes;
        tr.appendChild(td1);

        // Cell 2
        let td2 = document.createElement("td");
        let message = document.getElementById("classes").getElementsByTagName("li")[current].innerHTML;
        td2.style.background = `hsla(${colors[current]},75%,50%,0.6)`;
        td2.innerHTML = message;
        tr.appendChild(td2);

        // Cell 3
        let td3 = document.createElement("td");
        let button_modify = document.createElement("button");
        button_modify.innerHTML = "Modify";
        button_modify.onclick = function() {modifyRect(nb_boxes);};
        td3.appendChild(button_modify);
        tr.appendChild(td3);

        // Cell 4
        let td4 = document.createElement("td");
        let button_delete = document.createElement("button");
        button_delete.innerHTML = "Delete";
        button_delete.onclick = function() {deleteRect(nb_boxes);};
        td4.appendChild(button_delete);
        tr.appendChild(td4);

        // Add in table
        annotations.appendChild(tr);
        list_to_json(boxes);

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

    // get references to the canvas and context
    let canvas = document.getElementById("layerDraw");
    let overlay = document.getElementById("layerShow");
    let ctx = canvas.getContext("2d");
    let ctxo = overlay.getContext("2d");

    let mySelColor = '#CC0000';
    let mySelWidth = 4;
    let mySelBoxColor = 'black'; // New for selection boxes
    let mySelBoxSize = 8;

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    let $canvas = $("#layerDraw");
    let canvasOffset = $canvas.offset();
    let offsetX = canvasOffset.left;
    let offsetY = canvasOffset.top;
    let scrollX = $canvas.scrollLeft();
    let scrollY = $canvas.scrollTop();

    // updateRect flag is true when the user is dragging the mouse
    let isDown = false;

    // get correct rec
    let updateRect = boxes[index];

    ctx.strokeStyle = "black";
    ctx.lineWidth = mySelWidth;
    ctx.strokeRect(updateRect.x,updateRect.y,updateRect.w,updateRect.h);
    
    // draw the boxes
    
    let half = 2.5;

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
        if (isDrag) {
            getMouse(e);
        
            boxes[mySel].x = mx - offsetx;
            boxes[mySel].y = my - offsety;   
        
            // something is changing position so we better invalidate the canvas!
            invalidate();
        } else if (isResizeDrag) {

            // time ro resize!
            let oldx = boxes[mySel].x;
            let oldy = boxes[mySel].y;
        
            // 0  1  2
            // 3     4
            // 5  6  7
            switch (expectResize) {
            case 0:
                boxes[mySel].x = mx;
                boxes[mySel].y = my;
                boxes[mySel].w += oldx - mx;
                boxes[mySel].h += oldy - my;
                break;
            case 1:
                boxes[mySel].y = my;
                boxes[mySel].h += oldy - my;
                break;
            case 2:
                boxes[mySel].y = my;
                boxes[mySel].w = mx - oldx;
                boxes[mySel].h += oldy - my;
                break;
            case 3:
                boxes[mySel].x = mx;
                boxes[mySel].w += oldx - mx;
                break;
            case 4:
                boxes[mySel].w = mx - oldx;
                break;
            case 5:
                boxes[mySel].x = mx;
                boxes[mySel].w += oldx - mx;
                boxes[mySel].h = my - oldy;
                break;
            case 6:
                boxes[mySel].h = my - oldy;
                break;
            case 7:
                boxes[mySel].w = mx - oldx;
                boxes[mySel].h = my - oldy;
                break;
            }
            let b = boxes[mySel];
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
            if (mx >= cur.x && mx <= cur.x + mySelBoxSize &&
                my >= cur.y && my <= cur.y + mySelBoxSize) {
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
        list_to_json(boxes);
    }


    function getMouse(e) {
        mx = parseInt(e.clientX - offsetX);
        my = parseInt(e.clientY - offsetY);
    }

    function drawHandles() {
        clear(ctx);
        ctx.strokeStyle = "black";
        ctx.lineWidth = mySelWidth;
        ctx.strokeRect(updateRect.x,updateRect.y,updateRect.w,updateRect.h);
        
        // draw the boxes
        
        let half = 2.5;
        let selectionHandles = [{x:updateRect.x-half, y:updateRect.y-half}, 
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

function invalidate() {
    canvasValid = false;
}

//wipes the canvas context
function clear(c) {
    c.clearRect(0, 0, canvas.width, canvas.height);
}
    
// Main draw loop.
// While draw is called as often as the INTERVAL letiable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
    if (canvasValid == false) {
        clear(ctxo);
    
        // draw all boxes
        let l = boxes.length;
        for (let i = 0; i < l; i++) {
            let b = boxes[i];
            if (b.tool == "rect") {
                // Box is a rectangle
                drawRect(ctxo,b.type,b.x,b.y,b.x+b.w,b.y+b.h);
            } else {
                // Box is a free form
                let b2_points = b.p;
                ctxo.beginPath();
                for (let index = 0; index < b2_points.length; index ++){
                    // add in list
                    let point = b2_points[index];
                    
                    // draw in ctxo
                    if (index == 0){
                        ctxo.moveTo(point.x, point.y);
                    } else {
                        ctxo.lineTo(point.x, point.y);
                    }
                }

                // Save free form in layer
                ctxo.fillStyle = `hsla(${colors[b.type]},75%,50%,0.2)`;
                ctxo.strokeStyle = `hsla(${colors[b.type]},75%,50%,1)`;
                ctxo.lineTo(b2_points[0].x, b2_points[0].y);
                ctxo.fill();
                ctxo.stroke();
                ctxo.closePath();
            }
        }
        canvasValid = true;
    }
}

function deleteRect(index) {
    // make mainDraw() fire every INTERVAL milliseconds
    setInterval(mainDraw, INTERVAL);
    
    let toDelete = document.getElementById("annotations").getElementsByTagName("tr")[index];

    let l = boxes.length;
    let i = index+1;
    for (i; i < l; i++) {
        let newi = i-1;
        let toChange = document.getElementById("annotations").getElementsByTagName("tr")[i].getElementsByTagName("td");

        // Change color
        let colorToChange = toChange[1];
        colorToChange.style.background = `hsla(${colors[boxes[newi].type]},75%,50%,0.6)`;

        // Change index
        let numToChange = toChange[0];
        numToChange.innerHTML = newi;

        // Rectangle = 2 buttons and lasso = 1 button
        if (toChange.length == 2 ) {           
            toChange[2].getElementsByTagName("button")[0].onclick = function() {modifyRect(newi);}
            toChange[3].getElementsByTagName("button")[0].onclick = function() {deleteRect(newi);}
        } else {
            toChange[3].getElementsByTagName("button")[0].onclick = function() {deleteLasso(newi);}
        }
    }

    toDelete.parentNode.removeChild(toDelete);
    boxes.splice(index,1);
    invalidate();
    list_to_json(boxes);
}

// Load previously saved annotations
$(document).ready(function() {
  let saved = $('#my_data').data("boxes");
  if (saved.length > 0 ) {
      boxes = saved;
      setInterval(mainDraw, INTERVAL);
      for (let i=0; i < boxes.length; i++) {

        // Save in HTML table
        let tr = document.createElement("tr");

        // Cell 1 
        let td1 = document.createElement("td");
        td1.innerHTML = i;
        tr.appendChild(td1);

        // Cell 2
        let td2 = document.createElement("td");
        let message = document.getElementById("classes").getElementsByTagName("li")[boxes[i].type].innerHTML;
        let t = boxes[i].type
        alert(colors[t]);
        td2.style.background = `hsla(${colors[t]},75%,50%,0.6)`;
        td2.innerHTML = message;
        tr.appendChild(td2);
        
        // Cell 3
        let button_delete;
        if (boxes[i].tool == "rect" ) {           
            // Cell 3 (RECT)
            let td3 = document.createElement("td");
            let button_modify = document.createElement("button");
            button_modify.innerHTML = "Modify";
            button_modify.onclick = function() {modifyRect(i);};
            td3.appendChild(button_modify);
            tr.appendChild(td3);

            // Cell 4 button
            button_delete = document.createElement("button");
            button_delete.onclick = function() {deleteRect(i);};
        } else {
            // Cell 3 (LASSO)
            let td3 = document.createElement("td");
            tr.appendChild(td3);
            
            // Cell 4 button
            button_delete = document.createElement("button");
            button_delete.onclick = function() {deleteLasso(i);};
        }
        // Cell 4
        let td4 = document.createElement("td");
        button_delete.innerHTML = "Delete";
        td4.appendChild(button_delete);
        tr.appendChild(td4);

        annotations.appendChild(tr);

        invalidate();
    }
  }
});