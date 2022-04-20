import unittest

import sys
sys.path.append('../')

from app.models import Project, User, Image
from app import db

import random
import string

# Class of unit tests for models
class Test_models(unittest.TestCase):

    # Test check password
    def test_user_creation_same_username(self):
        
        # Reinit DB
        db.drop_all()
        db.create_all()

        admin = User(username="admin",firstname="Admin",surname="Admin")

        # Test 100 random password
        characters = string.ascii_letters + string.digits + string.punctuation
        for i in range(100):
            length = random.randint(5,15)
            result_str = ''.join(random.choice(characters) for j in range(length))

            admin.set_password(result_str)
            db.session.add(admin)

            self.assertTrue(admin.check_password(result_str))

        db.drop_all()

    # Test that 2 userscan't have same username
    def test_project_add_member(self):
        
        # Reinit DB
        db.drop_all()
        db.create_all()

        # Double creation of project and user added
        admin = User(username="admin",firstname="Admin",surname="Admin")
        admin.set_password("admin")
        db.session.add(admin)
        pr = Project(creator = admin, name = "name", privacy=1, classes=["first class", "second class"], nb_membre=0)
        pr.addMember(admin)

        self.assertTrue(pr.nb_membre==1)

        db.drop_all()

if __name__ == "__main__":
        unittest.main()