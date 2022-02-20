class Image():
    def __init__(self, name, dataset_path, size, last_time, last_person):
        self.name = name
        self.dataset_path = dataset_path
        self.size = size
        self.last_time = last_time
        self.last_person = last_person
        self.collaborators = [] 