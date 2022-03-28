from email.policy import default
from flask_login import UserMixin
from sqlalchemy import null, PickleType
from app import db,login_manager
from copy import deepcopy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from xml.etree.cElementTree import Element, ElementTree, SubElement, dump

from sqlalchemy.ext.mutable import MutableList

#-------------------------Image---------------------------------------------
ds_images = []

class Image(db.Model):
    __tablename__ = "image"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80),unique = False, nullable=False)
    path = db.Column(db.String(80),unique=False,nullable=False)
    size = db.Column(db.Integer)
    last_time = db.Column(db.DateTime, unique=False, nullable=False)
    last_person = db.Column(db.Integer,db.ForeignKey("users.id"))
    #self.collaborators = [] 
    nb_annotations = db.Column(db.Integer)
    annotations = db.Column(MutableList.as_mutable(PickleType),default=[])
    #project = db.Column(db.Integer, db.ForeignKey("project.id"))

    def update_annotations(self,json_list):
        self.annotations = json_list
        self.nb_annotations = len(json_list)
        db.session.commit()

#-----------------------------Projets/User---------------------------------

class ProjectUser(db.Model):
    __tablename__ = 'projectuser'
    id = db.Column(db.Integer, primary_key=True, index=True)
    projectId = db.Column(db.Integer, db.ForeignKey('project.id'))
    userId = db.Column(db.Integer, db.ForeignKey('users.id'))

#-------------------------------Projets------------------------------------

class Project(db.Model):
    __tablename__ = "project"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    creator = db.relationship("User", backref=db.backref('posts', lazy=True))
    name = db.Column(db.String(80),unique = True, nullable=False)
    privacy = db.Column(db.Boolean,default = True)
    classes = db.Column(MutableList.as_mutable(PickleType),default=[])
    members = db.relationship("User", secondary=ProjectUser.__table__, backref="Project")
    nb_membre = db.Column(db.Integer)

    def addMember(self, user):
        self.members.append(user)
        self.nb_membre+=1

    def getMembers(self):
        return self.members

    def exportConfig(self):
        node_config = Element("configuration")

        # add classes
        node_classes = SubElement(node_config,"classes")
        classes = ["first", "second"]  
        for cl in classes:
            node_cl = SubElement(node_classes, "classe")
            node_cl.text = cl
        
        # add config to doc and return it
        doc = ElementTree(node_config)
        return doc

#----------------------------User-----------------------------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    firstname = db.Column(db.String(80), nullable=False)
    surname = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(16))
    password_hash = db.Column(db.String(16))
    projects = db.relationship("Project", secondary=ProjectUser.__table__, backref="User")
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

    def getMyProjects(self):
        return self.projects

    def checkIsAdmin(self):
        return self.group.name == "mod"

    def __repr__(self):
        return self.username

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

pr = Project(creator = admin, name = "name", privacy=1, classes=["first class", "second class"], nb_membre=0)
pr.addMember(admin)

db.session.commit()

users = ["admin"]

@login_manager.user_loader
def user_loader(userid):
    return User.query.get(int(userid))