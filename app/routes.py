from app import app

from flask import render_template, redirect
from flask import url_for, request, flash

import os
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from datetime import datetime

from app.models import Image, ds_images


##############
# Home pages #
##############

# Homepage (redirect to login page) - (sprint 1 : redirect to load dataset page)
@app.route('/')
def home():
    return redirect(url_for("project_create"))


# Login
@app.route("/login/", methods=["GET", "POST"])
def login():
    return "hello world!"


# Register
@app.route("/register/", methods=["GET", "POST"])
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
            img = Image(i, filename, path, size, datetime.now().strftime("%Y-%m-%d %H:%M"), "varioti")
            ds_images.append(img)

        return redirect(url_for('dataset_overview', project_id=0))

    return render_template("project/create.html")


# Join a project
@app.route("/project/join/")
def project_join():
    return "hello world!"


######################
# In a project pages #
######################

# S1
# Dataset overview of a project (list img and vid)
@app.route("/project/<int:project_id>/dataset/")
def dataset_overview(project_id):
    dataset = ds_images
    return render_template("project/dataset.html", dataset=dataset, id=project_id)


# S1
# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
def annotate_image(project_id, img_id):
    image = ds_images[img_id]
    return render_template("project/annotate.html", image=image, img_id=img_id)

