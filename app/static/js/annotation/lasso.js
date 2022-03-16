function addLasso(){

    // get references to the canvas and context
    let canvas = document.getElementById("layerDraw");
    let overlay = document.getElementById("layerShow");
    let ctx = canvas.getContext("2d");
    let ctxo = overlay.getContext("2d");

    let annotations = document.getElementById("annotations");

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    let $canvas = $("#layerDraw");
    let canvasOffset = $canvas.offset();
    let offsetX = canvasOffset.left;
    let offsetY = canvasOffset.top;
    let scrollX = $canvas.scrollLeft();
    let scrollY = $canvas.scrollTop();

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
        const sel = {type:current, p:[]};
        let nb_boxes = boxes.length;

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
        tr.appendChild(td3);

        // Cell 4
        let td4 = document.createElement("td");
        let button_delete = document.createElement("button");
        button_delete.innerHTML = "Delete";
        button_delete.onclick = function() {deleteLasso(nb_boxes);};
        td4.appendChild(button_delete);
        tr.appendChild(td4);

        // Add in table
        annotations.appendChild(tr);

        ctxo.beginPath();
        for (let index = 0; index < points.length; index ++){
            // add in list
            let point = points[index];
            sel.p.push(point);
            
            // draw in ctxo
            if (index == 0){
                ctxo.moveTo(point.x, point.y);
            } else {
                ctxo.lineTo(point.x, point.y);
            }
        }

        boxes.push(sel);

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
        list_to_json(boxes);
    }

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function deleteLasso(index) {
    clear(ctx);
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