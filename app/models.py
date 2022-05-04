from email.policy import default

from flask_login import UserMixin
from sqlalchemy import null, PickleType
from app import db,login_manager
from copy import deepcopy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from xml.etree.cElementTree import Element, ElementTree, SubElement, dump, tostring
from sqlalchemy.ext.mutable import MutableList

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

    def removeMember(self, user):
        self.members.remove(user)
        self.nb_membre-=1

    def getMembers(self):
        return self.members

    def isMember(self,user):
        return (user in self.members)

    def changePrivacy(self):
        self.privacy = not self.privacy

    def addClass(self, new):
        self.classes.append(new)

    def exportConfig(self):
        node_config = Element("configuration")

        # add classes
        node_classes = SubElement(node_config,"classes")
        classes = self.classes 
        for cl in classes:
            node_cl = SubElement(node_classes, "classe")
            node_cl.text = cl
        
        xmlstr = tostring(node_config, encoding='utf8',method="xml")
        return xmlstr

#----------------------------User-----------------------------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    firstname = db.Column(db.String(80), nullable=False)
    surname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80),unique=True, nullable=False)
    password = db.Column(db.String(16))
    password_hash = db.Column(db.String(16))
    projects = db.relationship("Project", secondary=ProjectUser.__table__, backref="User")
    
    image_id = db.Column(db.Integer, db.ForeignKey('image.id'))
    image = db.relationship("Image", backref=db.backref('posts2', lazy=True),foreign_keys=[image_id])

    def set_password(self, password):
        self.password = password
        self.password_hash = generate_password_hash(password)

    def setImage(self, img):
        self.image = img

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

    def getImageId(self):
        return self.image_id

    def getImage(self):
        return self.image

    def __repr__(self):
        return self.username

class PWReset(db.Model):
    __tablename__ = "pwreset"
    id = db.Column(db.Integer, primary_key=True)
    reset_key = db.Column(db.String(128), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    datetime = db.Column(db.DateTime(timezone=True), default=datetime.now)
    user = db.relationship(User, lazy='joined')
    has_activated = db.Column(db.Boolean, default=False)

#-------------------------Image---------------------------------------------
class Image(db.Model):
    __tablename__ = "image"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80),unique = False, nullable=False)
    path = db.Column(db.String(80),unique=False,nullable=False)
    size = db.Column(db.Integer)
    last_time = db.Column(db.DateTime, unique=False, nullable=False)
    project_pos = db.Column(db.Integer, nullable=False)

    nb_annotations = db.Column(db.Integer)
    annotations = db.Column(MutableList.as_mutable(PickleType),default=[])

    log_annotations = db.Column(MutableList.as_mutable(PickleType),default=[])

    last_person_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    last_person = db.relationship("User", backref=db.backref('posts1', lazy=True), foreign_keys=[last_person_id])

    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    project = db.relationship("Project", backref=db.backref('posts2', lazy=True))

    working = db.Column(MutableList.as_mutable(PickleType),default=[])

    def add_working(self, username):
        self.working.append(username)
        db.session.commit()

    def delete_working(self, username):
        self.working.remove(username)
        db.session.commit()

    def update_annotations(self, json_list, date, user):
        self.annotations = json_list
        self.nb_annotations = len(json_list)
        self.last_time = date
        self.last_person = user
        db.session.commit()

    def add_log(self, username, modif, type, tool, date):
        self.log_annotations.append({"user":username, "modification":modif, "type":type, "tool":tool, "date":date})
        print(self.log_annotations)
        db.session.commit()

    def generate_log(self):
        txt = "Log modifications:\n------------------\n"
        for line in self.log_annotations:
            txt = txt + "\n" + line["modification"].upper() + " " + line["tool"].upper() + " (Class = " + line["type"] + ")\n\tUser: " + line["user"] + "\n\tDate: " + line["date"].strftime('%Y-%m-%d %H:%M') + "\n"
        return txt

#-------------------------Video--------------------------------------
class Video(db.Model):
    __tablename__ = "video"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=False, nullable=False)
    path = db.Column(db.String(80), unique=False, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    project = db.relationship("Project", backref=db.backref('posts2', lazy=True))
    images = db.relationship("Image",db.ForeignKey('image.id'))

#--------------------------------------------------------------------
db.drop_all()
db.create_all()

# Create the admin user

admin = User(username="admin",firstname="Admin",surname="Admin",email="innoye2000@gmail.com")
admin.set_password("admin")
db.session.add(admin)

#pr = Project(creator = admin, name = "name", privacy=1, classes=["first class", "second class"], nb_membre=0)
#pr.addMember(admin)

db.session.commit()

users = ["admin"]

@login_manager.user_loader
def user_loader(userid):
    return User.query.get(int(userid))