from __future__ import annotations
from app import app

from flask import render_template, redirect
from flask import url_for, request, flash, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.forms import LoginForm, RegisterForm

import os
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from datetime import datetime
import json

from app.models import Image, ds_images, User,  Group, gr1, gr2, users, Project
from app import db

##############
# Home pages #
##############

# Homepage (redirect to login page) - (sprint 1 : redirect to load dataset page)
@app.route('/')
def home():
    return redirect(url_for("login"))


# Login
@app.route("/login/", methods=["GET", "POST"])
def login():
    # check is current user already authenticated
    print(current_user.is_authenticated)
    if current_user.is_authenticated:
        return redirect(url_for("project_create"))

    # Form data
    form = LoginForm()
    #print(form)
    if request.method == 'POST':
        if form.validate_on_submit():

            user = User.query.filter_by(username=form.username.data).first()
            if user is None:
                flash("You are not registered yet.", "log_warning")
                return redirect(url_for("login"))

            if not user.check_password(form.password.data):
                flash("Username or password incorrect.", "log_warning")
                return redirect(url_for("login"))

            # Ok for log in
            login_user(user)
            flash("Logged in successfully.", "info")
            return redirect(url_for("project"))

    # GET
    return render_template("project/login.html",form=form)


# Register
@app.route("/register/", methods=["GET", "POST"])
def register():

    # check is current user already authenticated
    if current_user.is_authenticated:
        return redirect(url_for("project"))

    # Form data
    form = RegisterForm()
    if form.validate_on_submit():
        # Add the user in the dict of users
        user = User(username=form.username.data, firstname=form.firstname.data, surname=form.surname.data,password=form.password.data, group=gr2)

        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()
        users.append(form.username.data)
        flash("Congratulations, you are now a registered user!", "info")

        # add new project dir
        new_dir = app.config['UPLOAD_FOLDER'] +"/"+ form.username.data
        os.mkdir(new_dir)

        return redirect(url_for("login"))

    return render_template("project/register.html", form=form)


# Logout
@app.route("/logout/")
def logout():
    return redirect(url_for("login"))


##################
# Projects pages #
##################

# All projects of the user (created and joined by him)
@app.route("/project/")
def project(user_id = current_user):
    """project_query = "SELECT * FROM Project WHERE members"
    query = Project.query(project_query)

    projects = query.all()
    print(projects)"""
    projects = Project.query.all()
    return render_template("project/project.html", projects=projects)

# S1
# Create a new project (Sprint 1 : only load a dataset)
@app.route("/project/new/", methods=["GET", "POST"])
def project_create():
    if request.method == 'POST':
        # check if the post request has the file part
        print(request.form.getlist('mytext[]'))
        if 'files[]' not in request.files:
            return redirect(request.url)
        uploaded_files = request.files.getlist('files[]')

        # check that at least 1 file
        if len(uploaded_files) < 1:
            return redirect(request.url)
        
        # add new project dir
        new_dir = app.config['UPLOAD_FOLDER'] +"/"+ current_user.username +"/"+ request.form["pname"]
        if not os.path.isdir(new_dir):
            os.mkdir(new_dir)

        # loop on each file on the folder imported
        for i in range(len(uploaded_files)):
            # save the file in the server
            file = uploaded_files[i]
            filename = secure_filename(file.filename)
            path = new_dir +"/"+ filename
            file.save(path)

            # get the size of the file in KO
            size = int(os.stat(path).st_size / 1000)

            # create Image object
            img = Image(name = filename, path = path[3:], size=size, last_time=datetime.now(),last_person=current_user.id,annotations=[],nb_annotations=0)
            db.session.add(img)
            db.session.commit()

        # Check if project is public or not
        if request.form["ptype"] == "1":
            ptype = True
        else:
            ptype = False 

        # Add project in DB
        pr = Project(creator = current_user, name = request.form["pname"], privacy=ptype, classes=request.form.getlist('mytext[]'), nb_membre=0)
        db.session.add(pr)
        db.session.commit()
        #changer project_id pour créer plusieurs projets
        return redirect(url_for('dataset_overview', project_id=0))

    return render_template("project/create.html")



# Join a project
@app.route("/project/join/")
def project_join():
    return "hello world!"


######################
# In a project pages #
######################

# Dataset overview of a project (list img and vid)
@app.route("/project/<int:project_id>/dataset/")
def dataset_overview(project_id):
    dataset = Image.query.all()
    project = Project.query.all()[project_id]
    return render_template("project/dataset.html", dataset=dataset, id=project_id, project=project)

# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
def annotate_image(project_id, img_id):
    ds_images = Image.query.all()
    image = ds_images[img_id]
    project = Project.query.all()[project_id]
    
    if image.nb_annotations == 0:
        boxes = "[]"
    else:
        boxes = json.dumps(image.annotations)

    # Compute id of previous and next images
    len_images = len(ds_images)
    prev = (img_id+len_images-1)%len_images
    next = (img_id+1)%len_images

    return render_template("project/annotate.html", image=image, img_id=img_id, prev=prev, next=next, classes=project.classes, boxes=boxes, project=project)

# Receive the json file from an image
@app.route("/project/<int:project_id>/annotate/<int:img_id>/save_json", methods=['POST'])
def save_json(project_id, img_id):
    image = Image.query.all()[img_id]

    # Get the annotations data and update it for image
    data = request.get_json()
    image.update_annotations(data['html_data'])

    resp = {"success": True, "response": "file saved!"}
    return jsonify(resp), 200    

