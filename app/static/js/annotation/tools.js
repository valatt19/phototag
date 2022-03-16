// TOOLS FUNCTIONS USED TO ADD ANNOTATIONS
// The tool itself is implemented in file : <toolname>.js

///////////////////////////////////////////
// ADD A BOX WITH : rect, lasso, polygon //
///////////////////////////////////////////
function addBoxe(tool) {
    if (tool == "rect") {
        addRect();
    } else if (tool == "lasso") {
        addLasso();
    }
}

//////////////////////////////////
// MODIFY A BOX : rect, polygon //
//////////////////////////////////
function modifyBoxe(tool, index) {
    if (tool == "rect") {
        modifyRect(index);
    }
}

///////////////////////////////////////
// DELETE A BOX : same for all tools //
///////////////////////////////////////
function deleteBoxe(index) {
    // Delete boxe in the list
    boxes.splice(index,1);
    
    // Redraw new canvas and update annotations list
    invalidate();
    setInterval(mainDraw, INTERVAL);
    setAnnotationsList(boxes);

    list_to_json(boxes);
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
                drawRect(ctxo,b.type,b.x,b.y,b.x+b.w,b.y+b.h);
            } else {
                // Box is a free form
                drawFree(ctxo,b.type,b.p);
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
      let tool = boxes[i].tool;
      let td3 = document.createElement("td");
      if (tool != "lasso" ) { 
          // Because lasso cant be modified
          let button_modify = document.createElement("button");
          button_modify.innerHTML = "Modify";
          button_modify.onclick = function() {modifyBoxe(tool,i);};
          td3.appendChild(button_modify);
      }
      tr.appendChild(td3); 

      // Cell 4
      let td4 = document.createElement("td");
      let button_delete = document.createElement("button");;
      button_delete.onclick = function() {deleteBoxe(i);};
      button_delete.innerHTML = "Delete";
      td4.appendChild(button_delete);
      tr.appendChild(td4);

      annotations.appendChild(tr);
    }
}

// Send POST request to server to save the annotations list
function list_to_json(l) {
    // Get image id
    var img_id = $('#my_data').data("img");

    // Send request
    $.ajax({
        url: img_id+"/save_json",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        data: JSON.stringify({html_data: l}),
        success: function(response) {
            console.log(response);
        },
    });
}