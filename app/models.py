ds_images = []

class Image():
    def __init__(self,id, name, path, size, last_time, last_person):
        self.id = id
        self.name = name
        self.path = path
        self.size = size
        self.last_time = last_time
        self.last_person = last_person
        self.collaborators = [] 
        self.annotations = 0