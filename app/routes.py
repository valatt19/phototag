from app import app

from flask import render_template, redirect
from flask import url_for, request, flash

from models import Image

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
@app.route("/project/new/", methods=["GET","POST"])
def project_create():
    if request.method == "GET":
        return "hello world!"

    # Otherwise POST
    _folder = request.form["folder"]
    if _folder :
        # Save in db (Sprint 2)
        print(_folder)

        return redirect(url_for("dataset_overview")) 

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
    
    # Temp
    img1 = Image("img1.jpg","flowers",106.5,"2022-02-20 17:30","varioti")
    img2 = Image("img2.jpg","flowers",142,"2022-02-20 17:31","varioti")
    img3 = Image("img3.jpg","flowers",85,"2022-02-21 12:00","iye")
    dataset = [img1,img2,img3]

    
    return "hello world!"

# S1
# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
def annotate_image(project_id,img_id):
    return "hello world!"