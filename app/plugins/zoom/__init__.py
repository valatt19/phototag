from flask import flash, Blueprint, render_template, render_template_string
from flask_plugins import connect_event
from app.models import AppPlugin

__plugin__ = "Zoom"
__version__ = "1.0.0"

# Render html code of plugin zoom with button zoom
def inject_zoom_script():
    return render_template_string(
        """
            <a><b>Zoom:</b></a>
            <input type='button' id='zoomout' class='button' value='Zoom out'>
            <input type='button' id='zoomin' class='button' value='Zoom in''>
            <input type='button' id='zoomreset' class='button' value='Reset' style='margin-right: 20px;'>
            <script src="{{url_for('zoom.static',filename='zoom_image.js')}}"></script>
        """
    )
zoom = Blueprint("zoom", __name__, template_folder="templates", static_folder="static")

class Zoom(AppPlugin):

    def setup(self):
        self.register_blueprint(zoom, url_prefix="/zoom")

        # HMTL code of this plugin will show on pannel bar in annotate.html page
        connect_event("tmpl_before_content_annotate_pannel", inject_zoom_script)