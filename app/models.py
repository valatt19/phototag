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
""" Junction table between Project and User because N-to-N relation """
class ProjectUser(db.Model):
    __tablename__ = 'projectuser'
    id = db.Column(db.Integer, primary_key=True, index=True)
    projectId = db.Column(db.Integer, db.ForeignKey('project.id'))
    userId = db.Column(db.Integer, db.ForeignKey('users.id'))


#-------------------------------------Invitation------------------------------------------
""" Table representing invitations from a Project to an User """
class Invitation(db.Model):
    __tablename__ = "invits"
    id = db.Column(db.Integer, primary_key=True , index = True)
    invited_by = db.relationship("Project",backref=db.backref('by',lazy=True))
    invited_byid=db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    invited_to = db.relationship("Project",backref=db.backref('to',lazy=True))
    invited=db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)


#-------------------------------Projets------------------------------------
""" Table representing a project of annotations : it contains a dataset (Images), a creator (User), members (Users), classes created by an user (List) """
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

    invitations=db.relationship("User", secondary=Invitation.__table__, backref="users")
    nb_invitation = db.Column(db.Integer,default=0)                                                                                                                         
    
    def invit(self,invit):
        self.invitations.append(invit)
        self.nb_invitation += 1

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
""" Table representing an User, it uses the UserMixin layout (for logins, lougout, ...). 
    An User has personnal informations, works on Projects, and is currently working on an Image (image = None if user not working on an image) """
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

    invitations = db.relationship("Invitation",secondary=Project.__table__,backref="users")

    def getInvitation(self):
        return self.invitations
        
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


#-------------------------PWReset---------------------------------------------   
""" Table used to handle Password Reset asked by an User. The user receives an email with a link to change his PW """
class PWReset(db.Model):
    __tablename__ = "pwreset"
    id = db.Column(db.Integer, primary_key=True)
    reset_key = db.Column(db.String(128), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    datetime = db.Column(db.DateTime(timezone=True), default=datetime.now)
    user = db.relationship(User, lazy='joined')
    has_activated = db.Column(db.Boolean, default=False)


#-------------------------Image---------------------------------------------
""" Table representing an Image. An image has some informations related to it. It has also a parent Project, some Annotations and a Log (in JSON format).
    The ID is used to identify the Image between ALL images saved. The PROJECT_POS is used to identify the image IN the dataset """
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


#-------------------------Launch DB-------------------------------------------
db.create_all()
db.session.commit()
users = []


#-----------------------Init Login Manager------------------------------------
@login_manager.user_loader
def user_loader(userid):
    return User.query.get(int(userid))