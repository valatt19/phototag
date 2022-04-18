function drawFree(ctxo,type,points){
    ctxo.beginPath();
    for (let index = 0; index < points.length; index ++){
        // add in list
        let point = points[index];
        
        // draw in ctxo
        if (index == 0){
            ctxo.moveTo(point.x, point.y);
        } else {
            ctxo.lineTo(point.x, point.y);
        }
    }

    // Save free form in layer
    ctxo.fillStyle = `hsla(${colors[type]},75%,50%,0.2)`;
    ctxo.strokeStyle = `hsla(${colors[type]},75%,50%,1)`;
    ctxo.lineTo(points[0].x, points[0].y);
    ctxo.fill();
    ctxo.stroke();
    ctxo.closePath();
}

function addLasso(){

    // this flage is true when the user is dragging the mouse
    let isDown = false;

    // starting point and list containing all the points of the form
    let start = {x:0,y:0};
    let points = [];

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
        for (let index = 0; index < points.length; index ++){
            let point = points[index];
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
        let sel = {tool:"lasso",type:current, p:[]};

        ctxo.beginPath();
        for (let index = 0; index < points.length; index ++){
            // add in list (without zoom)
            let point = {x:points[index].x/zoom,y:points[index].y/zoom};
            sel.p.push(point);
        }
        boxes.push(sel);
    }

    // FUNCTION
    function handleMouseDown(e){
        e.preventDefault();
        e.stopPropagation();

        // style the context
        ctx.strokeStyle = `hsl(${colors[current]},75%,50%)`;
        ctxo.strokeStyle = `hsl(${colors[current]},75%,50%)`;

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

        saveForm();
        // Redraw new canvas and update annotations list
        invalidate();
        setInterval(mainDraw, INTERVAL);
        setAnnotationsList(boxes);
        clear(ctx);

        canvas.removeEventListener("mousedown",handleMouseDown);
        canvas.removeEventListener("mousemove",handleMouseMove);
        canvas.removeEventListener("mouseup",handleMouseUp);
        list_to_json(boxes,"add","lasso",document.getElementById("classes").getElementsByTagName("li")[current].innerHTML);
    }

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function modifyLasso(index){
    let box = boxes[index];
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < box.p.length; i ++){

        let point = box.p[i];
        // draw in ctxo
        if (i == 0){
            ctx.moveTo(point.x*zoom, point.y*zoom);
        } else {
            ctx.lineTo(point.x*zoom, point.y*zoom);
        }
    }

    // Save free form in drawing layer 
    ctx.lineTo(box.p[0].x*zoom, box.p[0].y*zoom);
    ctx.stroke();
    ctx.closePath();
}
