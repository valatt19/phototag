from app import app, socketio

########
# MAIN #
########

if __name__ == '__main__':
    socketio.run(app)