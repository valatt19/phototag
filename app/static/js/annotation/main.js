// get references to the canvas and context
var canvas = document.getElementById("layerDraw");
var overlay = document.getElementById("layerShow");
var ctx = canvas.getContext("2d");
var ctxo = overlay.getContext("2d");

var boxes = []
var img_id = $('#my_data').data("img");

$(document).ready(function() {
  var saved = $('#my_data').data("boxes");
  if (saved.length > 0 ) {
      boxes = saved;

      for (let i=0; i < boxes.length; i++) {
        if (boxes[i].tool == "rect" ) {           
            // Save in list
            var message = i + "-" + document.getElementById("classes").getElementsByTagName("li")[current].innerHTML;

            var button_modify = document.createElement("button");
            button_modify.innerHTML = "Modify";
            button_modify.onclick = function() {modifyRect(i);}

            var button_delete = document.createElement("button");
            button_delete.innerHTML = "Delete";
            button_delete.onclick = function() {deleteRect(i);}

            var li = document.createElement("li");
            li.appendChild(document.createTextNode(message));
            li.appendChild(button_modify);
            li.appendChild(button_delete);

            annotations.appendChild(li);
            drawRect(ctxo,boxes[i].type,boxes[i].x,boxes[i].y,boxes[i].x+boxes[i].x,boxes[i].w+boxes[i].h);
        } else {
            // Save in list
            var message = i + "-" + document.getElementById("classes").getElementsByTagName("li")[current].innerHTML;

            var button_delete = document.createElement("button");
            button_delete.innerHTML = "Delete";
            button_delete.onclick = function() {deleteLasso(i);}

            var li = document.createElement("li");
            li.appendChild(document.createTextNode(message));
            li.appendChild(button_delete);

            annotations.appendChild(li);
        }
    }
  }
});

function download_image(){
    var canvas = document.getElementById("layerShow");
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
}

function list_to_json(l) {
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