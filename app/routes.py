from __future__ import annotations
from app import app, socketio

from flask import render_template, redirect
from flask import url_for, request, flash, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.forms import LoginForm, RegisterForm, EditUserForm

import os
from werkzeug.utils import secure_filename
from datetime import datetime
import json
from xml.dom import minidom
from app.models import Image, ds_images, User, users, Project
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
    # print(form)
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
    return render_template("login.html", form=form)

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
        user = User(username=form.username.data, firstname=form.firstname.data, surname=form.surname.data)
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()
        users.append(form.username.data)
        flash("Congratulations, you are now a registered user!", "info")

        # add new user  dir
        new_dir = app.config['UPLOAD_FOLDER'] + "/" + form.username.data
        if not os.path.isdir(new_dir):
            os.mkdir(new_dir)

        return redirect(url_for("login"))

    return render_template("register.html", form=form)

# Logout
@app.route("/logout/")
def logout():
    logout_user()
    return redirect(url_for("login"))

# Profile
@app.route("/profile/", methods=['GET', 'POST']) #view function to update a task
@login_required
def update_user_info():
        form = EditUserForm()
        if form.validate_on_submit():
                current_user.firstname = form.firstname.data
                current_user.surname = form.surname.data
                db.session.commit()
                flash("Your changes have been saved.", "info")
                return redirect(url_for('project'))

        elif request.method == 'GET':
                form.firstname.data = current_user.firstname
                form.surname.data = current_user.surname     
   
        return render_template ('profile.html', form = form)

##################
# Projects pages #
##################

# All projects of the user (created and joined by him)
@app.route("/project/")
@login_required
def project(user_id=current_user):
    projects = current_user.getMyProjects()
    return render_template("project/project.html", projects=projects)

# Create a new project (Sprint 1 : only load a dataset)
@app.route("/project/new/", methods=["GET", "POST"])
@login_required
def project_create():
    if request.method == 'POST':
        # check that name does not exist
        if Project.query.filter(Project.name == request.form["pname"]).count() != 0:
            return redirect(request.url)

        # check that there is files
        if 'files[]' not in request.files:
            return redirect(request.url)
        uploaded_files = request.files.getlist('files[]')

        # check that at least 1 file
        if len(uploaded_files) < 1:
            return redirect(request.url)

        # add new project dir
        new_dir = app.config['UPLOAD_FOLDER'] + "/" + current_user.username + "/" + request.form["pname"]
        if not os.path.isdir(new_dir):
            os.mkdir(new_dir)
            os.mkdir(new_dir + '/config/')

        # Check if project is public or not
        if request.form["ptype"] == "1":
            ptype = True
        else:
            ptype = False


        # configuration----------------------------------------
        if 'importConfig' not in request.files:
            if len(request.form.getlist('mytext[]')) < 1:
                return redirect(request.url)
        final_classes = []

        if request.form.getlist('mytext[]') != ['']:

            # manual configuration
            final_classes = request.form.getlist('mytext[]')

        else:

            # xml configuration
            uploaded_importConfig = request.files['importConfig']

            filename = secure_filename(uploaded_importConfig.filename)
            path = new_dir + "/config/" + filename
            uploaded_importConfig.save(path)

            data = minidom.parse(path)
            classes = data.getElementsByTagName('classe')

            for elem in classes:
                final_classes.append(elem.firstChild.data)

        # Add project in DB
        pr = Project(creator=current_user, name=request.form["pname"], privacy=ptype, classes=final_classes, nb_membre=0)
        pr.addMember(current_user)

        db.session.add(pr)
        db.session.commit()

        # loop on each file on the folder imported
        ps = 0 # variable used to indicate position of image in dataset
        for i in range(len(uploaded_files)):
            # save the file in the server
            file = uploaded_files[i]
            filename = secure_filename(file.filename)
            path = new_dir + "/" + filename
            file.save(path)

            # get the size of the file in KO
            size = int(os.stat(path).st_size / 1000)

            # create Image object
            img = Image(name=filename, path=path[3:], size=size, last_time=datetime.now(), last_person=current_user, annotations=[], nb_annotations=0, project=pr, project_pos=ps)
            db.session.add(img)
            db.session.commit()

            ps += 1

        return redirect(url_for('dataset_overview', project_id=pr.id))

    return render_template("project/create.html")


# Join a project
@app.route("/project/join/")
def project_join():
    # Get all public projects (that can be joined) but remove the ones where the user is already in
    public_projects = Project.query.filter(Project.privacy == 1)
    final_public_projects = []
    for p in public_projects:
        if not p in current_user.getMyProjects():
            final_public_projects.append(p)

    return render_template("project/project_join.html", projects=final_public_projects)

# User click on join a project
@app.route("/project/joined/<int:project_id>")
def project_joined(project_id):
    project_joined = Project.query.get(project_id)
    # Check that user is joining a public project
    if project_joined.privacy == 1:
        project_joined.addMember(current_user)
        db.session.commit()
        return redirect(url_for('dataset_overview', project_id=project_joined.id))

    return redirect(url_for('project_join'))


######################
# In a project pages #
######################

# Dataset overview of a project (list img and vid)
@app.route("/project/<int:project_id>/dataset/")
@login_required
def dataset_overview(project_id):
    dataset = Image.query.filter((Image.project_id == project_id)) # Get all images of the dataset
    project = Project.query.get(project_id)
    project_name = project.name

    config = project.exportConfig()

    # Create working on users list for each image
    working = []
    for img in dataset:
        working.append(User.query.filter(User.image_id == img.id))

    return render_template("project/dataset.html", dataset=dataset, id=project_id, name=project_name, project=project, user=current_user.username, working = working, configExport=config)

# Users overview of a project (list of members)
@app.route("/project/<int:project_id>/users/")
@login_required
def project_users(project_id):
    project = Project.query.get(project_id)
    project_name = project.name
    config = project.exportConfig()

    members = project.getMembers()

    return render_template("project/users.html", members=members, id=project_id, name=project_name, project=project, user=current_user.username, can_remove = (current_user.id==project.creator.id), configExport=config)

# User click on join a project
@app.route("/project/<int:project_id>/remove/<int:user_id>")
def project_users_remove(project_id, user_id):
    project = Project.query.get(project_id)
    user = User.query.get(user_id) 

    # Check that current user is creator of project and not triying to remove creator
    if current_user.id == project.creator.id and project.creator.id != user_id :
        project.removeMember(user)
        db.session.commit()

    return redirect(url_for('project_users', project_id=project_id))

# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
@login_required
def annotate_image(project_id, img_id):
    project = Project.query.get(project_id)
    config = project.exportConfig()
    ds_images = Image.query.filter((Image.project_id == project_id))
    image = ds_images[img_id]

    # Compute id of previous and next images
    len_images = ds_images.count()
    prev = (img_id + len_images - 1) % len_images
    next = (img_id + 1) % len_images

    if image.nb_annotations == 0:
        boxes = "[]"
    else:
        boxes = json.dumps(image.annotations)

    # Generate txt log file
    log = image.generate_log()

    # Add user in working list
    current_user.setImage(image)
    db.session.commit()
    working = User.query.filter(User.image_id == image.id)

    refresh(image.id)

    return render_template("project/annotate.html", image=image, img_id=image.id, prev=prev, next=next,
                           classes=project.classes, boxes=boxes, project=project, working=working, configExport=config, log=log)

@socketio.on("refresh")
def refresh(img_id):
    '''On connecting, update the client with the current state.'''
    img = Image.query.get(img_id)
    boxes = img.annotations

    working = User.query.filter(User.image_id == img.id)
    users_live = []
    for user in working:
        users_live.append(user.username)

    print(users_live)

    log = img.generate_log()

    socketio.emit("update", (boxes, img_id, users_live, log))

@socketio.on('disconnect')
def test_disconnect():
    # Remove user in working list
    print("disconnected "+current_user.username)
    current_user.setImage(None)
    db.session.commit()

# Receive the json file from an image
@app.route("/project/<int:project_id>/annotate/<int:img_id>/save_json", methods=['POST'])
@login_required
def save_json(project_id, img_id):
    image = Image.query.get(img_id)
    if image.project_id != project_id:
        return jsonify({"impossible": True, "response": "can't modify this file"}), 200

        # Get the annotations data and update it for image
    data = request.get_json()
    user = current_user
    date = datetime.now()
    image.update_annotations(data['html_data'][0], date, user)
    print(data['html_data'])
    image.add_log(username=user.username, modif=data['html_data'][1], type=data['html_data'][3], tool=data['html_data'][2] , date=date)

    refresh(img_id)

    resp = {"success": True, "response": "file saved!"}
    return jsonify(resp), 200


########
# MAIN #
########

if __name__ == '__main__':
    socketio.run(app)
