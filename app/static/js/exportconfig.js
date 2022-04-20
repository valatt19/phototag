function saveConfig() {
    $(document).ready(function () {
    let xmltext = $('#my_config').data("config");
    xmltext = xmltext.slice(2, xmltext.length - 1);
    xmltext = xmltext.replace(/\\n/g, '')

    let name = $('#my_config').data("name");
    let filename =name+".xml";

    let pom = document.createElement('a');
    let bb = new Blob([xmltext], {type: 'text/plain'});

    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);

    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true;
    pom.classList.add('dragout');

    pom.click();

    });
}