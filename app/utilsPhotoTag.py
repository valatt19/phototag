import cv2


def getFrame(sec, vidcap, count, imageDestination):
    vidcap.set(cv2.CAP_PROP_POS_MSEC, sec * 1000)
    hasFrames, image = vidcap.read()
    if hasFrames:
        cv2.imwrite(imageDestination + "image" + str(count) + ".jpg", image)  # save frame as JPG file

    return hasFrames


def cut_Video(videopath, imageDestination):
    # vidcap = cv2.VideoCapture('C:/Users/babca/Pictures/Camera Roll/video.mp4')
    vidcap = cv2.VideoCapture(videopath)
    sec = 0
    frameRate = 1  # //it will capture image in each 0.5 second
    count = 1
    success = getFrame(sec, vidcap, count, imageDestination)
    while success:
        count = count + 1
        sec = sec + frameRate
        sec = round(sec, 2)
        success = getFrame(sec, vidcap, count, imageDestination)
