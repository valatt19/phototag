from flask import flash, Blueprint, render_template, render_template_string
from flask_plugins import connect_event
from app.models import AppPlugin

__plugin__ = "Zoom"
__version__ = "1.0.0"

def inject_zoom_script():
    return "<h1>Hello World Injected</h1>"

zoom = Blueprint("hello", __name__, template_folder="templates")

@zoom.route("/")
def index():
    return render_template("zoom.html")


class Zoom(AppPlugin):

    def setup(self):
        self.register_blueprint(zoom, url_prefix="/zoom")

        connect_event("tmpl_before_content", inject_zoom_script)