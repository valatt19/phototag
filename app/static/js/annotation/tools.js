// TOOLS FUNCTIONS USED TO ADD ANNOTATIONS
// The tool itself is implemented in file : <toolname>.js

///////////////////////////////////////////
// ADD A BOX WITH : rect, lasso, polygon //
///////////////////////////////////////////
function addBoxe(tool) {
    clear(ctx);

    if (tool == "rect") {
        addRect();
    } else if (tool == "lasso") {
        addLasso();
    } else if (tool == "polygon") {
        addPolygon();
    }
}

//////////////////////////////////
// MODIFY A BOX : rect, polygon //
//////////////////////////////////
function modifyBoxe(tool, index) {
    clear(ctx);
    setBorder(index);
    
    if (tool == "rect") {
        modifyRect(index);
    } else if (tool == "lasso") {
        modifyLasso(index);
    } else if (tool == "polygon") {
        modifyPolygon(index);
    }
}

///////////////////////////////////////
// DELETE A BOX : same for all tools //
///////////////////////////////////////
function deleteBoxe(index) {
    clear(ctx);

    // Delete boxe in the list
    let tool = boxes[index].tool;
    let type = boxes[index].type
    boxes.splice(index,1);
    
    // Redraw new canvas and update annotations list
    invalidate();
    setInterval(mainDraw, INTERVAL);
    setAnnotationsList(boxes);

    save_modifications(boxes, "delete", tool, document.getElementById("classes").getElementsByTagName("li")[type].innerHTML);
}

//////////////////////////
// ADDITONALS FUNCTIONS //
//////////////////////////

// Main draw loop. 
// While draw is called as often as the INTERVAL letiable demands,
// It only ever does something if the canvas gets invalidated
function mainDraw() {
    if (canvasValid == false) {
        clear(ctxo);
    
        // draw all boxes
        let l = boxes.length;
        for (let i = 0; i < l; i++) {
            let b = boxes[i];
            if (b.tool == "rect") {
                // Box is a rectangle
                drawRect(ctxo,b.type,b.x*zoom,b.y*zoom,b.x*zoom+b.w*zoom,b.y*zoom+b.h*zoom);
            } else {
                // Box is a free form
                // Adapt coordinates with zoom factor
                let bp = [];
                for (let j = 0; j < b.p.length; j++) {
                    let point = b.p[j]
                    bp.push({x:point.x*zoom, y:point.y*zoom})
                }
                drawFree(ctxo,b.type,bp);
            }
        }
        canvasValid = true;
    }
}

// Invalidate the canvas to redraw it
function invalidate() {
    canvasValid = false;
}

// Wipes the canvas context
function clear(c) {
    c.clearRect(0, 0, canvas.width, canvas.height);
}

// BUG : affichage des couleurs apres delete
// DE TOUTE FACON : liste par classe

// Load saved annotations in the list in the pannel
function setAnnotationsList(boxes) {
    // Init : EMPTY list annotations
    $("#annotations tr").remove();

    // Then : FILL list annotations 
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
      td2.innerHTML = message;
      tr.appendChild(td2);
      td2.style.background = `hsla(${colors[boxes[i].type]},75%,50%,0.6)`;

      // Cell 3
      let td3 = document.createElement("td");
      td3.innerHTML = boxes[i].tool;
      tr.appendChild(td3);

      // Cell 4
      let td4 = document.createElement("td");
      let button_delete = document.createElement("button");;
      button_delete.onclick = function() {deleteBoxe(i);};
      button_delete.innerHTML = "Delete";
      td4.appendChild(button_delete);
      tr.appendChild(td4);
      
      // Make row clickable to modify box
      let tool = boxes[i].tool;
      tr.onclick = function() {modifyBoxe(tool,i);};
      tr.style.cursor = "pointer";

      annotations.appendChild(tr);
    }
}

// Send POST request to server to save the annotations list
function save_modifications(l,modif,tool,type) {
    // Set border to of annotations to normal when modification finished
    setBorder(-1);

    // Get image id
    img_id = $('#my_data').data("img");

    // Send request to save the modifications to server
    $.ajax({
        url: img_id+"/save_json",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        data: JSON.stringify({html_data: [l,modif,tool,type]}),
        success: function(response) {
            console.log(response);
        },
    });
}

////////////////////////////////////////
// UPDATE when other user made update //
////////////////////////////////////////
function update(b,i,users,l) {
    if (img_id == i) {
        // Update live users first
        updateLive(users,i)
        boxes = b;
        // Redraw new canvas and update annotations list
        invalidate();
        setInterval(mainDraw, INTERVAL);
        setAnnotationsList(boxes);
        log=l;
    }
}

/////////////////////////////////
// UPDATE live users connected //
/////////////////////////////////
function updateLive(users,i) {
    if (img_id == i) {
        // Delete all precedents usernames
        const myNode = document.getElementById("username");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
        // Add new usernames
        for (let j=0; j < users.length; j++) {
            let div = document.createElement("div");
            div.className = "avatar-circle";

            let span = document.createElement("span");
            span.className = "initials";
            span.title = users[j];
            span.innerHTML = users[j].slice(0,2);

            div.appendChild(span);
            myNode.appendChild(div);
        }
    }
}

function setBorder(index) {
    let lines = document.getElementById("annotations").getElementsByTagName("tr");
    for (let i = 0 ; i < lines.length ; i++) {
        lines[i].style.border = "1px solid #ddd";
    }
    // One line is selectionned and it is thicked
    if (index > -1) {
        lines[index].style.border = "thick solid black";
    }

}