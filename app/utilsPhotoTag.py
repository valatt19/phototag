import cv2


def getFrame(sec, vidcap, count, imageDestination, videoName):
    """
    get the frame as image and save it
    :param sec: secondes in video
    :param vidcap: the video
    :param count: num of frame
    :param imageDestination: folder where the images will be saved
    :param videoName: name of video
    :return: true if the frame is saved
    """
    vidcap.set(cv2.CAP_PROP_POS_MSEC, sec * 1000)
    hasFrames, image = vidcap.read()
    if hasFrames:
        cv2.imwrite(imageDestination +videoName+ "_imageFromVideo_" + str(count) + ".jpg", image)  # save frame as JPG file

    return hasFrames


def cut_Video(videopath, videoName, imageDestination,frame):
    """
    cut video into many images
    :param videopath: path of video
    :param videoName: name of video
    :param imageDestination: folder where the images will be saved
    :param frame: framerate
    """

    vidcap = cv2.VideoCapture(videopath)
    sec = 0
    frameRate = float(frame)  # //it will capture image in each <frame> second
    count = 1

    success = getFrame(sec, vidcap, count, imageDestination,videoName)

    while success:
        count = count + 1
        sec = sec + frameRate
        sec = round(sec, 2)
        success = getFrame(sec, vidcap, count, imageDestination,videoName)
