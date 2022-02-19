from app import app

from flask import render_template, redirect
from flask import url_for, request, flash

##############
# Home pages #
##############

# Homepage (redirect to login page) - (sprint 1 : redirect to load dataset page)
@app.route('/')
def home():
    return redirect(url_for("project_create")) 

# Login
@app.route("/login/", methods=["GET","POST"])
def login():
    return "hello world!"

# Register
@app.route("/register/", methods=["GET","POST"])
def register():
    return "hello world!"

# Logout
@app.route("/logout/")
def logout():
    return "hello world!"

##################
# Projects pages #
##################

# All projects of the user (created and joined by him)
@app.route("/project/")
def project():
    return "hello world!"

# S1
# Create a new project (Sprint 1 : only load a dataset)
@app.route("/project/new/")
def project_create():
    return "hello world!"

# Join a project
@app.route("/project/join/")
def project_join():
    return "hello world!"

######################
# In a project pages #
######################

# S1
# Dataset overview of a project (list img and vid)
@app.route("/project/<int:project_id>/dataset/<int:img_id>")
def dataset_overview(project_id):
    return "hello world!"

# S1
# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
def annotate_image(project_id,img_id):
    return "hello world!"