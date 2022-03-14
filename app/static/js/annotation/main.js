var img_id = $('#my_data').data("img");
var boxes = []

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