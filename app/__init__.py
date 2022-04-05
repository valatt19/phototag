# Import and init flask app
from flask import Flask
from config import Config
app = Flask(__name__)

UPLOAD_FOLDER = 'app/static/datasets' # where files uploaded go
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

app.config.from_object(Config)

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

from app import routes