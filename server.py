import flask_socketio
from flask import Flask, request, render_template, session
from werkzeug.utils import redirect
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room, leave_room, send, rooms
import json
import secrets
import os

app = Flask('MyChat')
#app.secret_key = secrets.token_hex(16)
app.secret_key = '6854ty84n61hn6584kl974m6h51rs354tj89'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nickname = db.Column(db.String, unique=True, nullable=False)
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
    if 'current_chat_id' in session:
        room = str(session['current_chat_id'])
        leave_room(room)

@socketio.on('fix_room')
def fix_room():
    join_room(f'p{session['id']}')

@socketio.on('send_new_message')
def send_msg(jsn):
    if 'id' in session:
        data = json.loads(str(jsn))
        data['sender'] = Users.query.filter_by(id=session['id']).first().username
        room = str(session['current_chat_id'])
        emit('new_message', data, to=room)

@socketio.on('create_new_chat')
def create_cht(jsn):
    if 'id' in session:
        data = json.loads(jsn)
        print(data)
        print('chat created, sending it')
        for person_id in data['people']:
            print('sended', person_id)
            emit('new_chat', data, to=f'p{person_id}')

@app.route('/', methods=['GET'])
def index():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def log_in():
    if request.method == 'GET':
        return render_template('login.html')
    data = json.loads(request.data.decode('utf-8'))
    nickname = data['nickname']
    password = data['password']
    user = Users.query.filter_by(nickname=nickname).first()
    if user and user.password == password:
        session['username'] = user.username
        session['id'] = user.id
        return redirect('/main')
    return {'message': 'Nickname or password is incorrect', 'success': False}

@app.route('/signup', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'GET':
        return render_template('signup.html')
    data = json.loads(request.data.decode('utf-8'))
    nickname = data['nickname']
    password = data['password']
    username = data['username']
    people = data['people']
    user = Users.query.filter_by(nickname=nickname).first()
    if user:
        return {'message': 'User with this nickname is already exsists', 'success': False}
    new_user = Users(nickname=nickname, password=password, username=username)
    db.session.add(new_user)
    db.session.commit()
    user_id = Users.query.filter_by(nickname=nickname).first().id
    for p in people:
        new_people_type = PeopleTypes(user_id=user_id, type=p)
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
        if Chats.query.filter_by(id=chat.group_id).first().name == chat_name:
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
            if user.type in types and user.user_id not in people and user.user_id != session['id']:
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
        return {'id': new_chat.id}

@app.route('/get_username', methods=['GET'])
def get_username():
    return {'username': session['username']}

@app.route('/add_person', methods=['POST'])
def add_person():
    if 'id' in session:
        redirect('/')
    data = request.data.decode('utf-8')
    user = Users.query.filter_by(nickname=data).first()
    member = Members(member_id=user.id, group_id=session['current_chat_id'])
    db.session.add(member)
    db.session.commit()
    chat_name = Chats.query.filter_by(id=session['current_chat_id']).first().name
    return {'chatName': chat_name, 'id': session['current_chat_id'], 'personId': user.id}

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8080))
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
