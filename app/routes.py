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

from app.models import Image, ds_images, User,  Group, gr1, gr2, users
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
            return redirect(url_for("project_create"))

    # GET
    return render_template("project/login.html",form=form)


# Register
@app.route("/register/", methods=["GET", "POST"])
def register():

    # check is current user already authenticated
    if current_user.is_authenticated:
        return redirect(url_for("project_create"))

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

        return redirect(url_for("login"))

    return render_template("project/register.html", form=form)


# Logout
@app.route("/logout/")
def logout():
    return "hello world!"


##################
# Projects pages #
##################

# All projects of the user (created and joined by him)
@app.route("/project/")
def project(user_id):
        return render_template("project/project.html", user_id=user_id)


# S1
# Create a new project (Sprint 1 : only load a dataset)
@app.route("/project/new/", methods=["GET", "POST"])
def project_create():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'files[]' not in request.files:
            return redirect(request.url)
        uploaded_files = request.files.getlist('files[]')

        # check that at least 1 file
        if len(uploaded_files) < 1:
            return redirect(request.url)

        # loop on each file on the folder imported
        for i in range(len(uploaded_files)):
            # save the file in the server
            file = uploaded_files[i]
            filename = secure_filename(file.filename)
            path = app.config['UPLOAD_FOLDER'] + "/" + filename
            file.save(path)

            # get the size of the file in KO
            size = int(os.stat(path).st_size / 1000)

            # create Image object
            img = Image(name = filename, path = path, size=size,last_time=datetime.now(),last_person=current_user.id,nb_annotations=0)#
            ds_images.append(img)
        for im in ds_images:
            db.session.add(im)

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
    dataset = ds_images
    return render_template("project/dataset.html", dataset=dataset, id=project_id)

# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
def annotate_image(project_id, img_id):
    image = ds_images[img_id]
    if image.nb_annotations == 0:
        boxes = "[]"
    else:
        boxes = json.dumps(image.annotations)
    print(annotations)

    # Compute id of previous and next images
    len_images = len(ds_images)
    prev = (img_id+len_images-1)%len_images
    next = (img_id+1)%len_images

    return render_template("project/annotate.html", image=image, img_id=img_id, prev=prev, next=next, classes=["first","second","third"], boxes=boxes)

# Receive the json file from an image
@app.route("/project/<int:project_id>/annotate/<int:img_id>/save_json", methods=['POST'])
def save_json(project_id, img_id):
    image = ds_images[img_id]

    # Get the annotations data and update it for image
    data = request.get_json()
    image.update_annotations(data['html_data'])

    resp = {"success": True, "response": "file saved!"}
    return jsonify(resp), 200    

