from flask import Flask
app = Flask(__name__)

UPLOAD_FOLDER = 'app/static/tmp' # where files uploaded go
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 
from app import routes