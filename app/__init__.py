# Import and init flask app
from flask import Flask, current_app
from config import Config
app = Flask(__name__)

from os.path import abspath

abs = abspath('app') 
print(abs)
absolute = abs.replace('\\','/')

UPLOAD_FOLDER = absolute+'/static/datasets' # where files uploaded go
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

app.config.from_object(Config)

domain = app.config.get('SERVER_NAME', 'some.sensible.default.domain')

# Import and init flask login
from flask_login import LoginManager

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message_category = "info"
login_manager.login_message = "You can not access this page. Please log in to access this page."
login_manager.session_protection = "strong"

# Import and init flask DB
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

# Import and init socket for real time collab
from flask_socketio import SocketIO

socketio = SocketIO(app)

# Import and init plugin manager
from flask_plugins import PluginManager

plugin_manager = PluginManager(app)

from app import routes