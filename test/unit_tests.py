import unittest

import sys
sys.path.append('../')

from app.models import Project, User, Image
from app import app
from flask_sqlalchemy import SQLAlchemy
import random
import string

testdb = SQLAlchemy(app)

# Class of unit tests for models
class Test_models(unittest.TestCase):

    # Test check password
    def test_user_creation_same_username(self):
        
        # Reinit DB
        testdb.drop_all()
        testdb.create_all()

        admin = User(username="admin",firstname="Admin",surname="Admin")

        # Test 100 random password
        characters = string.ascii_letters + string.digits + string.punctuation
        for i in range(100):
            length = random.randint(5,15)
            result_str = ''.join(random.choice(characters) for j in range(length))

            admin.set_password(result_str)
            testdb.session.add(admin)

            self.assertTrue(admin.check_password(result_str))

        testdb.drop_all()

    # Test that 2 userscan't have same username
    def test_project_add_member(self):
        
        # Reinit DB
        testdb.drop_all()
        testdb.create_all()

        # Double creation of project and user added
        admin = User(username="admin",firstname="Admin",surname="Admin")
        admin.set_password("admin")
        testdb.session.add(admin)
        pr = Project(creator = admin, name = "name", privacy=1, classes=["first class", "second class"], nb_membre=0)
        pr.addMember(admin)

        self.assertTrue(pr.nb_membre==1)

        testdb.drop_all()

if __name__ == "__main__":
        unittest.main()