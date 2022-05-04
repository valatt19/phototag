from app import app 
from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, SubmitField, DateField, SelectField
from wtforms.widgets import TextArea
from wtforms.validators import InputRequired, DataRequired, Length, NoneOf, EqualTo, Email
from app.models import User

# Form for enter a login
class LoginForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50)])
    password = PasswordField("Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50)])
    submit = SubmitField('Login')

# Form for register
class RegisterForm(FlaskForm):
    users = [u.username for u in User.query.all()]
    emails = [u.email for u in User.query.all()]
    firstname = StringField("First name:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50,message="Between 2 and 50 characters")])
    surname = StringField("Surname:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50,message="Between 2 and 50 characters")])
    username = StringField("Username:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50,message="Between 2 and 50 characters"),NoneOf(values=users,message="This username is already used")])
    email = StringField('Email', validators=[InputRequired(),DataRequired(), Email(), Length(min=6, max=50),NoneOf(values=emails,message="This email is already used")])
    password = PasswordField("New Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50,message="Between 2 and 50 characters"),EqualTo("checkpassword", message="Passwords must match")])
    checkpassword = PasswordField("Repeat Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=50),])
    submit = SubmitField('Submit')

# Form for 
class EditUserForm(FlaskForm):
    firstname = StringField("First name:", validators=[InputRequired(), Length(min=2, max=50,message="Between 2 and 50 characters")])
    surname = StringField("Surname:", validators=[InputRequired(), Length(min=2, max=50,message="Between 2 and 50 characters")])
    submit = SubmitField('Submit')



