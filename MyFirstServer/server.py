from flask import Flask, request, render_template, session
from werkzeug.utils import redirect
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room, leave_room, send
import json

app = Flask('MyChat')
app.secret_key = '685en641e6t51n68e4ty5146etny32t187n32891n5et6'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    login = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)

class PeopleTypes(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False, primary_key=True)

class Messages(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer)
    chat_id = db.Column(db.String, nullable=False)
    text = db.Column(db.Text, nullable=False)

class Chats(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)

class Members(db.Model):
    member_id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, primary_key=True)

with app.app_context():
    db.create_all()

@socketio.on('join')
def join(data):
    room = data
    join_room(room)

@socketio.on('leave')
def leave():
    room = str(session['current_chat_id'])
    leave_room(room)

@socketio.on('send_new_message')
def send_msg(jsn):
    if 'id' in session:
        data = json.loads(str(jsn))
        data['sender'] = Users.query.filter_by(id=session['id']).first().username
        room = str(session['current_chat_id'])
        emit('new_message', data, to=room)

@app.route('/', methods=['GET'])
def index():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def log_in():
    if request.method == 'GET':
        return render_template('login.html')
    data = json.loads(request.data.decode('utf-8'))
    login = data['login']
    password = data['password']
    user = Users.query.filter_by(login=login).first()
    if user and user.password == password:
        session['username'] = user.username
        session['id'] = user.id
        return redirect('/main')
    return {'message': 'Login or password is incorrect', 'success': False}

@app.route('/signup', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'GET':
        return render_template('signup.html')
    data = json.loads(request.data.decode('utf-8'))
    login = data['login']
    password = data['password']
    username = data['username']
    people = data['people']
    user = Users.query.filter_by(login=login).first()
    if user:
        return {'message': 'User with this login is already exsists', 'success': False}
    new_user = Users(login=login, password=password, username=username)
    db.session.add(new_user)
    db.session.commit()
    id = Users.query.filter_by(login=login).first().id
    for p in people:
        new_people_type = PeopleTypes(user_id=id, type=p)
        db.session.add(new_people_type)
    db.session.commit()
    return redirect('/login')

@app.route('/main', methods=['GET'])
def get_main_page():
    if 'id' not in session:
        return redirect('/')
    groups = Members.query.filter_by(member_id=session['id'])
    chat_list = []
    for group in groups:
        group_name = Chats.query.filter_by(id=group.group_id).first().name
        chat_list.append([group.group_id, group_name])
    return render_template('main.html', chat_list=chat_list)

@app.route('/get_messages', methods=['POST'])
def get_messages():
    if 'id' not in session:
        return redirect('/')
    chat_id = int(request.data.decode('utf-8'))
    session['current_chat_id'] = chat_id
    messages = Messages.query.filter_by(chat_id=chat_id)
    message_list = []
    for message in messages:
        if message.sender_id == session['id']:
            message_list.append(['You', message.text])
        else:
            message_list.append([Users.query.filter_by(id=message.sender_id).first().username, message.text])
    return {'messages': message_list}

@app.route('/send_message', methods=['POST'])
def send_message():
    if 'id' not in session:
        return redirect('/')
    message_text = request.data.decode('utf-8')
    new_message = Messages(sender_id=session['id'], chat_id=session['current_chat_id'], text=message_text)
    db.session.add(new_message)
    db.session.commit()
    return {'sender': 'You', 'message': message_text}

@app.route('/search_chat', methods=['POST'])
def search_chat():
    if 'id' not in session:
        return redirect('/')
    chat_name = request.data.decode('utf-8')
    chats = Members.query.filter_by(member_id=session['id'])
    for chat in chats:
        if Chats.query.filter_by(id=chat.group_id).name == chat_name:
            return {'id': chat.group_id}
    return {'id': -1}

@app.route('/create_chat', methods=['GET', 'POST'])
def create_chat():
    if 'id' not in session:
        return redirect('/')
    if request.method == 'GET':
        buff = PeopleTypes.query.filter_by(user_id=session['id'])
        types = []
        for b in buff:
            types.append(b.type)
        people = {}
        users_types = PeopleTypes.query.all()
        for user in users_types:
            if user.user_id not in people and user.user_id != session['id']:
                people[user.user_id] = Users.query.filter_by(id=user.user_id).first().username
        return render_template('chat_creator.html', chats=people)
    elif request.method == 'POST':
        data = json.loads(request.data.decode('utf-8'))
        new_chat = Chats(name=data['chat_name'])
        db.session.add(new_chat)
        db.session.commit()
        me = Members(member_id=session['id'], group_id=new_chat.id)
        db.session.add(me)
        for p in data['people']:
            member = Members(member_id=int(p), group_id=new_chat.id)
            db.session.add(member)
        db.session.commit()
        return redirect('/main')

@app.route('/get_username', methods=['GET'])
def get_username():
    return {'username': session['username']}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
