from flask import Flask, request, render_template, session
from werkzeug.utils import redirect
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask('MyChat')
app.secret_key = ''
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    login = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)

with app.app_context():
    db.create_all()

chat_list = { 'main chat': list() }
current_chat = ''

@app.route('/', methods=['GET'])
def index():
    return render_template('login.html')

@app.route('/signup', methods=['POST'])
def sign_up():
    data = json.loads(request.data.decode('utf-8'))
    login = data['login']
    password = data['password']
    people = data['people']
    print(f'{login}, {password}, {people}')

@app.route('/login', methods=['POST'])
def log_in():
    data = json.loads(request.data.decode('utf-8'))
    login = data['login']
    password = data['password']


@app.route('/main', methods=['GET'])
def get_main_page():
    return render_template('index.html', chat_list=chat_list, current_chat=current_chat)

@app.route('/get_messages', methods=['GET'])
def get_messages():
    global current_chat
    current_chat = request.args.get('chat_name')
    return redirect('/')

@app.route('/send_message', methods=['POST'])
def send_message():
    chat_list.get(current_chat).append(('You', request.data.decode('utf-8')))
    print('Recived message:', request.data.decode('utf-8'))
    return chat_list.get(current_chat)

@app.route('/search_chat', methods=['POST'])
def search_chat():
    chat = request.form.get('chat_name')
    return redirect('/')

app.run(debug=True, port=5000)
