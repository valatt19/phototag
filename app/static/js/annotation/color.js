let colors = [];
let current = 0;

// Function to generate a new color
function generateColor(number){
    const hue = number * 137.508; // use golden angle approximation
    return hue;
}

function set_current(new_current){
    current=parseInt(new_current);
    // Remove border for all classes
    let classes = document.getElementById("classes").getElementsByTagName("li");
    for (let i = 0 ; i<classes.length ; i++) {
        classes[i].style.border = "none";
    }
    // Add border to new class selected
    classes[new_current].style.border = "thick solid black";
}

// When document ready : add background color for all classes and select first by default
$(document).ready(function() {
    let classes = document.getElementById("classes").getElementsByTagName("li");
    for (let i = 0 ; i<classes.length ; i++) {
        let rand_color = generateColor(i)
        colors.push(rand_color)
        classes[i].style.background = `hsla(${rand_color},75%,50%,0.6)`;
    }
    classes[0].style.border = "thick solid black";
});