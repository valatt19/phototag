from email.policy import default
from flask_login import UserMixin
from sqlalchemy import null, PickleType
from app import db,login_manager
from copy import deepcopy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy.ext.mutable import MutableList


#-------------------------Image---------------------------------------------
ds_images = []

class Image(db.Model):
    __tablename__ = "image"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80),unique = True, nullable=False)
    path = db.Column(db.String(80),unique=False,nullable=False)
    size = db.Column(db.Integer)
    last_time = db.Column(db.DateTime, unique=False, nullable=False)
    last_person = db.Column(db.Integer,db.ForeignKey("users.id"))
    #self.collaborators = [] 
    nb_annotations =db.Column(db.Integer)
    #annotation = db.Column(MutableList.as_mutable(PickleType),default=[])
    #projet =  db.Column(db.Integer, db.ForeignKey("projets.id"))

    def update_annotations(self,json_list):
        self.annotations = json_list
        self.nb_annotations = len(json_list)


#-------------------------------Projets------------------------------------

"""class Projet(db.Model):
    __tablename__ = "projets"
    id = db.column(db.Integer, primary_key = True, autoincrement=True)
    name = db.Column(db.String(80),unique = True, nullable=False)
    privacy = db.column(db.Boolean,default = True)
    nb_membre = db.column(db.Integer)
    members =  db.Column(MutableList.as_mutable(PickleType),default=[])

#--------------------------Fichiers d'images------------------------------------
class Files(db.Model):
    __tablename__ ="file"
    id= db.column(db.Integer,primary_key=True,autoincrement=True)
    filename = db.Column(db.String(80),unique = True, nullable=False)
    size = db.Column(db.Integer)
"""

#----------------------------User-----------------------------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    firstname = db.Column(db.String(80), nullable=False)
    surname = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(16))
    password_hash = db.Column(db.String(16))
    #myProject = db.relationship("UserProjet", backref="author", lazy="dynamic")
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"), nullable=False)
    group = db.relationship("Group", backref=db.backref('posts', lazy=True))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def getUsername(self):
        return self.username

    def getFirstname(self):
        return self.firstname

    def getSurname(self):
        return self.surname

    def getPassword(self):
        return self.password

    def getGroup(self):
        return self.group

    def getMyMovies(self):
        userMovies = self.mymovies
        return userMovies

    def checkIsAdmin(self):
        return self.group.name == "mod"

    def __repr__(self):
        return ("username = %s\nfirstname = %s\nfirst name = %s\nsurname = %s" % (
        self.username, self.firstName, self.surname))

# GROUPS
class Group(db.Model):

    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return "< Group >" + self.name

db.drop_all()
db.create_all()

# Create two groups
gr1 = Group(name="mod")
gr2 = Group(name="normal")

# Create the admin user
admin = User(username="admin",firstname="Admin",surname="Admin",group=gr1)
admin.set_password("admin")
db.session.add(admin)
db.session.commit()

users = ["admin"]

@login_manager.user_loader
def user_loader(userid):
    return User.query.get(int(userid))