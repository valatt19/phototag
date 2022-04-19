from app import app 
from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, SubmitField, DateField, SelectField
from wtforms.widgets import TextArea
from wtforms.validators import InputRequired, DataRequired, Length, NoneOf, EqualTo, Email
from app.models import users

# Form for enter a login
class LoginForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20)])
    password = PasswordField("Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20)])
    submit = SubmitField('Login')

# Form for register
class RegisterForm(FlaskForm):
    firstname = StringField("First name:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20,message="Between 2 and 20 characters")])
    surname = StringField("Surname:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20,message="Between 2 and 20 characters")])
    username = StringField("Username:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20,message="Between 2 and 20 characters"),NoneOf(values=users,message="This username is already used")])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(min=6, max=40)])
    password = PasswordField("New Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20,message="Between 2 and 20 characters"),EqualTo("checkpassword", message="Passwords must match")])
    checkpassword = PasswordField("Repeat Password:", validators=[InputRequired(), DataRequired(), Length(min=2, max=20),])
    submit = SubmitField('Submit')



