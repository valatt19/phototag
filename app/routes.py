from __future__ import annotations

import mimetypes
import uuid
from os import listdir
from os.path import isfile, join

import pytz
import yagmail
from sqlalchemy import exists
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash

from app import app, socketio, keygenerator, plugin_manager

from flask import render_template, redirect
from flask import url_for, request, flash, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.forms import LoginForm, RegisterForm, EditUserForm

import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import json
from xml.dom import minidom

from oauthlib.oauth2 import WebApplicationClient
import requests

from app.models import Image, User, users, Project, PWReset, Invitation, Video
from app import db, domain
from app.utilsPhotoTag import cut_Video
from . import smtpConfig

from flask_plugins import get_enabled_plugins, get_plugin, emit_event

##############
# Home page #
##############

# Homepage
@app.route('/')
def home():
    return redirect(url_for("login"))

####################
# For GOOGLE Login #
####################
# store the Google Client ID and Client Secret
GOOGLE_CLIENT_ID = "790952338581-eo6eir5djsu1cn1j2butat647t7kp0lc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)
# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# This function retrieves Google’s provider configuration
def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


# Login with Google
@app.route("/login/google/login/", methods=["GET", "POST"])
def login2():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


# When Google sends back that unique code, it will be sending
# it to this login callback endpoint on your application
@app.route("/login/google/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")

    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Prepare and send a request to get tokens
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code,
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )
    # Parse the tokens
    client.parse_request_body_response(json.dumps(token_response.json()))

    # find and hit the URL from Google that gives the user's profile information
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    # verify if the email is verified
    # The user authenticated with Google authorized
    # we've verified their email through Google!
    if userinfo_response.json().get("email_verified"):
        second = userinfo_response.json()["family_name"]
        username = userinfo_response.json()["given_name"] + second
    else:
        return "User email not available or not verified by Google.", 400

    # Create new folder for user
    new_dir = app.config['UPLOAD_FOLDER'] + "/" + username
    if not os.path.isdir(new_dir):
        os.mkdir(new_dir)

    # Check if user with same email is not already registred
    user = User.query.filter_by(username=username).first()

    # Doesn't exist? Add it to the database + redirect to set password page
    if user is None:
        user = User(
            username=username, firstname=userinfo_response.json()["given_name"], surname=second,
            email=userinfo_response.json()["email"]
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)

        # Redirection to create a password
        return redirect((url_for('set_pswd_get')))

    # Account already created, google used to login
    else:
        login_user(user)
        return redirect((url_for('project')))


## Page for choosing a password for the user that used Google login
@app.route("/set_pswd", methods=["GET"])
def set_pswd_get():
    return render_template('login/choose_pswd.html')


# [Post] for the password ask
@app.route("/set_pswd", methods=["POST"])
def set_pswd():
    user = current_user

    # Password checks
    if request.form["password"] != request.form["password2"]:
        flash("Your password and password verification didn't match.", "danger")
        return redirect(url_for("set_pswd_get"))
    if len(request.form["password"]) < 1:
        flash("Your password needs to be at least 1 characters", "danger")
        return redirect(url_for("set_pswd_get"))
    user.set_password(request.form["password"])
    db.session.commit()
    return redirect(url_for('project'))


################
# Normal Login #
################

# Normal Login
@app.route("/login/", methods=["GET", "POST"])
def login():
    # check is current user already authenticated
    if current_user.is_authenticated:
        return redirect(url_for("project_create"))

    # Form data
    form = LoginForm()

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
            return redirect(url_for("project"))

    # GET
    return render_template("login/login.html", form=form)


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
        user = User(username=form.username.data, firstname=form.firstname.data, surname=form.surname.data,
                    email=form.email.data)
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()
        flash("Congratulations, you are now a registered user!", "info")

        # add new user  dir
        new_dir = app.config['UPLOAD_FOLDER'] + "/" + form.username.data
        if not os.path.isdir(new_dir):
            os.mkdir(new_dir)

        return redirect(url_for("login"))

    return render_template("login/register.html", form=form)

# Logout
@app.route("/logout/")
def logout():
    logout_user()
    return redirect(url_for("login"))


###################
# Password Forget #
###################

# Display  forgot password page
@app.route("/pwresetrq", methods=["GET"])
def pwresetrq_get():
    return render_template('login/forgotPage.html')


# Send a request to change password
@app.route("/pwresetrq", methods=["POST"])
def pwresetrq_post():
    if db.session.query(User).filter_by(email=request.form["email"]).first():

        user = db.session.query(User).filter_by(email=request.form["email"]).one()
        # check if user already has reset their password, so they will update
        # the current key instead of generating a separate entry in the table.
        if db.session.query(PWReset).filter_by(user_id=user.id).first():

            pwalready = db.session.query(PWReset).filter_by(user_id=user.id).first()
            # if the key hasn't been used yet, just send the same key.
            if pwalready.has_activated == False:

                pwalready.datetime = datetime.now()
                key = pwalready.reset_key
            else:

                key = keygenerator.make_key()
                pwalready.reset_key = key
                pwalready.datetime = datetime.now()
                pwalready.has_activated = False
        else:
            key = keygenerator.make_key()

            user_reset = PWReset(reset_key=str(key), user_id=user.id)
            db.session.add(user_reset)
        db.session.commit()

        email = smtpConfig.EMAIL
        pwd = smtpConfig.PASSWORD

        yag = yagmail.SMTP(user=email, password=pwd)
        contents = ['Please go to this URL to reset your password:',
                    request.host + url_for("pwreset_get", id=(str(key)))]
        yag.send(request.form["email"], 'Reset your password', contents)
        flash("Hello " + user.username + ", check your email for a link to reset your password.", "success")

        return redirect(url_for("home"))
    else:

        flash("Your email was never registered.", "danger")
        return redirect(url_for("pwresetrq_get"))


# Send the new password
@app.route("/pwreset/<id>", methods=["POST"])
def pwreset_post(id):
    if request.form["password"] != request.form["password2"]:
        flash("Your password and password verification didn't match.", "danger")
        return redirect(url_for("pwreset_get", id=id))
    if len(request.form["password"]) < 1:
        flash("Your password needs to be at least 1 characters", "danger")
        return redirect(url_for("pwreset_get", id=id))

    user_reset = db.session.query(PWReset).filter_by(reset_key=id).one()
    try:
        exists(db.session.query(User).filter_by(id=user_reset.user_id)
               .update(
            {'password': request.form["password"], 'password_hash': generate_password_hash(request.form["password"])}))
        db.session.commit()

    except IntegrityError:
        flash("Something went wrong", "danger")
        db.session.rollback()
        return redirect(url_for("home"))
    user_reset.has_activated = True
    db.session.commit()
    flash("Your new password is saved.", "success")
    return redirect(url_for("home"))


# Display the reset password page
@app.route("/pwreset/<id>", methods=["GET"])
def pwreset_get(id):
    key = id
    pwresetkey = db.session.query(PWReset).filter_by(reset_key=id).one()
    generated_by = datetime.utcnow().replace(tzinfo=pytz.utc) - timedelta(hours=24)
    if pwresetkey.has_activated is True:
        flash("You already reset your password with the URL you are using." +
              "If you need to reset your password again, please make a" +
              " new request here.", "danger")

        return redirect(url_for("pwresetrq_get"))
    if pwresetkey.datetime.replace(tzinfo=pytz.utc) < generated_by:
        flash("Your password reset link expired.  Please generate a new one" +
              " here.", "danger")

        return redirect(url_for("pwresetrq_get"))
    return render_template('login/resetPassword.html', id=key)


#################
# Profile pages #
#################

# Profile page to update personal infos or to delete profile
@app.route("/profile/", methods=['GET', 'POST'])  # view function to update a task
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

    return render_template('login/profile.html', form=form)


# Delete current user (asked by him)
@app.route("/delete_user/", methods=['POST'])
@login_required
def delete_user():
    User.query.filter(User.id == current_user.id).delete()
    db.session.commit()

    logout_user()
    return redirect(url_for('home'))


##################
# Projects pages #
##################

# All projects of the user (created and joined by him)
@app.route("/project/")
@login_required
def project():
    projects = current_user.getMyProjects()
    return render_template("project/project.html", projects=projects)


#####################
# Projects creation #
#####################

# Create a new project
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
        pr = Project(creator=current_user, name=request.form["pname"], privacy=ptype, classes=final_classes,
                     nb_membre=0)
        pr.addMember(current_user)

        db.session.add(pr)
        db.session.commit()

        # Add image in project
        listVideo = []
        # loop on each file on the folder imported
        ps = 0  # variable used to indicate position of image in dataset
        for i in range(len(uploaded_files)):
            # save the file in the server
            file = uploaded_files[i]
            filename = secure_filename(file.filename)
            path = new_dir + "/" + filename
            file.save(path)
            mimetypes.init()

            mimestart = mimetypes.guess_type(filename)[0]

            if mimestart is not None:
                mimestart = mimestart.split('/')[0]

                if mimestart in ['video']:

                    nameVid = filename.strip(".mp4")
                    nameVid = nameVid.strip(".MP4")
                    nameVid = nameVid.strip(".mpeg")
                    nameVid = nameVid.strip(".m4v")
                    nameVid = nameVid.strip(".mpg")
                    nameVid = nameVid.strip(".avi")

                    imageDestination = new_dir + "/"
                    pathVid = path

                    aVideo = Video(name=nameVid, path=pathVid, imageDestination=imageDestination, project_id=pr.id)
                    listVideo.append(aVideo)
                    db.session.add(aVideo)
                    db.session.commit()


                else:

                    # get the size of the file in KO
                    size = int(os.stat(path).st_size / 1000)

                    # create Image object
                    img = Image(name=filename, path=path[3:], size=size, last_time=datetime.now(),
                                last_person=current_user, annotations=[], nb_annotations=0, project=pr, project_pos=ps)
                    db.session.add(img)
                    db.session.commit()

                    ps += 1

        # If there is at least 1 video, redirect user to a select frame rate page
        if len(listVideo) == 0:
            return redirect(url_for('dataset_overview', project_id=pr.id))
        else:
            return redirect(url_for('chooseframe', project_id=pr.id))

    return render_template("project/create.html")

# Page to make the user choose the framerate when parsing video into images
@app.route("/project/create/videoFrameRate/<int:project_id>/", methods=["GET", "POST"])
def chooseframe(project_id):
    project = Project.query.get(project_id)
    # Check that current user is the creator of the project
    if project.creator != current_user:
        return redirect(url_for("project"))

    listVideo = Video.query.filter((Video.project_id == project_id))
    if request.method == 'POST':

        imageOfProject = Image.query.filter((Image.project_id == project_id))  # Get all images of the dataset
        ps= 0
        for img in imageOfProject:
            ps+=1
        for video in listVideo:

            id_video = "frame_"+str(video.id)
            frame = request.form[id_video]

            pathVid = video.path
            nameVid = video.name
            imageDestination = video.imageDestination
            video.setFrameRate(frame)
            cut_Video(pathVid, nameVid, imageDestination, frame)
            onlyfiles = [f for f in listdir(imageDestination) if isfile(join(imageDestination, f))]

            if os.path.exists(pathVid):
                os.remove(pathVid)

            for pic in onlyfiles:
                if "_imageFromVideo_" in pic:
                    # get the size of the file in KO
                    size = int(os.stat(imageDestination + pic).st_size / 1000)

                    # create Image object
                    img = Image(name=pic, path=imageDestination[3:] + pic, size=size, last_time=datetime.now(),
                                last_person=current_user, annotations=[], nb_annotations=0, project=project,
                                project_pos=ps)
                    db.session.add(img)
                    db.session.commit()
                    ps += 1
        return redirect(url_for('dataset_overview', project_id=project.id))

    else:
        return render_template("project/chooseframerate.html",videos=listVideo)


###############################
# Adding members in projects  #
###############################

# Join a public project or a private project (with invitation)
@app.route("/project/join/")
def project_join():
    public_projects = Project.query.filter(Project.privacy == 1)
    final_public_projects = []
    for p in public_projects:
        if not p in current_user.getMyProjects():
            final_public_projects.append(p)

    private_projects = Invitation.query.all()
    private = []
    for p2 in private_projects:
        if not p2 in current_user.getInvitation():
            private.append(p2)

    return render_template("project/project_join.html", projects=final_public_projects, invitations=private)


# User click on join a project
@app.route("/project/joined/<int:project_id>")
def project_joined(project_id):
    project_joined = Project.query.get(project_id)

    # Check that project is public
    if project_joined.privacy == 1:
        project_joined.addMember(current_user)
        db.session.commit()

        return redirect(url_for('dataset_overview', project_id=project_joined.id))

    return redirect(url_for('project_join'))


# User click on accept an invitation
@app.route("/project/acceptinvit/<int:invit_id>/<int:project_id>")
def project_accept_invit(invit_id, project_id):
    project_joined = Project.query.get(project_id)
    invit = Invitation.query.get(invit_id)

    # Check project is private and the invit correspond to correct project
    if project_joined.privacy == 0 and invit.invited == project_id:
        project_joined.addMember(current_user)
        Invitation.query.filter(Invitation.id == invit_id).delete()
        current_user.invited = False
        db.session.commit()

        return redirect(url_for('dataset_overview', project_id=project_joined.id))

    return redirect(url_for('project_join'))


# User click on decline an invitation
@app.route("/project/declineinvit/<int:invit_id>")
def project_decline_invit(invit_id):
    Invitation.query.filter(Invitation.id == invit_id).delete()
    current_user.invited = False
    db.session.commit()
    return redirect(url_for('project'))


# [POST] invitation sent to user
@app.route("/added/<int:project_id>/<int:user_id>/")
def add_user_private(project_id, user_id):
    project_added = Project.query.get(project_id)
    get_user = User.query.get(user_id)
    if project_added.privacy == 0:
        project_added.invit(get_user)
        get_user.invited = True
        db.session.commit()
        return redirect(url_for('project'))
    return redirect(url_for('add'))


# Page to list users (not already member of a project) and send them invitation to join the project
@app.route("/project/<int:project_id>/add/")
def add(project_id):
    all_users = User.query.all()
    userTo_add = []
    project = Project.query.get(project_id)
    for u in all_users:
        if u.id != project.creator_id and u not in project.getMembers():
            userTo_add.append(u)
    return render_template("project/users_add.html", project=project, users=userTo_add)


######################
# In a project pages #
######################

# Dataset overview of a project (list img and vid)
@app.route("/project/<int:project_id>/dataset/")
@login_required
def dataset_overview(project_id):
    dataset = Image.query.filter((Image.project_id == project_id))  # Get all images of the dataset
    project = Project.query.get(project_id)
    project_name = project.name

    # Check that user can access this project
    if not project.isMember(current_user):
        return redirect(url_for('project'))

    # Create working on users list for each image
    working = []
    for img in dataset:
        working.append(User.query.filter(User.image_id == img.id))

    return render_template("project/dataset.html", dataset=dataset, id=project_id, name=project_name, project=project,
                           user=current_user.username, working=working)


####################
# Project settings #
####################

# Users overview of a project (list of members)
@app.route("/project/<int:project_id>/settings/", methods=["GET", "POST"])
@login_required
def project_settings(project_id):
    project = Project.query.get(project_id)
    project_name = project.name
    config = project.exportConfig()

    # Check that user can access this project
    if not project.isMember(current_user):
        return redirect(url_for('project'))

    # User want to add a new class
    if request.method == 'POST':
        if len(request.form["newclass"]) >= 1 and current_user.id == project.creator.id:
            project.addClass(request.form["newclass"])
            db.session.commit()

        return redirect(url_for('project_settings', project_id=project_id))

    project = Project.query.get(project_id)
    project_name = project.name
    config = project.exportConfig()

    # Check that user can access this project
    if not project.isMember(current_user):
        return redirect(url_for('project'))

    members = project.getMembers()

    return render_template("project/settings.html", members=members, id=project_id, name=project_name, project=project,
                           user=current_user.username, can_remove=(current_user.id == project.creator.id),
                           classes=project.classes, exportConfig=config)


# User removed by creator of project
@app.route("/project/<int:project_id>/remove/<int:user_id>")
def project_users_remove(project_id, user_id):
    project = Project.query.get(project_id)
    user = User.query.get(user_id)

    # Check that current user is creator of project and not triying to remove creator
    if current_user.id == project.creator.id and project.creator.id != user_id:
        project.removeMember(user)
        db.session.commit()

    return redirect(url_for('project_settings', project_id=project_id))


# Privacy of project changed
@app.route("/project/<int:project_id>/switch/")
def project_privacy_switch(project_id):
    project = Project.query.get(project_id)

    # Check that current user is creator
    if current_user.id == project.creator.id:
        project.changePrivacy()
        db.session.commit()

    return redirect(url_for('project_settings', project_id=project_id))


#####################
# Annotation routes #
#####################

# Annotate an image of a project
@app.route("/project/<int:project_id>/annotate/<int:img_id>")
@login_required
def annotate_image(project_id, img_id):
    project = Project.query.get(project_id)

    # Check that user can access this project
    if not project.isMember(current_user):
        return redirect(url_for('project'))

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
                           classes=project.classes, boxes=boxes, project=project, working=working, log=log)


# SOCKET used to refresh annotation page when modifications are made by other user
# It updates also the Users live working on the same image
@socketio.on("refresh")
def refresh(img_id):
    img = Image.query.get(img_id)
    boxes = img.annotations

    # Find all users working on this image
    working = User.query.filter(User.image_id == img.id)
    users_live = []
    for user in working:
        users_live.append(user.username)

    # Generate new log with latest updates
    log = img.generate_log()

    socketio.emit("update", (boxes, img_id, users_live, log))


# SOCKET used to update current image where the user is working to None
@socketio.on('disconnect')
def test_disconnect():
    # Remove user in working list
    current_user.setImage(None)
    db.session.commit()


# Receive the json file from an image
@app.route("/project/<int:project_id>/annotate/<int:img_id>/save_json", methods=['POST'])
@login_required
def save_json(project_id, img_id):
    project = Project.query.get(project_id)
    image = Image.query.get(img_id)
    if image.project_id != project_id or not project.isMember(current_user):
        return jsonify({"impossible": True, "response": "Can't modify this file"}), 200

    # Get the annotations data and update it for the image + add element in log
    data = request.get_json()
    user = current_user
    date = datetime.now()
    image.update_annotations(data['html_data'][0], date, user)
    image.add_log(username=user.username, modif=data['html_data'][1], type=data['html_data'][3],
                  tool=data['html_data'][2], date=date)

    refresh(img_id)
    resp = {"success": True, "response": "File saved"}
    return jsonify(resp), 200


##################
# Error handling #
##################

# Show custom error pages
@app.errorhandler(404)
def handler404(error):
    return render_template("error/errorpage.html", code=404)


@app.errorhandler(403)
def handler403(error):
    return render_template("error/errorpage.html", code=403)


@app.errorhandler(400)
def handler400(error):
    return render_template("error/errorpage.html", code=400)


@app.errorhandler(500)
def handler404(error):
    return render_template("error/errorpage.html", code=500)


########
# MAIN #
########

if __name__ == '__main__':
    socketio.run(app)
