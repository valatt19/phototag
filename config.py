import os, binascii

basedir = os.path.abspath(os.path.dirname(__file__))
EMAIL = 'pphototag@gmail.com'
PASSWORD = 'Phototag2022'
class Config(object):
    SECRET_KEY = binascii.hexlify(os.urandom(24))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'users.db') # or 'sqlite:/// + global path to db 
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
